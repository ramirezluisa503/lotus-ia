import Button from "../components/Button";
import Logo from "../components/Logo";
import { IconSparkles } from "../components/icons";

export default function ProximamenteCard({ title, description }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-6">
      <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-xl shadow-teal/10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <span className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-teal">
          <IconSparkles className="h-5.5 w-5.5" />
        </span>

        <h1 className="mt-4 text-lg font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/65">{description}</p>

        <Button as="a" href="/" variant="secondary" className="mt-6 w-full">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
