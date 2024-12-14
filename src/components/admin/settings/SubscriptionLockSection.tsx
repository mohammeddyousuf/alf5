import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface SubscriptionLockSectionProps {
  initialLockEnabled: boolean;
  initialLockDatetime: string | null;
  initialLockMessage: string | null;
  initialCheckInterval: number | null;
  refetch: () => Promise<any>;
}

export const SubscriptionLockSection = ({
  initialLockEnabled,
  initialLockDatetime,
  initialLockMessage,
  initialCheckInterval,
  refetch
}: SubscriptionLockSectionProps) => {
  const { toast } = useToast();
  const [lockEnabled, setLockEnabled] = useState(initialLockEnabled);
  const [lockDatetime, setLockDatetime] = useState("");
  const [lockMessage, setLockMessage] = useState(initialLockMessage || "");
  const [checkInterval, setCheckInterval] = useState(
    initialCheckInterval ? Math.floor(initialCheckInterval / 60000) : 1
  );

  // Update local state when props change
  useEffect(() => {
    setLockEnabled(initialLockEnabled);
    if (initialLockDatetime) {
      const date = new Date(initialLockDatetime);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      setLockDatetime(localDate.toISOString().slice(0, 16));
    }
    setLockMessage(initialLockMessage || "");
    setCheckInterval(initialCheckInterval ? Math.floor(initialCheckInterval / 60000) : 1);
  }, [initialLockEnabled, initialLockDatetime, initialLockMessage, initialCheckInterval]);

  const handleSave = async () => {
    try {
      let formattedDateTime = null;
      if (lockEnabled && lockDatetime) {
        // Convert local datetime to UTC for storage
        const localDate = new Date(lockDatetime);
        formattedDateTime = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)).toISOString();
      }

      const updates = {
        lock_enabled: lockEnabled,
        lock_datetime: formattedDateTime,
        lock_message: lockMessage || null,
        lock_check_interval: checkInterval * 60000
      };

      console.log('Saving lock settings:', updates);
      
      await updateSettings(updates);
      await refetch();
      
      toast({
        title: "Success",
        description: "Subscription lock settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating subscription lock settings:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription lock settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Subscription Lock</Label>
          <p className="text-sm text-muted-foreground">
            When enabled, the app will be locked at the specified date and time
          </p>
        </div>
        <Switch
          checked={lockEnabled}
          onCheckedChange={(checked) => {
            setLockEnabled(checked);
            if (!checked) {
              setLockDatetime("");
              setLockMessage("");
            }
          }}
        />
      </div>
      
      {lockEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="lockDatetime">Lock Date and Time</Label>
            <Input
              id="lockDatetime"
              type="datetime-local"
              value={lockDatetime}
              onChange={(e) => setLockDatetime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lockMessage">Lock Message</Label>
            <Textarea
              id="lockMessage"
              value={lockMessage}
              onChange={(e) => setLockMessage(e.target.value)}
              placeholder="Enter the message to display when the app is locked..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval">Check Interval (minutes)</Label>
            <Input
              id="checkInterval"
              type="number"
              min="1"
              step="1"
              value={checkInterval}
              onChange={(e) => setCheckInterval(Number(e.target.value))}
              placeholder="Enter check interval in minutes (e.g., 1 for every minute)"
            />
            <p className="text-sm text-muted-foreground">
              How often to check if the app should be locked (in minutes). Minimum 1 minute
            </p>
          </div>
          
          <Button onClick={handleSave} className="w-full">
            Save Lock Settings
          </Button>
        </>
      )}
    </div>
  );
};