import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LimitExceededDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  limit: number;
}

export function LimitExceededDialog({
  open,
  onOpenChange,
  currentCount,
  limit,
}: LimitExceededDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Product Limit Exceeded</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached the maximum limit of {limit} products. You currently have {currentCount} products. Please contact your administrator to increase the limit.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}