import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchAndSort } from "./image-management/SearchAndSort";
import { ImageTable } from "./image-management/ImageTable";

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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "date-asc" | "date-desc">("date-desc");
  const [showUnassigned, setShowUnassigned] = useState(false);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const { data: imageData, error: imageError } = await supabase.storage
        .from("product-images")
        .list();

      if (imageError) throw imageError;

      // Get all products to find image usage
      const { data: products } = await supabase
        .from("products")
        .select("name, images");

      // Get all sliders
      const { data: sliders } = await supabase
        .from("sliders")
        .select("title, image_url");

      const imagesWithUsage = await Promise.all(
        imageData.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(file.name);

          const usage = [];

          // Check products
          products?.forEach(product => {
            if (product.images?.includes(publicUrl)) {
              usage.push({ type: 'Product', name: product.name });
            }
          });

          // Check sliders
          sliders?.forEach(slider => {
            if (slider.image_url === publicUrl) {
              usage.push({ type: 'Slider', name: slider.title });
            }
          });

          return {
            ...file,
            url: publicUrl,
            usage
          };
        })
      );

      setImages(imagesWithUsage);
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
    if (!imagesToDelete.length) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.storage
        .from("product-images")
        .remove(imagesToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${imagesToDelete.length} image(s) deleted successfully`
      });

      await loadImages();
      onImageUpload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsDeleting(false);
      setImagesToDelete([]);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    try {
      await Promise.all(
        files.map(async (file) => {
          const fileName = `product_${Date.now()}_${file.name}`;
          const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, {
              upsert: false
            });

          if (error) throw error;
        })
      );

      toast({
        title: "Success",
        description: "Images uploaded successfully"
      });
      
      await loadImages();
      onImageUpload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.usage?.some((u: any) => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          className="w-[90vw] sm:max-w-[900px]"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              Product Images
              <span className="text-sm font-normal text-muted-foreground">
                Total images: {images.length} • Folder size: {(folderSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleDrop({ 
                    preventDefault: () => {},
                    dataTransfer: { files: e.target.files } 
                  } as any);
                }
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

          <SearchAndSort
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={(value) => setSortOrder(value as any)}
            showUnassigned={showUnassigned}
            onShowUnassignedChange={setShowUnassigned}
          />

          <ScrollArea className="h-[calc(100vh-250px)] mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div 
                className={`rounded-lg transition-colors ${
                  isDragging ? 'bg-muted/50 border-2 border-dashed border-primary' : ''
                }`}
              >
                <ImageTable
                  images={filteredImages}
                  isDeleting={isDeleting}
                  onDeleteClick={setImagesToDelete}
                  sortOrder={sortOrder}
                  showUnassigned={showUnassigned}
                />
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ImageDeleteDialog
        open={imagesToDelete.length > 0}
        onOpenChange={(open) => !open && setImagesToDelete([])}
        onConfirmDelete={handleDelete}
        count={imagesToDelete.length}
      />
    </>
  );
}
