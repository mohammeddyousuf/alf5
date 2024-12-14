import { useState } from "react";
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
  const [lockDatetime, setLockDatetime] = useState(initialLockDatetime || "");
  const [lockMessage, setLockMessage] = useState(initialLockMessage || "");
  const [checkInterval, setCheckInterval] = useState(initialCheckInterval || 60000);

  const handleSave = async () => {
    try {
      await updateSettings({
        lock_enabled: lockEnabled,
        lock_datetime: lockDatetime || null,
        lock_message: lockMessage || null,
        lock_check_interval: checkInterval
      });
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
          onCheckedChange={setLockEnabled}
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
            <Label htmlFor="checkInterval">Check Interval (milliseconds)</Label>
            <Input
              id="checkInterval"
              type="number"
              min="1000"
              step="1000"
              value={checkInterval}
              onChange={(e) => setCheckInterval(Number(e.target.value))}
              placeholder="Enter check interval in milliseconds (e.g., 60000 for 1 minute)"
            />
            <p className="text-sm text-muted-foreground">
              How often to check if the app should be locked (in milliseconds). Minimum 1000ms (1 second)
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