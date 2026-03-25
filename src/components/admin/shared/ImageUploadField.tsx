import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/db";
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
  isSlider?: boolean;
  isCollection?: boolean;
}

export function ImageUploadField({
  imageUrl,
  onImageChange,
  isUploading: externalIsUploading,
  setIsUploading: externalSetIsUploading,
  acceptedFileTypes = "image/*",
  isFavicon = false,
  isLogo = false,
  isSlider = false,
  isCollection = false,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const actualIsUploading = externalIsUploading ?? isUploading;
  const actualSetIsUploading = externalSetIsUploading ?? setIsUploading;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevent upload if there's already a logo and this is a logo upload
    if (isLogo && imageUrl) {
      toast({
        variant: "destructive",
        description: "Please delete the existing logo before uploading a new one",
      });
      event.target.value = "";
      return;
    }

    if (isFavicon && !file.type.includes('image/')) {
      toast({
        variant: "destructive",
        description: "Please upload a valid image file (ICO, PNG, JPG, SVG)",
      });
      return;
    }

    actualSetIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || '';
      const timestamp = new Date().getTime();
      
      let fileName;
      if (isFavicon) {
        fileName = `ico_${timestamp}.${extension}`;
      } else if (isLogo) {
        fileName = `logo_${timestamp}.${extension}`;
        console.log("Creating logo filename:", fileName);
      } else if (isSlider) {
        fileName = `slider_${timestamp}.${extension}`;
        console.log("Creating slider filename:", fileName);
      } else if (isCollection) {
        fileName = `collection_${timestamp}.${extension}`;
        console.log("Creating collection filename:", fileName);
      } else {
        fileName = `${timestamp}.${extension}`;
      }

      console.log("Uploading file with name:", fileName);
      
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
          description: `${isFavicon ? 'Favicon' : (isLogo ? 'Logo' : (isSlider ? 'Slider image' : (isCollection ? 'Collection image' : 'Image')))} uploaded successfully`,
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
        description: `${isFavicon ? 'Favicon' : (isLogo ? 'Logo' : (isSlider ? 'Slider image' : (isCollection ? 'Collection image' : 'Image')))} deleted successfully`,
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
                <span>Upload {isFavicon ? 'Favicon' : (isLogo ? 'Logo' : (isSlider ? 'Slider Image' : (isCollection ? 'Collection Image' : 'Image')))}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <ImageDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleImageDelete}
        isFavicon={isFavicon}
      />
    </div>
  );
}