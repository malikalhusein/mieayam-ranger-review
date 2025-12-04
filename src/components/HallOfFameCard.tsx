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
        return "from-yellow-400 to-amber-500 text-yellow-900 shadow-yellow-400/50";
      case 2:
        return "from-slate-300 to-slate-400 text-slate-700 shadow-slate-400/50";
      case 3:
        return "from-amber-600 to-amber-700 text-amber-100 shadow-amber-600/50";
      default:
        return "from-primary to-primary/80 text-primary-foreground shadow-primary/50";
    }
  };

  const getGlowStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]";
      case 2:
        return "hover:shadow-[0_0_25px_rgba(148,163,184,0.4)]";
      case 3:
        return "hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]";
      default:
        return "hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]";
    }
  };

  return (
    <Link
      to={`/review/${id}`}
      className={`group flex items-center gap-3 md:gap-5 bg-card rounded-xl p-3 md:p-4 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in ${getGlowStyle(rank)}`}
      style={{ animationDelay: `${(rank - 1) * 100}ms` }}
    >
      {/* Rank Badge */}
      <div className={`shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-lg bg-gradient-to-br ${getRankStyle(rank)} flex items-center justify-center font-bold text-xl md:text-2xl shadow-md`}>
        {rank}
      </div>

      {/* Image */}
      <div className="relative shrink-0 w-20 h-14 md:w-32 md:h-20 rounded-lg overflow-hidden">
        <img
          src={displayImage}
          alt={outlet_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] md:text-[11px] px-1 md:px-1.5 py-0.5 rounded">
          {product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
        </div>
      </div>

      {/* Content - Better mobile layout */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="font-bold text-foreground text-sm md:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
          {outlet_name}
        </h3>
        <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{city}</span>
        </div>
        <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          Rp{price.toLocaleString("id-ID")}
        </div>
      </div>

      {/* Score Badge */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="flex items-center gap-1 bg-primary/10 px-2 md:px-4 py-1.5 md:py-2 rounded-lg">
          <Star className="h-4 w-4 md:h-5 md:w-5 text-primary fill-primary" />
          <span className="font-bold text-primary text-base md:text-xl">{score.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

export default HallOfFameCard;
