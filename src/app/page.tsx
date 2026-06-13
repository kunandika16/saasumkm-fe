import { redirect } from "next/navigation";

export default function RootPage() {
  // Root page redirects to admin login.
  // Members access via /t/[tenantId] (NFC/QR URL).
  redirect("/login");
}
