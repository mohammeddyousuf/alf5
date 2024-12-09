import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pages = () => {
  const navigate = useNavigate();
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button onClick={() => navigate("/admin/pages/new")}>
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      <div className="grid gap-4">
        {pages?.map((page) => (
          <Card key={page.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{page.title}</h2>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => navigate(`/admin/pages/${page.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!pages?.length && (
        <p className="text-center text-muted-foreground">
          No pages created yet.
        </p>
      )}
    </div>
  );
};

export default Pages;