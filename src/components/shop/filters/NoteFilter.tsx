import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteFilterProps {
  label: string;
  selectedNotes: string[];
  setSelectedNotes: (notes: string[]) => void;
  notes: string[] | undefined;
}

export function NoteFilter({ label, selectedNotes, setSelectedNotes, notes }: NoteFilterProps) {
  const handleSelect = (value: string) => {
    if (value === "all") {
      setSelectedNotes([]);
    } else if (!selectedNotes.includes(value)) {
      setSelectedNotes([...selectedNotes, value]);
    }
  };

  const handleRemove = (note: string) => {
    setSelectedNotes(selectedNotes.filter(n => n !== note));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value=""
        onValueChange={handleSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder={selectedNotes.length > 0 ? `${selectedNotes.length} selected` : `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {notes?.filter(note => !selectedNotes.includes(note)).map((note) => (
            <SelectItem key={note} value={note}>
              {note}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedNotes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedNotes.map(note => (
            <Badge key={note} variant="secondary" className="text-xs cursor-pointer" onClick={() => handleRemove(note)}>
              {note} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
