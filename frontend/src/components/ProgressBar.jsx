export default function ProgressBar({ paso, total }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-navy/50">
        <span>
          Paso {paso} de {total}
        </span>
        <span>{Math.round((paso / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full rounded-full bg-teal transition-all duration-300"
          style={{ width: `${(paso / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
