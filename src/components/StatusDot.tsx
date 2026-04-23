import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/supplyChain";

const COLOR: Record<RiskLevel, string> = {
  healthy: "bg-success",
  watch: "bg-warning",
  critical: "bg-destructive",
};

const LABEL: Record<RiskLevel, string> = {
  healthy: "Healthy",
  watch: "Watch",
  critical: "Critical",
};

export function StatusDot({ level, withLabel = false, className }: { level: RiskLevel; withLabel?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", COLOR[level], level === "critical" && "ring-2 ring-destructive/20")} />
      {withLabel && <span className="text-xs font-medium text-muted-foreground">{LABEL[level]}</span>}
    </span>
  );
}
