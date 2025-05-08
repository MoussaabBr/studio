
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button onClick={logout} variant="outline" className="border-primary text-primary hover:bg-primary/10">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
