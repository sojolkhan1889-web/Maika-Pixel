import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck, MoreHorizontal, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Order } from '@/store/useAppStore';

const TABS = ['All', 'Processing', 'Purchase', 'Confirmed', 'Delivered', 'Cancelled', 'Trash'];

export function Orders() {
  const { orders, customers, fetchOrders, updateOrderStatusAsync, toggleCustomerBlockAsync, isLoadingOrders } = useAppStore();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = activeTab === 'All' || order.status === activeTab;
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.phone.includes(searchQuery);
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatusAsync(orderId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-text-muted mt-1">Manage orders and trigger Facebook CAPI events.</p>
        </div>
        <button className="btn-primary">Export CSV</button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/10 overflow-x-auto pb-px">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-text-muted hover:text-text-primary hover:border-white/20"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name, or Phone..." 
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-text-muted border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">History Ratio</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">FB CAPI</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingOrders && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">No orders found.</td>
                </tr>
              ) : filteredOrders.map((order) => {
                const customer = customers.find(c => c.phone === order.phone);
                const success = customer?.successOrders || 0;
                const cancel = customer?.cancelledOrders || 0;
                const isBlocked = customer?.isBlocked || false;

                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-primary">{order.id}</td>
                    <td className="p-4">
                      <div className="font-medium flex items-center gap-2">
                        {order.customerName}
                        {isBlocked && <ShieldAlert className="w-3 h-3 text-danger" title="Blocked Customer" />}
                      </div>
                      <div className="text-xs text-text-muted">{order.phone}</div>
                    </td>
                    <td className="p-4">
                      <HistoryBar success={success} cancel={cancel} />
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border bg-transparent outline-none cursor-pointer appearance-none",
                          order.status === 'Purchase' ? 'text-success border-success/20 bg-success/10' :
                          order.status === 'Processing' ? 'text-warning border-warning/20 bg-warning/10' :
                          order.status === 'Cancelled' ? 'text-danger border-danger/20 bg-danger/10' :
                          'text-white border-white/20 bg-white/10'
                        )}
                      >
                        {TABS.filter(t => t !== 'All').map(t => (
                          <option key={t} value={t} className="bg-card text-text-primary">{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <FBStatusBadge status={order.fbStatus} />
                    </td>
                    <td className="p-4 font-medium">{order.total}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const cust = customers.find(c => c.phone === order.phone);
                            if (cust) toggleCustomerBlockAsync(cust.id, isBlocked);
                          }}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            isBlocked ? "text-success hover:bg-success/10" : "text-text-muted hover:text-danger hover:bg-danger/10"
                          )}
                          title={isBlocked ? "Unblock Customer" : "Block Customer"}
                        >
                          {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                        <button className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HistoryBar({ success, cancel }: { success: number, cancel: number }) {
  const total = success + cancel || 1;
  const successPct = (success / total) * 100;
  const cancelPct = (cancel / total) * 100;

  return (
    <div className="w-24">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-success">{success}</span>
        <span className="text-danger">{cancel}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
        <div className="bg-success h-full transition-all duration-500" style={{ width: `${successPct}%` }} />
        <div className="bg-danger h-full transition-all duration-500" style={{ width: `${cancelPct}%` }} />
      </div>
    </div>
  );
}

function FBStatusBadge({ status }: { status: string }) {
  if (status === 'Sent') return <div className="flex items-center gap-1 text-success text-xs"><CheckCircle2 className="w-4 h-4" /> Sent</div>;
  if (status === 'Pending') return <div className="flex items-center gap-1 text-warning text-xs"><Clock className="w-4 h-4" /> Pending</div>;
  if (status === 'Failed') return <div className="flex items-center gap-1 text-danger text-xs"><XCircle className="w-4 h-4" /> Failed</div>;
  return null;
}
