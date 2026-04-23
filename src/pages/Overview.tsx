import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/Sparkline";
import { StatusDot } from "@/components/StatusDot";
import { ArrowUpRight, RefreshCw, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import {
  components as allComponents,
  getKpis,
  inventoryValueTrend,
  topCritical,
  riskLevel,
  weeksOfSupply,
  riskScore,
} from "@/data/supplyChain";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Tone = "neutral" | "rose" | "amber";

const toneStyles: Record<Tone, { card: string; value: string; spark: string }> = {
  neutral: { card: "", value: "text-foreground", spark: "hsl(var(--accent))" },
  rose: {
    card: "bg-rose-50/70 border-rose-100",
    value: "text-rose-600",
    spark: "hsl(350 75% 50%)",
  },
  amber: {
    card: "bg-amber-50/70 border-amber-100",
    value: "text-amber-700",
    spark: "hsl(32 90% 45%)",
  },
};

function KpiTile({ label, value, delta, spark, tone = "neutral" }: { label: string; value: string; delta?: string; spark: number[]; tone?: Tone }) {
  const t = toneStyles[tone];
  return (
    <Card className={`p-5 shadow-sm transition-shadow hover:shadow ${t.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`tabular font-display mt-2 text-3xl font-semibold tracking-tight ${t.value}`}>{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className="h-10 w-24">
          <Sparkline data={spark} color={t.spark} />
        </div>
      </div>
    </Card>
  );
}

function HealthHero() {
  const { score, label, accentClass, dotClass, barClass } = useMemo(() => {
    const avg = allComponents.reduce((s, c) => s + riskScore(c), 0) / allComponents.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - avg)));
    if (score >= 80) {
      return { score, label: "Healthy", accentClass: "text-emerald-600", dotClass: "bg-emerald-500", barClass: "bg-emerald-500" };
    }
    if (score >= 50) {
      return { score, label: "Watch", accentClass: "text-amber-700", dotClass: "bg-amber-500", barClass: "bg-amber-500" };
    }
    return { score, label: "Critical", accentClass: "text-rose-600", dotClass: "bg-rose-500", barClass: "bg-rose-500" };
  }, []);

  return (
    <Card className="p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
            <ShieldCheck className={`h-7 w-7 ${accentClass}`} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Supply Health Score</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className={`tabular font-display text-5xl font-semibold tracking-tight ${accentClass}`}>{score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium ${accentClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                {label}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Composite of stock coverage, lead time, and sourcing concentration</p>
          </div>
        </div>
        <div className="md:w-72">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-accent transition-all" style={{ width: `${score}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Critical</span><span>Watch</span><span>Healthy</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Overview() {
  const kpis = getKpis();
  const trend = inventoryValueTrend();
  const critical = topCritical(5);

  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  async function fetchSummary() {
    setLoadingSummary(true);
    setSummary("");
    try {
      const top = critical.map((c) => `${c.mpn} (${c.manufacturer}) — ${weeksOfSupply(c)}w supply, ${c.leadTimeWeeks}w lead, ${c.supplierIds.length} supplier(s), risk ${riskScore(c)}`).join("\n");
      const prompt = `KPIs: ${kpis.total} SKUs, ${kpis.atRisk} at risk, avg lead time ${kpis.avgLead} weeks, ${kpis.openAlerts} open alerts.\n\nTop critical components:\n${top}\n\nWrite an executive briefing for a hardware ops lead as exactly 3 short lines, each one sentence (max ~20 words). Format strictly as:\nCRITICAL: <biggest immediate risk>\nWARNING: <secondary concern to watch>\nACTION: <one recommended next step>\nNo other text, no bullets, no markdown.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], mode: "summary" }),
      });
      if (!resp.ok || !resp.body) {
        setSummary("Unable to generate summary right now.");
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const t = p.choices?.[0]?.delta?.content;
            if (t) {
              acc += t;
              setSummary(acc);
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      setSummary("Unable to generate summary right now.");
    } finally {
      setLoadingSummary(false);
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Real-time view of your component supply chain.</p>
      </div>

      <HealthHero />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Total SKUs" value={kpis.total.toString()} delta="Tracked components" spark={trend.map((t) => t.value / 1000)} />
        <KpiTile tone="rose" label="At Risk" value={kpis.atRisk.toString()} delta={`${Math.round((kpis.atRisk / kpis.total) * 100)}% of inventory`} spark={[8, 9, 10, 11, 10, 12, 13, 12, 14, 15, 14, 16]} />
        <KpiTile tone="amber" label="Avg Lead Time" value={`${kpis.avgLead}w`} delta="Across all suppliers" spark={[10, 11, 11, 12, 12, 13, 13, 14, 14, 13, 14, 14]} />
        <KpiTile tone="rose" label="Open Alerts" value={kpis.openAlerts.toString()} delta="Awaiting action" spark={[4, 5, 6, 6, 7, 7, 8, 9, 10, 11, 12, kpis.openAlerts]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Inventory value — last 30 days</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Total stock value across all components</p>
            </div>
            <Badge variant="outline" className="font-normal">USD</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="invFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#invFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold">AI Risk Briefing</h3>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fetchSummary} disabled={loadingSummary}>
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSummary ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="min-h-[8rem] flex-1 text-sm leading-relaxed text-foreground/85">
            {summary ? (
              <BriefingPoints text={summary} />
            ) : (
              <p>{loadingSummary ? "Analyzing your supply chain…" : "—"}</p>
            )}
          </div>
          <Link to="/copilot" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            Ask follow-up <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Top critical components</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Highest risk score, sorted by urgency</p>
          </div>
          <Link to="/components" className="text-xs font-medium text-accent hover:underline">View all →</Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">MPN</th>
                <th className="px-4 py-2.5 font-medium">Manufacturer</th>
                <th className="px-4 py-2.5 font-medium tabular text-right">Weeks of supply</th>
                <th className="px-4 py-2.5 font-medium tabular text-right">Lead time</th>
                <th className="px-4 py-2.5 font-medium tabular text-right">Risk score</th>
              </tr>
            </thead>
            <tbody>
              {critical.map((c) => (
                <tr key={c.id} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3"><StatusDot level={riskLevel(c)} /></td>
                  <td className="px-4 py-3 font-medium tabular">{c.mpn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.manufacturer}</td>
                  <td className="px-4 py-3 tabular text-right">{weeksOfSupply(c)}w</td>
                  <td className="px-4 py-3 tabular text-right">{c.leadTimeWeeks}w</td>
                  <td className="px-4 py-3 tabular text-right font-medium">{riskScore(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
