import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Plus, Edit2, ShieldAlert, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminBilling() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'plans'>('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, plansRes] = await Promise.all([
        fetch('/api/admin/billing/transactions').then(r => r.json()),
        fetch('/api/admin/billing/plans').then(r => r.json())
      ]);
      
      if (transRes.success) setTransactions(transRes.data);
      if (plansRes.success) setPlans(plansRes.data);
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const res = await fetch('/api/admin/billing/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPlan)
       });
       const data = await res.json();
       if (data.success) {
          setIsEditingPlan(false);
          fetchData();
       }
    } catch (error) {
       console.error('Failed to save plan', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className="text-text-muted mt-1">Manage pricing structures and monitor seller transactions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "pb-2 px-1 text-sm font-medium transition-colors border-b-2",
            activeTab === 'transactions' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-white"
          )}
        >
          Transaction Logs
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={cn(
            "pb-2 px-1 text-sm font-medium transition-colors border-b-2",
            activeTab === 'plans' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-white"
          )}
        >
          Pricing Plans
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading billing data...</div>
      ) : activeTab === 'transactions' ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-text-muted">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Seller Info</th>
                  <th className="p-4 font-medium">Plan Name</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">No transactions found.</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-text-muted">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <p className="font-medium text-white">{t.seller_name}</p>
                        <p className="text-xs text-text-muted">{t.seller_email}</p>
                      </td>
                      <td className="p-4"><span className="uppercase text-[10px] tracking-wider font-bold text-white bg-white/10 px-2 py-1 rounded-full">{t.plan_name}</span></td>
                      <td className="p-4 font-medium text-white">৳{t.amount}</td>
                      <td className="p-4 text-text-muted">{t.payment_method}</td>
                      <td className="p-4">
                        {t.status === 'completed' ? (
                           <span className="flex items-center gap-1 text-success text-xs font-medium"><CheckCircle className="w-3 h-3" /> Paid</span>
                        ) : (
                           <span className="flex items-center gap-1 text-danger text-xs font-medium"><ShieldAlert className="w-3 h-3" /> {t.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
                onClick={() => {
                   setCurrentPlan({ name: '', price: 0, event_limit: 0, features: [] });
                   setIsEditingPlan(true);
                }}
                className="bg-primary text-background hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> Create New Plan
             </button>
          </div>

          {isEditingPlan && (
            <div className="glass-card p-6 border border-primary/20">
              <h3 className="text-lg font-semibold mb-4">{currentPlan.id ? 'Edit Plan' : 'Create Plan'}</h3>
              <form onSubmit={savePlan} className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Plan Name (Code)</label>
                    <input type="text" value={currentPlan.name} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} className="input-field" required placeholder="e.g. basic" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Price (৳)</label>
                    <input type="number" value={currentPlan.price} onChange={e => setCurrentPlan({...currentPlan, price: Number(e.target.value)})} className="input-field" required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Event Limit (Monthly)</label>
                    <input type="number" value={currentPlan.event_limit} onChange={e => setCurrentPlan({...currentPlan, event_limit: Number(e.target.value)})} className="input-field" required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Features (Comma Separated)</label>
                    <input type="text" value={currentPlan.features?.join(', ')} onChange={e => setCurrentPlan({...currentPlan, features: e.target.value.split(',').map(s=>s.trim())})} className="input-field" placeholder="Dashboard, API, Support" />
                 </div>
                 <div className="col-span-2 pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditingPlan(false)} className="px-4 py-2 rounded-lg font-medium bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg font-medium bg-primary text-background hover:bg-primary/90 transition-colors">Save Plan</button>
                 </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="glass-card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold uppercase">{plan.name}</h3>
                  <button 
                     onClick={() => {
                        setCurrentPlan(plan);
                        setIsEditingPlan(true);
                     }}
                     className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-muted"
                  >
                     <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">৳{plan.price}</span>
                  <span className="text-text-muted">/mo</span>
                </div>
                <p className="text-sm text-text-muted mb-6">Limit: {plan.event_limit.toLocaleString()} logs</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
