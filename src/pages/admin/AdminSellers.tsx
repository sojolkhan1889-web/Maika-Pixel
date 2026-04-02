import React, { useEffect, useState } from 'react';
import { Users, Ban, CheckCircle, Search, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers');
      const data = await res.json();
      if (data.success) {
        setSellers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/sellers/${id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSellers(sellers.map(s => s.id === id ? { ...s, is_blocked: !currentStatus } : s));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.email?.toLowerCase().includes(search.toLowerCase()) || 
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Manage Sellers</h1>
          <p className="text-text-muted mt-1">View and manage all registered sellers on the platform.</p>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-text-muted">
              <tr>
                <th className="p-4 font-medium">Seller Info</th>
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">Loading sellers...</td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">No sellers found.</td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {seller.name?.charAt(0) || seller.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{seller.name || 'Unknown'}</p>
                          <p className="text-xs text-text-muted">{seller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-muted">{seller.company || '-'}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold",
                        seller.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {seller.role || 'seller'}
                      </span>
                    </td>
                    <td className="p-4">
                      {seller.is_blocked ? (
                        <span className="flex items-center gap-1 text-danger text-xs font-medium">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-success text-xs font-medium">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-text-muted">
                      {new Date(seller.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleBlockStatus(seller.id, seller.is_blocked)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          seller.is_blocked 
                            ? "bg-success/10 text-success hover:bg-success/20" 
                            : "bg-danger/10 text-danger hover:bg-danger/20"
                        )}
                      >
                        {seller.is_blocked ? 'Unblock' : 'Block'}
                      </button>
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
