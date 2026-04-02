import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';

const router = Router();

// Zod schema for validating incoming tracking requests
const trackSchema = z.object({
  pixelId: z.string().min(1, "Pixel ID is required"),
  eventName: z.string().min(1, "Event Name is required"),
  eventData: z.record(z.string(), z.any()).optional().default({}),
  url: z.string().url().optional(),
  userAgent: z.string().optional(),
});

/**
 * @route POST /api/track
 * @desc Receives events from seller websites (CAPI Gateway Entry Point)
 */
router.post('/', async (req, res) => {
  try {
    // 1. Validate incoming data
    const body = trackSchema.parse(req.body);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // 1.5 Get seller_id from pixel
    const { data: pixel, error: pixelError } = await supabaseAdmin
      .from('pixels')
      .select('seller_id')
      .eq('pixel_id', body.pixelId)
      .single();

    if (pixelError || !pixel) {
      console.error('Pixel not found:', body.pixelId);
      return res.status(400).json({ success: false, error: 'Invalid Pixel ID' });
    }

    const sellerId = pixel.seller_id;

    // 2. Insert into event_logs table
    // Note: In a high-scale production environment, we would push this to Redis/BullMQ first.
    // For now, we are inserting directly into Supabase.
    const { data, error } = await supabaseAdmin
      .from('event_logs')
      .insert([
        {
          pixel_id: body.pixelId,
          event_name: body.eventName,
          event_data: {
            ...body.eventData,
            client_ip: clientIp,
            user_agent: body.userAgent,
            source_url: body.url
          },
          status: 'pending' // Pending means it hasn't been sent to Facebook yet
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw new Error('Database error');
    }

    // 2.5 Process Orders, Customers, and Incomplete Orders
    try {
      const { customer_name, phone, email, value, total_amount, product_name } = body.eventData;
      const total = value || total_amount || '0';
      const customerPhone = phone || 'unknown';
      const customerEmail = email || '';

      if (body.eventName === 'Purchase' && (phone || email)) {
        // 1. Insert Order
        await supabaseAdmin.from('orders').insert([{
          seller_id: sellerId,
          pixel_id: body.pixelId,
          customer_name: customer_name || 'Unknown',
          phone: customerPhone,
          email: customerEmail,
          total: total.toString(),
          status: 'Processing',
          fb_status: 'Pending',
          origin: 'Website'
        }]);

        // 2. Upsert Customer (Check if exists first to increment)
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('phone', customerPhone)
          .single();

        if (existingCustomer) {
          await supabaseAdmin.from('customers').update({
            total_orders: existingCustomer.total_orders + 1,
            success_orders: existingCustomer.success_orders + 1,
            name: customer_name || existingCustomer.name
          }).eq('id', existingCustomer.id);
        } else {
          await supabaseAdmin.from('customers').insert([{
            seller_id: sellerId,
            name: customer_name || 'Unknown',
            email: customerEmail,
            phone: customerPhone,
            total_orders: 1,
            success_orders: 1
          }]);
        }

        // 3. Mark Incomplete Order as Recovered (if exists)
        await supabaseAdmin.from('incomplete_orders')
          .update({ status: 'Recovered' })
          .eq('seller_id', sellerId)
          .eq('phone', customerPhone)
          .eq('status', 'Pending');

      } else if (body.eventName === 'InitiateCheckout' && (phone || email)) {
        // Insert Incomplete Order
        await supabaseAdmin.from('incomplete_orders').insert([{
          seller_id: sellerId,
          pixel_id: body.pixelId,
          customer_name: customer_name || 'Unknown',
          phone: customerPhone,
          email: customerEmail,
          product_name: product_name || 'Unknown Product',
          total: total.toString(),
          status: 'Pending'
        }]);
      }
    } catch (processError) {
      console.error('Error processing order/customer data:', processError);
      // We don't throw here to ensure the client still gets a 200 OK for the tracking event
    }

    // 3. Return immediate success to client (so seller website doesn't lag)
    res.status(200).json({ 
      success: true, 
      message: 'Event received successfully', 
      eventId: data.id 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    } else {
      console.error('Tracking API Error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

export default router;
