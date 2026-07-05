interface BarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  height?: number;
}

export function BarChart({ data, formatValue, height = 140 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => {
        const barHeight = d.value > 0 ? Math.max(4, (d.value / max) * height) : 2;
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-medium">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div
              className="w-full rounded-t-md bg-primary/70"
              style={{ height: barHeight }}
            />
            <span className="text-[11px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
