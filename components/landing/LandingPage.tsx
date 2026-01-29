'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoArea } from '@/components/landing/DemoArea';
import { DemoStepper, DemoStep } from '@/components/landing/DemoStepper';
import { LogoLandingLink } from '@/components/LogoLandingLink';
import type { DemoTabId } from '@/lib/demo-mocks';

const steps: DemoStep[] = [
  {
    id: 'focus',
    title: 'Pick the market focus',
    description: 'Start with a market, region, or account list. Getnius auto-shapes the query.',
    tabId: 'companies',
    detail: 'Switches the demo to the Companies view with a focused market list.',
  },
  {
    id: 'signal',
    title: 'Stack intent signals',
    description: 'Layer funding, hiring, product launches, and news to prioritize the right accounts.',
    tabId: 'signals',
    detail: 'Shows signals with chips and score-driven ranking.',
  },
  {
    id: 'enrich',
    title: 'Enrich every record',
    description: 'Instantly append size, revenue, and team signals so lists are ready to use.',
    tabId: 'people',
    detail: 'Loads People with enriched roles, emails, and intent signals.',
  },
  {
    id: 'decide',
    title: 'Review & shortlist',
    description: 'Open a result, scan the summary, and decide who moves forward.',
    tabId: 'news',
    detail: 'Switches to News so you can review match and relevance.',
  },
  {
    id: 'track',
    title: 'Monitor daily updates',
    description: 'Set alerts to stay current on fast-moving markets and competitors.',
    tabId: 'marketReports',
    detail: 'Shows market reports and updates-ready research insights.',
  },
];

export function LandingPage() {
  const [activeStepId, setActiveStepId] = useState(steps[0]?.id ?? 'focus');
  const [showDemo, setShowDemo] = useState(false);
  const [activeDemoTabId, setActiveDemoTabId] = useState<DemoTabId>('companies');
  const [focusSearch, setFocusSearch] = useState(false);
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const handleStepChange = (stepId: string) => {
    setActiveStepId(stepId);
    setShowDemo(true);
  };
  const handleStepSelect = (tabId: DemoTabId) => {
    setActiveDemoTabId(tabId);
    setShowDemo(true);
  };
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId)
  );
  const activeStep = steps[activeStepIndex] ?? steps[0];

  useEffect(() => {
    if (!showDemo) return;
    demoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFocusSearch(true);
  }, [showDemo]);

  const useCases = useMemo(
    () => [
      {
        title: 'Sales prospecting',
        description: 'Find ICP-fit accounts with recent buying signals and ship-ready data.',
      },
      {
        title: 'Competitive intel',
        description: 'Track moves from competitors, partners, and adjacent startups in minutes.',
      },
      {
        title: 'Strategy & research',
        description: 'Build market maps and evaluate TAM with fresh, contextual signals.',
      },
      {
        title: 'Market monitoring',
        description: 'Stay ahead of emerging players, funding, and expansion signals.',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <LogoLandingLink
                textClassName="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              />
              <nav className="hidden md:flex gap-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg transition-colors"
                >
                  New Search
                </Link>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
                  aria-disabled="true"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="hidden sm:inline-flex">
                <Button variant="outline">Open app</Button>
              </Link>
              <Button onClick={() => setShowDemo(true)}>
                Try the demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pb-16">
        <section className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              <Sparkles className="h-4 w-4" />
              AI research workflow
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Turn market questions into decision-ready company lists.
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Getnius combines search, enrichment, and signal tracking so you can find the right accounts
              faster. From prospecting to competitive intel, stay ahead with curated results in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setShowDemo(true)}>
                Try the demo
              </Button>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Open app
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-5">
            <Card className="border-indigo-200/60 bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Instant clarity</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Turn fragmented market data into prioritized company lists with enrichment baked in.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signal-driven filtering</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Track funding, hiring, launches, and coverage so you focus on the hottest signals.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily monitoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Keep searches alive with recurring updates and alert-driven summaries.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-10" ref={demoSectionRef}>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">How it works</p>
            <h2 className="text-3xl font-semibold text-slate-900">Your guided Getnius flow</h2>
            <p className="text-sm text-slate-600">
              Click through the flow to see how Getnius turns questions into action.
            </p>
          </div>
          <div className="mt-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              <DemoStepper
                steps={steps}
                activeStepId={activeStepId}
                onStepChange={handleStepChange}
                onStepSelect={handleStepSelect}
                showDetails={false}
              />
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Step {activeStepIndex + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                    {activeStep?.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {activeStep?.description}
                  </p>
                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    <p className="font-semibold">{activeStep?.detail}</p>
                  </div>
                </div>
                {showDemo ? (
                  <DemoArea
                    activeDemoTabId={activeDemoTabId}
                    onTabChange={setActiveDemoTabId}
                    focusSearch={focusSearch}
                    onSearchFocused={() => setFocusSearch(false)}
                  />
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">Ready to explore?</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Start the demo to load the interactive search experience.
                    </p>
                    <Button className="mt-4" onClick={() => setShowDemo(true)}>
                      Try the demo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Use cases</p>
            <h2 className="text-3xl font-semibold text-slate-900">Where teams use Getnius</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{useCase.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
