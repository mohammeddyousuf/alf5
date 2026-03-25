import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { Loader2 } from "lucide-react";

export function SystemLimits() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: limits, refetch } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data: existingLimits, error } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching limits:", error);
        throw error;
      }
      
      if (!existingLimits || existingLimits.length === 0) {
        console.log("No limits found, creating default");
        const defaultLimit = {
          product_limit: 100,
          max_image_size_mb: 5,
          max_folder_size_mb: 500
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from("system_limits")
          .insert([defaultLimit])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating default limits:", insertError);
          throw insertError;
        }

        return insertedData;
      }
      
      return existingLimits[0];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updates = {
      product_limit: parseInt(formData.get("product_limit") as string),
      max_image_size_mb: parseFloat(formData.get("max_image_size_mb") as string),
      max_folder_size_mb: parseFloat(formData.get("max_folder_size_mb") as string)
    };

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("system_limits")
        .update(updates)
        .eq("id", limits?.id);

      if (error) throw error;

      toast({
        description: "System limits updated successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!limits) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="product_limit">Maximum Products</Label>
          <Input
            id="product_limit"
            name="product_limit"
            type="number"
            defaultValue={limits.product_limit}
            min={1}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_image_size_mb">Maximum Image Size (MB)</Label>
          <Input
            id="max_image_size_mb"
            name="max_image_size_mb"
            type="number"
            defaultValue={limits.max_image_size_mb}
            min={0.1}
            step={0.1}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_folder_size_mb">Maximum Folder Size (MB)</Label>
          <Input
            id="max_folder_size_mb"
            name="max_folder_size_mb"
            type="number"
            defaultValue={limits.max_folder_size_mb}
            min={1}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isUpdating}>
        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}