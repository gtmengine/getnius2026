'use client';

import React, { useEffect } from 'react';
import { Calendar, Lock, Mail, Sparkles, X } from 'lucide-react';
import type { PlanOption, PaywallPlanId } from './types';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

const planOptions: PlanOption[] = [
  {
    id: 'enterprise',
    title: 'Demo with Founder',
    priceLine: 'Custom solution',
    lines: ['15-minute intro'],
  },
  {
    id: 'free',
    title: 'Free Subscribe',
    priceLine: 'Daily updates',
    lines: ['Email or Telegram delivery'],
  },
  {
    id: 'pro',
    title: 'Pro Access',
    priceLine: '$50/month or $90/quarter*',
    lines: ['Unlimited searches', 'Advanced enrichment', 'Priority API access'],
  },
];

const handlePlanKeyDown = (
  event: React.KeyboardEvent<HTMLDivElement>,
  action: () => void
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};

export function PaywallModal({ open, onClose, onOpenAuth }: PaywallModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const handlePlanSelect = (planId: PaywallPlanId) => {
    if (planId === 'free') {
      onOpenAuth();
    }
  };

  const iconMap: Record<PaywallPlanId, React.ElementType> = {
    enterprise: Calendar,
    free: Mail,
    pro: Sparkles,
  };

  const PlanCard = ({
    plan,
    highlighted,
  }: {
    plan: PlanOption;
    highlighted?: boolean;
  }) => {
    const Icon = iconMap[plan.id];
    const action = () => handlePlanSelect(plan.id);
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={action}
        onKeyDown={(event) => handlePlanKeyDown(event, action)}
        aria-label={`Select ${plan.title} plan`}
        className={`flex h-full min-h-[200px] cursor-pointer flex-col gap-4 rounded-2xl border bg-white px-6 py-6 text-left shadow-sm transition-colors transition-shadow motion-safe:duration-200 motion-safe:transition-shadow motion-safe:transition-colors hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[220px] sm:px-7 sm:py-7 ${
          highlighted
            ? 'border-violet-400 bg-violet-50/30 shadow-[0_16px_36px_rgba(124,58,237,0.18)] ring-1 ring-violet-200'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)]'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <span className="block text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                {plan.title}
              </span>
            </div>
          </div>
        </div>
        <span className="text-[15px] font-semibold leading-5 text-violet-600 sm:text-base">
          {plan.priceLine}
        </span>
        {plan.id === 'pro' ? (
          <ul className="space-y-2 text-sm text-slate-600 sm:text-[15px]">
            {plan.lines.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-1.5 text-sm text-slate-600 sm:text-[15px]">
            {plan.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-[94vw] max-w-[820px] rounded-3xl border border-slate-200/80 bg-white px-7 py-7 shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:w-full sm:px-8 sm:py-8 max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors transition-shadow motion-safe:duration-200 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Close paywall"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col divide-y divide-slate-200/70">
          <div className="pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="paywall-title"
                  className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl"
                >
                  Unlock Full Intelligence
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Sign in to access all results and premium features
                </p>
              </div>
            </div>
          </div>

          <div className="py-6 sm:py-7">
            <div className="flex flex-col items-center gap-3">
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors transition-shadow motion-safe:duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-w-[280px]"
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M23.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.5c-.3 1.6-1.2 2.9-2.5 3.8v3h4c2.3-2.1 3.5-5.2 3.5-8.8z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-4-3c-1.1.7-2.5 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.4v3.1C3.4 21.5 7.4 24 12 24z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.6 14.5c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.8H1.4C.5 8.6 0 10.6 0 12.2s.5 3.6 1.4 5.4l4.2-3.1z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.7c1.7 0 3.3.6 4.5 1.7l3.3-3.3C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.5 1.4 6.8l4.2 3.1C6.5 6.7 9 4.7 12 4.7z"
                        fill="#EA4335"
                      />
                    </svg>
                  </span>
                  <span>Sign in with Google</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors transition-shadow motion-safe:duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-w-[280px]"
                >
                  <Mail className="h-5 w-5 text-slate-700" />
                  <span>Continue with Email</span>
                </button>
              </div>
              <p className="text-center text-xs text-slate-500">
                Secure authentication • No credit card required
              </p>
            </div>
          </div>

          <div className="pt-6 sm:pt-7">
            <p className="text-sm font-semibold text-slate-900">
              Or choose a plan directly:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
              {planOptions.map((plan) => (
                <PlanCard key={plan.id} plan={plan} highlighted={plan.id === 'pro'} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
