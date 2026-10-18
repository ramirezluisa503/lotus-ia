export default function Logo({ className = "" }) {
  return (
    <a href="/" className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-8 w-8 shrink-0">
        <path d="M50 50 L56.26 5.44 A45 45 0 0 1 94.32 42.19 Z" fill="#7AC174" />
        <path d="M50 50 L94.32 42.19 A45 45 0 0 1 78.93 84.47 Z" fill="#3C9142" />
        <path d="M50 50 L78.93 84.47 A45 45 0 0 1 21.07 84.47 Z" fill="#1E6B3B" />
        <path d="M50 50 L21.07 84.47 A45 45 0 0 1 7.71 34.61 Z" fill="#5BAE55" />
        <path d="M50 50 L7.71 34.61 A45 45 0 0 1 43.74 5.44 Z" fill="#1F7A3F" />
        <path
          d="M56.16 33.09 A18 18 0 1 1 34.41 41.0"
          fill="none"
          stroke="#D7EFD2"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-teal">Lotus</span>
        <span className="text-navy">.IA</span>
      </span>
    </a>
  );
}
