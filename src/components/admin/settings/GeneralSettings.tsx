import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagram_url || "");
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebook_url || "");

  // Update state when settings change
  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.website_name || "");
      setInstagramUrl(settings.instagram_url || "");
      setFacebookUrl(settings.facebook_url || "");
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

  const ensureHttps = (url: string) => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSocialMediaUpdate = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          instagram_url: ensureHttps(instagramUrl),
          facebook_url: ensureHttps(facebookUrl),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Social media links updated successfully",
      });
    } catch (error) {
      console.error('Error updating social media links:', error);
      toast({
        title: "Error",
        description: "Failed to update social media links",
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Social Media Links</h3>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="Enter Instagram URL (e.g., www.instagram.com/your-profile)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook URL</Label>
          <Input
            id="facebookUrl"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="Enter Facebook URL (e.g., www.facebook.com/your-profile)"
          />
        </div>
        <Button onClick={handleSocialMediaUpdate}>Save Social Media Links</Button>
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
        />
      </div>
    </div>
  );
};