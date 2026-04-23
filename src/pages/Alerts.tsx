import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/StatusDot";
import { getAlerts, getComponent } from "@/data/supplyChain";
import { Sparkles, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Alerts() {
  const alerts = getAlerts();
  const navigate = useNavigate();
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const watch = alerts.filter((a) => a.severity === "watch").length;

  function askAi(componentId: string) {
    const c = getComponent(componentId);
    if (!c) return;
    navigate(`/copilot?prompt=${encodeURIComponent(`Why is ${c.mpn} at risk and what should I do?`)}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Risk Alerts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ranked by severity and time-to-stockout</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {critical} critical
          </Badge>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> {watch} watch
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => {
          const c = getComponent(a.componentId)!;
          return (
            <Card key={a.id} className="p-5 shadow-sm transition-shadow hover:shadow">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${a.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning"}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-medium tabular">{c.mpn}</p>
                    <span className="text-xs text-muted-foreground">{c.manufacturer}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">{c.category}</Badge>
                    <StatusDot level={a.severity} withLabel />
                  </div>
                  <p className="mt-1.5 text-sm text-foreground">{a.reason}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Suggested action:</span> {a.action}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => askAi(a.componentId)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask AI
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
