import { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck, MoreHorizontal, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

export function Customers() {
  const { customers, toggleCustomerBlock } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-text-muted mt-1">Manage customer profiles, view history, and handle fraud blocks.</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by Name, Email, or Phone..." 
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
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact Info</th>
                <th className="p-4 font-medium">Orders (Total)</th>
                <th className="p-4 font-medium">Success Ratio</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">No customers found.</td>
                </tr>
              ) : filteredCustomers.map((customer) => {
                const successRate = Math.round((customer.successOrders / (customer.totalOrders || 1)) * 100);
                
                return (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-primary">{customer.name}</div>
                      <div className="text-xs text-text-muted">Joined: {customer.joinDate}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{customer.phone}</div>
                      <div className="text-xs text-text-muted">{customer.email}</div>
                    </td>
                    <td className="p-4 font-medium text-center w-24">
                      {customer.totalOrders}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden w-24">
                          <div 
                            className={cn("h-full transition-all duration-500", successRate >= 80 ? "bg-success" : successRate >= 50 ? "bg-warning" : "bg-danger")} 
                            style={{ width: `${successRate}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono">{successRate}%</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1">
                        <span className="text-success">{customer.successOrders} Success</span> • <span className="text-danger">{customer.cancelledOrders} Cancelled</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {customer.isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-danger/10 text-danger border-danger/20 flex items-center gap-1 w-max">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-success/10 text-success border-success/20 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleCustomerBlock(customer.phone)}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            customer.isBlocked ? "text-success hover:bg-success/10" : "text-text-muted hover:text-danger hover:bg-danger/10"
                          )}
                          title={customer.isBlocked ? "Unblock Customer" : "Block Customer"}
                        >
                          {customer.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                        <button className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded transition-colors" title="View Details">
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
