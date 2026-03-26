import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckboxFilterProps {
  label: string;
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  options: string[] | undefined;
}

export function CheckboxFilter({ label, selectedValues, setSelectedValues, options }: CheckboxFilterProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ScrollArea className="max-h-32">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${label}-${option}`}
                checked={selectedValues.includes(option)}
                onCheckedChange={() => handleToggle(option)}
              />
              <label
                htmlFor={`${label}-${option}`}
                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
