import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchAndSort } from "./image-management/SearchAndSort";
import { ImageTable } from "./image-management/ImageTable";
import { useQuery } from "@tanstack/react-query";
import { useImageManagement } from "./hooks/useImageManagement";
import { ImagePagination } from "./image-management/ImagePagination";

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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "date-asc" | "date-desc">("date-desc");
  const [showUnassigned, setShowUnassigned] = useState(false);

  const {
    images,
    isLoading,
    currentPage,
    setCurrentPage,
    loadImages,
    getPaginatedImages
  } = useImageManagement();

  const { data: systemLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data: existingLimits, error } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return existingLimits;
    },
  });

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

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  const { paginatedImages, totalPages, totalImages } = getPaginatedImages(
    images,
    sortOrder,
    showUnassigned,
    searchQuery
  );

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
                Total images: {images.length} • Folder size: {(folderSize / (1024 * 1024)).toFixed(2)} MB / {systemLimits?.max_folder_size_mb || '...'} MB
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

          <ScrollArea className="h-[calc(100vh-350px)] mt-6">
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
                  images={paginatedImages}
                  isDeleting={isDeleting}
                  onDeleteClick={setImagesToDelete}
                  sortOrder={sortOrder}
                  showUnassigned={showUnassigned}
                />
              </div>
            )}
          </ScrollArea>

          <ImagePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalImages={totalImages}
          />
        </SheetContent>
      </Sheet>

      <ImageDeleteDialog
        open={imagesToDelete.length > 0}
        onOpenChange={(open) => !open && setImagesToDelete([])}
        onConfirm={handleDelete}
        count={imagesToDelete.length}
      />
    </>
  );
}