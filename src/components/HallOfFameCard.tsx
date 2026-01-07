import { Link } from "react-router-dom";
import { Star, MapPin, Award, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HallOfFameCardProps {
  id: string;
  slug?: string;
  rank: number;
  outlet_name: string;
  address: string;
  city: string;
  overall_score: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  product_type: string;
  price: number;
  editor_choice?: boolean;
  take_it_or_leave_it?: boolean;
}

const HallOfFameCard = ({
  id,
  slug,
  rank,
  outlet_name,
  address,
  city,
  overall_score,
  image_url,
  image_urls,
  product_type,
  price,
  editor_choice,
  take_it_or_leave_it,
}: HallOfFameCardProps) => {
  const displayImage = image_urls?.[0] || image_url || "/placeholder.svg";
  const score = Math.min(10, overall_score || 0);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getRankBadgeStyle = (rank: number) => {
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
        return "hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:border-yellow-400/70";
      case 2:
        return "hover:shadow-[0_0_35px_rgba(148,163,184,0.5)] hover:border-slate-400/70";
      case 3:
        return "hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] hover:border-amber-500/70";
      default:
        return "hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] hover:border-primary/60";
    }
  };

  // Use slug for URL if available, fallback to id
  const reviewUrl = slug ? `/reviews/${slug}` : `/review/${id}`;

  return (
    <Link
      ref={cardRef}
      to={reviewUrl}
      className={`group relative overflow-hidden rounded-xl border border-border transition-all duration-500 ${getGlowStyle(rank)} ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: isVisible ? `${(rank - 1) * 100}ms` : "0ms" }}
    >
      {/* Desktop: Tile card layout (vertical) */}
      <div className="hidden lg:block bg-card">
        {/* Image section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={displayImage}
            alt={outlet_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {/* Rank badge overlay */}
          <div className={`absolute top-3 left-3 w-10 h-10 rounded-lg bg-gradient-to-br ${getRankBadgeStyle(rank)} flex items-center justify-center font-bold text-lg shadow-lg`}>
            {rank}
          </div>
          {/* Product type and editor badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full font-medium">
              {product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
            </div>
            {editor_choice && (
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                <Award className="h-3 w-3" />
                Editor's Choice
              </div>
            )}
            {take_it_or_leave_it && (
              <div className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-md dark:bg-orange-950 dark:text-orange-300">
                <AlertTriangle className="h-3 w-3" />
                Take It or Leave It
              </div>
            )}
          </div>
          {/* Score overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white text-xl">{score.toFixed(1)}</span>
              </div>
              <span className="text-white/80 text-sm">Rp{price.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {outlet_name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        </div>
      </div>

      {/* Tablet: Horizontal card layout */}
      <div className="hidden md:flex lg:hidden items-center gap-5 bg-card p-4">
        {/* Rank Badge */}
        <div className={`shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${getRankBadgeStyle(rank)} flex items-center justify-center font-bold text-2xl shadow-md`}>
          {rank}
        </div>

        {/* Image */}
        <div className="relative shrink-0 w-32 h-20 rounded-lg overflow-hidden">
          <img
            src={displayImage}
            alt={outlet_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-1 right-1 flex flex-col gap-1 items-end">
            <div className="bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
              {product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
            </div>
            {editor_choice && (
              <div className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Award className="h-2.5 w-2.5" />
                EC
              </div>
            )}
            {take_it_or_leave_it && (
              <div className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <AlertTriangle className="h-2.5 w-2.5" />
                TILI
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {outlet_name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{city}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Rp{price.toLocaleString("id-ID")}
          </div>
        </div>

        {/* Score Badge */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-lg">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold text-primary text-xl">{score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Mobile: Background image with overlay */}
      <div className="md:hidden relative min-h-[100px]">
        <img
          src={displayImage}
          alt={outlet_name}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
        <div className="relative z-10 flex items-center gap-3 p-3">
          {/* Rank Badge */}
          <div className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${getRankBadgeStyle(rank)} flex items-center justify-center font-bold text-2xl shadow-lg`}>
            {rank}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {outlet_name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{city}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Rp{price.toLocaleString("id-ID")}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                {product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
              </span>
              {editor_choice && (
                <span className="text-[10px] bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Award className="h-2.5 w-2.5" />
                  EC
                </span>
              )}
              {take_it_or_leave_it && (
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  TILI
                </span>
              )}
            </div>
          </div>
          
          {/* Score Badge */}
          <div className="shrink-0 flex flex-col items-center bg-primary/10 px-3 py-2 rounded-lg">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold text-primary text-xl">{score.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HallOfFameCard;
