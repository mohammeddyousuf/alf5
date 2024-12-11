import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaLinksSection } from "./settings/SocialMediaLinksSection";
import type { SocialMediaLink } from "@/integrations/supabase/types/social";

export const WhatsAppSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [isSocialMediaUpdating, setIsSocialMediaUpdating] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;
      console.log("Settings data:", data); // Added for debugging
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsapp_number || "");
      setWhatsappGroupUrl(settings.whatsapp_group_url || "");
      
      // Initialize social media links from settings
      if (settings.social_media_links && settings.social_media_links.length > 0) {
        setSocialMediaLinks(settings.social_media_links);
      } else {
        // Fallback to individual URLs if social_media_links array is empty
        const links: SocialMediaLink[] = [];
        if (settings.instagram_url) {
          links.push({ name: "Instagram", url: settings.instagram_url });
        }
        if (settings.facebook_url) {
          links.push({ name: "Facebook", url: settings.facebook_url });
        }
        setSocialMediaLinks(links);
      }
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

  const handleUpdateSocialMedia = async (links: SocialMediaLink[]) => {
    setIsSocialMediaUpdating(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          social_media_links: links,
          instagram_url: links.find(link => link.name === "Instagram")?.url || null,
          facebook_url: links.find(link => link.name === "Facebook")?.url || null,
        })
        .eq("id", settings?.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSocialMediaLinks(links);

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
      setIsSocialMediaUpdating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
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
        </div>
      </div>

      <div className="pt-4 border-t">
        <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
        <SocialMediaLinksSection
          links={socialMediaLinks}
          onUpdate={handleUpdateSocialMedia}
          isUpdating={isSocialMediaUpdating}
        />
      </div>
    </Card>
  );
};