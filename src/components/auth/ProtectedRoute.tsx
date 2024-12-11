import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if trying to access superadmin page
      if (location.pathname === '/sa83ms') {
        // Only allow specific email for superadmin
        if (session.user.email !== 'mohammedd.yousuf@gmail.com') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          navigate('/admin');
          return;
        }
      }
    };

    checkAuth();
  }, [navigate, location, toast]);

  return <>{children}</>;
};

export default ProtectedRoute;