"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground mt-1">
          Manage and schedule appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments Management</CardTitle>
          <CardDescription>
            This page is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="h-16 w-16 mb-4" />
            <p className="text-lg">Appointments page coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
