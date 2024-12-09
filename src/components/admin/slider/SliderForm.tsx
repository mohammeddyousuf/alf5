import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadField } from "../shared/ImageUploadField";

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
    button_text: slider?.button_text || "Learn More",
    active: slider?.active ?? true,
    order_index: slider?.order_index || 0,
  });

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
    <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 pr-4">
      <div className="grid gap-4">
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
            className="h-24"
          />
        </div>

        <div>
          <Label>Image</Label>
          <ImageUploadField
            imageUrl={formData.image_url}
            onImageChange={(url) => setFormData({ ...formData, image_url: url || "" })}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
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
          <Label htmlFor="button_text">Button Text</Label>
          <Input
            id="button_text"
            value={formData.button_text}
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
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
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : slider ? "Update Slider" : "Create Slider"}
      </Button>
    </form>
  );
};