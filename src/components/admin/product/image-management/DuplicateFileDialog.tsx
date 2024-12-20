import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DuplicateFileDialogProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (autoRename: boolean) => void;
}

export function DuplicateFileDialog({
  file,
  open,
  onOpenChange,
  onConfirm,
}: DuplicateFileDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate File Name</AlertDialogTitle>
          <AlertDialogDescription>
            An image with the name "{file?.name}" already exists. Would you like to rename it automatically or choose a different file?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(true)}>
            Auto Rename
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}