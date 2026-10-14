import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo />
        <p className="max-w-md text-xs text-navy/60">
          Proyecto de grado — Tecnología en Desarrollo de Software, Universidad
          Católica de Pereira. Piloto en instituciones educativas de Pereira,
          Risaralda.
        </p>
      </div>
    </footer>
  );
}
