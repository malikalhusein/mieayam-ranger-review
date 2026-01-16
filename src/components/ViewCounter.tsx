import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCounterProps {
  count: number;
  size?: "sm" | "md";
  className?: string;
}

export const ViewCounter = ({ count, size = "sm", className }: ViewCounterProps) => {
  const formatCount = (n: number) => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}k`;
    }
    return n.toString();
  };

  return (
    <div className={cn(
      "flex items-center gap-1 text-muted-foreground",
      size === "sm" ? "text-xs" : "text-sm",
      className
    )}>
      <Eye className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      <span>{formatCount(count)}</span>
    </div>
  );
};

export default ViewCounter;