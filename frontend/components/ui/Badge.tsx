interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function orderStatusVariant(
  status: string,
): BadgeProps["variant"] {
  switch (status) {
    case "delivered":
    case "approved":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "cancelled":
    case "rejected":
    case "failed":
      return "danger";
    case "shipped":
    case "confirmed":
      return "info";
    default:
      return "default";
  }
}
