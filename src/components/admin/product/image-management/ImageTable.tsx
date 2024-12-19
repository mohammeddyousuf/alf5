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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectedImages.length === sortedImages.length && sortedImages.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedImages.map((image) => (
            <TableRow key={image.name} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox 
                  checked={selectedImages.includes(image.name)}
                  onCheckedChange={(checked) => handleSelectImage(image.name, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </TableCell>
              <TableCell className="font-medium">{image.name}</TableCell>
              <TableCell>
                {image.usage?.map((item: any, index: number) => (
                  <span key={index} className="block text-sm text-muted-foreground">
                    {item.type}: {item.name}
                  </span>
                ))}
              </TableCell>
              <TableCell>
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