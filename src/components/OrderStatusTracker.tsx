import { Check, Clock, Flame, Truck, PackageCheck, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "placed", label: "Order Placed", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: Check },
  { id: "baking", label: "Baking", icon: Flame },
  { id: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: PackageCheck },
];

interface OrderStatusTrackerProps {
  status: string;
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const isCancelled = status.toLowerCase() === "cancelled";
  const currentIndex = STAGES.findIndex((s) => s.id === status.toLowerCase());

  if (isCancelled) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-300 bg-neutral-50 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
          <Ban className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Order Cancelled</h3>
          <p className="text-xs text-neutral-500">
            This order has been cancelled and will not be prepared or delivered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="relative">
        {/* Connecting Progress Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-neutral-200 hidden sm:block -z-0">
          <div
            className="h-full bg-neutral-950 transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2 relative z-10">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2",
                  isPending ? "opacity-40" : "opacity-100"
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border shrink-0",
                    isCompleted
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : isCurrent
                      ? "bg-white text-neutral-950 border-neutral-950 ring-4 ring-neutral-200"
                      : "bg-white text-neutral-400 border-neutral-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Label */}
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isCurrent
                        ? "text-neutral-950 font-bold"
                        : isCompleted
                        ? "text-neutral-800"
                        : "text-neutral-400"
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-neutral-400 sm:hidden">
                    Step {idx + 1} of 5
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
