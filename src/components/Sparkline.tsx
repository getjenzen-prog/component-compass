import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ data, color = "hsl(var(--accent))", height = 32 }: { data: number[]; color?: string; height?: number }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
