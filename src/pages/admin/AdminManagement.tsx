import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminList from "@/components/admin/AdminList";
import GrantAccessForm from "@/components/admin/GrantAccessForm";

const AdminManagement = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    try {
      const { data: profilesData, error: adminsError } = await supabase
        .from('profiles')
        .select('*');

      if (adminsError) throw adminsError;

      const adminProfiles = profilesData?.filter(
        profile => profile.role === 'admin' || profile.role === 'super_admin'
      ) || [];

      setAdmins(adminProfiles);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin list",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkUserAndFetchAdmins = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to access this page",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to verify admin access",
          variant: "destructive",
        });
        return;
      }

      if (currentUserProfile?.role !== 'admin' && currentUserProfile?.role !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      fetchAdmins();
    };

    checkUserAndFetchAdmins();
  }, [navigate, toast]);

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

      <GrantAccessForm onSuccess={fetchAdmins} />
      <AdminList admins={admins} />
    </div>
  );
};

export default AdminManagement;