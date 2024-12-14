import { Shield, Settings, UserCheck, Lock, ArrowLeft, FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { SystemLimits } from "@/components/admin/settings/SystemLimits";
import { SubscriptionLockSection } from "@/components/admin/settings/SubscriptionLockSection";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SuperAdmin = () => {
  const navigate = useNavigate();

  const { data: settings, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Subscription Lock</h2>
          </div>
          <SubscriptionLockSection
            initialLockEnabled={settings?.lock_enabled || false}
            initialLockDatetime={settings?.lock_datetime}
            initialLockMessage={settings?.lock_message}
            initialCheckInterval={settings?.lock_check_interval}
            refetch={refetch}
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Page Management</h2>
            </div>
            <Button onClick={() => navigate("/admin/pages/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Page
            </Button>
          </div>
          <p className="text-muted-foreground">
            Create new pages and manage their placement in the navigation
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">System Limits</h2>
          </div>
          <SystemLimits />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Admin Management</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Manage admin access and permissions
            </p>
            <Button className="w-full">Manage Admins</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Override Settings</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Override website and WhatsApp settings
            </p>
            <Button className="w-full">Manage Overrides</Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SuperAdmin;