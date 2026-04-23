import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Factory, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { format, differenceInWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { components, type Component } from "@/data/supplyChain";
import { useNavigate } from "react-router-dom";

interface GapRow {
  comp: Component;
  need: number;
  onHand: number;
  gap: number;
  weeksUntilNeeded: number;
  short: boolean;
  late: boolean;
}

export default function Planner() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<number>(500);
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7 * 12);
    return d;
  });
  const [submitted, setSubmitted] = useState(false);

  const bom = useMemo(
    () => components.filter((c) => c.category === "MCU" || c.category === "Connector"),
    []
  );

  const analysis = useMemo(() => {
    if (!submitted || !date) return null;
    const weeksUntil = Math.max(0, differenceInWeeks(date, new Date()));
    const rows: GapRow[] = bom.map((c) => {
      const need = units;
      const gap = need - c.onHand;
      const short = gap > 0;
      const late = short && c.leadTimeWeeks > weeksUntil;
      return {
        comp: c,
        need,
        onHand: c.onHand,
        gap,
        weeksUntilNeeded: weeksUntil,
        short,
        late,
      };
    });

    const shortRows = rows.filter((r) => r.short);
    const lateRows = rows.filter((r) => r.late);
    const orderCost = shortRows.reduce((s, r) => s + r.gap * r.comp.unitPrice, 0);
    const status: "GO" | "AT_RISK" = lateRows.length === 0 ? "GO" : "AT_RISK";
    const buildable = Math.min(...bom.map((c) => c.onHand));

    return { rows, shortRows, lateRows, orderCost, status, buildable, weeksUntil };
  }, [submitted, date, units, bom]);

  function handleAskAI() {
    if (!analysis) return;
    const summary = `Production plan: build ${units} units by ${date ? format(date, "PPP") : "TBD"} (${analysis.weeksUntil} weeks out).
Status: ${analysis.status}.
${analysis.shortRows.length} of ${bom.length} components need ordering. Estimated order cost: $${analysis.orderCost.toFixed(2)}.
Components at risk (lead time exceeds time available): ${analysis.lateRows.map((r) => `${r.comp.mpn} (need ${r.gap} more, ${r.comp.leadTimeWeeks}w lead)`).join(", ") || "none"}.

What's the best mitigation plan?`;
    navigate(`/copilot?prompt=${encodeURIComponent(summary)}`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Factory className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Production Planner</h2>
          <p className="mt-1 text-sm text-muted-foreground">Run a what-if build plan against current inventory.</p>
        </div>
      </div>

      <Card className="p-6 shadow-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div>
            <Label htmlFor="units" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              How many units do you want to build?
            </Label>
            <Input
              id="units"
              type="number"
              min={1}
              value={units}
              onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 0))}
              className="mt-2 tabular"
            />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              By what date?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("mt-2 w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Run Plan</Button>
        </form>
      </Card>

      {analysis && (
        <>
          <Card
            className={cn(
              "p-6 shadow-sm",
              analysis.status === "GO" ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
            )}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    analysis.status === "GO" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}
                >
                  {analysis.status === "GO" ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "font-display text-3xl font-bold tracking-tight",
                        analysis.status === "GO" ? "text-emerald-700" : "text-rose-700"
                      )}
                    >
                      {analysis.status === "GO" ? "GO" : "AT RISK"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Est. order cost <span className="tabular font-medium text-foreground">${analysis.orderCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/85">
                    {analysis.status === "GO"
                      ? `On-hand stock can cover ${units} units. ${analysis.shortRows.length} component${analysis.shortRows.length === 1 ? "" : "s"} need${analysis.shortRows.length === 1 ? "s" : ""} to be ordered, but lead times fit your timeline.`
                      : `You can build ${analysis.buildable.toLocaleString()} units today. ${analysis.shortRows.length} component${analysis.shortRows.length === 1 ? "" : "s"} need to be ordered — ${analysis.lateRows.length} won't arrive in time.`}
                  </p>
                </div>
              </div>
              <Button onClick={handleAskAI} variant="outline" className="shrink-0">
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
                Ask AI about this plan
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Component gap analysis</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                BOM assumes 1× of every MCU and Connector per unit ({bom.length} components).
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Component</th>
                    <th className="px-4 py-2.5 font-medium tabular text-right">Need</th>
                    <th className="px-4 py-2.5 font-medium tabular text-right">On Hand</th>
                    <th className="px-4 py-2.5 font-medium tabular text-right">Gap</th>
                    <th className="px-4 py-2.5 font-medium tabular text-right">Lead Time</th>
                    <th className="px-4 py-2.5 font-medium tabular text-right">Weeks Until Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.rows.map((r) => (
                    <tr key={r.comp.id} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium tabular">{r.comp.mpn}</div>
                        <div className="text-xs text-muted-foreground">{r.comp.manufacturer} · {r.comp.category}</div>
                      </td>
                      <td className="px-4 py-3 tabular text-right">{r.need.toLocaleString()}</td>
                      <td className="px-4 py-3 tabular text-right">{r.onHand.toLocaleString()}</td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular text-right font-medium",
                          r.short ? "text-rose-600" : "text-emerald-600"
                        )}
                      >
                        {r.short ? `-${r.gap.toLocaleString()}` : `+${(-r.gap).toLocaleString()}`}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular text-right",
                          r.late ? "text-rose-600 font-medium" : ""
                        )}
                      >
                        {r.comp.leadTimeWeeks}w
                      </td>
                      <td className="px-4 py-3 tabular text-right text-muted-foreground">{r.weeksUntilNeeded}w</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
