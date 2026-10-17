export default function Field({ label, id, error, children }) {
  return (
    <div className="text-left">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function inputClasses(hasError) {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35
    focus:outline-none focus:ring-2 focus:ring-teal/40
    ${hasError ? "border-red-400" : "border-navy/15 focus:border-teal"}`;
}
