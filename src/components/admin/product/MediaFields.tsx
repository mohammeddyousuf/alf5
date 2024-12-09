import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type FormData = z.infer<typeof productFormSchema>;

interface MediaFieldsProps {
  form: UseFormReturn<FormData>;
}

export function MediaFields({ form }: MediaFieldsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const currentImages = form.getValues("images") || [];

    try {
      const newImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

          return publicUrl;
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
      // Reset the input value so the same file can be uploaded again
      event.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const addVideoUrl = () => {
    if (!newVideoUrl) return;
    const currentUrls = form.getValues("video_urls") || [];
    form.setValue("video_urls", [...currentUrls, newVideoUrl]);
    setNewVideoUrl("");
  };

  const removeVideoUrl = (indexToRemove: number) => {
    const currentUrls = form.getValues("video_urls") || [];
    form.setValue(
      "video_urls",
      currentUrls.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Images</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {form.watch("images")?.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
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

      <div className="space-y-2">
        <FormLabel>Video URLs</FormLabel>
        <div className="flex gap-2">
          <Input
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder="Enter video URL"
          />
          <Button type="button" onClick={addVideoUrl} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {form.watch("video_urls")?.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={url} readOnly />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVideoUrl(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}