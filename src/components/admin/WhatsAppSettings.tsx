import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const WhatsAppSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Update state when settings change
  useEffect(() => {
    if (settings?.whatsapp_number) {
      setWhatsappNumber(settings.whatsapp_number);
    }
    if (settings?.whatsapp_group_url) {
      setWhatsappGroupUrl(settings.whatsapp_group_url);
    }
    if (settings?.instagram_url) {
      setInstagramUrl(settings.instagram_url);
    }
    if (settings?.facebook_url) {
      setFacebookUrl(settings.facebook_url);
    }
  }, [settings]);

  const handleUpdateWhatsApp = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({ 
          whatsapp_number: whatsappNumber,
          whatsapp_group_url: whatsappGroupUrl 
        })
        .eq("id", settings?.id);

      if (error) throw error;

      // Invalidate and refetch settings query
      await queryClient.invalidateQueries({ queryKey: ["settings"] });

      toast({
        title: "Success",
        description: "WhatsApp settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating WhatsApp settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update WhatsApp settings",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSocialMediaUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          instagram_url: instagramUrl,
          facebook_url: facebookUrl,
        })
        .eq("id", settings?.id);

      if (error) throw error;

      // Invalidate and refetch settings query
      await queryClient.invalidateQueries({ queryKey: ["settings"] });

      toast({
        title: "Success",
        description: "Social media links updated successfully",
      });
    } catch (error) {
      console.error("Error updating social media links:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update social media links",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">WhatsApp Settings</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Enter WhatsApp number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsappGroup">WhatsApp Group Link</Label>
          <Input
            id="whatsappGroup"
            value={whatsappGroupUrl}
            onChange={(e) => setWhatsappGroupUrl(e.target.value)}
            placeholder="Enter WhatsApp group invite link"
          />
        </div>
        <Button onClick={handleUpdateWhatsApp} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update WhatsApp'
          )}
        </Button>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Enter full Instagram URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="Enter full Facebook URL"
              />
            </div>
            <Button onClick={handleSocialMediaUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Social Media Links'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};