import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/product/ProductForm";

const EditProduct = () => {
  const { id } = useParams();

  const { data: product } = useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductForm initialData={product} />
    </div>
  );
};

export default EditProduct;