import { useState, useEffect } from "react";
import { WebsiteNameSection } from "./WebsiteNameSection";
import { TrackingCodesSection } from "./TrackingCodesSection";
import { ImageSection } from "./ImageSection";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  settings: any;
  refetch: () => Promise<any>;
}

export const GeneralSettings = ({ settings, refetch }: GeneralSettingsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showNewsTicker, setShowNewsTicker] = useState(settings?.show_news_ticker ?? true);
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setShowNewsTicker(settings.show_news_ticker ?? true);
    }
  }, [settings]);

  const handleNewsTickerToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({ show_news_ticker: checked })
        .eq('id', settings.id);

      if (error) throw error;

      setShowNewsTicker(checked);
      await refetch();
      toast({ description: "News ticker visibility updated successfully" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-6">
      <WebsiteNameSection 
        initialName={settings?.website_name || ""} 
        refetch={refetch} 
      />

      <div className="flex flex-col items-center justify-center space-y-2">
        <Switch
          id="show-news-ticker"
          checked={showNewsTicker}
          onCheckedChange={handleNewsTickerToggle}
        />
        <Label htmlFor="show-news-ticker">Show News Ticker</Label>
      </div>

      <ImageSection
        logoUrl={settings?.logo_url}
        faviconUrl={settings?.favicon_url}
        refetch={refetch}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      <TrackingCodesSection
        initialCodes={settings?.tracking_codes || ""}
        refetch={refetch}
      />
    </div>
  );
};