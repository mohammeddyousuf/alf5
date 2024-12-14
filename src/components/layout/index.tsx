import { ReactNode, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LockOverlay } from "../LockOverlay";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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

  // Periodically check lock status
  useEffect(() => {
    // Check immediately on mount
    const checkLockStatus = () => {
      const now = new Date();
      const lockDateTime = settings?.lock_datetime ? new Date(settings.lock_datetime) : null;
      
      if (settings?.lock_enabled && lockDateTime && now >= lockDateTime) {
        console.log('App is locked:', {
          now: now.toISOString(),
          lockDateTime: lockDateTime.toISOString(),
          message: settings.lock_message
        });
        refetch(); // Refresh settings to ensure we have latest lock status
      }
    };

    // Check immediately
    checkLockStatus();

    // Then check every minute
    const interval = setInterval(checkLockStatus, 60000);

    return () => clearInterval(interval);
  }, [settings, refetch]);

  const isLocked = settings?.lock_enabled && 
    settings?.lock_datetime && 
    new Date(settings.lock_datetime) <= new Date();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {isLocked && <LockOverlay message={settings.lock_message || "This app is currently locked. Please contact support."} />}
    </div>
  );
};

export default Layout;