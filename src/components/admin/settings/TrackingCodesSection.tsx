import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface TrackingCodesSectionProps {
  initialCodes: string;
  refetch: () => Promise<any>;
}

export const TrackingCodesSection = ({ initialCodes, refetch }: TrackingCodesSectionProps) => {
  const { toast } = useToast();
  const [trackingCodes, setTrackingCodes] = useState(initialCodes);

  const handleTrackingCodesUpdate = async () => {
    try {
      await updateSettings({ tracking_codes: trackingCodes });
      await refetch();
      toast({
        title: "Success",
        description: "Tracking codes updated successfully",
      });
    } catch (error) {
      console.error('Error updating tracking codes:', error);
      toast({
        title: "Error",
        description: "Failed to update tracking codes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="trackingCodes">Tracking Codes</Label>
      <div className="space-y-2">
        <Textarea
          id="trackingCodes"
          value={trackingCodes}
          onChange={(e) => setTrackingCodes(e.target.value)}
          placeholder="Paste your tracking codes here (e.g., Google Analytics)"
          className="min-h-[150px] font-mono text-sm"
        />
        <Button onClick={handleTrackingCodesUpdate} className="w-full">
          Save Tracking Codes
        </Button>
      </div>
    </div>
  );
};