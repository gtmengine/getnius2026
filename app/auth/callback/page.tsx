'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const isSafeRedirect = (value: string | null) =>
  Boolean(value) && value!.startsWith('/') && !value!.startsWith('//');

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError('Supabase is not configured. Missing environment variables.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      const redirectTo = isSafeRedirect(redirectParam) ? redirectParam! : '/';
      const code = params.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      router.replace(redirectTo);
    };

    run().catch((err) => {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-semibold">Signing you in…</h1>
        <p className="mt-3 text-sm text-slate-300">
          Finishing Google OAuth. You can close this tab if it takes too long.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
