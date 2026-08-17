interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
