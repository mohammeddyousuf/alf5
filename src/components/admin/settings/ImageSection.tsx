import { Label } from "@/components/ui/label";
import { ImageUploadField } from "../shared/ImageUploadField";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface ImageSectionProps {
  logoUrl: string | null;
  faviconUrl: string | null;
  refetch: () => Promise<any>;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

export const ImageSection = ({ 
  logoUrl, 
  faviconUrl, 
  refetch, 
  isUploading, 
  setIsUploading 
}: ImageSectionProps) => {
  const { toast } = useToast();

  const handleLogoChange = async (url: string | null) => {
    try {
      await updateSettings({ logo_url: url });
      await refetch();
    } catch (error) {
      console.error('Error updating logo:', error);
      toast({
        title: "Error",
        description: "Failed to update logo",
        variant: "destructive",
      });
    }
  };

  const handleFaviconChange = async (url: string | null) => {
    try {
      await updateSettings({ favicon_url: url });
      await refetch();
      
      // Dispatch custom event to update favicon and title
      window.dispatchEvent(new Event('settingsUpdated'));
      
      toast({
        title: "Success",
        description: "Favicon updated successfully",
      });
    } catch (error) {
      console.error('Error updating favicon:', error);
      toast({
        title: "Error",
        description: "Failed to update favicon",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="space-y-2 w-full text-center">
        <Label htmlFor="logo">Logo</Label>
        <div className="flex justify-center">
          <ImageUploadField
            imageUrl={logoUrl}
            onImageChange={handleLogoChange}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>
      </div>

      <div className="space-y-2 w-full text-center">
        <Label htmlFor="favicon">Favicon (ICO)</Label>
        <div className="flex justify-center">
          <ImageUploadField
            imageUrl={faviconUrl}
            onImageChange={handleFaviconChange}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            isFavicon={true}
          />
        </div>
      </div>
    </div>
  );
};