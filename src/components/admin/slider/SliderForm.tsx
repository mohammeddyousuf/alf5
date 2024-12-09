import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Loader2 } from "lucide-react";

interface SliderFormProps {
  slider?: any;
  onSuccess?: () => void;
}

export const SliderForm = ({ slider, onSuccess }: SliderFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: slider?.title || "",
    description: slider?.description || "",
    image_url: slider?.image_url || "",
    link_url: slider?.link_url || "",
    active: slider?.active ?? true,
    order_index: slider?.order_index || 0,
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Keep the original filename but ensure it's URL-safe
      const fileName = encodeURIComponent(file.name);
      
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (slider) {
        const { error } = await supabase
          .from("sliders")
          .update(formData)
          .eq("id", slider.id);

        if (error) throw error;
        toast({ description: "Slider updated successfully" });
      } else {
        const { error } = await supabase
          .from("sliders")
          .insert([formData]);

        if (error) throw error;
        toast({ description: "Slider created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["sliders"] });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label>Image</Label>
        <div className="space-y-4">
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Slider preview"
              className="w-40 h-40 object-cover rounded-lg"
            />
          )}
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div className="h-10 w-full border-2 border-dashed rounded-lg flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  <span>Upload Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="link_url">Link URL</Label>
        <Input
          id="link_url"
          value={formData.link_url}
          onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="order_index">Order</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : slider ? "Update Slider" : "Create Slider"}
      </Button>
    </form>
  );
};
