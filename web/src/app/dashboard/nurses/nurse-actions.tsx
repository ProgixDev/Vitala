"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

/** Approve / reject buttons for a pending nurse. Calls the admin API. */
export function NurseActions({ nurseId }: { nurseId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const decide = async (decision: "approved" | "rejected") => {
    setBusy(true);
    try {
      await apiRequest(`/admin/nurses/${nurseId}/verify`, {
        method: "PUT",
        body: { decision },
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        disabled={busy}
        onClick={() => decide("approved")}
        className="bg-green-600 hover:bg-green-700"
      >
        <Check className="h-4 w-4" /> Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => decide("rejected")}
      >
        <X className="h-4 w-4" /> Reject
      </Button>
    </div>
  );
}
