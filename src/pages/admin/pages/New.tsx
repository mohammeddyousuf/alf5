import { PageForm } from "@/components/admin/page/PageForm";

const NewPage = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Page</h1>
      <PageForm />
    </div>
  );
};

export default NewPage;