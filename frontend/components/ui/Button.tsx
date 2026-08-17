import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-light focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white hover:bg-secondary-dark focus-visible:ring-secondary",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "text-primary hover:bg-primary/5",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
