import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageDeleteDialog } from "./ImageDeleteDialog";
import { ImagePreview } from "./ImagePreview";

interface ImageUploadFieldProps {
  imageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  isUploading?: boolean;
  setIsUploading?: (value: boolean) => void;
  acceptedFileTypes?: string;
  isFavicon?: boolean;
  isLogo?: boolean;
}

export function ImageUploadField({
  imageUrl,
  onImageChange,
  isUploading: externalIsUploading,
  setIsUploading: externalSetIsUploading,
  acceptedFileTypes = "image/*",
  isFavicon = false,
  isLogo = false,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const actualIsUploading = externalIsUploading ?? isUploading;
  const actualSetIsUploading = externalSetIsUploading ?? setIsUploading;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For favicon, accept both .ico and common image formats
    if (isFavicon && !file.type.includes('image/')) {
      toast({
        variant: "destructive",
        description: "Please upload a valid image file (ICO, PNG, JPG, SVG)",
      });
      return;
    }

    actualSetIsUploading(true);
    try {
      // Generate the filename with the appropriate prefix
      let prefix = '';
      if (isFavicon) {
        prefix = 'ico_';
      } else if (isLogo) {
        prefix = 'logo_';
      }
      
      // Ensure unique filename with prefix
      const timestamp = new Date().getTime();
      const fileName = `${prefix}${timestamp}_${encodeURIComponent(file.name)}`;
      
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
      
      if (isFavicon && !file.type.includes('x-icon')) {
        toast({
          description: "Note: ICO format is recommended for favicons, but other image formats will work.",
        });
      } else {
        toast({
          title: "Success",
          description: `${isFavicon ? 'Favicon' : (isLogo ? 'Logo' : 'Image')} uploaded successfully`,
        });
      }
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
        description: `${isFavicon ? 'Favicon' : (isLogo ? 'Logo' : 'Image')} deleted successfully`,
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

  // Only show upload input if there's no existing image for favicon or logo
  const showUploadInput = !imageUrl || (!isFavicon && !isLogo);

  return (
    <div className="space-y-4">
      {imageUrl && (
        <ImagePreview
          imageUrl={imageUrl}
          onDeleteClick={() => setShowDeleteDialog(true)}
          isUploading={actualIsUploading}
          isFavicon={isFavicon}
        />
      )}
      {showUploadInput && (
        <div className="relative">
          <Input
            type="file"
            accept={isFavicon ? ".ico,image/*" : acceptedFileTypes}
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
                <span>Upload {isFavicon ? 'Favicon' : (isLogo ? 'Logo' : 'Image')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <ImageDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleImageDelete}
        isFavicon={isFavicon}
      />
    </div>
  );
}