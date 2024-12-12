import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormFields } from "./FormFields";
import { OrderFormData } from "./types";
import { MessageCircle } from "lucide-react";

interface CustomerFormProps {
  form: UseFormReturn<OrderFormData>;
  onSubmit: (data: OrderFormData) => void;
}

export const CustomerForm = ({ form, onSubmit }: CustomerFormProps) => {
  const handleSubmit = async (data: OrderFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormFields form={form} />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <MessageCircle className="mr-2 h-5 w-5" />
          Submit
        </Button>
      </form>
    </Form>
  );
};