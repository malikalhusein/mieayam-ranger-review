import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, AlertTriangle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  slug?: string;
  outlet_name: string;
  city: string;
  overall_score: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  product_type: string;
  price: number;
  editor_choice?: boolean;
  take_it_or_leave_it?: boolean;
}

interface RelatedReviewsProps {
  currentReviewId: string;
  productType: string;
  city: string;
  priceRange: number;
  overallScore: number | null;
}

const RelatedReviews = ({ 
  currentReviewId, 
  productType, 
  city, 
  priceRange, 
  overallScore 
}: RelatedReviewsProps) => {
  const [relatedReviews, setRelatedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedReviews();
  }, [currentReviewId, productType, city, priceRange]);

  const fetchRelatedReviews = async () => {
    try {
      // Calculate price range (±5000 from current price)
      const minPrice = Math.max(0, priceRange - 5000);
      const maxPrice = priceRange + 5000;

      // Fetch reviews with same product type OR same city, excluding current
      const { data, error } = await supabase
        // @ts-ignore
        .from("reviews")
        .select("id, slug, outlet_name, city, overall_score, image_url, image_urls, product_type, price, editor_choice, take_it_or_leave_it")
        .neq("id", currentReviewId)
        .order("overall_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Score each review for relevance
      const scoredReviews = (data || []).map((review: Review) => {
        let relevanceScore = 0;
        
        // Same product type = high priority
        if (review.product_type === productType) relevanceScore += 3;
        
        // Same city = medium priority
        if (review.city === city) relevanceScore += 2;
        
        // Similar price range = medium priority
        if (review.price >= minPrice && review.price <= maxPrice) relevanceScore += 2;
        
        // Similar score (within 1 point) = low priority
        if (overallScore && review.overall_score) {
          const scoreDiff = Math.abs(overallScore - review.overall_score);
          if (scoreDiff <= 1) relevanceScore += 1;
        }

        // Editor's choice bonus
        if (review.editor_choice) relevanceScore += 1;

        return { ...review, relevanceScore };
      });

      // Sort by relevance score and take top 4
      const sortedReviews = scoredReviews
        .filter(r => r.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);

      setRelatedReviews(sortedReviews);
    } catch (error) {
      console.error("Error fetching related reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Kalau Suka Ini, Mungkin Suka...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedReviews.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Kalau Suka Ini, Mungkin Suka...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {relatedReviews.map((review) => {
            const displayImage = review.image_urls?.[0] || review.image_url || "/placeholder.svg";
            const reviewUrl = review.slug ? `/reviews/${review.slug}` : `/review/${review.id}`;
            const score = Math.min(10, review.overall_score || 0);

            return (
              <Link
                key={review.id}
                to={reviewUrl}
                className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={displayImage}
                    alt={review.outlet_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Score badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-full font-bold">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {score.toFixed(1)}
                  </div>

                  {/* Editor badges */}
                  {review.editor_choice && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                      <Award className="h-2.5 w-2.5" />
                      EC
                    </div>
                  )}

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-primary-foreground">
                      {review.outlet_name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-white/80 text-[10px]">
                        <MapPin className="h-2.5 w-2.5" />
                        <span>{review.city}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-white/30"
                      >
                        {review.product_type === "kuah" ? "🍜" : "🍝"} Rp{(review.price / 1000).toFixed(0)}K
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedReviews;
