import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskStyles = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-danger/10 text-danger border-danger/30",
};

const riskLabels = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
        riskStyles[level],
        className
      )}
    >
      <span
        className={cn("w-2 h-2 rounded-full mr-2", {
          "bg-success": level === "low",
          "bg-warning": level === "medium",
          "bg-danger": level === "high",
        })}
      />
      {riskLabels[level]}
    </span>
  );
}
