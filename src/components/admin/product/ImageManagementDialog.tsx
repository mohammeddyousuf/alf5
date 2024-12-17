import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUpload: () => void;
  folderSize: number;
}

export function ImageManagementDialog({ 
  open, 
  onOpenChange,
  onImageUpload,
  folderSize 
}: ImageManagementDialogProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage
        .from("product-images")
        .list();

      if (error) throw error;

      const imagesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(file.name);
          return {
            ...file,
            url: publicUrl
          };
        })
      );

      setImages(imagesWithUrls);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.storage
        .from("product-images")
        .remove([imageToDelete]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully"
      });

      await loadImages();
      onImageUpload(); // Refresh folder size
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  // Load images when dialog opens
  useState(() => {
    if (open) {
      loadImages();
    }
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[90vw] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              Product Images
              <span className="text-sm font-normal text-muted-foreground">
                Folder size: {(folderSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                onImageUpload();
                loadImages();
                e.target.value = '';
              }}
              className="hidden"
              id="bulk-upload-dialog"
            />
            <label htmlFor="bulk-upload-dialog">
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <div className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Images
                </div>
              </Button>
            </label>
          </div>

          <ScrollArea className="h-[70vh] mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((image) => (
                  <div key={image.name} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImageToDelete(image.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ImageDeleteDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        onConfirmDelete={handleDelete}
      />
    </>
  );
}