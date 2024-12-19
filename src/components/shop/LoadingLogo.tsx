import { cn } from "@/lib/utils";

interface LoadingLogoProps {
  className?: string;
}

export function LoadingLogo({ className }: LoadingLogoProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="w-16 h-16 relative animate-spin">
        <img
          src="/logo.png"
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </div>
      <p className="mt-4 text-muted-foreground animate-pulse">Loading products...</p>
    </div>
  );
}