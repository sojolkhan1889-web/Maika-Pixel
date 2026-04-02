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

    res.status(200).json({
      success: true,
      data: {
        totalEvents: totalEvents || 0,
        totalPixels: totalPixels || 0,
        activeSellers: 1, // Placeholder until users table is fully implemented
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
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sellers' });
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

export default router;
