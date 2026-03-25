import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/db";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("Rendering Auth page");

  useEffect(() => {
    // Log current auth state on component mount
    const logAuthState = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      // If there's already a valid session, redirect to admin
      if (session) {
        navigate('/admin');
        return;
      }
      
      if (error) {
        console.error('Session error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    logAuthState();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        navigate('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This page is for administrators only.
        </AlertDescription>
      </Alert>

      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          style: {
            button: { background: 'rgb(var(--primary))', color: 'white' },
            anchor: { color: 'rgb(var(--primary))' },
            message: {
              color: 'rgb(239 68 68)'  // Red color for error messages
            }
          },
        }}
        theme="light"
        providers={[]}
        redirectTo={window.location.origin}
        showLinks={false}
        view="sign_in"
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign In',
              loading_button_label: 'Signing in...',
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Your password',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign Up',
              loading_button_label: 'Signing up...',
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Your password',
            }
          },
        }}
      />
    </div>
  );
};

export default AuthPage;