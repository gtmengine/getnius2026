'use client';

import React from 'react';
import Link from 'next/link';
import {
  Target,
  ShieldCheck,
  Zap,
  Clock,
  FileText,
  CheckCircle2,
  Check,
  Flame,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sampleLeads = [
  {
    name: 'Jordan Lee',
    title: 'VP Growth',
    company: 'SignalIQ',
    email: 'jordan@signaliq.io',
    phone: '+1 (415) 555-0182',
    otherContacts: 'Telegram: @jordanlee',
    linkedin: 'in/jordan-lee',
  },
  {
    name: 'Priya Patel',
    title: 'Head of Sales',
    company: 'CloudPort',
    email: 'priya@cloudport.com',
    phone: '+1 (312) 555-0147',
    otherContacts: 'X: @priyapatel',
    linkedin: 'in/priya-p',
  },
  {
    name: 'Alex Morgan',
    title: 'RevOps',
    company: 'NovaLedger',
    email: 'alex@novaledger.co',
    phone: '+1 (646) 555-0119',
    otherContacts: 'WhatsApp: +1 646 555 0119',
    linkedin: 'in/alex-m',
  },
];

const verificationChecks = [
  'Email deliverability and format validation',
  'Role/company ICP matching',
  'Duplicate and stale contact removal',
  'Manual quality checks pre-delivery',
];

export default function TenLeadsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/10leads" className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">10 Leads</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <span className="text-sm font-medium text-slate-400">Sign In</span>
            <a href="#pricing">
              <Button size="sm">Start Order</Button>
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              <Flame className="h-4 w-4" />
              Founder generated $1M in revenue using this last week
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
              Get your first 10 customers for{' '}
              <span className="text-blue-600">$1</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Share your ICP and we deliver a verified, clean CSV with name, title, company, email,
              and LinkedIn. Not scraped lists&mdash;human-verified leads ready to close.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#pricing">
                <Button size="lg">Start an Order</Button>
              </a>
              <a href="#pricing">
                <Button size="lg" variant="outline">
                  See Pricing
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                30&ndash;60 min delivery
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
                <FileText className="h-3.5 w-3.5" />
                CSV + Google Sheet
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Human-verified
              </Badge>
            </div>
          </div>
        </section>

        {/* Sample Delivery Card */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Sample Delivery</CardTitle>
              <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-b bg-slate-50 text-left">
                      <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Title</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Company</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Phone</th>
                      <th className="px-4 py-3 font-medium text-slate-500">LinkedIn</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Other Contacts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleLeads.map((lead) => (
                      <tr key={lead.email} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                        <td className="px-4 py-3 text-slate-600">{lead.title}</td>
                        <td className="px-4 py-3 text-slate-600">{lead.company}</td>
                        <td className="px-4 py-3 text-blue-600">{lead.email}</td>
                        <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                        <td className="px-4 py-3 text-slate-500">{lead.linkedin}</td>
                        <td className="px-4 py-3 text-slate-600">{lead.otherContacts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-3 text-xs text-slate-400">
                Full file includes LinkedIn URLs and company website.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Trust Metrics */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-6 grid gap-8 sm:grid-cols-3 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-blue-600">$1M+</p>
              <p className="text-sm text-slate-600">Revenue generated by customers</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-blue-600">98%</p>
              <p className="text-sm text-slate-600">Email accuracy (human-verified)</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-blue-600">$1</p>
              <p className="text-sm text-slate-600">Get your first 10 customers</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-16 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="text-slate-600">Three simple steps to verified leads.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader className="items-center">
                <div className="rounded-full bg-blue-100 p-3 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Define your ICP</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Specify your target industry, company size, and role requirements. We build a
                custom search tailored to your exact needs.
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="items-center">
                <div className="rounded-full bg-blue-100 p-3 mb-2">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Verify every lead</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Every contact is human-verified for accuracy. Bad emails get replaced for free
                &mdash; we guarantee quality.
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="items-center">
                <div className="rounded-full bg-blue-100 p-3 mb-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Deliver in under an hour</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Get your verified CSV and Google Sheet in 30&ndash;60 minutes. Ready to load into
                your CRM immediately.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Verification Details */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <CardTitle className="text-base">What we verify</CardTitle>
                    <p className="mt-2 text-xs text-slate-500">Every lead passes these checks.</p>
                    <div className="mt-4 space-y-3">
                      {verificationChecks.map((check) => (
                        <div key={check} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-700">{check}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <CardTitle className="text-base">Multi-stage qualification</CardTitle>
                    <p className="mt-2 text-xs text-slate-500">Custom criteria, enforced at scale.</p>
                    <p className="mt-4 text-sm text-slate-600">
                      Each company runs through your custom checkboxes before a lead is shipped.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        ICP fit
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Role seniority
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Geography
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <CardTitle className="text-base">Multilevel verification</CardTitle>
                    <p className="mt-2 text-xs text-slate-500">Sources cross-checked for accuracy.</p>
                    <p className="mt-4 text-sm text-slate-600">
                      Verified across 100+ sources with human validation on top of automated signals.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Company sites
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        News + filings
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Social profiles
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Your dashboard</h2>
            <p className="text-slate-600">Track orders and preview leads in real time.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">SaaS Sales Leaders</p>
                    <p className="text-xs text-slate-500">200 leads &middot; Submitted 12 min ago</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Fintech Founders</p>
                    <p className="text-xs text-slate-500">10 leads &middot; Delivered</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lead File Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-t border-b bg-slate-50 text-left">
                        <th className="px-4 py-2 font-medium text-slate-500">Name</th>
                        <th className="px-4 py-2 font-medium text-slate-500">Title</th>
                        <th className="px-4 py-2 font-medium text-slate-500">Company</th>
                        <th className="px-4 py-2 font-medium text-slate-500">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleLeads.map((lead) => (
                        <tr key={lead.email + '-preview'} className="border-b last:border-b-0">
                          <td className="px-4 py-2 text-slate-900">{lead.name}</td>
                          <td className="px-4 py-2 text-slate-600">{lead.title}</td>
                          <td className="px-4 py-2 text-slate-600">{lead.company}</td>
                          <td className="px-4 py-2 text-blue-600">{lead.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">Simple pricing</h2>
              <p className="text-slate-600">No subscriptions. Pay once, get your leads.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Starter Pack */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">Starter Pack</CardTitle>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-bold text-slate-900">$1.00</span>
                    <span className="text-sm text-slate-500">/ one-time</span>
                  </div>
                  <p className="text-sm text-slate-600 pt-1">10 verified leads</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'AI-searched & human-verified leads',
                    'CSV export',
                    'Priority processing',
                    'Industry targeting',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-sm text-slate-700">{feat}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    Start Order
                  </Button>
                </CardContent>
              </Card>
              {/* Growth Pack */}
              <Card className="relative border-blue-200 ring-2 ring-blue-100">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white border-blue-600">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Growth Pack</CardTitle>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-bold text-slate-900">$10.00</span>
                    <span className="text-sm text-slate-500">/ one-time</span>
                  </div>
                  <p className="text-sm text-slate-600 pt-1">200 verified leads</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'AI-searched & human-verified leads',
                    'CSV export',
                    'Priority processing',
                    'Industry targeting',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-sm text-slate-700">{feat}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-4">Start Order</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Ready to get started?</h2>
            <p className="text-slate-600 text-lg">
              Place your order in under 2 minutes and receive a verified CSV in 30&ndash;60 minutes.
            </p>
            <a href="#pricing">
              <Button size="lg">Start an Order</Button>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          &copy; 2026 Getnius. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
