import { Loader2, X } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  onDeleteClick: () => void;
  isUploading: boolean;
  isFavicon?: boolean;
}

export function ImagePreview({
  imageUrl,
  onDeleteClick,
  isUploading,
  isFavicon = false,
}: ImagePreviewProps) {
  return (
    <div className="relative group">
      {isFavicon ? (
        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-lg">
          <img
            src={imageUrl}
            alt="Favicon Preview"
            className="w-16 h-16"
          />
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Preview"
          className="w-40 h-40 object-cover rounded-lg"
        />
      )}
      <button
        type="button"
        onClick={onDeleteClick}
        disabled={isUploading}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}