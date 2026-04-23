import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { suppliers, componentsBySupplier, riskLevel, weeksOfSupply, type Supplier } from "@/data/supplyChain";
import { StatusDot } from "@/components/StatusDot";
import { MapPin } from "lucide-react";

export default function Suppliers() {
  const [selected, setSelected] = useState<Supplier | null>(null);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Suppliers</h2>
        <p className="mt-1 text-sm text-muted-foreground">{suppliers.length} active suppliers across US, EU, and Asia</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => {
          const cnt = componentsBySupplier(s.id).length;
          return (
            <Card
              key={s.id}
              onClick={() => setSelected(s)}
              className="cursor-pointer p-5 shadow-sm transition-all hover:border-accent/40 hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-primary">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {s.region}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] font-normal">{cnt} SKUs</Badge>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="Reliability" value={`${s.reliability}`} />
                <Metric label="On-time" value={`${s.onTimePct}%`} />
                <Metric label="Lead" value={`${s.leadTimeWeeks}w`} />
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${s.reliability}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.region} · {selected.reliability}/100 reliability · {selected.onTimePct}% on-time delivery</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Components supplied ({componentsBySupplier(selected.id).length})</p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">MPN</th>
                        <th className="px-3 py-2 font-medium tabular text-right">Live stock</th>
                        <th className="px-3 py-2 font-medium tabular text-right">Supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentsBySupplier(selected.id).map((c) => (
                        <tr key={c.id} className="border-t border-border">
                          <td className="px-3 py-2"><StatusDot level={riskLevel(c)} /></td>
                          <td className="px-3 py-2 font-medium tabular">{c.mpn}</td>
                          <td className="px-3 py-2 tabular text-right">{c.onHand.toLocaleString()}</td>
                          <td className="px-3 py-2 tabular text-right">{weeksOfSupply(c)}w</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">Stock updated {Math.floor(Math.random() * 12) + 1} min ago</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
