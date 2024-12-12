import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  onClick: () => void;
  whatsappUrl?: string;
}

export const WhatsAppButton = ({ onClick, whatsappUrl }: WhatsAppButtonProps) => {
  const handleClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    } else {
      onClick();
    }
  };

  return (
    <Button
      size="lg"
      className="w-full md:w-auto"
      onClick={handleClick}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Contact on WhatsApp
    </Button>
  );
};