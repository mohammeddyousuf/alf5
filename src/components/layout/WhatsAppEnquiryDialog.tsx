import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";

interface WhatsAppEnquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, mobile: string, email: string, comments?: string) => void;
}

export const WhatsAppEnquiryDialog = ({ isOpen: propIsOpen, onClose, onSubmit }: WhatsAppEnquiryDialogProps) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if dialog should be opened from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showDialog = searchParams.get('connect') === 'whatsapp';
  const [isOpen, setIsOpen] = useState(propIsOpen || showDialog);

  useEffect(() => {
    setIsOpen(propIsOpen || showDialog);
  }, [propIsOpen, showDialog]);

  const handleClose = () => {
    // Remove the URL parameter when closing
    if (showDialog) {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('connect');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !mobile || !email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    onSubmit(name, mobile, email, comments);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect on WhatsApp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};