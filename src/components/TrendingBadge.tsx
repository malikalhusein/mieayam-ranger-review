import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingBadgeProps {
  className?: string;
}

export const TrendingBadge = ({ className }: TrendingBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs ${className}`}
    >
      <Flame className="h-3 w-3 mr-1" />
      Trending
    </Badge>
  );
};

export default TrendingBadge;