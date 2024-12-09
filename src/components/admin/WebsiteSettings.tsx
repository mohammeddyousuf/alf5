import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadField } from "./shared/ImageUploadField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { updateThemeColor } from "@/utils/themeUtils";

export const WebsiteSettings = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [colors, setColors] = useState({
    primary: "#9b87f5",
    secondary: "#7E69AB",
    accent: "#6E59A5",
    background: "#FFFFFF",
    foreground: "#000000",
  });

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

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
    updateThemeColor(colorKey, value);
    
    toast({
      title: "Theme Updated",
      description: `${colorKey} color has been updated`,
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Website Settings</h2>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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
            />
          </div>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="h-10 w-20"
                />
                <Input 
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="h-10 w-20"
                />
                <Input 
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="h-10 w-20"
                />
                <Input 
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="h-10 w-20"
                />
                <Input 
                  value={colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foregroundColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="foregroundColor"
                  type="color"
                  value={colors.foreground}
                  onChange={(e) => handleColorChange('foreground', e.target.value)}
                  className="h-10 w-20"
                />
                <Input 
                  value={colors.foreground}
                  onChange={(e) => handleColorChange('foreground', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
