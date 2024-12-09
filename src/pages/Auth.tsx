import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AuthPage = () => {
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
            }
          },
        }}
      />
    </div>
  );
};

export default AuthPage;