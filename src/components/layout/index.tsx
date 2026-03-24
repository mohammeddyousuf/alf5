import { ReactNode, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LockOverlay } from "../LockOverlay";
import { WhatsAppGroupPopup } from "../home/WhatsAppGroupPopup";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Periodically check lock status
  useEffect(() => {
    const checkLockStatus = () => {
      if (!settings?.lock_enabled || !settings?.lock_datetime) return;
      
      const now = new Date();
      const lockDateTime = new Date(settings.lock_datetime);
      
      // Only log and refetch if we've passed the lock time
      if (now >= lockDateTime) {
        console.log('Website lock status check:', {
          now: now.toISOString(),
          lockDateTime: lockDateTime.toISOString(),
          shouldLock: now >= lockDateTime,
          message: settings.lock_message
        });
        refetch(); // Refresh settings to ensure we have latest lock status
      }
    };

    // Check immediately
    checkLockStatus();

    // Then check based on the configured interval
    const interval = setInterval(checkLockStatus, settings?.lock_check_interval || 60000);

    return () => clearInterval(interval);
  }, [settings, refetch]);

  // Only show lock if enabled, has datetime, and current time is past lock time
  const isLocked = settings?.lock_enabled && 
    settings?.lock_datetime && 
    new Date() >= new Date(settings.lock_datetime);

  // Don't show lock overlay on super admin page
  const showLockOverlay = isLocked && location.pathname !== '/sa83ms';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {showLockOverlay && <LockOverlay message={settings?.lock_message || "This website is currently locked. Please contact support."} />}
    </div>
  );
};

export default Layout;