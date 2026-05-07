'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

type Phase = 'hidden' | 'visible' | 'hiding';

export default function NavigationLoader() {
  const pathname   = usePathname();
  const [phase, setPhase] = useState<Phase>('hidden');
  const prevPath   = useRef(pathname);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pathname changed → navigation complete → start fade-out
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setPhase('hiding');
      hideTimer.current = setTimeout(() => setPhase('hidden'), 350);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [pathname]);

  // Detect internal link clicks → show loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank'
      ) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
        setPhase('visible');
      } catch {
        // unparseable href — ignore
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`mp-loader-overlay${phase === 'hiding' ? ' mp-loader-overlay--out' : ''}`}>
      <div className="mp-loader-card">

        <div className="mp-logo-wrap">
          <span className="mp-ring mp-ring-1" />
          <span className="mp-ring mp-ring-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mochapoint-logo.svg"
            alt="Mocha Point"
            width={88}
            height={88}
            className="mp-logo-img"
          />
        </div>

        <p className="mp-brand">Mocha Point</p>

        <div className="mp-dots">
          <span className="mp-dot" />
          <span className="mp-dot" />
          <span className="mp-dot" />
        </div>

      </div>
    </div>
  );
}
