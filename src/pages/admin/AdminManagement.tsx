import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCog, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Get the current user's profile first
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

      // Only proceed if user is an admin
      if (currentUserProfile?.role !== 'admin' && currentUserProfile?.role !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Now fetch other admin profiles
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

    checkUserAndFetchAdmins();
  }, [navigate, toast]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send magic link
      const { error: inviteError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (inviteError) throw inviteError;

      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          email,
          role: 'admin'
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });

      setEmail("");
      
      // Refresh the admin list
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      const adminProfiles = profilesData?.filter(
        profile => profile.role === 'admin' || profile.role === 'super_admin'
      ) || [];

      setAdmins(adminProfiles);
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

  const getRoleIcon = (role: string) => {
    if (role === 'super_admin') {
      return <Shield className="h-4 w-4 text-destructive" />;
    }
    return <UserCog className="h-4 w-4 text-primary" />;
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

      <Card>
        <CardHeader>
          <CardTitle>Admin List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(admin.role)}
                      <Badge variant={admin.role === 'super_admin' ? "destructive" : "default"}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No admins found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;