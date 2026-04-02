import crypto from 'crypto';

/**
 * Hash data using SHA256 as required by Facebook Conversions API
 * for User Data (Email, Phone, etc.)
 */
export function hashData(data: string): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Send event data to Facebook Conversions API
 */
export async function sendToFacebookCAPI(pixelId: string, accessToken: string, event: any) {
  const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;

  // Format user data according to Facebook's requirements
  const userData: any = {
    client_ip_address: event.event_data?.client_ip,
    client_user_agent: event.event_data?.user_agent,
  };

  // Hash PII (Personally Identifiable Information)
  if (event.event_data?.email) {
    userData.em = [hashData(event.event_data.email)];
  }
  if (event.event_data?.phone) {
    // Remove all non-numeric characters except leading '+'
    const cleanPhone = event.event_data.phone.replace(/[^\d+]/g, '');
    userData.ph = [hashData(cleanPhone)];
  }
  if (event.event_data?.first_name) {
    userData.fn = [hashData(event.event_data.first_name)];
  }
  if (event.event_data?.last_name) {
    userData.ln = [hashData(event.event_data.last_name)];
  }

  // Construct the CAPI payload
  const payload = {
    data: [
      {
        event_name: event.event_name,
        event_time: Math.floor(new Date(event.created_at).getTime() / 1000),
        action_source: 'website',
        event_source_url: event.event_data?.source_url || 'http://unknown.com',
        user_data: userData,
        custom_data: {
          currency: event.event_data?.currency || 'USD',
          value: event.event_data?.product_price || event.event_data?.total_order_amount || 0,
          content_name: event.event_data?.product_name,
          content_ids: event.event_data?.product_id ? [event.event_data.product_id] : undefined,
        }
      }
    ]
  };

  // Send request to Facebook Graph API
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, access_token: accessToken })
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error?.message || 'Unknown Facebook API Error');
  }
  
  return result;
}
