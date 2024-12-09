import { ProductForm } from "@/components/admin/product/ProductForm";

const NewProduct = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Product</h1>
      <ProductForm />
    </div>
  );
};

export default NewProduct;