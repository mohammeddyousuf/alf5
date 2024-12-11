import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";

export function AdminHeader() {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isSuperAdmin = session?.user?.email === "mohammedd.yousuf@gmail.com";

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            {session?.user?.email}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isSuperAdmin && (
            <DropdownMenuItem onClick={() => navigate("/sa83ms")}>
              <Settings className="mr-2 h-4 w-4" />
              Super Admin Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}