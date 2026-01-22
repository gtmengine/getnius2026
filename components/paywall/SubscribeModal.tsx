'use client';

import React from 'react';
import { ChevronRight, Mail, Send, X } from 'lucide-react';

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscribeModal({ open, onClose }: SubscribeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close subscribe modal"
        onClick={onClose}
      />
      <div
        className="relative w-[92vw] max-w-[560px] rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:w-full sm:px-9 sm:py-8 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col divide-y divide-slate-200/70">
          <div className="pb-5">
            <h3 id="subscribe-title" className="text-xl font-semibold text-slate-900">
              Subscribe (Daily Updates)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose how you want to receive notifications.
            </p>
          </div>

          <div className="grid gap-3 py-5 sm:gap-4">
            <a
              href="https://substack.com/@getnius"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 transition hover:border-purple-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">Subscribe via Substack</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-purple-500" />
            </a>

            <a
              href="https://t.me/Getniusbot"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 transition hover:border-emerald-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Telegram</p>
                  <p className="text-sm text-slate-600">Get updates from @Getniusbot</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-emerald-500" />
            </a>
          </div>

          <div className="pt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 sm:w-auto"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
