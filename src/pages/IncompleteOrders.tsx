import React, { useState, useEffect } from 'react';
import { useAppStore, IncompleteOrder } from '@/store/useAppStore';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MessageCircle, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function IncompleteOrders() {
  const { 
    incompleteOrders, 
    fetchIncompleteOrders,
    updateIncompleteOrderStatusAsync, 
    deleteIncompleteOrderAsync, 
    updateLastContactedAsync,
    isLoadingIncompleteOrders
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchIncompleteOrders();
  }, [fetchIncompleteOrders]);

  // Metrics Calculation
  const totalAbandoned = incompleteOrders.length;
  const recovered = incompleteOrders.filter(o => o.status === 'Recovered').length;
  const recoveryRate = totalAbandoned > 0 ? Math.round((recovered / totalAbandoned) * 100) : 0;
  
  const lostRevenue = incompleteOrders
    .filter(o => o.status === 'Pending' || o.status === 'Lost')
    .reduce((sum, order) => {
      const amount = parseInt(order.total.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + amount;
    }, 0);

  // Filtering
  const filteredOrders = incompleteOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleWhatsAppContact = (order: IncompleteOrder) => {
    updateLastContactedAsync(order.id);
    const phone = order.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${order.customerName || 'there'},\n\nWe noticed you left "${order.productName}" in your cart. Do you need any help completing your order? Let us know!`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Recovered': return <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Recovered</span>;
      case 'Lost': return <span className="px-2 py-1 rounded-full bg-danger/10 text-danger text-xs font-medium border border-danger/20 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> Lost</span>;
      case 'Pending': return <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium border border-warning/20 flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Pending</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Incomplete Orders
        </h1>
        <p className="text-text-muted mt-1">Track abandoned carts and recover lost revenue through direct contact.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/20 rounded-lg text-warning">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-text-muted">Total Abandoned</h3>
          </div>
          <p className="text-2xl font-bold">{totalAbandoned}</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/20 rounded-lg text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-text-muted">Recovered Orders</h3>
          </div>
          <p className="text-2xl font-bold">{recovered}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-text-muted">Recovery Rate</h3>
          </div>
          <p className="text-2xl font-bold">{recoveryRate}%</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-danger/20 rounded-lg text-danger">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-text-muted">Lost Revenue</h3>
          </div>
          <p className="text-2xl font-bold">৳ {lostRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID..." 
            className="input-field pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <select 
            className="input-field pl-9 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Recovered">Recovered</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-sm font-semibold text-text-muted">Order Info</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Customer</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Product & Amount</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Status</th>
                <th className="p-4 text-sm font-semibold text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingIncompleteOrders && incompleteOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-muted">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-muted">
                    No incomplete orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm text-primary">{order.id}</div>
                      <div className="text-xs text-text-muted mt-1" title={format(new Date(order.date), 'PPpp')}>
                        {formatDistanceToNow(new Date(order.date), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{order.customerName || 'Unknown'}</div>
                      <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm truncate max-w-[200px]" title={order.productName}>{order.productName}</div>
                      <div className="font-semibold text-white mt-1">{order.total}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(order.status)}
                        {order.lastContacted && (
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Contacted {formatDistanceToNow(new Date(order.lastContacted), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleWhatsAppContact(order)}
                              className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg transition-colors"
                              title="Contact via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateIncompleteOrderStatusAsync(order.id, 'Recovered')}
                              className="p-2 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors"
                              title="Mark as Recovered"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateIncompleteOrderStatusAsync(order.id, 'Lost')}
                              className="p-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg transition-colors"
                              title="Mark as Lost"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => deleteIncompleteOrderAsync(order.id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-2"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
