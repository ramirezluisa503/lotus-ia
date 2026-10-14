export default function Logo({ className = "" }) {
  return (
    <span className={`font-semibold text-xl tracking-tight ${className}`}>
      <span className="text-teal">Lotus</span>
      <span className="text-navy">.IA</span>
    </span>
  );
}
