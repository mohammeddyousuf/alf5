import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface WhatsAppTextsSectionProps {
  floatingContactText: string;
  floatingGroupText: string;
  popupTitle: string;
  refetch: () => Promise<any>;
}

export const WhatsAppTextsSection = ({
  floatingContactText,
  floatingGroupText,
  popupTitle,
  refetch,
}: WhatsAppTextsSectionProps) => {
  const { toast } = useToast();
  const [contactText, setContactText] = useState(floatingContactText);
  const [groupText, setGroupText] = useState(floatingGroupText);
  const [titleText, setTitleText] = useState(popupTitle);

  const handleUpdate = async () => {
    try {
      await updateSettings({
        floating_contact_text: contactText,
        floating_group_text: groupText,
        whatsapp_popup_title: titleText,
      });
      await refetch();
      toast({
        title: "Success",
        description: "WhatsApp display texts updated successfully",
      });
    } catch (error) {
      console.error("Error updating WhatsApp texts:", error);
      toast({
        title: "Error",
        description: "Failed to update WhatsApp display texts",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">WhatsApp Display Texts</Label>
        <p className="text-sm text-muted-foreground">
          Customize the labels shown on floating buttons and the group popup.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="floatingContactText">Floating Contact Button Text</Label>
        <Input
          id="floatingContactText"
          value={contactText}
          onChange={(e) => setContactText(e.target.value)}
          placeholder="Contact on WhatsApp"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="floatingGroupText">Floating Group Button Text</Label>
        <Input
          id="floatingGroupText"
          value={groupText}
          onChange={(e) => setGroupText(e.target.value)}
          placeholder="Join WhatsApp Group"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="popupTitle">WhatsApp Group Popup Title</Label>
        <Input
          id="popupTitle"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder="Join Our WhatsApp Group"
        />
      </div>
      <Button onClick={handleUpdate} className="w-full">
        Save WhatsApp Texts
      </Button>
    </div>
  );
};
