'use client';

import React, { useMemo } from 'react';
import { Check } from 'lucide-react';

import type { DemoTabId } from '@/lib/demo-mocks';

export type DemoStep = {
  id: string;
  title: string;
  description: string;
  tabId: DemoTabId;
  detail: string;
};

interface DemoStepperProps {
  steps: DemoStep[];
  activeStepId: string;
  onStepChange: (stepId: string) => void;
  onStepSelect: (tabId: DemoTabId) => void;
  showDetails?: boolean;
}

const assertSteps = (steps: DemoStep[]) => {
  if (!Array.isArray(steps)) {
    throw new Error('DemoStepper requires a steps array');
  }
  if (steps.length < 4 || steps.length > 6) {
    throw new Error('DemoStepper steps must include 4 to 6 items');
  }
  steps.forEach((step, index) => {
    if (
      !step ||
      typeof step.id !== 'string' ||
      typeof step.title !== 'string' ||
      typeof step.description !== 'string' ||
      typeof step.tabId !== 'string' ||
      typeof step.detail !== 'string'
    ) {
      throw new Error(`Invalid step at index ${index}`);
    }
  });
};

export function DemoStepper({
  steps,
  activeStepId,
  onStepChange,
  onStepSelect,
  showDetails = true,
}: DemoStepperProps) {
  if (process.env.NODE_ENV !== 'production') {
    assertSteps(steps);
  }

  const activeIndex = useMemo(
    () => Math.max(0, steps.findIndex((step) => step.id === activeStepId)),
    [activeStepId, steps]
  );

  const activeStep = steps[activeIndex] ?? steps[0];

  return (
    <div className={showDetails ? "grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]" : ""}>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep.id;
          const isComplete = index < activeIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                onStepChange(step.id);
                onStepSelect(step.tabId);
              }}
              className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
                isActive
                  ? 'border-indigo-200 bg-indigo-50/60 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40'
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isComplete
                    ? 'bg-indigo-600 text-white'
                    : isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-slate-900">{step.title}</span>
                <span className="block text-xs text-slate-500 group-hover:text-slate-600">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {showDetails ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step {activeIndex + 1}</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{activeStep.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{activeStep.description}</p>
          <p className="mt-4 text-sm font-semibold text-indigo-700">{activeStep.detail}</p>
        </div>
      ) : null}
    </div>
  );
}
