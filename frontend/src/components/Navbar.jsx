import Button from "./Button";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-navy/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button as="a" href="/login" variant="secondary" className="hidden sm:inline-flex">
            Iniciar sesión
          </Button>
          <Button as="a" href="/registro" variant="primary">
            Registrarme
          </Button>
        </nav>
      </div>
    </header>
  );
}
