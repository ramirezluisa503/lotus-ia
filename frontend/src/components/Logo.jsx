export default function Logo({ className = "" }) {
  return (
    <a href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-teal to-navy">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-mint" fill="currentColor">
          <path d="M12 2c2.5 2.8 4 6 4 9a4 4 0 0 1-8 0c0-3 1.5-6.2 4-9Z" opacity="0.9" />
          <path d="M4 13c2.9.7 5 2.6 6.2 5.3C6.5 19 4 16.4 4 13Z" opacity="0.65" />
          <path d="M20 13c-2.9.7-5 2.6-6.2 5.3 3.7-.3 6.2-2.9 6.2-5.3Z" opacity="0.65" />
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-teal">Lotus</span>
        <span className="text-navy">.IA</span>
      </span>
    </a>
  );
}
