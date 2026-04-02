import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Activity, CheckCircle2, XCircle, Code, Copy, Check, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Pixel } from '@/store/useAppStore';

export function Pixels() {
  const { pixels, createPixelAsync, fetchPixels, isLoadingPixels } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPixelName, setNewPixelName] = useState('');
  const [newPixelId, setNewPixelId] = useState('');
  const [newAccessToken, setNewAccessToken] = useState('');
  const [installPixel, setInstallPixel] = useState<Pixel | null>(null);

  useEffect(() => {
    fetchPixels();
  }, [fetchPixels]);

  const handleAddPixel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPixelName || !newPixelId || !newAccessToken) return;
    
    await createPixelAsync({
      name: newPixelName,
      pixelId: newPixelId,
      accessToken: newAccessToken,
      events: {
        PageView: true,
        ViewContent: true,
        AddToCart: false,
        InitiateCheckout: false,
        Purchase: false,
        Lead: false,
      }
    });
    
    setNewPixelName('');
    setNewPixelId('');
    setNewAccessToken('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Pixels & Events</h1>
          <p className="text-text-muted mt-1">Manage your Facebook Pixels and configure which events to track.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add New Pixel'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddPixel} className="glass-card p-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Pixel Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Checkout Pixel" 
                value={newPixelName}
                onChange={(e) => setNewPixelName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Pixel ID</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="1234567890" 
                value={newPixelId}
                onChange={(e) => setNewPixelId(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-muted mb-1">Conversions API Access Token</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="EAAB..." 
                value={newAccessToken}
                onChange={(e) => setNewAccessToken(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save Pixel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isLoadingPixels ? (
          <div className="col-span-full p-12 text-center text-text-muted glass-card flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : pixels.length === 0 ? (
          <div className="col-span-full p-12 text-center text-text-muted glass-card">
            No pixels added yet. Click "Add New Pixel" to get started.
          </div>
        ) : pixels.map((pixel) => (
          <PixelCard key={pixel.id} pixel={pixel} onInstall={() => setInstallPixel(pixel)} />
        ))}
      </div>

      {installPixel && (
        <InstallModal pixel={installPixel} onClose={() => setInstallPixel(null)} />
      )}
    </div>
  );
}

function PixelCard({ pixel, onInstall }: { key?: string; pixel: Pixel; onInstall: () => void }) {
  const { togglePixelEvent, deletePixelAsync } = useAppStore();

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-primary/20 rounded-lg text-primary">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {pixel.name}
              {pixel.status === 'active' ? (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-text-muted bg-white/10 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </h3>
            <p className="text-sm font-mono text-text-muted mt-1">ID: {pixel.pixelId}</p>
            <p className="text-xs font-mono text-text-muted/50 mt-0.5">
              Token: {pixel.accessToken ? `${pixel.accessToken.substring(0, 4)}...${pixel.accessToken.substring(pixel.accessToken.length - 4)}` : 'Not set'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onInstall}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Code className="w-4 h-4" />
            Install
          </button>
          <button 
            onClick={() => deletePixelAsync(pixel.id)}
            className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6 flex-1">
        <h4 className="text-sm font-medium text-text-muted mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Event Configuration
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(pixel.events) as Array<keyof Pixel['events']>).map((eventName) => {
            const isEnabled = pixel.events[eventName];
            return (
              <div 
                key={eventName}
                onClick={() => togglePixelEvent(pixel.id, eventName)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  isEnabled 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-white/10 bg-[#0D0F14] hover:border-white/20"
                )}
              >
                <span className={cn("text-sm font-medium", isEnabled ? "text-primary" : "text-text-muted")}>
                  {eventName}
                </span>
                {isEnabled ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-text-muted opacity-50" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
        <p className="text-xs text-text-muted">Changes save automatically</p>
      </div>
    </div>
  );
}

function CopyBlock({ code, title }: { key?: string; code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/20 border border-white/5 rounded-lg p-4">
      {title && (
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-primary">{title}</h4>
        </div>
      )}
      <div className="relative group">
        <pre className="bg-black/50 border border-white/5 p-4 rounded-lg overflow-x-auto text-xs font-mono text-green-400/80 whitespace-pre-wrap">
          {code}
        </pre>
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-medium uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}

function InstallModal({ pixel, onClose }: { pixel: Pixel; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'js' | 'wp'>('js');

  const jsBaseCode = `<!-- Maika Pixel Universal Script -->
<script>
!function(m,a,i,k,e,p,x,l){m.MaikaPixelObject=e;m[e]=m[e]||function(){
(m[e].q=m[e].q||[]).push(arguments)};m[e].l=1*new Date();
p=a.createElement(i);x=a.getElementsByTagName(i)[0];
p.async=1;p.src=k;x.parentNode.insertBefore(p,x)
}(window,document,'script','https://your-backend-domain.com/tracker.js','maika');

// Initialize with your Pixel ID
maika('init', '${pixel.pixelId}');

// Automatically track PageView on load
maika('track', 'PageView', {
  page_name: document.title,
  page_id: window.location.pathname,
  browser_name: navigator.appName,
  user_agent: navigator.userAgent,
  // IP Address, Browser ID, Date & Time are automatically collected by tracker.js
});
</script>
<!-- End Maika Pixel Universal Script -->`;

  const getEventSnippet = (eventName: string) => {
    switch(eventName) {
      case 'Purchase': return `// Trigger this when a purchase is completed
maika('track', 'Purchase', {
  customer_name: 'John Doe',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+8801711223344',
  email: 'john@example.com',
  address: '123 Main St, Dhaka',
  product_name: 'Premium T-Shirt',
  product_price: 1500.00,
  product_id: 'PROD_101',
  total_order_amount: 1500.00,
  currency: 'BDT',
  // Browser ID, IP Address, User Agent, Date & Time are auto-collected
});`;
      case 'Lead': return `// Trigger this when a lead is captured (e.g., form submission)
maika('track', 'Lead', {
  customer_name: 'Jane Smith',
  first_name: 'Jane',
  last_name: 'Smith',
  phone: '+8801811223344',
  email: 'jane@example.com',
  address: '456 Park Ave, Dhaka',
  product_name: 'Consultation Service',
  product_price: 0.00,
  product_id: 'SERV_001',
  total_order_amount: 0.00,
  currency: 'BDT',
});`;
      case 'AddToCart': return `// Trigger this when a product is added to cart
maika('track', 'AddToCart', {
  product_name: 'Premium T-Shirt',
  product_price: 1500.00,
  currency: 'BDT',
  product_id: 'PROD_101',
  // Date & Time are auto-collected
});`;
      case 'InitiateCheckout': return `// Trigger this when checkout begins
maika('track', 'InitiateCheckout', {
  product_name: 'Premium T-Shirt',
  product_price: 1500.00,
  currency: 'BDT',
  product_id: 'PROD_101',
  // Date & Time are auto-collected
});`;
      case 'ViewContent': return `// Trigger this when a product page is viewed
maika('track', 'ViewContent', {
  product_name: 'Premium T-Shirt',
  product_amount: 1500.00,
  product_id: 'PROD_101',
  // Date & Time are auto-collected
});`;
      default: return `maika('track', '${eventName}');`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D0F14] border border-white/10 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Install Pixel: {pixel.name}
            </h2>
            <p className="text-sm text-text-muted mt-1">Connect your website to Maika Pixel</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex border-b border-white/10 mb-6 shrink-0">
            <button 
              className={cn("pb-3 px-4 text-sm font-medium transition-colors relative", activeTab === 'js' ? "text-primary" : "text-text-muted hover:text-white")}
              onClick={() => setActiveTab('js')}
            >
              JavaScript Snippet
              {activeTab === 'js' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              className={cn("pb-3 px-4 text-sm font-medium transition-colors relative", activeTab === 'wp' ? "text-primary" : "text-text-muted hover:text-white")}
              onClick={() => setActiveTab('wp')}
            >
              WordPress Plugin
              {activeTab === 'wp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          </div>

          {activeTab === 'js' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-primary mb-2">How Tracking Works (2-Step Process):</h3>
                <ol className="list-decimal list-inside text-sm text-text-muted space-y-1.5">
                  <li>First, install the <strong>Universal Base Code</strong> on all pages to initialize the tracker.</li>
                  <li>Then, fire <strong>Specific Event Codes</strong> with dynamic data exactly when actions occur (e.g., after a successful checkout).</li>
                </ol>
              </div>

              {/* Base Code Section */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Step 1: Install Universal Base Code</h3>
                <p className="text-sm text-text-muted mb-4">
                  Copy and paste this code into the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">&lt;head&gt;</code> section of <strong>every page</strong> on your website. This script initializes the tracker and automatically collects PageView data (URL, Browser, User Agent, IP, Time).
                </p>
                <CopyBlock code={jsBaseCode} />
              </div>

              {/* Specific Events Section */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-base font-semibold text-white mb-2">Step 2: Trigger Specific Events with Data</h3>
                
                <div className="bg-black/30 border border-white/10 rounded-lg p-5 mb-6 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Developer Guide: How to Implement Event Codes
                  </h4>
                  
                  <div className="space-y-3 text-sm text-text-muted">
                    <p>
                      <strong className="text-white">Where to put the code:</strong> Event codes should NOT be placed globally. They must be executed <em>only</em> when the specific action occurs.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Purchase/Lead:</strong> Place on the "Thank You" or "Order Success" page load.</li>
                      <li><strong>AddToCart/InitiateCheckout:</strong> Bind to the respective button's <code>onClick</code> event.</li>
                      <li><strong>ViewContent:</strong> Place on the individual Single Product page load.</li>
                    </ul>

                    <p className="mt-4">
                      <strong className="text-white">How to replace Dummy Data with Dynamic Variables:</strong><br/>
                      The snippets below contain hardcoded dummy data (e.g., <code>'John Doe'</code>). Your developer must replace these strings with your website platform's dynamic variables.
                    </p>
                    
                    <div className="bg-black/50 p-3 rounded border border-white/5 mt-2">
                      <p className="text-xs font-semibold text-white mb-2">Example (PHP / WooCommerce):</p>
                      <pre className="text-[11px] font-mono text-green-400/80">
{`maika('track', 'Purchase', {
  customer_name: '<?php echo $order->get_billing_first_name(); ?>',
  phone: '<?php echo $order->get_billing_phone(); ?>',
  total_order_amount: <?php echo $order->get_total(); ?>,
  // ... other fields
});`}
                      </pre>
                    </div>
                    
                    <div className="bg-black/50 p-3 rounded border border-white/5 mt-2">
                      <p className="text-xs font-semibold text-white mb-2">Example (JavaScript / React / Next.js):</p>
                      <pre className="text-[11px] font-mono text-green-400/80">
{`// Inside your handleCheckoutSuccess function
maika('track', 'Purchase', {
  customer_name: userData.fullName,
  phone: userData.phoneNumber,
  total_order_amount: cart.cartTotal,
  // ... other fields
});`}
                      </pre>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-muted mb-4">
                  Below are the required data structures for the events you have enabled:
                </p>
                
                <div className="space-y-4">
                  {(Object.keys(pixel.events) as Array<keyof Pixel['events']>).filter(e => pixel.events[e] && e !== 'PageView').map((eventName) => (
                    <CopyBlock 
                      key={eventName} 
                      title={`${eventName} Data Structure`} 
                      code={getEventSnippet(eventName)} 
                    />
                  ))}
                  
                  {Object.values(pixel.events).filter(v => v).length <= 1 && (
                    <div className="text-sm text-text-muted p-4 bg-white/5 rounded-lg text-center border border-white/5">
                      Enable more events in the Pixel configuration to see their data structures here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="p-2 bg-primary/20 rounded-lg text-primary shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white">1. Download Plugin</h3>
                  <p className="text-sm text-text-muted mt-1 mb-3">Download the official Maika Pixel WordPress plugin and install it on your site.</p>
                  <button className="btn-primary py-1.5 px-4 text-sm">Download .zip</button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-white">2. Configure Plugin</h3>
                <p className="text-sm text-text-muted">Go to Maika Pixel settings in your WordPress admin dashboard and paste the following credentials:</p>
                
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-lg">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Pixel ID</p>
                      <p className="font-mono text-sm">{pixel.pixelId}</p>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(pixel.pixelId); }}
                      className="p-2 hover:bg-white/10 rounded text-text-muted hover:text-white transition-colors"
                      title="Copy Pixel ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-lg">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Access Token</p>
                      <p className="font-mono text-sm">{pixel.accessToken ? `${pixel.accessToken.substring(0, 10)}...` : 'Not configured'}</p>
                    </div>
                    <button 
                      onClick={() => { if(pixel.accessToken) navigator.clipboard.writeText(pixel.accessToken); }}
                      className="p-2 hover:bg-white/10 rounded text-text-muted hover:text-white transition-colors"
                      title="Copy Access Token"
                      disabled={!pixel.accessToken}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
