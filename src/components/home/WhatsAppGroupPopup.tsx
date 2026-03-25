import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppGroupPopupProps {
  enabled: boolean;
  message: string;
  groupUrl: string;
  title?: string;
}

export const WhatsAppGroupPopup = ({ enabled, message, groupUrl, title = "Join Our WhatsApp Group" }: WhatsAppGroupPopupProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (enabled && groupUrl) {
      const dismissed = sessionStorage.getItem("whatsapp_group_popup_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [enabled, groupUrl]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("whatsapp_group_popup_dismissed", "true");
  };

  const handleJoin = () => {
    window.open(groupUrl, "_blank");
    handleClose();
  };

  if (!enabled || !groupUrl) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {message || "Join our WhatsApp group for the latest updates and offers!"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button onClick={handleJoin} className="bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="mr-2 h-4 w-4" />
            Join Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
