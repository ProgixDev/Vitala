import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in admins go straight to the dashboard; everyone else signs in.
  if (user?.app_metadata?.role === "admin") {
    redirect("/dashboard");
  }
  redirect("/signin");
}
