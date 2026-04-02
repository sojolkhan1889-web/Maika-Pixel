import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

// Middleware to mock authentication for now
// In production, this should verify a JWT token and set req.user
const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/pixels
 * @desc Get all pixels for the authenticated seller
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pixels')
      .select('*')
      .eq('seller_id', req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch pixels' });
  }
});

/**
 * @route POST /api/pixels
 * @desc Create a new pixel
 */
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { name, pixelId, accessToken, events } = req.body;

    const { data, error } = await supabaseAdmin
      .from('pixels')
      .insert([{
        seller_id: req.user.id,
        name,
        pixel_id: pixelId,
        access_token: accessToken,
        events: events || { PageView: true }
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create pixel' });
  }
});

/**
 * @route DELETE /api/pixels/:id
 * @desc Delete a pixel
 */
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('pixels')
      .delete()
      .eq('id', req.params.id)
      .eq('seller_id', req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Pixel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete pixel' });
  }
});

export default router;
