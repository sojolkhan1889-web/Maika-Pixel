import { useEffect } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

// Dynamic Plans replaced static mapping

export function Subscription() {
  const { subscriptionPlan, fetchSubscription, upgradeSubscriptionAsync, isLoadingSubscription } = useAppStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetchSubscription();
    fetch('/api/subscriptions/plans')
      .then(res => res.json())
      .then(data => {
         if (data.success) {
            setPlans(data.data);
         }
         setLoadingPlans(false);
      })
      .catch(err => {
         console.error('Failed to load plans', err);
         setLoadingPlans(false);
      });
  }, [fetchSubscription]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {(isLoadingSubscription || loadingPlans) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-text-muted mt-2">
          Choose the perfect plan for your tracking needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        {plans.map((plan: any) => {
          const isCurrent = subscriptionPlan === plan.name;
          // Determine scale visually based on arbitrary heuristic for 'popular' if desired, or skip it.
          const isPopular = plan.name === 'pro';
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "relative glass-card p-6 flex flex-col transition-all duration-300",
                isPopular && !isCurrent && "border-primary shadow-[0_0_30px_rgba(108,71,255,0.15)] scale-105 z-10",
                isCurrent && "border-success shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-105 z-10"
              )}
            >
              {isCurrent ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Current Plan
                </div>
              ) : isPopular ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </div>
              ) : null}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold uppercase">{plan.name}</h3>
                <p className="text-sm text-text-muted mt-2 h-[40px]">Up to {plan.event_limit.toLocaleString()} logs.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">৳{plan.price}</span>
                  <span className="text-text-muted">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className={cn("w-5 h-5 shrink-0", isCurrent ? "text-success" : "text-primary")} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => upgradeSubscriptionAsync(plan.name)}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                  isCurrent 
                    ? "bg-success/10 text-success cursor-default border border-success/20" 
                    : isPopular 
                      ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                )}
                disabled={isCurrent}
              >
                {!isCurrent && <CreditCard className="w-4 h-4" />}
                {isCurrent ? 'Active Plan' : `Subscribe ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-semibold text-lg">Payment Methods</h4>
          <p className="text-sm text-text-muted mt-1">We accept all major credit cards, bKash, and Nagad via SSLCommerz & Stripe.</p>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-16 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/50">SSL</div>
          <div className="h-10 w-16 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/50">Stripe</div>
          <div className="h-10 w-16 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/50">bKash</div>
        </div>
      </div>
    </div>
  );
}
