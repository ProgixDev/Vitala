import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  receipt_number: string | null;
  created_at: string;
  user: { full_name: string } | null;
}

const money = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n);

const statusBadge: Record<string, string> = {
  completed: "bg-green-500 text-white",
  processing: "bg-blue-500 text-white",
  pending: "bg-amber-500 text-white",
  failed: "bg-red-500 text-white",
  refunded: "bg-gray-500 text-white",
  cancelled: "bg-gray-400 text-white",
};

export default async function PaymentsPage() {
  let payments: PaymentRow[] = [];
  let error: string | null = null;
  try {
    payments = await apiGet<PaymentRow[]>("/admin/payments");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load payments";
  }

  const completed = payments.filter((p) => p.status === "completed");
  const revenue = completed.reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) =>
    ["pending", "processing"].includes(p.status),
  ).length;

  const summary = [
    { label: "Total Revenue", value: money(revenue) },
    { label: "Completed", value: String(completed.length) },
    { label: "Pending", value: String(pending) },
    { label: "Transactions", value: String(payments.length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Transactions across the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Live payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No payments yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.receipt_number ?? p.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{p.user?.full_name ?? "—"}</TableCell>
                    <TableCell className="capitalize">{p.method ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge[p.status] ?? "bg-gray-400"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(Number(p.amount), p.currency)}
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
