'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Database,
  FileSearch,
  Globe2,
  Layers3,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { LogoLandingLink } from '@/components/LogoLandingLink';

const problems = [
  {
    old: 'Generic AI research stops at summaries',
    next: 'Research the live web, source by source',
    copy: 'Getnius breaks a diligence question into research tasks, searches the open web, cross-checks evidence, and keeps the source trail attached.',
  },
  {
    old: 'Manual diligence means dozens of tabs',
    next: 'One workflow from question to evidence',
    copy: 'Company pages, news, filings, product signals, hiring, people, competitors and market context are gathered into one structured research flow.',
  },
  {
    old: 'Reports go stale as soon as they are exported',
    next: 'Re-run the same investigation when facts change',
    copy: 'Save a research workflow, refresh the evidence, compare what changed and update the decision instead of rebuilding the analysis from scratch.',
  },
];

const useCases = [
  {
    eyebrow: 'Commercial DD',
    title: 'Know what is actually behind the growth story',
    copy: 'Validate market claims, customer signals, partnerships, geography, product traction and competitive position before the investment memo.',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'Company research',
    title: 'Turn a company name into a research dossier',
    copy: 'Map products, people, funding, expansion, hiring, customers, risks and recent developments with evidence attached.',
    icon: FileSearch,
  },
  {
    eyebrow: 'Market intelligence',
    title: 'Build market maps without tab-by-tab copying',
    copy: 'Discover players, segments, pricing, positioning and emerging signals, then structure them into a decision-ready view.',
    icon: Radar,
  },
  {
    eyebrow: 'Competitive intelligence',
    title: 'Track what changed, not just what exists',
    copy: 'Monitor launches, hiring, partnerships, messaging, pricing and news so your analysis stays current.',
    icon: Layers3,
  },
  {
    eyebrow: 'Deal sourcing',
    title: 'Find companies that match an investment thesis',
    copy: 'Describe the thesis in plain English and generate a researched shortlist with supporting signals instead of a static database export.',
    icon: Search,
  },
  {
    eyebrow: 'Strategy research',
    title: 'Answer messy strategic questions with traceable evidence',
    copy: 'Use multiple research agents to decompose broad questions, investigate them in parallel and synthesize a sourced answer.',
    icon: Workflow,
  },
];

const plans = [
  {
    name: 'Explorer',
    price: '$0',
    suffix: '/mo',
    description: 'For trying research workflows',
    features: ['Run basic research', 'Source-linked results', 'Company and market search'],
    cta: 'Start free',
    href: '/app',
  },
  {
    name: 'Researcher',
    price: '$29',
    suffix: '/mo',
    description: 'For recurring diligence and market work',
    features: ['Deeper multi-step research', 'Saved research history', 'Structured company dossiers', 'Priority research capacity'],
    cta: 'Start researching',
    href: '/app',
    featured: true,
  },
  {
    name: 'Team',
    price: '$99',
    suffix: '/mo',
    description: 'For investment, strategy and GTM teams',
    features: ['Higher research limits', 'Shared workflows', 'Repeatable monitoring', 'Everything in Researcher'],
    cta: 'Get started',
    href: '/app',
  },
];

const faqs = [
  ['How is Getnius different from asking ChatGPT to research a company?', 'Getnius is built around a repeatable research workflow: decompose the question, search for evidence, compare sources, structure the result and preserve provenance. The goal is not another generic summary, but a decision-ready research trail.'],
  ['Do I need to write code?', 'No. You can start from a plain-language research question and work through the web app.'],
  ['What can I research?', 'Companies, markets, competitors, people, funding, hiring, products, positioning, news and other public web signals relevant to diligence and strategy.'],
  ['Can I verify where a claim came from?', 'Yes. Source provenance is a core part of the workflow so important claims can be checked against the underlying evidence.'],
  ['Is this only for investors?', 'No. The same research engine can support strategy, business development, GTM, market intelligence, consulting and competitive research.'],
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111113] text-white selection:bg-orange-500/30">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#111113]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <LogoLandingLink textClassName="text-xl font-black tracking-tight text-white" />
            <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
              <a href="#product" className="transition hover:text-white">Product</a>
              <a href="#use-cases" className="transition hover:text-white">Use cases</a>
              <a href="#pricing" className="transition hover:text-white">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="hidden text-sm text-zinc-400 transition hover:text-white sm:block">History</Link>
            <Link href="/app" className="rounded-full bg-[#ff6a2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff7c45]">
              Start for free <ArrowRight className="ml-1.5 inline h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,106,42,0.10),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_top,black,transparent)]" />
          <div className="relative mx-auto max-w-[950px] px-6 py-24 text-center sm:py-32">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3.5 py-1.5 text-xs font-medium text-orange-300">
              <Sparkles className="h-3.5 w-3.5" /> AI research for due diligence
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Search, verify, and analyze the web for your <span className="text-[#ff6a2a]">Due Diligence</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Turn a company, market, or investment question into structured research. Getnius searches the live web, cross-checks evidence, and keeps the source trail attached.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/app" className="rounded-full bg-[#ff6a2a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7c45]">
                Start for free <ArrowRight className="ml-1.5 inline h-4 w-4" />
              </Link>
              <a href="#product" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white">See how it works</a>
            </div>
            <p className="mt-4 text-xs text-zinc-600">No credit card required to explore</p>
          </div>
        </section>

        <section className="border-b border-white/5 py-8">
          <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 text-xs font-medium text-zinc-600 sm:text-sm">
            <span>Company research</span><span>Market intelligence</span><span>Competitive analysis</span><span>Deal sourcing</span><span>Strategy research</span>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-[1180px] px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a2a]">// The problem</p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Web research today is shallow, fragmented, and hard to verify</h2>
            <p className="mt-5 max-w-xl text-zinc-400">The bottleneck is not getting another answer. It is finding current evidence, checking it, and turning it into a decision.</p>
          </div>

          <div className="mt-14 space-y-4">
            {problems.map((item, index) => (
              <div key={item.old} className="grid overflow-hidden rounded-2xl border border-white/7 bg-[#151517] md:grid-cols-2">
                <div className="border-b border-white/7 p-6 md:border-b-0 md:border-r">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600"><span className="h-1.5 w-1.5 rounded-full bg-zinc-700" /> Old way</div>
                  <h3 className="text-lg font-semibold text-zinc-300">{item.old}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400"><span className="h-1.5 w-1.5 rounded-full bg-[#ff6a2a]" /> With Getnius</div>
                  <h3 className="text-lg font-semibold">{item.next}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#0e0e10] py-24 sm:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a2a]">// How it works</p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Go from a messy question to a sourced research brief</h2>
            <p className="mt-5 max-w-xl text-zinc-400">No research pipeline to build. Describe the decision you are trying to make and let the workflow do the decomposition.</p>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                { no: '01', icon: Globe2, title: 'Ask a real research question', copy: 'A company, market, competitor, investment thesis or strategic question in plain language.' },
                { no: '02', icon: Database, title: 'Agents search and cross-check', copy: 'Getnius decomposes the task, gathers public evidence and compares sources across the web.' },
                { no: '03', icon: FileSearch, title: 'Get a decision-ready output', copy: 'Review a structured answer with claims, evidence and sources that can be checked.' },
              ].map((step) => (
                <div key={step.no} className="relative min-h-[260px] rounded-2xl border border-white/7 bg-[#151517] p-6">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-orange-400">{step.no}</span><step.icon className="h-5 w-5 text-zinc-600" /></div>
                  <h3 className="mt-20 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="mx-auto max-w-[1180px] px-6 py-24 sm:py-32">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a2a]">// Built for research</p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Pick the decision. Getnius builds the research around it.</h2>
          <p className="mt-5 max-w-xl text-zinc-400">Use one research engine across diligence, strategy, market intelligence and competitive analysis.</p>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item, index) => (
              <div key={item.title} className={`group rounded-2xl border border-white/7 bg-[#151517] p-6 transition hover:border-orange-500/25 ${index === 0 ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-orange-400">{item.eyebrow}</span><item.icon className="h-5 w-5 text-zinc-700 transition group-hover:text-orange-500" /></div>
                <h3 className="mt-12 max-w-lg text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-y border-white/5 bg-[#0e0e10] py-24 sm:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a2a]">// Pricing</p>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Simple pricing for serious research</h2>
              <p className="mx-auto mt-5 max-w-xl text-zinc-400">Start free, then scale when Getnius becomes part of your research workflow.</p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-2xl border p-6 ${plan.featured ? 'border-orange-500/45 bg-[#171411]' : 'border-white/7 bg-[#151517]'}`}>
                  {plan.featured && <span className="absolute right-5 top-5 rounded-full bg-[#ff6a2a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Popular</span>}
                  <p className="text-sm font-semibold text-zinc-300">{plan.name}</p>
                  <p className="mt-2 text-sm text-zinc-600">{plan.description}</p>
                  <div className="mt-8 flex items-end gap-1"><span className="text-4xl font-semibold tracking-tight">{plan.price}</span><span className="pb-1 text-sm text-zinc-600">{plan.suffix}</span></div>
                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature) => <div key={feature} className="flex gap-2 text-sm text-zinc-400"><Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{feature}</div>)}
                  </div>
                  <Link href={plan.href} className={`mt-8 block rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${plan.featured ? 'bg-[#ff6a2a] text-white hover:bg-[#ff7c45]' : 'border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'}`}>{plan.cta}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-24 sm:py-32">
          <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[#151517] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,106,42,.18),transparent_38%)]" />
            <div className="relative">
              <Globe2 className="mx-auto h-8 w-8 text-orange-500" />
              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">The web is the largest research database ever built.</h2>
              <p className="mx-auto mt-5 max-w-xl text-zinc-400">Getnius turns it into a research workflow your team can actually use.</p>
              <Link href="/app" className="mt-8 inline-flex rounded-full bg-[#ff6a2a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7c45]">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[900px] px-6 pb-28">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a2a]">// Q&A</p>
          <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Questions people ask before trusting AI with research</h2>
          <div className="mt-10 divide-y divide-white/7 border-y border-white/7">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-200"><span>{question}</span><ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 transition group-open:rotate-180" /></summary>
                <p className="max-w-2xl pt-4 text-sm leading-6 text-zinc-500">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#0e0e10]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <LogoLandingLink textClassName="text-xl font-black tracking-tight text-white" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">AI research for due diligence, market intelligence and strategic decisions.</p>
          </div>
          <div className="text-sm"><p className="mb-4 font-semibold text-zinc-300">Product</p><div className="space-y-2 text-zinc-600"><Link href="/app" className="block hover:text-white">New research</Link><Link href="/history" className="block hover:text-white">History</Link><a href="#pricing" className="block hover:text-white">Pricing</a></div></div>
          <div className="text-sm"><p className="mb-4 font-semibold text-zinc-300">Use cases</p><div className="space-y-2 text-zinc-600"><a href="#use-cases" className="block hover:text-white">Due diligence</a><a href="#use-cases" className="block hover:text-white">Market intelligence</a><a href="#use-cases" className="block hover:text-white">Competitive research</a></div></div>
        </div>
        <div className="mx-auto max-w-[1180px] border-t border-white/5 px-6 py-5 text-xs text-zinc-700">© 2026 Getnius</div>
      </footer>
    </div>
  );
}
