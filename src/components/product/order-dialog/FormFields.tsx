import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormData } from "./types";

interface FormFieldsProps {
  form: UseFormReturn<OrderFormData>;
}

export function FormFields({ form }: FormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Name</FormLabel>
            <FormControl>
              <Input {...field} className="bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} className="bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Mobile</FormLabel>
            <FormControl>
              <Input type="tel" {...field} className="bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Address (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-background text-foreground" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paymentMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Preferred Payment Mode (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select payment mode" className="text-foreground" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cash" className="bg-background text-foreground hover:bg-accent hover:text-white">Cash</SelectItem>
                <SelectItem value="upi" className="bg-background text-foreground hover:bg-accent hover:text-white">UPI</SelectItem>
                <SelectItem value="bank_transfer" className="bg-background text-foreground hover:bg-accent hover:text-white">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}