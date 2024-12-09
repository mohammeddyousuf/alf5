import { NewsForm } from "@/components/admin/news/NewsForm";

const NewNews = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create News Item</h1>
      <NewsForm />
    </div>
  );
};

export default NewNews;