const VARIANTS = {
  primary:
    "bg-teal text-white shadow-sm shadow-teal/30 hover:bg-navy focus-visible:outline-teal",
  secondary:
    "bg-white text-teal border border-teal/30 hover:border-teal hover:bg-ice focus-visible:outline-teal",
  ghost: "text-navy hover:bg-navy/5 focus-visible:outline-navy",
  // Para usar sobre fondos oscuros (ej. el banner de CTA con degradado teal/navy)
  light: "bg-white text-navy shadow-sm hover:bg-mint focus-visible:outline-white",
};

const SIZES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  as: Component = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
