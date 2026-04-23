import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusDot } from "@/components/StatusDot";
import { Sparkline } from "@/components/Sparkline";
import { Search, Sparkles } from "lucide-react";
import { components, suppliers, riskLevel, weeksOfSupply, riskScore, riskReasons, suggestedAction, type Component, type Category, type RiskLevel } from "@/data/supplyChain";

export default function Components() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [risk, setRisk] = useState<string>("all");
  const [selected, setSelected] = useState<Component | null>(null);

  const filtered = useMemo(() => {
    return components.filter((c) => {
      if (q && !`${c.mpn} ${c.manufacturer} ${c.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (risk !== "all" && riskLevel(c) !== risk) return false;
      return true;
    });
  }, [q, cat, risk]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Components</h2>
        <p className="mt-1 text-sm text-muted-foreground">{components.length} SKUs across {new Set(components.map((c) => c.category)).size} categories</p>
      </div>

      <Card className="p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MPN, manufacturer, description…" className="h-9 pl-8 text-sm" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-9 w-full text-sm sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(["MCU", "Passive", "Connector", "Memory", "Power", "Sensor"] as Category[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="h-9 w-full text-sm sm:w-44"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="watch">Watch</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">MPN</th>
              <th className="px-4 py-3 font-medium">Manufacturer</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium tabular text-right">On hand</th>
              <th className="px-4 py-3 font-medium tabular text-right">Weeks supply</th>
              <th className="px-4 py-3 font-medium tabular text-right">Lead time</th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40">
                <td className="px-4 py-3"><StatusDot level={riskLevel(c)} /></td>
                <td className="px-4 py-3 font-medium tabular">{c.mpn}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.manufacturer}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="font-normal text-[11px]">{c.category}</Badge></td>
                <td className="px-4 py-3 tabular text-right">{c.onHand.toLocaleString()}</td>
                <td className="px-4 py-3 tabular text-right">{weeksOfSupply(c)}w</td>
                <td className="px-4 py-3 tabular text-right">{c.leadTimeWeeks}w</td>
                <td className="px-4 py-3"><div className="h-7 w-24"><Sparkline data={c.stockHistory} /></div></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No components match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <StatusDot level={riskLevel(selected)} />
                  <SheetTitle className="font-mono text-base tabular">{selected.mpn}</SheetTitle>
                </div>
                <SheetDescription>{selected.manufacturer} · {selected.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="On hand" value={selected.onHand.toLocaleString()} />
                  <Stat label="Weeks supply" value={`${weeksOfSupply(selected)}w`} />
                  <Stat label="Risk score" value={riskScore(selected).toString()} />
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stock — 30 days</p>
                  <div className="h-20 rounded-lg border border-border bg-muted/20 p-2">
                    <Sparkline data={selected.stockHistory} height={64} />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suppliers</p>
                  <div className="space-y-2">
                    {selected.supplierIds.map((sid) => {
                      const s = suppliers.find((x) => x.id === sid)!;
                      return (
                        <div key={sid} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.region} · {s.onTimePct}% on-time</p>
                          </div>
                          <p className="tabular text-xs text-muted-foreground">{s.leadTimeWeeks}w lead</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold">AI risk explanation</p>
                  </div>
                  <ul className="space-y-1 text-sm text-foreground/85">
                    {riskReasons(selected).length === 0 ? (
                      <li>This component is healthy. Stock and lead time are within normal range.</li>
                    ) : (
                      riskReasons(selected).map((r, i) => <li key={i}>• {r}</li>)
                    )}
                  </ul>
                  <p className="mt-3 border-t border-accent/20 pt-3 text-sm">
                    <span className="font-medium">Suggested action: </span>
                    <span className="text-foreground/85">{suggestedAction(selected)}</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="tabular mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
