import { redirect } from "next/navigation";

export default function LegacyServicesRedirectPage() {
  redirect("/services");
}
