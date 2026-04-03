import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: req.headers['x-impersonate-id'] || '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/incomplete-orders
 * @desc Get all incomplete orders for the seller
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('incomplete_orders')
      .select('*')
      .eq('seller_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Incomplete Orders API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch incomplete orders' });
  }
});

/**
 * @route PUT /api/incomplete-orders/:id/status
 * @desc Update incomplete order status
 */
router.put('/:id/status', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('incomplete_orders')
      .update({ status })
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Incomplete Orders API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

/**
 * @route PUT /api/incomplete-orders/:id/contacted
 * @desc Update last contacted time
 */
router.put('/:id/contacted', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('incomplete_orders')
      .update({ last_contacted: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Incomplete Orders API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update contacted time' });
  }
});

/**
 * @route DELETE /api/incomplete-orders/:id
 * @desc Delete an incomplete order
 */
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('incomplete_orders')
      .delete()
      .eq('id', id)
      .eq('seller_id', req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Incomplete Orders API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete incomplete order' });
  }
});

export default router;
