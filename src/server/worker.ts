import { supabaseAdmin } from './supabase';
import { sendToFacebookCAPI } from './services/facebook';

let isRunning = false;

/**
 * Background Worker for processing pending events and sending them to Facebook CAPI.
 * In a massive scale production environment, this would be replaced by BullMQ/Redis.
 * For this architecture, a setInterval loop acts as our background processor.
 */
export const startWorker = () => {
  console.log('🚀 Starting Background Worker for Facebook CAPI...');
  
  // Run every 5 seconds
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      // 1. Fetch up to 50 pending events
      const { data: events, error: fetchError } = await supabaseAdmin
        .from('event_logs')
        .select('*')
        .eq('status', 'pending')
        .limit(50);

      if (fetchError) throw fetchError;
      
      if (!events || events.length === 0) {
        isRunning = false;
        return;
      }

      // Extract unique pixel IDs
      const pixelIds = [...new Set(events.map(e => e.pixel_id))];

      // Fetch access tokens for these pixels
      const { data: pixels, error: pixelError } = await supabaseAdmin
        .from('pixels')
        .select('pixel_id, access_token')
        .in('pixel_id', pixelIds);

      if (pixelError) throw pixelError;

      // Create a map for quick lookup
      const pixelMap = new Map(pixels.map(p => [p.pixel_id, p.access_token]));

      // 2. Process each event
      for (const event of events) {
        try {
          const accessToken = pixelMap.get(event.pixel_id);
          if (!accessToken) {
            throw new Error('Missing Facebook Access Token for this Pixel');
          }

          // Send to Facebook
          await sendToFacebookCAPI(event.pixel_id, accessToken, event);

          // Mark as success
          await supabaseAdmin
            .from('event_logs')
            .update({ status: 'success' })
            .eq('id', event.id);

        } catch (err: any) {
          console.error(`[Worker] Failed to process event ${event.id}:`, err.message);
          
          // Mark as failed and store the error message
          await supabaseAdmin
            .from('event_logs')
            .update({ 
              status: 'failed', 
              event_data: { ...event.event_data, error_reason: err.message } 
            })
            .eq('id', event.id);
        }
      }
    } catch (error) {
      console.error('[Worker] Critical Error:', error);
    } finally {
      isRunning = false;
    }
  }, 5000); 
};
