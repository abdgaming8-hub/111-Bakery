import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusDetails = (s: string) => {
    switch (s.toLowerCase()) {
      case "placed":
        return {
          label: "Order Placed",
          styles: "bg-neutral-100 text-neutral-800 border-neutral-300",
          dot: "bg-neutral-500",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          styles: "bg-neutral-100 text-neutral-900 border-neutral-400 font-semibold",
          dot: "bg-neutral-700",
        };
      case "baking":
        return {
          label: "Baking Now",
          styles: "bg-neutral-900 text-white border-neutral-900 font-semibold",
          dot: "bg-white animate-pulse",
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          styles: "bg-neutral-900 text-white border-neutral-900 font-semibold",
          dot: "bg-white",
        };
      case "delivered":
        return {
          label: "Delivered",
          styles: "bg-white text-neutral-950 border-neutral-950 font-bold",
          dot: "bg-neutral-950",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          styles: "bg-neutral-100 text-neutral-500 line-through border-neutral-200",
          dot: "bg-neutral-400",
        };
      default:
        return {
          label: status,
          styles: "bg-neutral-100 text-neutral-700 border-neutral-200",
          dot: "bg-neutral-400",
        };
    }
  };

  const details = getStatusDetails(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
        details.styles,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", details.dot)} />
      <span>{details.label}</span>
    </span>
  );
}
