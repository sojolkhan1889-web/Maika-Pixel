import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: req.headers['x-impersonate-id'] || '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/subscriptions
 * @desc Get seller subscription
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('seller_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Default to 'basic' if no subscription found
    const planName = data?.plan_name === 'free' ? 'basic' : (data?.plan_name || 'basic');
    const subscriptionData = data ? { plan: planName, status: data.status } : { plan: 'basic', status: 'active' };
    res.status(200).json({ success: true, data: subscriptionData });
  } catch (error) {
    console.error('Subscriptions API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
});

/**
 * @route POST /api/subscriptions/upgrade
 * @desc Upgrade or change subscription plan
 */
router.post('/upgrade', authMiddleware, async (req: any, res) => {
  try {
    const { planId } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({ 
        seller_id: req.user.id, 
        plan_name: planId,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
      }, { onConflict: 'seller_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: { plan: data.plan_name, status: data.status } });
  } catch (error) {
    console.error('Subscriptions API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade subscription' });
  }
});

/**
 * @route GET /api/subscriptions/plans
 * @desc Get all pricing plans
 */
router.get('/plans', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('price', { ascending: true });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Subscriptions API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pricing plans' });
  }
});

export default router;
