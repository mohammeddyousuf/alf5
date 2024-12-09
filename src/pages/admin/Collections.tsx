import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export default function Collections() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  
  const { data: collections, refetch } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CollectionRow[];
    },
  });

  const filteredCollections = collections?.filter(collection =>
    collection.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
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
      refetch();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collections</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Collection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Collection</DialogTitle>
            </DialogHeader>
            <CollectionForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search collections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections?.map((collection) => (
          <Card key={collection.id} className="p-4">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg">
              {collection.image_url ? (
                <img
                  src={collection.image_url}
                  alt={collection.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  No image
                </div>
              )}
            </div>
            <h3 className="font-semibold mb-2">{collection.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {collection.description}
            </p>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                  </DialogHeader>
                  <CollectionForm collection={collection} onSuccess={() => refetch()} />
                </DialogContent>
              </Dialog>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(collection.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}