import { ProductForm } from "@/components/admin/product/ProductForm";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewProduct = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-3xl relative">
      <button
        onClick={() => navigate("/admin/products")}
        className="absolute right-8 top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm />
      </div>
    </div>
  );
};

export default NewProduct;