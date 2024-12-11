import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function GlobalSaleControls() {
  const { toast } = useToast();
  const [isGlobalSaleEnabled, setIsGlobalSaleEnabled] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSaveSettings = async () => {
    if (isGlobalSaleEnabled && (!endDate || !endTime)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set both date and time for the sale end",
      });
      return;
    }

    const endDateTime = isGlobalSaleEnabled 
      ? new Date(`${endDate}T${endTime}`).toISOString()
      : null;

    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          clearance_sale_active: isGlobalSaleEnabled,
          clearance_sale_end_date: endDateTime
        })
        .eq('id', 1);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Global sale settings updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update global sale settings: " + error.message,
      });
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Global Sale Timer</h3>
          <p className="text-sm text-muted-foreground">
            Enable to show countdown timer on all products with sale prices
          </p>
        </div>
        <Switch
          checked={isGlobalSaleEnabled}
          onCheckedChange={setIsGlobalSaleEnabled}
        />
      </div>

      {isGlobalSaleEnabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}