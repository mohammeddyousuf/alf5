import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default function Collections() {
  const { toast } = useToast();
  
  const { data: collections, refetch: refetchCollections } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteCollection = async (id: string) => {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      refetchCollections();
    }
  };

  const handleSuccess = () => {
    refetchCollections();
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections?.map((collection) => (
          <Card key={collection.id} className="p-4">
            <div className="space-y-4">
              {collection.image_url && (
                <img 
                  src={collection.image_url} 
                  alt={collection.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <h3 className="font-semibold text-lg">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground">
                  {collection.description}
                </p>
              )}
              {collection.link_url && (
                <p className="text-sm text-muted-foreground">
                  Link: {collection.link_url}
                </p>
              )}
              <div className="pt-2">
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteCollection(collection.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}