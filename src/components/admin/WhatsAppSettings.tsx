import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showOrderForm, setShowOrderForm] = useState(true);
  const [showWhatsappGroupPopup, setShowWhatsappGroupPopup] = useState(false);
  const [whatsappGroupPopupMessage, setWhatsappGroupPopupMessage] = useState("");
  const [showFloatingContact, setShowFloatingContact] = useState(false);
  const [showFloatingGroup, setShowFloatingGroup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [isSocialMediaUpdating, setIsSocialMediaUpdating] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      console.log("Fetching settings...");
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      console.log("Settings data:", data);
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsapp_number || "");
      setWhatsappGroupUrl(settings.whatsapp_group_url || "");
      setShowOrderForm(settings.show_order_form !== false);
      setShowWhatsappGroupPopup(settings.show_whatsapp_group_popup === true);
      setWhatsappGroupPopupMessage(settings.whatsapp_group_popup_message || "");
      setShowFloatingContact(settings.show_floating_whatsapp_contact === true);
      setShowFloatingGroup(settings.show_floating_whatsapp_group === true);
      
      // Initialize social media links from settings
      let links: SocialMediaLink[] = [];
      
      if (settings.social_media_links && Array.isArray(settings.social_media_links) && settings.social_media_links.length > 0) {
        console.log("Using social_media_links array:", settings.social_media_links);
        links = settings.social_media_links;
      } else {
        console.log("Using individual URLs as fallback");
        // Fallback to individual URLs if social_media_links array is empty or invalid
        if (settings.instagram_url) {
          links.push({ name: "Instagram", url: settings.instagram_url });
        }
        if (settings.facebook_url) {
          links.push({ name: "Facebook", url: settings.facebook_url });
        }
      }
      
      console.log("Setting social media links:", links);
      setSocialMediaLinks(links);
    }
  }, [settings]);

  const handleUpdateWhatsApp = async () => {
    setIsUpdating(true);
    try {
      // Try updating with show_order_form first
      const updateData: Record<string, any> = { 
        whatsapp_number: whatsappNumber,
        whatsapp_group_url: whatsappGroupUrl,
        show_whatsapp_group_popup: showWhatsappGroupPopup,
        whatsapp_group_popup_message: whatsappGroupPopupMessage,
        show_floating_whatsapp_contact: showFloatingContact,
        show_floating_whatsapp_group: showFloatingGroup,
      };

      // Try with show_order_form column
      const { error: fullError } = await supabase
        .from("settings")
        .update({ ...updateData, show_order_form: showOrderForm })
        .eq("id", settings?.id);

      if (fullError) {
        // If show_order_form column doesn't exist, update without it
        if (fullError.message?.includes('show_order_form')) {
          console.warn("show_order_form column not found, updating without it");
          const { error } = await supabase
            .from("settings")
            .update(updateData)
            .eq("id", settings?.id);
          if (error) throw error;
        } else {
          throw fullError;
        }
      }

      // Invalidate all queries that might use the WhatsApp number
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] })
      ]);

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
    console.log("Updating social media links:", links);
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showOrderForm"
              checked={showOrderForm}
              onCheckedChange={(checked) => setShowOrderForm(checked === true)}
            />
            <Label htmlFor="showOrderForm">
              Show order form before redirecting to WhatsApp
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showWhatsappGroupPopup"
              checked={showWhatsappGroupPopup}
              onCheckedChange={(checked) => setShowWhatsappGroupPopup(checked === true)}
            />
            <Label htmlFor="showWhatsappGroupPopup">
              Show WhatsApp group popup when website loads
            </Label>
          </div>
          {showWhatsappGroupPopup && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="popupMessage">Popup Message</Label>
              <Input
                id="popupMessage"
                value={whatsappGroupPopupMessage}
                onChange={(e) => setWhatsappGroupPopupMessage(e.target.value)}
                placeholder="Join our WhatsApp group for the latest updates and offers!"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showFloatingContact"
              checked={showFloatingContact}
              onCheckedChange={(checked) => setShowFloatingContact(checked === true)}
            />
            <Label htmlFor="showFloatingContact">
              Show floating "Contact on WhatsApp" button on website
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showFloatingGroup"
              checked={showFloatingGroup}
              onCheckedChange={(checked) => setShowFloatingGroup(checked === true)}
            />
            <Label htmlFor="showFloatingGroup">
              Show floating "Join WhatsApp Group" button on website
            </Label>
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