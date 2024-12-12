import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormFields } from "./FormFields";
import { OrderFormData } from "./types";

interface CustomerFormProps {
  form: UseFormReturn<OrderFormData>;
  onSubmit: (data: OrderFormData) => void;
}

export const CustomerForm = ({ form, onSubmit }: CustomerFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFields form={form} />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Contact on WhatsApp
        </Button>
      </form>
    </Form>
  );
};