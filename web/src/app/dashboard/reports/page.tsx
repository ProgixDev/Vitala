import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default async function ReportsPage() {
  let overview: Overview | null = null;
  let error: string | null = null;
  try {
    overview = await apiGet<Overview>("/admin/overview");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load report";
  }

  const t = overview?.totals;
  const completed = overview?.appointmentsByStatus?.completed ?? 0;
  const completionRate =
    t && t.appointments ? Math.round((completed / t.appointments) * 100) : 0;

  const rows: [string, string][] = [
    ["Total users", String(t?.users ?? 0)],
    ["Patients", String(t?.patients ?? 0)],
    ["Nurses", String(t?.nurses ?? 0)],
    ["Nurses approved", String(overview?.nursesByStatus?.approved ?? 0)],
    ["Nurses pending review", String(overview?.nursesByStatus?.pending ?? 0)],
    ["Total appointments", String(t?.appointments ?? 0)],
    ["Completed appointments", String(completed)],
    ["Completion rate", `${completionRate}%`],
    ["Total revenue", t ? money(t.revenue) : "$0"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Platform summary — generated live
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary report</CardTitle>
          <CardDescription>
            Key metrics as of {new Date().toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {value}
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
