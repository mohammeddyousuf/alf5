import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const WebsiteSettings = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [websiteName, setWebsiteName] = useState("");

  const { data: settings, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      if (data) {
        setWebsiteName(data.website_name || "");
      }
      return data;
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('settings')
        .update({ logo_url: publicUrl })
        .eq('id', settings?.id);

      if (updateError) throw updateError;

      await refetch();
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `favicon-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('settings')
        .update({ favicon_url: publicUrl })
        .eq('id', settings?.id);

      if (updateError) throw updateError;

      await refetch();
      toast({
        title: "Success",
        description: "Favicon uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        title: "Error",
        description: "Failed to upload favicon",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Website Settings</h2>
      
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
          <div className="flex items-center gap-4">
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Current logo" className="h-8 w-auto" />
            )}
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="favicon">Favicon (ICO)</Label>
          <div className="flex items-center gap-4">
            {settings?.favicon_url && (
              <img src={settings.favicon_url} alt="Current favicon" className="h-8 w-auto" />
            )}
            <Input
              id="favicon"
              type="file"
              accept=".ico,image/*"
              onChange={handleFaviconUpload}
              disabled={isUploading}
            />
          </div>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </Card>
  );
};