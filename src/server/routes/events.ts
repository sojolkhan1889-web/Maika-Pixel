import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: req.headers['x-impersonate-id'] || '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/events
 * @desc Get event logs for the seller's pixels
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    // 1. Get seller's pixels first
    const { data: pixels, error: pixelError } = await supabaseAdmin
      .from('pixels')
      .select('pixel_id')
      .eq('seller_id', req.user.id);

    if (pixelError) throw pixelError;

    const pixelIds = pixels.map(p => p.pixel_id);

    if (pixelIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Get events for those pixels
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('event_logs')
      .select('*')
      .in('pixel_id', pixelIds)
      .order('created_at', { ascending: false })
      .limit(100);

    if (eventsError) throw eventsError;

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Events API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

export default router;
