import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

const authMiddleware = (req: any, res: any, next: any) => {
  // Hardcoded seller ID for MVP testing
  req.user = { id: '00000000-0000-0000-0000-000000000000' }; 
  next();
};

/**
 * @route GET /api/settings
 * @desc Get seller settings
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('seller_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    // If no settings exist yet, return a default structure
    const defaultSettings = {
      fraud: {
        check11Digits: true,
        blockPhone: false,
        blockEmail: false,
        blockIp: false,
        restrictMultiple: false,
        restrictHours: 24,
        restrictLimit: 3,
        errorPhone: ''
      },
      facebook: {
        enableCapi: true,
        sendImmediate: false,
        successPercent: 80,
        enableOrderFlow: true,
        enableTestEvent: false,
        enableAddToCart: true,
        enableInitiateCheckout: true
      }
    };

    const settingsData = data ? {
      fraud: data.fraud_settings,
      facebook: data.facebook_settings
    } : defaultSettings;

    res.status(200).json({ success: true, data: settingsData });
  } catch (error) {
    console.error('Settings API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

/**
 * @route PUT /api/settings
 * @desc Update seller settings
 */
router.put('/', authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({ 
        seller_id: req.user.id, 
        fraud_settings: req.body.fraud,
        facebook_settings: req.body.facebook,
        updated_at: new Date().toISOString()
      }, { onConflict: 'seller_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: { fraud: data.fraud_settings, facebook: data.facebook_settings } });
  } catch (error) {
    console.error('Settings API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

export default router;
