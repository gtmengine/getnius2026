'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

const planOptions = [
  {
    id: 'pro',
    title: 'Unlimited Access',
    priceLine: '$50/mo',
    secondaryPriceLine: 'or $90/qtr',
    description: 'Full access to every search result.',
    disclaimer: '*No abuse policy, within rolling session budget',
    highlighted: true,
  },
  {
    id: 'free',
    title: 'Daily Updates',
    priceLine: 'Free',
    description: 'Daily email + Telegram highlights.',
    footnote: 'Revive market updates related to your search',
  },
];

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

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
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-[94vw] max-w-[520px] rounded-3xl border border-slate-200/80 bg-white px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:w-full sm:px-8 sm:py-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-paywall-title"
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
              id="demo-paywall-title"
              className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl"
            >
              Your preview ended.
            </h2>
            <p className="text-sm text-slate-600">
              Pick how you want to keep getting results.
            </p>
            <button
              type="button"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-sm font-semibold text-purple-700 shadow-sm transition-colors hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              Demo with founder
            </button>
          </div>
          <div className="space-y-4">
            {planOptions.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex min-h-[140px] w-full flex-col justify-between gap-4 rounded-2xl border px-5 py-5 text-left shadow-sm sm:px-6 sm:py-6 ${
                  plan.highlighted
                    ? 'border-slate-300 bg-slate-50 ring-1 ring-slate-300'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-base font-semibold text-slate-900 sm:text-lg">{plan.title}</p>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
                <div className="mt-6">
                  <p className="text-lg font-semibold tracking-tight leading-none whitespace-nowrap text-slate-900 sm:text-xl">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
