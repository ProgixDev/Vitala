import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import { NurseActions } from "./nurse-actions";

interface NurseRow {
  profile_id: string;
  license_number: string | null;
  specializations: string[];
  experience_years: number | null;
  verification_status: "pending" | "approved" | "rejected";
  rating: number;
  total_reviews: number;
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    status: string;
  } | null;
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

const verifyBadge: Record<string, string> = {
  approved: "bg-green-500 text-white",
  pending: "bg-amber-500 text-white",
  rejected: "bg-red-500 text-white",
};

export default async function NursesPage() {
  let nurses: NurseRow[] = [];
  let error: string | null = null;
  try {
    nurses = await apiGet<NurseRow[]>("/admin/nurses");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load nurses";
  }

  const pending = nurses.filter((n) => n.verification_status === "pending").length;
  const approved = nurses.filter((n) => n.verification_status === "approved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nurses</h1>
        <p className="text-muted-foreground mt-1">
          {nurses.length} nurses · {approved} approved · {pending} pending review
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Nurses</CardTitle>
          <CardDescription>Review and verify nurse applications</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : nurses.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No nurses yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nurses.map((n) => (
                  <TableRow key={n.profile_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {initials(n.profile?.full_name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {n.profile?.full_name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {n.profile?.phone ?? "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {n.specializations.length ? (
                          n.specializations.map((s) => (
                            <Badge key={s} variant="secondary">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {Number(n.rating).toFixed(1)}
                        <span className="text-muted-foreground">
                          ({n.total_reviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={verifyBadge[n.verification_status]}>
                        {n.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {n.verification_status === "pending" && (
                        <NurseActions nurseId={n.profile_id} />
                      )}
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
