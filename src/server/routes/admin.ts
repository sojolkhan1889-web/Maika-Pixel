import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

/**
 * @route GET /api/admin/stats
 * @desc Get high-level stats for the admin dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    // Fetch total events
    const { count: totalEvents, error: eventsError } = await supabaseAdmin
      .from('event_logs')
      .select('*', { count: 'exact', head: true });

    // Fetch total pixels
    const { count: totalPixels, error: pixelsError } = await supabaseAdmin
      .from('pixels')
      .select('*', { count: 'exact', head: true });

    if (eventsError || pixelsError) {
      throw new Error('Failed to fetch stats');
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Fetch recent events timestamps
    const { data: recentEvents } = await supabaseAdmin
      .from('event_logs')
      .select('created_at')
      .gte('created_at', oneYearAgo.toISOString());

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Initialize charts array
    const eventsTodayChart: Record<string, number> = {};
    const mrrTodayChart: Record<string, number> = {};
    for (let i = 0; i <= new Date().getHours(); i++) {
        const h = i.toString().padStart(2, '0') + ':00';
        eventsTodayChart[h] = 0;
        mrrTodayChart[h] = 0;
    }

    const eventsMonthChart: Record<string, number> = {};
    const mrrMonthChart: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        eventsMonthChart[dateStr] = 0;
        mrrMonthChart[dateStr] = 0;
    }

    const eventsYearChart: Record<string, number> = {};
    const mrrYearChart: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        eventsYearChart[monthStr] = 0;
        mrrYearChart[monthStr] = 0;
    }

    if (recentEvents) {
      recentEvents.forEach(e => {
         const d = new Date(e.created_at);
         
         if (d >= startOfToday) {
             const h = d.getHours().toString().padStart(2, '0') + ':00';
             if (eventsTodayChart[h] !== undefined) eventsTodayChart[h]++;
         }
         
         const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         if (eventsMonthChart[dateStr] !== undefined) eventsMonthChart[dateStr]++;

         const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         if (eventsYearChart[monthStr] !== undefined) eventsYearChart[monthStr]++;
      });
    }

    // Fetch active subscriptions for MRR chart
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_name, status, created_at')
      .eq('status', 'active');

    let totalMRR = 0;
    if (!subsError && subscriptions) {
      const calculateMRRAtTime = (dateObj: Date) => {
          let dayMRR = 0;
          subscriptions.forEach(sub => {
              if (new Date(sub.created_at) <= dateObj) {
                  if (sub.plan_name === 'basic') dayMRR += 999;
                  else if (sub.plan_name === 'pro') dayMRR += 2499;
                  else if (sub.plan_name === 'enterprise') dayMRR += 4999;
              }
          });
          return dayMRR;
      };

      Object.keys(mrrTodayChart).forEach(hour => {
          const checkDate = new Date();
          checkDate.setHours(parseInt(hour), 59, 59, 999);
          mrrTodayChart[hour] = calculateMRRAtTime(checkDate);
      });

      const daysList = Object.keys(mrrMonthChart);
      for (let i = 29; i >= 0; i--) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          checkDate.setHours(23, 59, 59, 999);
          mrrMonthChart[daysList[29 - i]] = calculateMRRAtTime(checkDate);
      }

      const monthsList = Object.keys(mrrYearChart);
      for (let i = 11; i >= 0; i--) {
          const checkDate = new Date();
          checkDate.setMonth(checkDate.getMonth() - i + 1, 0); 
          checkDate.setHours(23, 59, 59, 999);
          mrrYearChart[monthsList[11 - i]] = calculateMRRAtTime(checkDate);
      }
      totalMRR = calculateMRRAtTime(new Date());
    }

    const eventsChart = {
        today: Object.keys(eventsTodayChart).map(k => ({ date: k, count: eventsTodayChart[k] })),
        month: Object.keys(eventsMonthChart).map(k => ({ date: k, count: eventsMonthChart[k] })),
        year: Object.keys(eventsYearChart).map(k => ({ date: k, count: eventsYearChart[k] }))
    };

    const mrrChart = {
        today: Object.keys(mrrTodayChart).map(k => ({ date: k, revenue: mrrTodayChart[k] })),
        month: Object.keys(mrrMonthChart).map(k => ({ date: k, revenue: mrrMonthChart[k] })),
        year: Object.keys(mrrYearChart).map(k => ({ date: k, revenue: mrrYearChart[k] }))
    };

    // Fetch system health metrics
    const { count: pendingEvents } = await supabaseAdmin
      .from('event_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: failedEvents } = await supabaseAdmin
      .from('event_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    const totalValidEvents = totalEvents || 0;
    const errorRate = totalValidEvents > 0 ? ((failedEvents || 0) / totalValidEvents) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEvents: totalEvents || 0,
        totalPixels: totalPixels || 0,
        activeSellers: 1, // Placeholder until users table is fully implemented
        totalMRR: totalMRR,
        eventsChart,
        mrrChart,
        systemHealth: {
          queueSize: pendingEvents || 0,
          errorRate: errorRate
        }
      }
    });

  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @route GET /api/admin/sellers
 * @desc Get list of all sellers
 */
router.get('/sellers', async (req, res) => {
  try {
    const { data: sellers, error } = await supabaseAdmin
      .from('sellers')
      .select('*, subscriptions(plan_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten subscription data so frontend sees seller.plan
    const formattedData = sellers.map(seller => ({
      ...seller,
      plan: seller.subscriptions && seller.subscriptions.length > 0 
        ? seller.subscriptions[0].plan_name 
        : (seller.subscriptions?.plan_name || 'free') // Handle both array and single object based on relationship type
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sellers' });
  }
});

/**
 * @route POST /api/admin/sellers/:id/plan
 * @desc Upgrade or downgrade a seller's plan manually
 */
router.post('/sellers/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({ 
        seller_id: id, 
        plan_name: plan,
        status: 'active',
        // Extend expiration by 30 days gracefully if upserting
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'seller_id' });

    if (error) throw error;

    res.status(200).json({ success: true, message: `Plan upgraded to ${plan}` });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
});

/**
 * @route POST /api/admin/sellers/:id/block
 * @desc Block or unblock a seller
 */
router.post('/sellers/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const { error } = await supabaseAdmin
      .from('sellers')
      .update({ is_blocked: isBlocked })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: `Seller ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update seller status' });
  }
});

/**
 * @route GET /api/admin/logs
 * @desc Get recent system logs (event logs)
 */
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

/**
 * @route GET /api/admin/billing/transactions
 * @desc Get all historical transactions
 */
router.get('/billing/transactions', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*, sellers(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // Flatten relational sellers map
    const formattedData = data.map((t: any) => ({
      ...t,
      seller_name: t.sellers?.name || 'Unknown',
      seller_email: t.sellers?.email || 'N/A'
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

/**
 * @route GET /api/admin/billing/plans
 * @desc Get all pricing plans
 */
router.get('/billing/plans', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('price', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

/**
 * @route POST /api/admin/billing/plans
 * @desc Create or update a pricing plan
 */
router.post('/billing/plans', async (req, res) => {
  try {
    const { id, name, price, event_limit, features } = req.body;
    
    let query = supabaseAdmin.from('pricing_plans');
    let result;
    
    if (id) {
       result = await query.update({ name, price, event_limit, features }).eq('id', id).select().single();
    } else {
       result = await query.insert({ name, price, event_limit, features }).select().single();
    }
    
    if (result.error) throw result.error;
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to save plan' });
  }
});

export default router;
