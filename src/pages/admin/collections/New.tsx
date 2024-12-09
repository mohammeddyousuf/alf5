import { CollectionForm } from "@/components/admin/CollectionForm";

const NewCollection = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Collection</h1>
      <CollectionForm />
    </div>
  );
};

export default NewCollection;