import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: req.headers['x-impersonate-id'] || '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/customers
 * @desc Get all customers for the seller
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('seller_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Customers API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

/**
 * @route PUT /api/customers/:id/block
 * @desc Toggle block status for a customer
 */
router.put('/:id/block', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ is_blocked: isBlocked })
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Customers API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update customer status' });
  }
});

export default router;
