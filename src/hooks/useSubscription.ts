import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export interface SubscriptionStatus {
  isPremium: boolean;
  premiumEndsAt: Date | null;
  premiumDaysLeft: number;
  trialEndsAt: Date;
  trialExpired: boolean;
  trialDaysLeft: number;
  mockTestsTaken: number;
  mockTestsAllowed: number;
  practiceTestsTaken: number;
  practiceTestsAllowed: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    premiumEndsAt: null,
    premiumDaysLeft: 0,
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    trialExpired: false,
    trialDaysLeft: 3,
    mockTestsTaken: 0,
    mockTestsAllowed: 1,
    practiceTestsTaken: 0,
    practiceTestsAllowed: 2,
  });
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    if (!user) {
       setLoading(false);
       return;
    }

    try {
      const now = Date.now();
      let isPremium = false;
      let premiumEndsAt: Date | null = null;
      let premiumDaysLeft = 0;

      if (user.user_metadata?.premium_ends_at) {
        premiumEndsAt = new Date(user.user_metadata.premium_ends_at);
        if (now < premiumEndsAt.getTime()) {
           isPremium = true;
           premiumDaysLeft = Math.max(0, Math.ceil((premiumEndsAt.getTime() - now) / (1000 * 60 * 60 * 24)));
        }
      }

      let trialEndsAt = new Date(new Date(user.created_at || now).getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const trialExpired = now > trialEndsAt.getTime();
      let trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now) / (1000 * 60 * 60 * 24)));

      const [{ count: mockTestsCount }, { count: practiceTestsCount }] = await Promise.all([
        supabase
          .from('test_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('practice_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      setStatus({
        isPremium,
        premiumEndsAt,
        premiumDaysLeft,
        trialEndsAt,
        trialExpired,
        trialDaysLeft,
        mockTestsTaken: mockTestsCount || 0,
        mockTestsAllowed: 1,
        practiceTestsTaken: practiceTestsCount || 0,
        practiceTestsAllowed: 2,
      });
    } catch (err) {
      console.error('Error fetching subscription status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user]);

  const upgradeToPremium = async () => {
     if (!user) return;
     try {
        const newEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.auth.updateUser({
           data: { is_premium: true, premium_ends_at: newEndsAt }
        });
        await checkStatus();
     } catch (err) {
        console.error("Upgrade failed", err);
     }
  };

  return { ...status, loading, upgradeToPremium, checkStatus };
}
