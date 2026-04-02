import React, { useEffect, useState } from 'react';
import { Activity, Users, Target, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalEvents: number;
  totalPixels: number;
  activeSellers: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In development, this will hit the Vite proxy or full-stack Express server
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to load stats');
        }
      } catch (err) {
        setError('Failed to connect to backend API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/20 rounded-xl text-danger flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold">Backend Connection Error</h3>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 opacity-80">Make sure the Express backend is running and connected to Supabase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-text-muted mt-1">Real-time metrics from the Maika Pixel tracking engine.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Events Processed" 
          value={stats?.totalEvents.toLocaleString() || '0'} 
          trend="+12.5%" 
          isPositive={true}
          icon={Activity} 
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard 
          title="Active Sellers" 
          value={stats?.activeSellers.toLocaleString() || '0'} 
          trend="+3" 
          isPositive={true}
          icon={Users} 
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <StatCard 
          title="Active Pixels" 
          value={stats?.totalPixels.toLocaleString() || '0'} 
          trend="0%" 
          isPositive={true}
          icon={Target} 
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Recent System Activity (Mock for now) */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">Recent System Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-white">Event Batch Processed</p>
                  <p className="text-xs text-text-muted">Successfully sent 500 events to Facebook CAPI</p>
                </div>
              </div>
              <span className="text-xs text-text-muted">Just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon: Icon, color, bg }: any) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", bg, color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
          isPositive ? "text-success bg-success/10" : "text-danger bg-danger/10"
        )}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity", bg)} />
    </div>
  );
}
