import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          role: 'admin'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });

      setEmail("");
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Admin Management</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/sa83ms")}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grant Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending Invitation..." : "Grant Admin Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;