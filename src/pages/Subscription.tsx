import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '৳999',
    period: '/mo',
    description: 'Perfect for small businesses just getting started with CAPI.',
    features: [
      '1 Website',
      '1 Facebook Pixel',
      '500 Orders / month',
      'Basic Fraud Block',
      'Standard Support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '৳2499',
    period: '/mo',
    description: 'Ideal for growing e-commerce stores with higher volume.',
    features: [
      '5 Websites',
      '5 Facebook Pixels',
      'Unlimited Orders',
      'Advanced Fraud Block',
      'Priority Support',
      'Incomplete Order Tracking'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '৳4999',
    period: '/mo',
    description: 'For agencies and large scale businesses requiring maximum power.',
    features: [
      'Unlimited Websites',
      'Unlimited Pixels',
      'Unlimited Orders',
      'Custom Event Mapping',
      '24/7 Dedicated Support',
      'White-label Reports'
    ]
  }
];

export function Subscription() {
  const { subscriptionPlan, setSubscriptionPlan } = useAppStore();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-text-muted mt-2">
          Choose the perfect plan for your tracking needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {PLANS.map((plan) => {
          const isCurrent = subscriptionPlan === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "relative glass-card p-8 flex flex-col transition-all duration-300",
                plan.popular && !isCurrent && "border-primary shadow-[0_0_30px_rgba(108,71,255,0.15)] scale-105 z-10",
                isCurrent && "border-success shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-105 z-10"
              )}
            >
              {isCurrent ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Current Plan
                </div>
              ) : plan.popular ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </div>
              ) : null}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-text-muted mt-2 h-10">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-text-muted">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className={cn("w-5 h-5 shrink-0", isCurrent ? "text-success" : "text-primary")} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => setSubscriptionPlan(plan.id)}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                  isCurrent 
                    ? "bg-success/10 text-success cursor-default border border-success/20" 
                    : plan.popular 
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
