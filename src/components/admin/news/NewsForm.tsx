import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface NewsFormProps {
  news?: any;
  onSuccess?: () => void;
}

export const NewsForm = ({ news, onSuccess }: NewsFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    message: news?.message || "",
    active: news?.active ?? true,
    order_index: news?.order_index || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (news) {
        const { error } = await supabase
          .from("news_ticker")
          .update(formData)
          .eq("id", news.id);

        if (error) throw error;
        toast({ description: "News item updated successfully" });
      } else {
        const { error } = await supabase
          .from("news_ticker")
          .insert([formData]);

        if (error) throw error;
        toast({ description: "News item created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["news-ticker"] });
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
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
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
        {isLoading ? "Saving..." : news ? "Update News" : "Create News"}
      </Button>
    </form>
  );
};