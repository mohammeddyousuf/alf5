import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchAndSort } from "./image-management/SearchAndSort";
import { ImageTable } from "./image-management/ImageTable";
import { useQuery } from "@tanstack/react-query";
import { useImageManagement } from "./hooks/useImageManagement";
import { useImageDeletion } from "./hooks/useImageDeletion";
import { ImagePagination } from "./image-management/ImagePagination";
import { DuplicateFileDialog } from "./image-management/DuplicateFileDialog";

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
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "date-asc" | "date-desc">("date-desc");
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images,
    isLoading,
    currentPage,
    setCurrentPage,
    loadImages,
    getPaginatedImages
  } = useImageManagement();

  const { isDeleting, handleDelete } = useImageDeletion(onImageUpload, loadImages);

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

  const handleDuplicateFiles = async (autoRename: boolean) => {
    if (duplicateFiles.length === 0) return;

    try {
      for (const file of duplicateFiles) {
        let fileName = file.name;
        
        if (autoRename) {
          const extension = fileName.split('.').pop() || '';
          const baseName = fileName.slice(0, -(extension.length + 1));
          let counter = 1;
          
          while (true) {
            const newFileName = `${baseName}_${counter}.${extension}`;
            const { data } = await supabase.storage
              .from("product-images")
              .list();
            
            const exists = data?.some(file => file.name === newFileName);
            if (!exists) {
              fileName = newFileName;
              break;
            }
            counter++;
          }
        }

        await uploadFile(file, fileName);
      }
      setDuplicateFiles([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
      setDuplicateFiles([]);
    }
  };

  const uploadFile = async (file: File, fileName: string) => {
    try {
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: `${fileName} uploaded successfully`
      });
      
      await loadImages();
      onImageUpload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upload ${fileName}: ${error.message}`
      });
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
    e.target.value = '';
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const { data: existingFiles } = await supabase.storage
        .from("product-images")
        .list();

      const duplicates: File[] = [];
      const toUpload: File[] = [];

      files.forEach(file => {
        const exists = existingFiles?.some(existingFile => existingFile.name === file.name);
        if (exists) {
          duplicates.push(file);
        } else {
          toUpload.push(file);
        }
      });

      if (duplicates.length > 0) {
        setDuplicateFiles(duplicates);
      }

      for (const file of toUpload) {
        await uploadFile(file, file.name);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent 
          className="w-[90vw] sm:max-w-[900px] flex flex-col h-full max-h-screen p-4"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <SheetHeader className="mb-2">
            <div className="flex justify-between items-center gap-2">
              <SheetTitle>Product Images</SheetTitle>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept="image/*"
                />
                {imagesToDelete.length > 0 && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleDelete(imagesToDelete)}
                    disabled={isDeleting}
                    className="whitespace-nowrap"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Selected ({imagesToDelete.length})
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Images"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              Total images: {images.length} • Folder size: {(folderSize / (1024 * 1024)).toFixed(2)} MB / {systemLimits?.max_folder_size_mb || '...'} MB
            </span>
          </SheetHeader>

          <SearchAndSort
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={(value) => setSortOrder(value as any)}
            showUnassigned={showUnassigned}
            onShowUnassignedChange={setShowUnassigned}
          />

          <div className="flex-1 min-h-0 mt-2">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div 
                  className={`transition-colors ${
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
          </div>

          <div className="mt-2 pt-2 border-t">
            <ImagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalImages={totalImages}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ImageDeleteDialog
        open={imagesToDelete.length > 0}
        onOpenChange={(open) => !open && setImagesToDelete([])}
        onConfirm={() => handleDelete(imagesToDelete)}
        count={imagesToDelete.length}
      />

      <DuplicateFileDialog
        file={duplicateFiles[0]}
        open={duplicateFiles.length > 0}
        onOpenChange={(open) => !open && setDuplicateFiles([])}
        onConfirm={handleDuplicateFiles}
      />
    </>
  );
}
