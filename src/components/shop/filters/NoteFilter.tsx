import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteFilterProps {
  label: string;
  selectedNote: string | null;
  setSelectedNote: (note: string | null) => void;
  notes: string[] | undefined;
}

export function NoteFilter({ label, selectedNote, setSelectedNote, notes }: NoteFilterProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={selectedNote || "all"}
        onValueChange={(value) => setSelectedNote(value === "all" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {notes?.map((note) => (
            <SelectItem key={note} value={note}>
              {note}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
