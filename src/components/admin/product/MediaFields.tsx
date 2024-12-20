import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ImageDeleteDialog } from "./ImageDeleteDialog";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type FormData = z.infer<typeof productFormSchema>;

interface MediaFieldsProps {
  form: UseFormReturn<FormData>;
}

export function MediaFields({ form }: MediaFieldsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
  const [imageToDelete, setImageToDelete] = useState<{ index: number; url: string } | null>(null);
  const [duplicateFile, setDuplicateFile] = useState<{ file: File, autoRename: boolean } | null>(null);

  const handleDuplicateFile = async (autoRename: boolean) => {
    if (!duplicateFile) return;

    try {
      let fileName = duplicateFile.file.name;
      
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

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, duplicateFile.file, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, fileName]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDuplicateFile(null);
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const { data } = await supabase.storage
          .from("product-images")
          .list();

        const exists = data?.some(existingFile => existingFile.name === file.name);
        
        if (exists) {
          setDuplicateFile({ file, autoRename: false });
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(file.name, file, {
            upsert: false
          });

        if (uploadError) throw uploadError;

        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, file.name]);
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = async (indexToRemove: number, imageUrl: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [indexToRemove]: true }));
      
      const fileName = imageUrl.includes('/') ? imageUrl.split('/').pop()! : imageUrl;
      
      console.log("Attempting to delete file:", fileName);

      const { error: deleteError, data } = await supabase.storage
        .from("product-images")
        .remove([fileName]);

      if (deleteError) {
        console.error("Error deleting from storage:", deleteError);
        throw deleteError;
      }

      console.log("Storage deletion response:", data);

      const currentImages = form.getValues("images") || [];
      const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
      form.setValue("images", updatedImages);
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove image. " + error.message,
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [indexToRemove]: false }));
      setImageToDelete(null);
    }
  };

  const getImageUrl = (fileName: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl;
  };

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Images</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {form.watch("images")?.map((fileName, index) => (
            <div key={fileName} className="relative group aspect-square">
              <img
                src={getImageUrl(fileName)}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImageToDelete({ index, url: fileName })}
                disabled={isDeleting[index]}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {isDeleting[index] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          <div className="aspect-square relative">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div className="h-full w-full border-2 border-dashed rounded-lg flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ImagePlus className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageDeleteDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        onConfirm={() => imageToDelete && removeImage(imageToDelete.index, imageToDelete.url)}
        imageName={imageToDelete?.url || ''}
      />

      <AlertDialog open={!!duplicateFile} onOpenChange={() => setDuplicateFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate File Name</AlertDialogTitle>
            <AlertDialogDescription>
              An image with the name "{duplicateFile?.file.name}" already exists. Would you like to rename it automatically or choose a different file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDuplicateFile(true)}>
              Auto Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}