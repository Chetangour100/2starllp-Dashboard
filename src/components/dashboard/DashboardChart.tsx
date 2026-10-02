import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatCurrencyCompact } from "@/lib/formatters";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  month: string;
  value: number;
}

interface DashboardChartProps {
  title: string;
  data: ChartDataPoint[];
  valueFormatter?: (value: number) => string;
  yAxisFormatter?: (value: number) => string;
}

export function DashboardChart({
  title,
  data,
  valueFormatter = (value) =>
    String(value),
  yAxisFormatter = (value) =>
    String(value),
}: DashboardChartProps) {

  const safeData: ChartDataPoint[] =
    Array.isArray(data)
      ? data.filter(
          (item): item is ChartDataPoint =>
            Boolean(item) &&
            typeof item.month === "string" &&
            typeof item.value === "number" &&
            Number.isFinite(item.value)
        )
      : [];

  const shortMonthLabel = (
    label: string
  ): string => {
    if (!label) {
      return "";
    }

    return (
      label.split(" ")[0] ??
      label
    );
  };

  return (
    <Card className="border shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>

        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Last 6 Months
        </span>

      </CardHeader>

      {/* CHART */}
      <CardContent className="pt-3">

        <div className="h-[260px] w-full">

          {safeData.length === 0 ? (

            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No chart data available
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={safeData}
                margin={{
                  top: 15,
                  right: 15,
                  left: 5,
                  bottom: 5,
                }}
              >

                {/* GRID */}

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.7}
                />

                {/* X AXIS */}

                <XAxis
                  dataKey="month"
                  interval={0}
                  tickFormatter={
                    shortMonthLabel
                  }
                  tick={{
                    fontSize: 11,
                    fill:
                      "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />

                {/* Y AXIS */}

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill:
                      "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    yAxisFormatter
                  }
                  width={60}
                  allowDecimals={false}
                />

                {/* TOOLTIP */}

                <Tooltip
                  cursor={{
                    stroke:
                      "hsl(var(--muted-foreground))",
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    backgroundColor:
                      "hsl(var(--card))",
                    border:
                      "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  labelFormatter={(label) =>
                    String(label)
                  }
                  formatter={(value) => [
                    valueFormatter(
                      Number(value)
                    ),
                    "Value",
                  ]}
                />

                {/* LINE */}

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}

                  dot={{
                    r: 4,
                    fill:
                      "hsl(var(--accent))",
                    strokeWidth: 2,
                    stroke:
                      "hsl(var(--card))",
                  }}

                  activeDot={{
                    r: 6,
                    fill:
                      "hsl(var(--accent))",
                    stroke:
                      "hsl(var(--card))",
                    strokeWidth: 2,
                  }}

                  animationDuration={800}
                  animationEasing="ease-out"
                  connectNulls
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </CardContent>

    </Card>
  );
}

/* =====================================================
   PAYROLL CHART
===================================================== */

export function PayrollChart(
  props: Omit<
    DashboardChartProps,
    "valueFormatter" |
    "yAxisFormatter"
  >
) {

  return (
    <DashboardChart
      {...props}
      valueFormatter={
        formatCurrencyCompact
      }
      yAxisFormatter={
        formatCurrencyCompact
      }
    />
  );
}