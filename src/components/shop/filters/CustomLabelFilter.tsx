import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShopUrlParams } from "@/hooks/useShopUrlParams";

interface CustomLabelFilterProps {
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
  labels?: string[];
}

export function CustomLabelFilter({ selectedLabel, setSelectedLabel, labels }: CustomLabelFilterProps) {
  const { updateUrlParams } = useShopUrlParams();

  const handleLabelChange = (value: string) => {
    const newLabel = value === "all" ? null : value;
    setSelectedLabel(newLabel);
    updateUrlParams({ label: newLabel });
  };

  return (
    <div className="space-y-2">
      <Label>Custom Label</Label>
      <Select
        value={selectedLabel || "all"}
        onValueChange={handleLabelChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Labels</SelectItem>
          {labels?.map((label) => (
            <SelectItem key={label} value={label}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}