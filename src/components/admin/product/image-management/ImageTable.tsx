import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface ImageTableProps {
  images: any[];
  isDeleting: boolean;
  onDeleteClick: (imageName: string) => void;
  sortOrder: "name-asc" | "name-desc" | "date-asc" | "date-desc";
}

export function ImageTable({ 
  images, 
  isDeleting, 
  onDeleteClick,
  sortOrder 
}: ImageTableProps) {
  const sortImages = (images: any[]) => {
    return [...images].sort((a, b) => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedImages.map((image) => (
          <TableRow key={image.name}>
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
                onClick={() => onDeleteClick(image.name)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}