import { useEffect, useState } from "react";

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

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const difference = new Date(endDate).getTime() - new Date().getTime();
        
        if (difference <= 0) {
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // If timer has expired, clear the interval
      if (newTimeLeft.days === 0 && 
          newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && 
          newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  // Don't render if all values are 0
  if (timeLeft.days === 0 && 
      timeLeft.hours === 0 && 
      timeLeft.minutes === 0 && 
      timeLeft.seconds === 0) {
    return null;
  }

  // Format numbers to ensure consistent width
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={`bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-mono tabular-nums ${className}`}>
      {formatNumber(timeLeft.days)}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m {formatNumber(timeLeft.seconds)}s
    </div>
  );
}