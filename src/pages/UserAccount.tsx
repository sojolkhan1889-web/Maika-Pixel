import React, { useState, useRef } from 'react';
import { User, Shield, Bell, Camera, Save, CheckCircle2, AlertCircle, Key, Globe, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'preferences';

export function UserAccount() {
  const { userProfile, userPreferences, updateUserProfile, updateUserPreferences } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState(userProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preferences State
  const [prefsData, setPrefsData] = useState(userPreferences);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      updateUserProfile(profileData);
      setIsSavingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }, 800);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      // In a real app, this would call an API to change the password
      setIsSavingPassword(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 800);
  };

  const handlePrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setTimeout(() => {
      updateUserPreferences(prefsData);
      setIsSavingPrefs(false);
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          User Account
        </h1>
        <p className="text-text-muted mt-1">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 shrink-0">
          <div className="glass-card p-2 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === 'profile' 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <User className="w-4 h-4" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === 'security' 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Shield className="w-4 h-4" />
              Security & Password
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === 'preferences' 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Bell className="w-4 h-4" />
              Preferences
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-black/40 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-text-muted" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Profile Picture</h3>
                    <p className="text-sm text-text-muted mt-1">Upload a new avatar. Recommended size: 256x256px.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Email Address</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-field" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Company / Store Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {profileSuccess ? (
                    <span className="text-success flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                    </span>
                  ) : <span />}
                  <button type="submit" disabled={isSavingProfile} className="btn-primary">
                    {isSavingProfile ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-6">Security & Password</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                {passwordError && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-3 text-danger text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{passwordError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-text-muted mb-1">Current Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="password" 
                      className="input-field pl-9" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-text-muted mb-1">New Password</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="password" 
                      className="input-field pl-9" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Must be at least 8 characters long.</p>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="password" 
                      className="input-field pl-9" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {passwordSuccess ? (
                    <span className="text-success flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Password updated successfully
                    </span>
                  ) : <span />}
                  <button type="submit" disabled={isSavingPassword} className="btn-primary">
                    {isSavingPassword ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-6">Preferences</h2>
              
              <form onSubmit={handlePrefsSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">Notifications</h3>
                  
                  <label className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-medium text-white text-sm">Email Notifications</p>
                      <p className="text-xs text-text-muted mt-0.5">Receive alerts for important account activities.</p>
                    </div>
                    <div className={cn("w-10 h-5 rounded-full transition-colors relative", prefsData.emailNotifications ? "bg-primary" : "bg-white/10")}>
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", prefsData.emailNotifications ? "left-6" : "left-1")} />
                    </div>
                    {/* Hidden input for accessibility/form submission if needed */}
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={prefsData.emailNotifications}
                      onChange={(e) => setPrefsData({ ...prefsData, emailNotifications: e.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-medium text-white text-sm">Marketing Emails</p>
                      <p className="text-xs text-text-muted mt-0.5">Receive product updates and promotional offers.</p>
                    </div>
                    <div className={cn("w-10 h-5 rounded-full transition-colors relative", prefsData.marketingEmails ? "bg-primary" : "bg-white/10")}>
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", prefsData.marketingEmails ? "left-6" : "left-1")} />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={prefsData.marketingEmails}
                      onChange={(e) => setPrefsData({ ...prefsData, marketingEmails: e.target.checked })}
                    />
                  </label>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">Localization</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Language
                      </label>
                      <select 
                        className="input-field appearance-none"
                        value={prefsData.language}
                        onChange={(e) => setPrefsData({ ...prefsData, language: e.target.value })}
                      >
                        <option value="en">English (US)</option>
                        <option value="bn">Bengali (BD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Timezone
                      </label>
                      <select 
                        className="input-field appearance-none"
                        value={prefsData.timezone}
                        onChange={(e) => setPrefsData({ ...prefsData, timezone: e.target.value })}
                      >
                        <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {prefsSuccess ? (
                    <span className="text-success flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Preferences saved
                    </span>
                  ) : <span />}
                  <button type="submit" disabled={isSavingPrefs} className="btn-primary">
                    {isSavingPrefs ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
