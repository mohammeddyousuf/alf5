import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface ImageTableProps {
  images: any[];
  isDeleting: boolean;
  selectedImages: string[];
  onSelectedImagesChange: (imageNames: string[]) => void;
  sortOrder: "name-asc" | "name-desc" | "date-asc" | "date-desc";
  showUnassigned: boolean;
}

export function ImageTable({ 
  images, 
  isDeleting,
  selectedImages,
  onSelectedImagesChange,
  sortOrder,
  showUnassigned
}: ImageTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedImagesChange(sortedImages.map(image => image.name));
    } else {
      onSelectedImagesChange([]);
    }
  };

  const handleSelectImage = (imageName: string, checked: boolean) => {
    if (checked) {
      onSelectedImagesChange([...selectedImages, imageName]);
    } else {
      onSelectedImagesChange(selectedImages.filter(name => name !== imageName));
    }
  };

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
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectedImages.length === sortedImages.length && sortedImages.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedImages.map((image) => (
            <TableRow key={image.name} className="hover:bg-muted/50 border-none">
              <TableCell className="py-2">
                <Checkbox 
                  checked={selectedImages.includes(image.name)}
                  onCheckedChange={(checked) => handleSelectImage(image.name, checked as boolean)}
                />
              </TableCell>
              <TableCell className="py-2">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </TableCell>
              <TableCell className="font-medium py-2">{image.name}</TableCell>
              <TableCell className="py-2">
                {image.usage && image.usage.length > 0 ? (
                  image.usage.map((item: any, index: number) => (
                    <span key={index} className="block text-sm text-muted-foreground">
                      {item.type}: {item.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Not in use</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}