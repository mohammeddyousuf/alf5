interface LockOverlayProps {
  message: string;
}

export const LockOverlay = ({ message }: LockOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full space-y-4 text-center border">
        <h2 className="text-2xl font-bold text-foreground">Website Locked</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};