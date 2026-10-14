// Set mínimo de íconos en línea (estilo outline), sin dependencias externas.

const base = "h-6 w-6";

export function IconBrain({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 4.5a2.5 2.5 0 0 0-2.5 2.5v.1A3 3 0 0 0 5 10v1a3 3 0 0 0 1.2 2.4A2.8 2.8 0 0 0 6 14.5 2.5 2.5 0 0 0 8.5 17v.5A2.5 2.5 0 0 0 11 20h0V6.2A2.5 2.5 0 0 0 9.5 4.5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 4.5a2.5 2.5 0 0 1 2.5 2.5v.1A3 3 0 0 1 19 10v1a3 3 0 0 1-1.2 2.4 2.8 2.8 0 0 1 .2 1.1A2.5 2.5 0 0 1 15.5 17v.5A2.5 2.5 0 0 1 13 20h0V6.2A2.5 2.5 0 0 1 14.5 4.5Z"
      />
    </svg>
  );
}

export function IconChart({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m6 10V4m6 16v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
    </svg>
  );
}

export function IconHome({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5V19a1 1 0 0 0 1 1h3v-5a2 2 0 1 1 4 0v5h3a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconHeart({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-7-4.5-9.3-8.8C1.3 8 2.6 5 5.7 4.4c1.9-.4 3.6.5 4.7 2.1A5 5 0 0 1 12 8a5 5 0 0 1 1.6-1.5c1.1-1.6 2.8-2.5 4.7-2.1 3.1.6 4.4 3.6 3 6.8C19 15.5 12 20 12 20Z"
      />
    </svg>
  );
}

export function IconShield({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 5 6v5.2c0 4.3 2.9 7.8 7 9.3 4.1-1.5 7-5 7-9.3V6l-7-2.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.3 12.2 1.9 1.9 3.5-3.9" />
    </svg>
  );
}

export function IconArrowRight({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-5.5-5.5M19.5 12 14 17.5" />
    </svg>
  );
}

export function IconSparkles({ className = base }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1m11.4-11.4 2.1-2.1" />
      <circle cx="12" cy="12" r="2.3" />
    </svg>
  );
}
