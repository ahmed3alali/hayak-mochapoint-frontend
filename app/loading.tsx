export default function Loading() {
  return (
    <div className="mp-loader-overlay">
      <div className="mp-loader-card">

        {/* Logo with pulse rings */}
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

        {/* Brand name */}
        <p className="mp-brand">Mocha Point</p>

        {/* Coffee dots */}
        <div className="mp-dots">
          <span className="mp-dot" />
          <span className="mp-dot" />
          <span className="mp-dot" />
        </div>

      </div>
    </div>
  );
}
