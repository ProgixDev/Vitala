import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Stethoscope, DollarSign, CalendarClock } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Overview {
  totals: {
    users: number;
    patients: number;
    nurses: number;
    appointments: number;
    revenue: number;
  };
  nursesByStatus: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function Breakdown({
  title,
  data,
  colors,
}: {
  title: string;
  data: Record<string, number>;
  colors: Record<string, string>;
}) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{total} total</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-32 text-sm capitalize">{key}</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${colors[key] ?? "bg-primary"}`}
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm tabular-nums">{count}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  let overview: Overview | null = null;
  let error: string | null = null;
  try {
    overview = await apiGet<Overview>("/admin/overview");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load analytics";
  }

  const t = overview?.totals;
  const cards = [
    { label: "Users", value: t?.users ?? 0, sub: `${t?.patients ?? 0} patients`, icon: Users, tint: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
    { label: "Nurses", value: t?.nurses ?? 0, sub: "on platform", icon: Stethoscope, tint: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20" },
    { label: "Appointments", value: t?.appointments ?? 0, sub: "all time", icon: CalendarClock, tint: "text-orange-600 bg-orange-100 dark:bg-orange-900/20" },
    { label: "Revenue", value: t ? money(t.revenue) : "$0", sub: "completed payments", icon: DollarSign, tint: "text-green-600 bg-green-100 dark:bg-green-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Live platform metrics</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <div className={`p-2 rounded-lg ${c.tint}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown
          title="Appointments by status"
          data={overview?.appointmentsByStatus ?? {}}
          colors={{
            completed: "bg-green-500",
            confirmed: "bg-blue-500",
            "in-progress": "bg-indigo-500",
            "on-the-way": "bg-cyan-500",
            pending: "bg-amber-500",
            cancelled: "bg-gray-400",
            declined: "bg-red-500",
          }}
        />
        <Breakdown
          title="Nurses by verification"
          data={overview?.nursesByStatus ?? {}}
          colors={{
            approved: "bg-green-500",
            pending: "bg-amber-500",
            rejected: "bg-red-500",
          }}
        />
      </div>
    </div>
  );
}
