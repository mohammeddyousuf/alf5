import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GrantAccessFormProps {
  onSuccess: () => void;
}

const GrantAccessForm = ({ onSuccess }: GrantAccessFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: inviteError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (inviteError) throw inviteError;

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
      onSuccess();
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
  );
};

export default GrantAccessForm;