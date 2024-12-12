import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { CategoryForm } from "@/components/admin/category/CategoryForm";
import { SubcategoryForm } from "@/components/admin/category/SubcategoryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default function Collections() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("categories");
  
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories, refetch: refetchSubcategories } = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      refetchCategories();
      refetchSubcategories();
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      refetchSubcategories();
    }
  };

  const handleSuccess = () => {
    refetchCategories();
    refetchSubcategories();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collections</h1>
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Collection</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Collection</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <CollectionForm onSuccess={handleSuccess} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Card key={category.id} className="p-4">
                <h3 className="font-semibold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                )}
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subcategories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories?.map((subcategory) => (
              <Card key={subcategory.id} className="p-4">
                <h3 className="font-semibold mb-2">{subcategory.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Category: {subcategory.categories?.name}
                </p>
                {subcategory.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {subcategory.description}
                  </p>
                )}
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteSubcategory(subcategory.id)}
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

