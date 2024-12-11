import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../shared/ImageUploadField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneralSettingsProps {
  settings: any;
  refetch: () => Promise<any>;
}

export const GeneralSettings = ({ settings, refetch }: GeneralSettingsProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [websiteName, setWebsiteName] = useState(settings?.website_name || "");
  const [trackingCodes, setTrackingCodes] = useState(settings?.tracking_codes || "");

  // Update state when settings change
  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.website_name || "");
      setTrackingCodes(settings.tracking_codes || "");
    }
  }, [settings]);

  const handleWebsiteNameUpdate = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ website_name: websiteName })
        .eq('id', settings?.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Website name updated successfully",
      });
    } catch (error) {
      console.error('Error updating website name:', error);
      toast({
        title: "Error",
        description: "Failed to update website name",
        variant: "destructive",
      });
    }
  };

  const handleTrackingCodesUpdate = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ tracking_codes: trackingCodes })
        .eq('id', settings?.id);

      if (error) throw error;

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

  const handleLogoChange = async (url: string | null) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ logo_url: url })
        .eq('id', settings?.id);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error('Error updating logo:', error);
      toast({
        title: "Error",
        description: "Failed to update logo",
        variant: "destructive",
      });
    }
  };

  const handleFaviconChange = async (url: string | null) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ favicon_url: url })
        .eq('id', settings?.id);

      if (error) throw error;
      await refetch();
      
      // Dispatch custom event to update favicon
      window.dispatchEvent(new Event('faviconUpdated'));
      
      toast({
        title: "Success",
        description: "Favicon updated successfully",
      });
    } catch (error) {
      console.error('Error updating favicon:', error);
      toast({
        title: "Error",
        description: "Failed to update favicon",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="websiteName">Website Name</Label>
        <div className="flex gap-2">
          <Input
            id="websiteName"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            placeholder="Enter website name"
          />
          <Button onClick={handleWebsiteNameUpdate}>Save</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        <ImageUploadField
          imageUrl={settings?.logo_url}
          onImageChange={handleLogoChange}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="favicon">Favicon (ICO)</Label>
        <ImageUploadField
          imageUrl={settings?.favicon_url}
          onImageChange={handleFaviconChange}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          isFavicon={true}
        />
      </div>

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
          <Button onClick={handleTrackingCodesUpdate} className="w-full">Save Tracking Codes</Button>
        </div>
      </div>
    </div>
  );
};