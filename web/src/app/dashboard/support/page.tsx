import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, BookOpen, LifeBuoy, Server } from "lucide-react";

const resources = [
  {
    icon: Server,
    title: "API status",
    body: "The dashboard reads live data from the Vitala API. If pages show a load error, check that the API is running and reachable at NEXT_PUBLIC_API_URL.",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    body: "Backend setup, environment variables, and the data model are documented in server-nest/README.md.",
  },
  {
    icon: LifeBuoy,
    title: "Verifying nurses",
    body: "Pending nurse applications appear on the Nurses page with Approve / Reject actions. Approving a nurse activates their account.",
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-1">Help and platform resources</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {resources.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <r.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{r.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Reach the platform team</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="mailto:support@vitala.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            support@vitala.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
