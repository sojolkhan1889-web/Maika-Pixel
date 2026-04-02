/**
 * Maika Pixel Universal Tracker
 * This script is loaded on the seller's website to track events and send them to the Maika Pixel Backend.
 */

(function(window, document) {
  'use strict';

  // Configuration
  // In production, this should point to your actual backend URL (e.g., https://api.maikapixel.com)
  // For development, we use the current host or a specific backend URL.
  const BACKEND_URL = 'http://localhost:3000/api/track'; 

  const MaikaTracker = {
    pixelId: null,
    
    init: function(pixelId) {
      this.pixelId = pixelId;
      console.log('[Maika Pixel] Initialized with Pixel ID:', pixelId);
    },

    track: function(eventName, eventData = {}) {
      if (!this.pixelId) {
        console.error('[Maika Pixel] Tracker not initialized. Call maika("init", "YOUR_PIXEL_ID") first.');
        return;
      }

      // Automatically collect common data
      const payload = {
        pixelId: this.pixelId,
        eventName: eventName,
        url: window.location.href,
        userAgent: navigator.userAgent,
        eventData: {
          ...eventData,
          timestamp: new Date().toISOString(),
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        }
      };

      // Send data to backend
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Use keepalive to ensure the request completes even if the user navigates away
        keepalive: true 
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(`[Maika Pixel] Event "${eventName}" tracked successfully.`);
        } else {
          console.error(`[Maika Pixel] Failed to track event "${eventName}":`, data.error);
        }
      })
      .catch(error => {
        console.error(`[Maika Pixel] Network error while tracking event "${eventName}":`, error);
      });
    }
  };

  // Process the queue of commands that were called before the script loaded
  const queueName = window.MaikaPixelObject || 'maika';
  const queue = window[queueName].q || [];
  
  // Replace the global function with our actual implementation
  window[queueName] = function() {
    const args = Array.from(arguments);
    const command = args.shift();
    
    if (typeof MaikaTracker[command] === 'function') {
      MaikaTracker[command].apply(MaikaTracker, args);
    } else {
      console.error(`[Maika Pixel] Unknown command: ${command}`);
    }
  };

  // Execute queued commands
  queue.forEach(args => {
    window[queueName].apply(null, args);
  });

})(window, document);
