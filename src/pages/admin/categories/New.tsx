import { CategoryForm } from "@/components/admin/category/CategoryForm";

const NewCategory = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Category</h1>
      <CategoryForm />
    </div>
  );
};

export default NewCategory;