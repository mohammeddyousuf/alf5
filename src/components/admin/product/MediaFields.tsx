import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
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

type FormData = z.infer<typeof productFormSchema>;

interface MediaFieldsProps {
  form: UseFormReturn<FormData>;
}

export function MediaFields({ form }: MediaFieldsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
  const [imageToDelete, setImageToDelete] = useState<{ index: number; url: string } | null>(null);

  const generateUniqueFileName = async (originalFileName: string): Promise<string> => {
    const extension = originalFileName.split('.').pop() || '';
    const baseName = originalFileName.slice(0, -(extension.length + 1));
    let fileName = `product_${baseName}.${extension}`;
    let counter = 1;

    const { data } = await supabase.storage
      .from("product-images")
      .list();

    const existingFiles = data?.map(file => file.name) || [];

    while (existingFiles.includes(fileName)) {
      fileName = `product_${baseName}_${counter}.${extension}`;
      counter++;
    }

    return fileName;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const currentImages = form.getValues("images") || [];

    try {
      const newImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const fileName = await generateUniqueFileName(file.name);
          console.log("Generated unique filename:", fileName);

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, {
              upsert: false
            });

          if (uploadError) throw uploadError;

          return fileName; // Store only the filename
        })
      );

      form.setValue("images", [...currentImages, ...newImages]);
      
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
      
      // Extract the filename from the URL or use the filename directly
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

      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
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
              onClick={() => imageToDelete && removeImage(imageToDelete.index, imageToDelete.url)}
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