import Link from 'next/link';
import React from 'react';

interface LogoLandingLinkProps {
  className?: string;
  textClassName?: string;
}

export function LogoLandingLink({ className, textClassName }: LogoLandingLinkProps) {
  return (
    <Link
      href="/welcome"
      aria-label="Go to Getnius landing"
      className={`inline-flex items-center cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 ${className ?? ''}`}
    >
      <span className={textClassName ?? ''}>Getnius</span>
    </Link>
  );
}
