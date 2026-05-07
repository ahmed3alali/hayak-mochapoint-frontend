'use client';
import { useEffect, useState } from 'react';

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {!ready && (
        <div className="mp-loader-overlay">
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
      )}
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </>
  );
}
