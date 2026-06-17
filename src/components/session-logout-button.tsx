import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutEverywhere } from "@/lib/session-cleanup";

export function SessionLogoutButton({
  label = "Deconnexion",
  to = "/mon-suivi",
}: {
  label?: string;
  to?: string;
}) {
  async function onClick() {
    await signOutEverywhere();
    window.location.assign(to);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
      onClick={onClick}
    >
      <LogOut className="h-4 w-4" />
      {label}
    </Button>
  );
}
