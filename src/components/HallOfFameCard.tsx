import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

interface HallOfFameCardProps {
  id: string;
  rank: number;
  outlet_name: string;
  address: string;
  city: string;
  overall_score: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  product_type: string;
  price: number;
}

const HallOfFameCard = ({
  id,
  rank,
  outlet_name,
  address,
  city,
  overall_score,
  image_url,
  image_urls,
  product_type,
  price,
}: HallOfFameCardProps) => {
  const displayImage = image_urls?.[0] || image_url || "/placeholder.svg";
  const score = Math.min(10, overall_score || 0);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-amber-500 text-yellow-900";
      case 2:
        return "from-slate-300 to-slate-400 text-slate-700";
      case 3:
        return "from-amber-600 to-amber-700 text-amber-100";
      default:
        return "from-primary to-primary/80 text-primary-foreground";
    }
  };

  return (
    <Link
      to={`/review/${id}`}
      className="group flex items-center gap-4 bg-card rounded-xl p-3 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${(rank - 1) * 100}ms` }}
    >
      {/* Rank Badge */}
      <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${getRankStyle(rank)} flex items-center justify-center font-bold text-xl shadow-md`}>
        {rank}
      </div>

      {/* Image */}
      <div className="relative shrink-0 w-24 h-16 rounded-lg overflow-hidden">
        <img
          src={displayImage}
          alt={outlet_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
          {product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {outlet_name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{city}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Rp{price.toLocaleString("id-ID")}
        </div>
      </div>

      {/* Score Badge */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg">
          <Star className="h-4 w-4 text-primary fill-primary" />
          <span className="font-bold text-primary text-lg">{score.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

export default HallOfFameCard;
