import { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, DollarSign, ShoppingCart, Target, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { isAfter, subDays, startOfDay, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#6C47FF', '#10B981', '#EF4444', '#F59E0B', '#00D4FF', '#8B5CF6'];

// Helper to parse currency strings like "৳ 2,450" to numbers
const parseCurrency = (val: string) => Number(val.replace(/[^0-9.-]+/g, ""));

export function Analytics() {
  const { orders, customers } = useAppStore();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // 1. Filter Orders based on Date Range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      // Handle both ISO strings and "YYYY-MM-DD hh:mm AM/PM" formats safely
      const orderDate = new Date(o.date);
      if (isNaN(orderDate.getTime())) return true; // Fallback if date is unparseable

      if (dateRange === 'today') return isAfter(orderDate, startOfDay(now));
      if (dateRange === '7days') return isAfter(orderDate, subDays(now, 7));
      if (dateRange === '30days') return isAfter(orderDate, subDays(now, 30));
      return true;
    });
  }, [orders, dateRange]);

  // 2. Calculate Key Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseCurrency(o.total), 0);
    const totalOrders = filteredOrders.length;
    const fbEventsSent = filteredOrders.filter(o => o.fbStatus === 'Sent').length;
    const successfulOrders = filteredOrders.filter(o => ['Purchase', 'Confirmed', 'Delivered'].includes(o.status)).length;
    const conversionRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : '0.0';

    return { totalRevenue, totalOrders, fbEventsSent, conversionRate };
  }, [filteredOrders]);

  // 3. Prepare Trend Chart Data (Revenue & Orders over time)
  const trendData = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const dateObj = new Date(order.date);
      const dateStr = isNaN(dateObj.getTime()) ? 'Unknown' : format(dateObj, 'MMM dd');
      
      if (!acc[dateStr]) {
        acc[dateStr] = { name: dateStr, orders: 0, revenue: 0, timestamp: dateObj.getTime() || 0 };
      }
      acc[dateStr].orders += 1;
      acc[dateStr].revenue += parseCurrency(order.total);
      return acc;
    }, {} as Record<string, { name: string, orders: number, revenue: number, timestamp: number }>);

    return Object.values(grouped).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [filteredOrders]);

  // 4. Prepare Order Status Distribution Data
  const statusData = useMemo(() => {
    const counts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredOrders]);

  // 5. Prepare FB CAPI Performance Data
  const fbCapiData = useMemo(() => {
    const counts = filteredOrders.reduce((acc, order) => {
      acc[order.fbStatus] = (acc[order.fbStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Sent', value: counts['Sent'] || 0, fill: '#10B981' },
      { name: 'Pending', value: counts['Pending'] || 0, fill: '#F59E0B' },
      { name: 'Failed', value: counts['Failed'] || 0, fill: '#EF4444' },
    ];
  }, [filteredOrders]);

  // 6. Top Customers
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.successOrders - a.successOrders)
      .slice(0, 5);
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-text-muted mt-1">Deep dive into your tracking performance and revenue metrics.</p>
        </div>
        
        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
          <FilterButton active={dateRange === 'today'} onClick={() => setDateRange('today')} label="Today" />
          <FilterButton active={dateRange === '7days'} onClick={() => setDateRange('7days')} label="7 Days" />
          <FilterButton active={dateRange === '30days'} onClick={() => setDateRange('30days')} label="30 Days" />
          <FilterButton active={dateRange === 'all'} onClick={() => setDateRange('all')} label="All Time" />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`৳ ${metrics.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-success" 
          bg="bg-success/10" 
        />
        <MetricCard 
          title="Total Orders" 
          value={metrics.totalOrders.toString()} 
          icon={ShoppingCart} 
          color="text-primary" 
          bg="bg-primary/10" 
        />
        <MetricCard 
          title="FB Events Sent" 
          value={metrics.fbEventsSent.toString()} 
          icon={Target} 
          color="text-secondary" 
          bg="bg-secondary/10" 
        />
        <MetricCard 
          title="Conversion Rate" 
          value={`${metrics.conversionRate}%`} 
          icon={TrendingUp} 
          color="text-warning" 
          bg="bg-warning/10" 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Trend */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Revenue & Orders Trend
          </h3>
          <div className="h-[300px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #ffffff10', borderRadius: '8px' }} 
                    itemStyle={{ color: '#F1F5F9' }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line yAxisId="left" type="monotone" name="Revenue" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" name="Orders" dataKey="orders" stroke="#6C47FF" strokeWidth={3} dot={{ r: 4, fill: '#6C47FF' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No data available for this period.</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Order Status
          </h3>
          <div className="h-[250px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #ffffff10', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No data available.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-4 max-h-[60px] overflow-y-auto custom-scrollbar">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-text-muted bg-white/5 px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FB CAPI Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" /> FB CAPI Performance
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fbCapiData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" tick={{fill: '#64748B'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #ffffff10', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {fbCapiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Top Customers (By Success)
          </h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-text-muted border-b border-white/10">
                <tr>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-center">Total Orders</th>
                  <th className="pb-3 font-medium text-center">Success</th>
                  <th className="pb-3 font-medium text-center">Cancelled</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-text-primary">{customer.name}</div>
                      <div className="text-xs text-text-muted">{customer.phone}</div>
                    </td>
                    <td className="py-3 text-center font-medium">{customer.totalOrders}</td>
                    <td className="py-3 text-center text-success">{customer.successOrders}</td>
                    <td className="py-3 text-center text-danger">{customer.cancelledOrders}</td>
                    <td className="py-3 text-right">
                      {customer.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-danger/10 text-danger border border-danger/20">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-success/10 text-success border border-success/20">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {topCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
        active ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text-primary hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className={cn("p-4 rounded-xl", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div>
        <p className="text-text-muted text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
    </div>
  );
}
