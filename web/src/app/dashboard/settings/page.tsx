"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Account {
  email: string;
  name: string;
  role: string;
  id: string;
}

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setAccount({
        email: user.email ?? "—",
        name: (user.user_metadata?.full_name as string) ?? "—",
        role: (user.app_metadata?.role as string) ?? "—",
        id: user.id,
      });
    });
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Your administrator account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed-in administrator details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!account ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <Field label="Name" value={account.name} />
              <Field label="Email" value={account.email} />
              <Field
                label="Role"
                value={<Badge className="capitalize">{account.role}</Badge>}
              />
              <Field
                label="User ID"
                value={<span className="font-mono text-xs">{account.id}</span>}
              />
              <div className="pt-2">
                <Button variant="outline" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
