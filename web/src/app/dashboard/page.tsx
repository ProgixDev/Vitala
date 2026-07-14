import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Stethoscope, DollarSign, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface AppointmentRow {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_start: string;
  price: number;
  address: string;
  service: { name: string } | null;
  patient: { full_name: string } | null;
  nurse: { full_name: string } | null;
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const statusColor: Record<string, string> = {
  completed: "bg-green-500",
  confirmed: "bg-blue-500",
  "in-progress": "bg-indigo-500",
  "on-the-way": "bg-cyan-500",
  pending: "bg-amber-500",
  cancelled: "bg-gray-400",
  declined: "bg-red-500",
};

export default async function DashboardPage() {
  let overview: Overview | null = null;
  let appointments: AppointmentRow[] = [];
  let error: string | null = null;
  try {
    [overview, appointments] = await Promise.all([
      apiGet<Overview>("/admin/overview"),
      apiGet<AppointmentRow[]>("/admin/appointments"),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard";
  }

  const t = overview?.totals;
  const cards = [
    { title: "Total Users", value: t?.users ?? 0, icon: Users, tint: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
    { title: "Nurses", value: t?.nurses ?? 0, icon: Stethoscope, tint: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20" },
    { title: "Revenue", value: t ? money(t.revenue) : "$0", icon: DollarSign, tint: "text-green-600 bg-green-100 dark:bg-green-900/20" },
    { title: "Appointments", value: t?.appointments ?? 0, icon: CalendarClock, tint: "text-orange-600 bg-orange-100 dark:bg-orange-900/20" },
  ];

  const statusEntries = Object.entries(overview?.appointmentsByStatus ?? {});
  const statusTotal = statusEntries.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Live overview from the Vitala API</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <div className={`p-2 rounded-lg ${c.tint}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments by status</CardTitle>
          <CardDescription>{statusTotal} total</CardDescription>
        </CardHeader>
        <CardContent>
          {statusEntries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-28 text-sm capitalize">{status}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${statusColor[status] ?? "bg-primary"}`}
                      style={{ width: `${(count / statusTotal) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent appointments</CardTitle>
          <CardDescription>Most recent bookings across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.slice(0, 8).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.patient?.full_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.service?.name ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>{a.nurse?.full_name ?? "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.scheduled_date} {a.scheduled_start?.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                        <span
                          className={`h-2 w-2 rounded-full ${statusColor[a.status] ?? "bg-primary"}`}
                        />
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(Number(a.price))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
