import React, { useEffect, useState } from 'react';
import { Activity, Users, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, DollarSign, Server, CheckCircle2, ShieldAlert, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminStats {
  totalEvents: number;
  totalPixels: number;
  activeSellers: number;
  totalMRR: number;
  eventsChart: { today: any[]; month: any[]; year: any[] };
  mrrChart: { today: any[]; month: any[]; year: any[] };
  systemHealth: {
    queueSize: number;
    errorRate: number;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [eventsTimeframe, setEventsTimeframe] = useState<'today' | 'month' | 'year'>('month');
  const [mrrTimeframe, setMrrTimeframe] = useState<'today' | 'month' | 'year'>('month');

  const downloadCSV = (data: any[], title: string, timeframe: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}_${timeframe}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Overview</h1>
          <p className="text-text-muted mt-1">Real-time metrics from the Maika Pixel tracking engine.</p>
        </div>

        {/* System Health Module */}
        {stats?.systemHealth && (
          <div className="flex flex-col sm:flex-row bg-black/40 border border-white/5 rounded-xl p-3 gap-6 shadow-lg">
            <div className="flex items-center gap-3 sm:pr-6 sm:border-r border-white/10">
              <div className={cn("p-2.5 rounded-lg", stats.systemHealth.queueSize > 1000 ? "bg-amber-500/20 text-amber-500" : "bg-success/20 text-success")}>
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Engine Queue</p>
                <p className="text-sm font-bold text-white tracking-wide">{stats.systemHealth.queueSize.toLocaleString()} pending</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:pr-2">
              <div className={cn("p-2.5 rounded-lg", stats.systemHealth.errorRate > 5 ? "bg-danger/20 text-danger" : "bg-success/20 text-success")}>
                {stats.systemHealth.errorRate > 5 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">API Error Rate</p>
                <p className="text-sm font-bold text-white tracking-wide">{stats.systemHealth.errorRate.toFixed(2)}% failure</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <StatCard 
          title="Total MRR" 
          value={`৳${(stats?.totalMRR || 0).toLocaleString()}`} 
          trend="Live" 
          isPositive={true}
          icon={DollarSign} 
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Total Events Trends</h2>
            <div className="flex items-center gap-2">
              <select 
                value={eventsTimeframe} 
                onChange={(e: any) => setEventsTimeframe(e.target.value)} 
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-2 py-1 outline-none"
              >
                <option value="today">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={() => stats?.eventsChart && downloadCSV(stats.eventsChart[eventsTimeframe], 'Events', eventsTimeframe)}
                className="p-1.5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg transition-colors focus:outline-none"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.eventsChart?.[eventsTimeframe] || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MRR Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Live MRR Growth</h2>
            <div className="flex items-center gap-2">
              <select 
                value={mrrTimeframe} 
                onChange={(e: any) => setMrrTimeframe(e.target.value)} 
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-2 py-1 outline-none"
              >
                <option value="today">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={() => stats?.mrrChart && downloadCSV(stats.mrrChart[mrrTimeframe], 'MRR', mrrTimeframe)}
                className="p-1.5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg transition-colors focus:outline-none"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.mrrChart?.[mrrTimeframe] || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`৳${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMRR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
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
