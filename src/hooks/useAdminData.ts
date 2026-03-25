import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { useEffect } from "react";

export function useAdminData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthChange = (event: string) => {
      if (event === 'SIGNED_IN') {
        console.log("Admin signed in, invalidating queries");
        // Refetch all queries after successful sign in
        queryClient.invalidateQueries();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: enquiries, isLoading: isEnquiriesLoading } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      console.log("Fetching enquiries data");
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching enquiries:", error);
        throw error;
      }
      
      console.log("Fetched enquiries:", data);
      return data;
    },
  });

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching orders data");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      console.log("Fetched orders:", data);
      return data;
    },
  });

  return {
    enquiries,
    orders,
    isLoading: isEnquiriesLoading || isOrdersLoading
  };
}