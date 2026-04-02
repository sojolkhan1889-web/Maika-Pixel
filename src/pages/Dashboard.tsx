import { useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, Target, Users, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { format, subDays, isAfter } from 'date-fns';

const COLORS = ['#6C47FF', '#10B981', '#EF4444', '#F59E0B', '#00D4FF'];

export function Dashboard() {
  const { eventLogs, pixels, fetchEventLogs, fetchPixels } = useAppStore();

  useEffect(() => {
    fetchEventLogs();
    fetchPixels();
  }, [fetchEventLogs, fetchPixels]);

  // Calculate dynamic stats from real eventLogs
  const totalEvents = eventLogs.length;
  const activePixels = pixels.filter(p => p.status === 'active').length;
  const eventsSent = eventLogs.filter(e => e.status === 'success').length;
  
  // Calculate Purchases
  const purchases = eventLogs.filter(e => e.eventName === 'Purchase').length;

  // Calculate Pie Chart Data dynamically based on Event Names
  const eventCounts = eventLogs.reduce((acc, log) => {
    acc[log.eventName] = (acc[log.eventName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(eventCounts).map(key => ({
    name: key,
    value: eventCounts[key]
  }));

  // Generate line chart data for the last 7 days
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      
      const dayEvents = eventLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getDate() === date.getDate() && logDate.getMonth() === date.getMonth();
      });

      data.push({
        name: dateStr,
        events: dayEvents.length,
        purchases: dayEvents.filter(e => e.eventName === 'Purchase').length
      });
    }
    return data;
  };

  const data = generateChartData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-1">Welcome back. Here's what's happening with your tracking today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Events" value={totalEvents.toString()} trend="+12.5%" isPositive={true} icon={Target} />
        <StatCard title="Events Sent to FB" value={eventsSent.toString()} trend="+5.2%" isPositive={true} icon={Target} />
        <StatCard title="Total Purchases" value={purchases.toString()} trend="+2.4%" isPositive={true} icon={ShoppingCart} />
        <StatCard title="Active Pixels" value={activePixels.toString()} trend="0%" isPositive={true} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Event Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #ffffff10', borderRadius: '8px' }} itemStyle={{ color: '#F1F5F9' }} />
                <Line type="monotone" dataKey="events" stroke="#00D4FF" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="purchases" stroke="#6C47FF" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #ffffff10', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-text-muted">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className={`flex items-center gap-1 mt-4 text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span className="font-medium">{trend}</span>
        <span className="text-text-muted ml-1">vs last week</span>
      </div>
    </div>
  );
}
