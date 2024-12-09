import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface ImageUploadFieldProps {
  imageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  isUploading?: boolean;
  setIsUploading?: (value: boolean) => void;
}

export function ImageUploadField({
  imageUrl,
  onImageChange,
  isUploading: externalIsUploading,
  setIsUploading: externalSetIsUploading,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const actualIsUploading = externalIsUploading ?? isUploading;
  const actualSetIsUploading = externalSetIsUploading ?? setIsUploading;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    actualSetIsUploading(true);
    try {
      const fileName = encodeURIComponent(file.name);
      
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      onImageChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      actualSetIsUploading(false);
      event.target.value = "";
    }
  };

  const handleImageDelete = async () => {
    if (!imageUrl) return;

    try {
      actualSetIsUploading(true);
      
      // Extract the filename from the URL
      const fileName = decodeURIComponent(imageUrl.split("/").pop() || "");
      if (!fileName) throw new Error("Invalid file URL");

      const { error: deleteError } = await supabase.storage
        .from("product-images")
        .remove([fileName]);

      if (deleteError) throw deleteError;

      onImageChange(null);
      setShowDeleteDialog(false);
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        variant: "destructive",
        description: "Failed to delete image. " + error.message,
      });
    } finally {
      actualSetIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={actualIsUploading}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            {actualIsUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={actualIsUploading}
        />
        <div className="h-10 w-full border-2 border-dashed rounded-lg flex items-center justify-center">
          {actualIsUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              <span>Upload Image</span>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImageDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}