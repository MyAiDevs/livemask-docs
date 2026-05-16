import { useEffect, useState } from 'react';
import { Check, Crown, Sparkles, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/livemask/AppLayout';
import { client } from '@/lib/api';

interface SubscriptionPlan {
  id: number;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_nodes: number;
  bandwidth_limit: string;
  features: string;
  is_active: boolean;
}

interface UserSubscription {
  id: number;
  plan_id: number;
  status: string;
  renewal_date: string;
  payment_method: string;
}

export default function Plan() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSub, setUserSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch plans
        const plansRes = await client.entities.subscription_plans.query({
          query: {},
          sort: 'price_monthly',
          limit: 10,
        });
        if (plansRes?.data?.items) {
          setPlans(plansRes.data.items as SubscriptionPlan[]);
        }

        // Check auth and subscription
        try {
          const user = await client.auth.me();
          if (user?.data) {
            setIsLoggedIn(true);
            const subRes = await client.entities.user_subscriptions.query({
              query: {},
              limit: 1,
            });
            if (subRes?.data?.items?.length > 0) {
              setUserSub(subRes.data.items[0] as UserSubscription);
            }
          }
        } catch { /* not logged in */ }
      } catch {
        /* error loading plans */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function parseFeatures(features: string): string[] {
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  }

  const currentPlanId = userSub?.plan_id;
  const currentPlanName = plans.find((p) => p.id === currentPlanId)?.name || 'Free';

  return (
    <AppLayout>
    <div className="min-h-screen bg-background pb-20 xl:pb-0">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-bold text-foreground">Plan</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Current Plan Status */}
        {isLoggedIn && userSub && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[hsl(174,62%,32%)]" />
                  <span className="font-semibold text-foreground">Current Plan</span>
                </div>
                <Badge
                  className={cn(
                    'text-xs',
                    userSub.status === 'active' && 'bg-green-100 text-green-800',
                    userSub.status === 'expiring' && 'bg-amber-100 text-amber-800',
                    userSub.status === 'suspended' && 'bg-red-100 text-red-800'
                  )}
                >
                  {userSub.status === 'active' && 'Active'}
                  {userSub.status === 'expiring' && 'Expiring Soon'}
                  {userSub.status === 'suspended' && 'Suspended'}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{currentPlanName}</p>
              {userSub.renewal_date && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Renews {new Date(userSub.renewal_date).toLocaleDateString()}</span>
                </div>
              )}
              {userSub.payment_method && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{userSub.payment_method}</span>
                </div>
              )}
              {userSub.status === 'expiring' && (
                <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  Your plan is expiring soon. Renew to keep full access.
                </div>
              )}
              {userSub.status === 'suspended' && (
                <div className="mt-3 p-2 rounded bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  Your access is limited. Please update your payment method.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-2 py-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              billingCycle === 'monthly'
                ? 'bg-[hsl(174,62%,32%)] text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              billingCycle === 'yearly'
                ? 'bg-[hsl(174,62%,32%)] text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            Yearly
            <Badge className="ml-1.5 bg-green-100 text-green-800 text-[10px] px-1">Save 17%</Badge>
          </button>
        </div>

        {/* Plans */}
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[hsl(174,62%,32%)] border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading plans...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const features = parseFeatures(plan.features);
              const isCurrent = plan.id === currentPlanId;
              const isPopular = plan.name === 'Pro';
              const price =
                billingCycle === 'monthly'
                  ? plan.price_monthly
                  : plan.price_yearly
                    ? plan.price_yearly / 12
                    : plan.price_monthly;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden',
                    isPopular && 'border-[hsl(174,62%,32%)] shadow-md',
                    isCurrent && 'ring-2 ring-[hsl(174,62%,32%)]'
                  )}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-[hsl(174,62%,32%)] text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base font-bold">{plan.name}</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold">
                          ${price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {plan.bandwidth_limit} · Up to {plan.max_nodes} nodes
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-1.5 mb-4">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                          <Check className="h-3.5 w-3.5 text-[hsl(174,62%,32%)] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <Button
                        variant="outline"
                        className="w-full h-9 text-sm"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          'w-full h-9 text-sm',
                          isPopular
                            ? 'bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white'
                            : ''
                        )}
                        variant={isPopular ? 'default' : 'outline'}
                      >
                        {plan.price_monthly === 0 ? 'Get Started' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rewards Placeholder */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Rewards are coming soon</p>
              <p className="text-xs text-muted-foreground">
                Earn points and unlock exclusive benefits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  );
}