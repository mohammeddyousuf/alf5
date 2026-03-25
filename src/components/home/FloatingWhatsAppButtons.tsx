import { MessageCircle, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingWhatsAppButtonsProps {
  showContact: boolean;
  showGroup: boolean;
  whatsappNumber: string;
  groupUrl: string;
  contactText?: string;
  groupText?: string;
}

export const FloatingWhatsAppButtons = ({
  showContact,
  showGroup,
  whatsappNumber,
  groupUrl,
  contactText = "Contact on WhatsApp",
  groupText = "Join WhatsApp Group",
}: FloatingWhatsAppButtonsProps) => {
  if (!showContact && !showGroup) return null;

  const handleContact = () => {
    const clean = whatsappNumber.replace(/\D/g, "");
    if (clean) {
      window.open(`https://wa.me/${clean}`, "_blank");
    }
  };

  const handleGroup = () => {
    if (groupUrl) {
      window.open(groupUrl, "_blank");
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {showGroup && groupUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGroup}
                className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label={groupText}
              >
                <Users className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{groupText}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {showContact && whatsappNumber && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleContact}
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label={contactText}
              >
                <MessageCircle className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{contactText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
