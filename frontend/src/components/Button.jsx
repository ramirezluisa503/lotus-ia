const VARIANTS = {
  primary:
    "bg-teal text-white hover:bg-navy focus-visible:outline-teal",
  secondary:
    "bg-white text-teal border border-teal hover:bg-ice focus-visible:outline-teal",
};

export default function Button({
  variant = "primary",
  as: Component = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium
        transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
