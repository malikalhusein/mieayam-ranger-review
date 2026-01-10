import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, DollarSign, Star, ChevronLeft, ChevronRight, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import RadarChart from "./RadarChart";
import OptimizedImage from "./OptimizedImage";

interface ReviewCardProps {
  id: string;
  slug?: string;
  outlet_name: string;
  address: string;
  city: string;
  visit_date: string;
  price: number;
  product_type: "kuah" | "goreng";
  notes?: string;
  image_url?: string;
  image_urls?: string[];
  overall_score?: number;
  editor_choice?: boolean;
  take_it_or_leave_it?: boolean;
  scores: {
    kuah: number;
    mie: number;
    ayam: number;
    fasilitas: number;
  };
  kuah_kekentalan?: number;
  kuah_kaldu?: number;
  kuah_keseimbangan?: number;
  mie_tekstur?: number;
  ayam_bumbu?: number;
}

const getPriceCategory = (price: number) => {
  if (price < 8000) return { label: "Murah Ga Masuk Akal", stars: 1 };
  if (price <= 10000) return { label: "Murah", stars: 2 };
  if (price <= 12000) return { label: "Normal", stars: 3 };
  if (price <= 15000) return { label: "Resto Menengah", stars: 4 };
  if (price <= 20000) return { label: "Cukup Mahal", stars: 5 };
  return { label: "Mahal", stars: 6 };
};

const ReviewCard = ({ 
  id, 
  slug,
  outlet_name, 
  address, 
  city, 
  visit_date, 
  price, 
  product_type, 
  notes, 
  image_url, 
  image_urls, 
  overall_score,
  editor_choice,
  take_it_or_leave_it,
  scores,
  kuah_kekentalan,
  kuah_kaldu,
  kuah_keseimbangan,
  mie_tekstur,
  ayam_bumbu
}: ReviewCardProps) => {
  const priceCategory = getPriceCategory(price);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Prepare image array
  const images = image_urls && image_urls.length > 0 
    ? image_urls 
    : image_url 
      ? [image_url] 
      : [];
  
  const hasMultipleImages = images.length > 1;
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  // Prepare radar chart data if detailed scores are available
  const hasDetailedScores = kuah_kekentalan !== undefined || mie_tekstur !== undefined || ayam_bumbu !== undefined;
  const radarData = hasDetailedScores ? {
    kuah: kuah_kekentalan || kuah_kaldu || kuah_keseimbangan || 0,
    mie: mie_tekstur || 0,
    ayam: ayam_bumbu || 0,
    fasilitas: scores.fasilitas || 0,
  } : null;
  
  // Use slug for URL if available, fallback to id
  const reviewUrl = slug ? `/reviews/${slug}` : `/review/${id}`;
  
  return (
    <Link to={reviewUrl}>
      <Card className="group h-full flex flex-col overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
        {images.length > 0 && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {/* OptimizedImage with blur placeholder */}
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={`${outlet_name} - Foto ${currentImageIndex + 1}`}
              className="h-full w-full group-hover:scale-110 transition-transform duration-300"
              aspectRatio="4/3"
            />
            
            {/* Navigation arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-4' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 max-w-[60%]">
              <div className="flex flex-wrap gap-1 justify-end">
                <Badge variant={product_type === "kuah" ? "default" : "secondary"} className="shadow-md text-[10px] md:text-xs px-1.5 py-0.5">
                  {product_type === "kuah" ? "🍜" : "🍝"}
                </Badge>
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm shadow-md text-[10px] md:text-xs px-1.5 py-0.5 truncate max-w-[80px] md:max-w-none">
                  {priceCategory.label}
                </Badge>
              </div>
              {editor_choice && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md flex items-center gap-1 text-[10px] md:text-xs px-1.5 py-0.5 justify-end">
                  <Award className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                  <span className="hidden sm:inline">Editor's Choice</span>
                  <span className="sm:hidden">EC</span>
                </Badge>
              )}
              {take_it_or_leave_it && (
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 shadow-md flex items-center gap-1 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700 text-[10px] md:text-xs px-1.5 py-0.5 justify-end">
                  <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                  <span className="hidden sm:inline">Take It or Leave It</span>
                  <span className="sm:hidden">TILI</span>
                </Badge>
              )}
            </div>
            {overall_score && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full shadow-md z-10">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-sm font-bold">{Math.min(10, overall_score).toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
        
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
              {outlet_name}
            </h3>
            {overall_score && images.length === 0 && (
              <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-sm font-bold">{Math.min(10, overall_score).toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-1 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{city}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>{new Date(visit_date).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>Rp {price.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col">
          {notes && (
            <div className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
              {notes.split('\n')[0].split(/(\*\*.*?\*\*)/).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          )}
          
          {radarData && (
            <div className="mt-auto">
              <RadarChart data={radarData} size="small" />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <span className="text-xs md:text-sm font-medium text-primary">
            Lihat Detail →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ReviewCard;
