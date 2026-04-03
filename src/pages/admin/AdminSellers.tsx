import React, { useEffect, useState } from 'react';
import { Users, Ban, CheckCircle, Search, ShieldAlert, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSellers();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/billing/plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

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

  const updatePlan = async (id: string, newPlan: string) => {
    try {
      const res = await fetch(`/api/admin/sellers/${id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      const data = await res.json();
      if (data.success) {
        setSellers(sellers.map(s => s.id === id ? { ...s, plan: newPlan } : s));
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleImpersonate = (sellerId: string) => {
    localStorage.setItem('impersonate_id', sellerId);
    window.open('/', '_blank');
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
                <th className="p-4 font-medium">Seller Info (ID & Phone)</th>
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Plan</th>
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
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                          {seller.name?.charAt(0) || seller.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{seller.name || 'Unknown'}</p>
                          <p className="text-xs text-text-muted">{seller.email}</p>
                          <p className="text-[10px] text-text-muted mt-1 font-mono">ID: {seller.id.split('-')[0]}</p>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-text-muted">
                            <span>📞 {seller.phone || 'N/A'}</span>
                            {seller.phone && (
                              <a 
                                href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-500 hover:text-green-400 opacity-80 hover:opacity-100 transition-opacity"
                                title="Message on WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                </svg>
                              </a>
                            )}
                          </div>
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
                      <select
                        value={seller.plan || 'free'}
                        onChange={(e) => updatePlan(seller.id, e.target.value)}
                        className="bg-black/40 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                      >
                        {plans.length > 0 ? plans.map(p => (
                           <option key={p.id} value={p.name}>
                              {p.name.charAt(0).toUpperCase() + p.name.slice(1)} {p.price > 0 ? `(৳${p.price})` : '(Free)'}
                           </option>
                        )) : (
                           <>
                              <option value="free">Free</option>
                              <option value="basic">Basic</option>
                           </>
                        )}
                      </select>
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
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleImpersonate(seller.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white/5 text-white hover:bg-white/10 inline-flex items-center gap-1"
                        title="Impersonate (Login As)"
                      >
                        <KeyRound className="w-3 h-3" /> Login As
                      </button>
                      <button 
                        onClick={() => toggleBlockStatus(seller.id, seller.is_blocked)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1",
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
