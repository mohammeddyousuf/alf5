import { ProductForm } from "@/components/admin/product/ProductForm";

const NewProduct = () => {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm />
      </div>
    </div>
  );
};

export default NewProduct;