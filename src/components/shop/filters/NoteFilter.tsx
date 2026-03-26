import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteFilterProps {
  label: string;
  selectedNotes: string[];
  setSelectedNotes: (notes: string[]) => void;
  notes: string[] | undefined;
}

export function NoteFilter({ label, selectedNotes, setSelectedNotes, notes }: NoteFilterProps) {
  const handleToggle = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  if (!notes || notes.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ScrollArea className="max-h-32">
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note} className="flex items-center space-x-2">
              <Checkbox
                id={`${label}-${note}`}
                checked={selectedNotes.includes(note)}
                onCheckedChange={() => handleToggle(note)}
              />
              <label
                htmlFor={`${label}-${note}`}
                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {note}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
