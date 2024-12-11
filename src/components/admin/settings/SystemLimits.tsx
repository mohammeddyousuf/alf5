import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type SystemLimits = Database['public']['Tables']['system_limits']['Row'];

export function SystemLimits() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const { data: limits, isLoading, refetch } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      // First try to get existing limits
      const { data: existingLimits, error: fetchError } = await supabase
        .from("system_limits")
        .select("*");
      
      if (fetchError) throw fetchError;
      
      // If no limits exist, create default ones
      if (!existingLimits || existingLimits.length === 0) {
        const { data: newLimits, error: insertError } = await supabase
          .from("system_limits")
          .insert({
            id: 1,
            product_limit: 100 // Default limit
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newLimits;
      }
      
      return existingLimits[0];
    },
  });

  const [productLimit, setProductLimit] = useState("");

  // Update local state when limits data changes
  useEffect(() => {
    if (limits?.product_limit) {
      setProductLimit(limits.product_limit.toString());
    }
  }, [limits]);

  const handleUpdateLimit = async () => {
    if (!productLimit) {
      toast({
        title: "Error",
        description: "Please enter a product limit",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("system_limits")
        .upsert({ 
          id: 1,
          product_limit: parseInt(productLimit) 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product limit updated successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="productLimit" className="text-sm font-medium">
          Maximum Products Allowed
        </label>
        <div className="flex space-x-2">
          <Input
            id="productLimit"
            type="number"
            min="1"
            value={productLimit}
            onChange={(e) => setProductLimit(e.target.value)}
            className="max-w-[200px]"
            placeholder="Enter product limit"
          />
          <Button 
            onClick={handleUpdateLimit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Limit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}