import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  showUnassigned: boolean;
  onShowUnassignedChange: (value: boolean) => void;
}

export function SearchAndSort({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  showUnassigned,
  onShowUnassignedChange,
}: SearchAndSortProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="w-full cursor-pointer" asChild>
          <label htmlFor="bulk-upload-dialog" className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Images
          </label>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortOrder} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Switch
            checked={showUnassigned}
            onCheckedChange={onShowUnassignedChange}
          />
          <span className="text-sm whitespace-nowrap">Show only unassigned</span>
        </div>
      </div>
    </div>
  );
}