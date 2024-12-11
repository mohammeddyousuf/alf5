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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    try {
      const { data: profilesData, error: adminsError } = await supabase
        .from('profiles')
        .select('*')
        .or('role.eq.admin,role.eq.super_admin');

      if (adminsError) throw adminsError;

      setAdmins(profilesData || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkUserAndFetchAdmins = async () => {
      try {
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

        // First check if user exists in profiles
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: 'user'
            });

          if (insertError) throw insertError;
          
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        fetchAdmins();
      } catch (error: any) {
        console.error('Error checking user access:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to verify access",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkUserAndFetchAdmins();
  }, [navigate, toast]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

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