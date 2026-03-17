"use client";

import Timestamp from "@/components/ui/Timestamp";
import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Hammer,
  Sparkles,
  Truck,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  pending: { label: "Received", icon: Clock, color: "blue" },
  in_progress: { label: "Staff Assigned", icon: Hammer, color: "blue" },
  staff_departed: { label: "Staff on Way", icon: Truck, color: "yellow" },
  staff_arrived: { label: "Staff Arrived", icon: Sparkles, color: "indigo" },
  service_center: {
    label: "Sent to Center",
    icon: AlertCircle,
    color: "orange",
  },
  completed: { label: "Resolved", icon: CheckCircle2, color: "green" },
  canceled: { label: "Canceled", icon: AlertCircle, color: "red" },
};

export default function ServiceStepper({
  history,
  type,
}: {
  history: any[];
  type: "repair" | "install";
}) {
  if (!history || history.length === 0) return null;

  const currentStatus = history[history.length - 1].status;

  return (
    <div className="flex flex-col gap-0">
      {history.map((step, idx) => {
        const config = statusConfig[step.status] || {
          label: step.status,
          icon: Clock,
          color: "gray",
        };
        const Icon = config.icon;
        const isLast = idx === history.length - 1;

        return (
          <div key={idx} className="relative flex gap-6 pb-8 group">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-100 group-hover:bg-blue-100 transition-colors"></div>
            )}

            {/* Circle */}
            <div
              className={clsx(
                "relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500",
                isLast
                  ? `bg-${config.color}-600 border-${config.color}-600 scale-110 shadow-lg shadow-${config.color}-100`
                  : "bg-white border-gray-100 text-gray-400",
              )}
            >
              <Icon
                size={14}
                className={isLast ? "text-white" : "text-gray-300"}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 mt-1">
              <h4
                className={clsx(
                  "text-sm font-black uppercase tracking-tight transition-colors",
                  isLast ? `text-${config.color}-700` : "text-gray-400",
                )}
              >
                {step.status === "custom" ? step.customLabel : config.label}
              </h4>
              <p
                className={clsx(
                  "text-sm leading-relaxed",
                  isLast ? "text-gray-700 font-medium" : "text-gray-400",
                )}
              >
                {step.status === "custom"
                  ? step.customNote
                  : step.cancelReason || "Processing your request..."}
              </p>
              <div className="mt-1 opacity-60">
                <Timestamp timestamp={step.createdAt} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
