import { useState, useEffect } from 'react';
import { Save, ShieldAlert, Facebook, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Settings as SettingsType } from '@/store/useAppStore';

export function Settings() {
  const [activeTab, setActiveTab] = useState('fraud');
  const { settings, updateSettings } = useAppStore();
  
  // Local state for form editing
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Sync local state if global state changes externally
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updateFraud = (key: keyof SettingsType['fraud'], value: any) => {
    setLocalSettings(prev => ({ ...prev, fraud: { ...prev.fraud, [key]: value } }));
  };

  const updateFb = (key: keyof SettingsType['facebook'], value: any) => {
    setLocalSettings(prev => ({ ...prev, facebook: { ...prev.facebook, [key]: value } }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-muted mt-1">Configure tracking, fraud prevention, and Facebook CAPI.</p>
      </div>

      <div className="flex space-x-1 border-b border-white/10">
        <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={SettingsIcon} label="General" />
        <TabButton active={activeTab === 'fraud'} onClick={() => setActiveTab('fraud')} icon={ShieldAlert} label="Fraud Block" />
        <TabButton active={activeTab === 'facebook'} onClick={() => setActiveTab('facebook')} icon={Facebook} label="Facebook CAPI" />
      </div>

      <div className="glass-card p-6">
        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Fraud Customer Block Settings</h3>
            <div className="space-y-4">
              <Checkbox label="Check 11 digits of phone number" checked={localSettings.fraud.check11Digits} onChange={(c) => updateFraud('check11Digits', c)} />
              <Checkbox label="Block Phone Numbers" checked={localSettings.fraud.blockPhone} onChange={(c) => updateFraud('blockPhone', c)} />
              <Checkbox label="Block Email Addresses" checked={localSettings.fraud.blockEmail} onChange={(c) => updateFraud('blockEmail', c)} />
              <Checkbox label="Block IP Addresses" checked={localSettings.fraud.blockIp} onChange={(c) => updateFraud('blockIp', c)} />
              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <Checkbox label="Restrict multiple orders from same Phone & IP" checked={localSettings.fraud.restrictMultiple} onChange={(c) => updateFraud('restrictMultiple', c)} />
                <div className="grid grid-cols-2 gap-4 pl-8">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Restrict Time (Hours)</label>
                    <input type="number" className="input-field" value={localSettings.fraud.restrictHours} onChange={(e) => updateFraud('restrictHours', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Order Limit</label>
                    <input type="number" className="input-field" value={localSettings.fraud.restrictLimit} onChange={(e) => updateFraud('restrictLimit', Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="block text-sm text-text-muted mb-1">Checkout Process Error Contact Phone Number</label>
                <input type="text" className="input-field max-w-md" placeholder="+8801..." value={localSettings.fraud.errorPhone} onChange={(e) => updateFraud('errorPhone', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Facebook Settings</h3>
            <div className="space-y-4">
              <Checkbox label="Enable FB CAPI" checked={localSettings.facebook.enableCapi} onChange={(c) => updateFb('enableCapi', c)} />
              <div className="pl-8 space-y-4">
                <Checkbox label="Send Purchase Data Immediately to Facebook" checked={localSettings.facebook.sendImmediate} onChange={(c) => updateFb('sendImmediate', c)} />
                <div>
                  <label className="block text-sm text-text-muted mb-1">Customer History Success Percent for Immediate Send</label>
                  <div className="flex items-center gap-3 max-w-xs">
                    <input type="range" min="0" max="100" value={localSettings.facebook.successPercent} onChange={(e) => updateFb('successPercent', Number(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-sm font-mono bg-white/5 px-2 py-1 rounded">{localSettings.facebook.successPercent}%</span>
                  </div>
                </div>
              </div>
              <Checkbox label="Enable Order Flow Tracking for Facebook" checked={localSettings.facebook.enableOrderFlow} onChange={(c) => updateFb('enableOrderFlow', c)} />
              <Checkbox label="Enable Test Event Code for Facebook" checked={localSettings.facebook.enableTestEvent} onChange={(c) => updateFb('enableTestEvent', c)} />
              <Checkbox label="Enable AddToCart Event on Funnel/Checkout Page" checked={localSettings.facebook.enableAddToCart} onChange={(c) => updateFb('enableAddToCart', c)} />
              <Checkbox label="Enable InitiateCheckout Event on Funnel/Checkout Page" checked={localSettings.facebook.enableInitiateCheckout} onChange={(c) => updateFb('enableInitiateCheckout', c)} />
            </div>
          </div>
        )}

        {activeTab === 'general' && <div className="text-text-muted py-8">General settings coming soon.</div>}

        <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
          <button onClick={handleSave} className={cn("btn-primary transition-all", isSaved && "bg-success hover:bg-success")}>
            <Save className="w-4 h-4" />
            {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", active ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-primary hover:border-white/20")}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-[#0D0F14] group-hover:border-primary transition-colors">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={cn("absolute inset-0 bg-primary rounded transition-opacity flex items-center justify-center", checked ? "opacity-100" : "opacity-0")}>
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <span className="text-sm select-none">{label}</span>
    </label>
  );
}
