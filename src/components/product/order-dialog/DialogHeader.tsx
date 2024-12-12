import {
  DialogHeader as BaseDialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const DialogHeader = () => {
  return (
    <BaseDialogHeader>
      <DialogTitle className="text-foreground">Contact on WhatsApp</DialogTitle>
      <DialogDescription>
        Fill in your details and ensure you keep your WhatsApp open to start a conversation
      </DialogDescription>
    </BaseDialogHeader>
  );
};