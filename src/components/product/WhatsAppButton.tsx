import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  onClick: () => void;
}

export const WhatsAppButton = ({ onClick }: WhatsAppButtonProps) => {
  return (
    <Button
      size="lg"
      className="w-full md:w-auto"
      onClick={onClick}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Contact on WhatsApp
    </Button>
  );
};