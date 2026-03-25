import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";

interface SaleCountdownProps {
  endDate: string;
  className?: string;
}

export function SaleCountdown({ endDate, className = "" }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const calculateTimeLeft = () => {
      try {
        const difference = new Date(endDate).getTime() - new Date().getTime();
        
        if (difference <= 0) {
          console.log("Sale timer expired - invalidating queries");
          queryClient.invalidateQueries({ queryKey: ["settings"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } catch (error) {
        console.error("Error calculating time left:", error);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const updateTimer = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && 
          newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && 
          newTimeLeft.seconds === 0) {
        clearInterval(timer);
        queryClient.refetchQueries({ queryKey: ["settings"] });
        queryClient.refetchQueries({ queryKey: ["products"] });
      }
    };

    updateTimer();
    timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endDate, queryClient]);

  if (timeLeft.days === 0 && 
      timeLeft.hours === 0 && 
      timeLeft.minutes === 0 && 
      timeLeft.seconds === 0) {
    return null;
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className={`text-destructive-foreground px-2 py-1 rounded-md text-xs font-mono tabular-nums ${className}`}
      style={{ 
        backgroundColor: settings?.sale_color || '#ea384c',
        color: 'white'
      }}
    >
      {formatNumber(timeLeft.days)}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m {formatNumber(timeLeft.seconds)}s
    </div>
  );
}