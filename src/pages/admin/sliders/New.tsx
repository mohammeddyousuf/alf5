import { SliderForm } from "@/components/admin/slider/SliderForm";

const NewSlider = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Slider</h1>
      <SliderForm />
    </div>
  );
};

export default NewSlider;