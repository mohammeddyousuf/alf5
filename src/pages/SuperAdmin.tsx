import { Shield, Settings, UserCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

const SuperAdmin = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">System Limits</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Configure system-wide limitations
            </p>
            <Button className="w-full">Configure Limits</Button>
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