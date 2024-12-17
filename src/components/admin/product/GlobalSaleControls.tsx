import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function GlobalSaleControls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGlobalSaleEnabled, setIsGlobalSaleEnabled] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Get current date and time in the required format
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const currentTime = today.toTimeString().slice(0, 5);

  // Fetch current settings
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

  // Initialize state from settings
  useEffect(() => {
    if (settings) {
      setIsGlobalSaleEnabled(settings.clearance_sale_active || false);
      if (settings.clearance_sale_end_date) {
        const endDateTime = new Date(settings.clearance_sale_end_date);
        const dateStr = endDateTime.toISOString().split('T')[0];
        const timeStr = endDateTime.toISOString().split('T')[1].substring(0, 5);
        
        // Only set the date and time if they're in the future
        if (new Date(`${dateStr}T${timeStr}`) > new Date()) {
          setEndDate(dateStr);
          setEndTime(timeStr);
        }
      }
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (isGlobalSaleEnabled && (!endDate || !endTime)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set both date and time for the sale end",
      });
      return;
    }

    // Validate that the selected date and time are in the future
    const selectedDateTime = new Date(`${endDate}T${endTime}`);
    if (selectedDateTime <= new Date()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a future date and time",
      });
      return;
    }

    try {
      const endDateTime = isGlobalSaleEnabled 
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : null;

      const updates = {
        clearance_sale_active: isGlobalSaleEnabled,
        clearance_sale_end_date: endDateTime
      };

      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', settings?.id);

      if (error) throw error;

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings"] });

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

  const handleToggleSale = async (checked: boolean) => {
    setIsGlobalSaleEnabled(checked);
    
    if (!checked) {
      try {
        const { error } = await supabase
          .from('settings')
          .update({
            clearance_sale_active: false,
            clearance_sale_end_date: null
          })
          .eq('id', settings?.id);

        if (error) throw error;

        // Clear the date and time inputs
        setEndDate("");
        setEndTime("");

        // Invalidate and refetch settings
        await queryClient.invalidateQueries({ queryKey: ["settings"] });

        toast({
          title: "Success",
          description: "Global sale disabled successfully",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to disable global sale: " + error.message,
        });
        // Revert the switch state if there was an error
        setIsGlobalSaleEnabled(true);
      }
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border mb-6">
      <div className="text-center space-y-1 mb-4">
        <h3 className="font-semibold">Global Sale Timer</h3>
        <p className="text-sm text-muted-foreground">
          Enable to show countdown timer on all products with sale prices
        </p>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <Switch
          checked={isGlobalSaleEnabled}
          onCheckedChange={handleToggleSale}
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
                min={minDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                min={endDate === minDate ? currentTime : undefined}
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