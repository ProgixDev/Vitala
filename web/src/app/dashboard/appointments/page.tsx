import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";

interface AppointmentRow {
  id: string;
  status: string;
  appointment_type: string;
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

const statusBadge: Record<string, string> = {
  completed: "bg-green-500 text-white",
  confirmed: "bg-blue-500 text-white",
  "in-progress": "bg-indigo-500 text-white",
  "on-the-way": "bg-cyan-500 text-white",
  pending: "bg-amber-500 text-white",
  cancelled: "bg-gray-400 text-white",
  declined: "bg-red-500 text-white",
};

export default async function AppointmentsPage() {
  let appointments: AppointmentRow[] = [];
  let error: string | null = null;
  try {
    appointments = await apiGet<AppointmentRow[]>("/admin/appointments");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load appointments";
  }

  const active = appointments.filter((a) =>
    ["confirmed", "on-the-way", "in-progress"].includes(a.status),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground mt-1">
          {appointments.length} total · {active} active
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>Live bookings across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No appointments yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.patient?.full_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.service?.name ?? "—"}</Badge>
                      {a.appointment_type === "emergency" && (
                        <Badge className="ml-1 bg-red-500 text-white">SOS</Badge>
                      )}
                    </TableCell>
                    <TableCell>{a.nurse?.full_name ?? "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.scheduled_date} {a.scheduled_start?.slice(0, 5)}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {a.address}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge[a.status] ?? "bg-gray-400"}>
                        {a.status}
                      </Badge>
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
