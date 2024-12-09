import { ProductForm } from "@/components/admin/product/ProductForm";

const NewProduct = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  );
};

export default NewProduct;