import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CollectionCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  linkUrl: string | null;
  buttonText?: string;
}

export const CollectionCard = ({ 
  id, 
  name, 
  imageUrl, 
  description, 
  linkUrl,
  buttonText = "View Collection"
}: CollectionCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <Link to={linkUrl || `/collections/${id}`} className="block">
        <div className="aspect-square w-full overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            {description && (
              <p className="text-sm text-white/80 line-clamp-2 mb-4">{description}</p>
            )}
            <Button 
              variant="default"
              className="text-white"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};