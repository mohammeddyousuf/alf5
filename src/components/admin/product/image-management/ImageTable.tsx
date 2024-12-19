import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImageTableProps {
  images: any[];
  isDeleting: boolean;
  onDeleteClick: (imageNames: string[]) => void;
  sortOrder: "name-asc" | "name-desc" | "date-asc" | "date-desc";
  showUnassigned: boolean;
}

export function ImageTable({ 
  images, 
  isDeleting, 
  onDeleteClick,
  sortOrder,
  showUnassigned
}: ImageTableProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const sortImages = (images: any[]) => {
    let filteredImages = [...images];
    
    if (showUnassigned) {
      filteredImages = filteredImages.filter(image => !image.usage || image.usage.length === 0);
    }
    
    return filteredImages.sort((a, b) => {
      if (sortOrder === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === "date-asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(sortedImages.map(image => image.name));
    } else {
      setSelectedImages([]);
    }
  };

  const handleSelectImage = (imageName: string, checked: boolean) => {
    if (checked) {
      setSelectedImages(prev => [...prev, imageName]);
    } else {
      setSelectedImages(prev => prev.filter(name => name !== imageName));
    }
  };

  const sortedImages = sortImages(images);

  if (sortedImages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No images found
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-0">
            <TableHead className="w-[50px] border-0">
              <Checkbox 
                checked={selectedImages.length === sortedImages.length && sortedImages.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="border-0">Image</TableHead>
            <TableHead className="border-0">Name</TableHead>
            <TableHead className="border-0">Usage</TableHead>
            <TableHead className="w-[100px] border-0">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedImages.map((image) => (
            <TableRow key={image.name} className="hover:bg-muted/50 border-0">
              <TableCell className="border-0">
                <Checkbox 
                  checked={selectedImages.includes(image.name)}
                  onCheckedChange={(checked) => handleSelectImage(image.name, checked as boolean)}
                />
              </TableCell>
              <TableCell className="border-0">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </TableCell>
              <TableCell className="font-medium border-0">{image.name}</TableCell>
              <TableCell className="border-0">
                {image.usage?.map((item: any, index: number) => (
                  <span key={index} className="block text-sm text-muted-foreground">
                    {item.type}: {item.name}
                  </span>
                ))}
              </TableCell>
              <TableCell className="border-0">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDeleteClick([image.name])}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}