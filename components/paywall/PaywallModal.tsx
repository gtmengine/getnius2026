'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { PaywallPlanId } from './types';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { buildOAuthRedirectUrl } from '@/lib/supabase/redirect';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenSubscribe?: () => void;
  isSubscribeOpen?: boolean;
}

const planOptions: Array<{
  id: PaywallPlanId;
  title: string;
  priceLine: string;
  secondaryPriceLine?: string;
  disclaimer?: string;
  footnote?: string;
  highlighted?: boolean;
}> = [
  {
    id: 'pro',
    title: 'Unlimited Access',
    priceLine: '$50/mo',
    secondaryPriceLine: 'or $90/qtr',
    disclaimer: '*No abuse policy, within rolling session budget',
    highlighted: true,
  },
  {
    id: 'free',
    title: 'Daily Updates',
    priceLine: 'Free',
    footnote: 'Receive market updates related to your search',
  },
];

export function PaywallModal({
  open,
  onClose,
  onOpenAuth,
  onOpenSubscribe,
  isSubscribeOpen = false,
}: PaywallModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanId>('pro');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  useEffect(() => {
    if (!open) return;
    setIsSigningIn(false);
    setSignInError('');
  }, [open]);

  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSignInError(
        'Google sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
      return;
    }

    try {
      setIsSigningIn(true);
      setSignInError('');
      const returnTo = `${window.location.pathname}${window.location.search}`;
      const redirectTo = buildOAuthRedirectUrl(returnTo);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: redirectTo ? { redirectTo } : undefined,
      });
      if (error) {
        setSignInError(error.message);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    if (!open || isSubscribeOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const container = dialogRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === container) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubscribeOpen, onClose, open]);

  if (!open) return null;

  const PlanCard = ({
    plan,
    isSelected,
    onSelect,
  }: {
    plan: (typeof planOptions)[number];
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={isSelected}
      className={`relative flex min-h-[140px] w-full flex-col justify-between gap-4 rounded-2xl border bg-white px-5 py-5 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-6 sm:py-6 ${
        isSelected
          ? 'border-slate-300 bg-slate-50 ring-1 ring-slate-300 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-slate-900 sm:text-lg">{plan.title}</p>
        <p className="text-sm text-slate-500">
          {plan.id === 'pro'
            ? 'Full access to every search result.'
            : 'Daily email + Telegram highlights.'}
        </p>
      </div>
      <div className="mt-6">
        <p
          className={`text-lg font-semibold tracking-tight leading-none whitespace-nowrap sm:text-xl ${
            isSelected ? 'text-slate-900' : 'text-slate-700'
          }`}
        >
          {plan.secondaryPriceLine
            ? `${plan.priceLine} ${plan.secondaryPriceLine}`
            : plan.priceLine}
        </p>
        {plan.disclaimer ? (
          <p className="mt-2 text-xs leading-snug text-slate-500 break-words">
            {plan.disclaimer}
          </p>
        ) : null}
        {plan.footnote ? (
          <p className="mt-2 text-xs leading-snug text-slate-500 break-words">
            {plan.footnote}
          </p>
        ) : null}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        ref={dialogRef}
        className="relative w-[94vw] max-w-[520px] rounded-3xl border border-slate-200/80 bg-white px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:w-full sm:px-8 sm:py-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        <button
          type="button"
          onClick={onClose}
          ref={closeButtonRef}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors transition-shadow motion-safe:duration-200 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Close paywall"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              UNLOCK FULL ACCESS
            </p>
            <h2
              id="paywall-title"
              className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl"
            >
              Your preview ended.
            </h2>
            <p className="text-sm text-slate-600">
              Pick how you want to keep getting results.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              aria-label="Sign in with Google"
              disabled={isSigningIn}
              className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h6.47a5.54 5.54 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.54-5.17 3.54-8.66Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-3.01c-1.08.73-2.46 1.17-4.05 1.17-3.12 0-5.76-2.11-6.7-4.95H1.29v3.11A12 12 0 0 0 12 24Z"
                  fill="#34A853"
                />
                <path
                  d="M5.3 14.29a7.19 7.19 0 0 1 0-4.58V6.6H1.29a12 12 0 0 0 0 10.8l4.01-3.11Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.6l4.01 3.11C6.24 6.87 8.88 4.76 12 4.76Z"
                  fill="#EA4335"
                />
              </svg>
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
            {signInError ? (
              <p className="mt-2 text-xs text-rose-600">{signInError}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Choose a plan">
            {planOptions.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={() => {
                  setSelectedPlan(plan.id);
                  if (plan.id === 'free') {
                    onOpenSubscribe?.();
                    return;
                  }
                  router.push('/app/pricing');
                  onClose();
                }}
              />
            ))}
          </div>

          <div className="flex w-full justify-center">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Demo with founder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
