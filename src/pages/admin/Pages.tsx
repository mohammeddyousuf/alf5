import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Pages } from "@/integrations/supabase/types/pages";
import { useState, useEffect } from "react";
import { BackToDashboard } from "@/components/admin/BackToDashboard";

const Pages = () => {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSuperAdmin(session?.user?.email === 'mohammedd.yousuf@gmail.com');
    };
    checkSuperAdmin();
  }, []);
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Pages["Row"][];
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
        <div className="flex items-center gap-4">
          <BackToDashboard />
          {isSuperAdmin && (
            <Button onClick={() => navigate("/admin/pages/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Page
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {pages?.map((page) => (
          <Card key={page.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{page.title}</h2>
                <p className="text-sm text-muted-foreground leading-none">/{page.slug}</p>
              </div>
              <Button 
                variant="outline"
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
