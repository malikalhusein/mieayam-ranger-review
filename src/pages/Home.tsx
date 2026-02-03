import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import CollectionSchema from "@/components/CollectionSchema";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import HallOfFameCard from "@/components/HallOfFameCard";
import HallOfFameSkeleton from "@/components/HallOfFameSkeleton";
import PerceptualMap, { MIE_AYAM_STYLES } from "@/components/PerceptualMap";
import LoadingScreen from "@/components/LoadingScreen";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Search, AlertCircle, SlidersHorizontal, Loader2, Coins, Clock, ArrowUpDown, Map, Flame } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import PreferenceWizard from "@/components/PreferenceWizard";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { calculateScore, calculateLegacyScore, type ReviewData } from "@/lib/scoring";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const INITIAL_REVIEWS_COUNT = 9;
const REVIEWS_PER_LOAD = 6;

const Home = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [topReviews, setTopReviews] = useState<any[]>([]);
  const [budgetReviews, setBudgetReviews] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [trendingReviews, setTrendingReviews] = useState<any[]>([]);
  const [trendingIds, setTrendingIds] = useState<Set<string>>(new Set());
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [complexityFilter, setComplexityFilter] = useState<number>(-6);
  const [sweetnessFilter, setSweetnessFilter] = useState<number>(-6);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [mapViewOpen, setMapViewOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const {
    toast
  } = useToast();

  // Infinite scroll hook
  const {
    displayedItems: displayedReviews,
    hasMore,
    isLoading: isLoadingMore,
    loaderRef,
    totalCount,
    loadedCount
  } = useInfiniteScroll(filteredReviews, {
    initialItemsCount: INITIAL_REVIEWS_COUNT,
    itemsPerLoad: REVIEWS_PER_LOAD
  });
  useEffect(() => {
    fetchReviews();
  }, []);
  const fetchReviews = async () => {
    try {
      const {
        data,
        error
      } = await supabase
      // @ts-ignore - Supabase types are auto-generated
      .from("reviews").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      const processedReviews = (data || []).map(review => {
        // Use new scoring algorithm if new fields are present, otherwise use legacy
        const hasNewFields = review.kuah_kejernihan !== null || review.goreng_keseimbangan_minyak !== null || review.goreng_bumbu_tumisan !== null || review.goreng_aroma_tumisan !== null;
        const reviewData: ReviewData = {
          product_type: review.product_type as "kuah" | "goreng",
          price: review.price,
          mie_tekstur: review.mie_tekstur,
          ayam_bumbu: review.ayam_bumbu,
          ayam_potongan: review.ayam_potongan,
          kuah_kekentalan: review.kuah_kekentalan,
          kuah_keseimbangan: review.kuah_keseimbangan,
          kuah_kaldu: review.kuah_kaldu,
          kuah_aroma: review.kuah_aroma,
          kuah_kejernihan: review.kuah_kejernihan,
          goreng_keseimbangan_minyak: review.goreng_keseimbangan_minyak,
          goreng_bumbu_tumisan: review.goreng_bumbu_tumisan,
          goreng_aroma_tumisan: review.goreng_aroma_tumisan,
          fasilitas_kebersihan: review.fasilitas_kebersihan,
          fasilitas_alat_makan: review.fasilitas_alat_makan,
          fasilitas_tempat: review.fasilitas_tempat,
          service_durasi: review.service_durasi,
          topping_ceker: review.topping_ceker,
          topping_bakso: review.topping_bakso,
          topping_ekstra_ayam: review.topping_ekstra_ayam,
          topping_ekstra_sawi: review.topping_ekstra_sawi,
          topping_balungan: review.topping_balungan,
          topping_tetelan: review.topping_tetelan,
          topping_mie_jumbo: review.topping_mie_jumbo,
          topping_jenis_mie: review.topping_jenis_mie,
          topping_pangsit_basah: review.topping_pangsit_basah,
          topping_pangsit_kering: review.topping_pangsit_kering,
          topping_dimsum: review.topping_dimsum,
          topping_variasi_bumbu: review.topping_variasi_bumbu,
        };
        const totalScore = hasNewFields ? calculateScore(reviewData).final_score_10 : review.overall_score || calculateLegacyScore(reviewData);
        return {
          ...review,
          scores: calculateScores(review),
          totalScore: totalScore
        };
      });

      // Group by outlet and show only highest score per outlet
      const groupedByOutlet = processedReviews.reduce((acc, review) => {
        const outletKey = `${review.outlet_name}-${review.address}`;
        if (!acc[outletKey] || (review.overall_score || 0) > (acc[outletKey].overall_score || 0)) {
          acc[outletKey] = review;
        }
        return acc;
      }, {} as Record<string, any>);
      const uniqueOutletReviews = Object.values(groupedByOutlet);
      setReviews(uniqueOutletReviews);
      setFilteredReviews(uniqueOutletReviews);

      // Get top 5 based on overall_score (excluding budget-friendly and excluded reviews)
      const eligibleForBest = [...uniqueOutletReviews].filter(
        r => r.price >= 11000 && !r.exclude_from_best
      );
      const sorted = eligibleForBest.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
      setTopReviews(sorted.slice(0, 5));

      // Get top 5 budget-friendly (price <= 11000)
      const budgetFriendly = [...uniqueOutletReviews]
        .filter(r => r.price <= 11000)
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
      setBudgetReviews(budgetFriendly.slice(0, 5));

      // Get recently added reviews (last 5 by created_at)
      const recent = [...uniqueOutletReviews]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentReviews(recent);

      // Get trending reviews (top 5 by view_count)
      const trending = [...uniqueOutletReviews]
        .filter(r => (r.view_count || 0) > 0)
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5);
      setTrendingReviews(trending);
      setTrendingIds(new Set(trending.map(r => r.id)));

      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || "Gagal memuat data review";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const calculateScores = (review: any) => {
    const kuahScore = review.product_type === "kuah" ? ((review.kuah_kekentalan || 0) + (review.kuah_kaldu || 0) + (review.kuah_keseimbangan || 0) + (review.kuah_aroma || 0)) / 4 : 0;
    const mieScore = review.mie_tekstur || 0;
    const ayamScore = ((review.ayam_bumbu || 0) + (review.ayam_potongan || 0)) / 2;
    const fasilitasScore = ((review.fasilitas_kebersihan || 0) + (review.fasilitas_alat_makan || 0) + (review.fasilitas_tempat || 0)) / 3;
    return {
      kuah: parseFloat(kuahScore.toFixed(1)),
      mie: parseFloat(mieScore.toFixed(1)),
      ayam: parseFloat(ayamScore.toFixed(1)),
      fasilitas: parseFloat(fasilitasScore.toFixed(1))
    };
  };
  const calculateTotalScore = (review: any) => {
    const scores = calculateScores(review);
    const avgRasa = (scores.kuah + scores.mie + scores.ayam) / 3;
    return (avgRasa + scores.fasilitas) / review.price * 1000;
  };
  // Helper function to determine closest style based on coordinates
  const getClosestStyle = (sweetness: number, complexity: number): string | null => {
    let closestStyle: string | null = null;
    let minDistance = Infinity;
    
    Object.entries(MIE_AYAM_STYLES).forEach(([key, style]) => {
      const distance = Math.sqrt(
        Math.pow(sweetness - style.typicalCoords.sweetness, 2) + 
        Math.pow(complexity - style.typicalCoords.complexity, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestStyle = key;
      }
    });
    
    // Only return style if within reasonable distance (3 units)
    return minDistance <= 3 ? closestStyle : null;
  };

  useEffect(() => {
    let filtered = reviews;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => r.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.address.toLowerCase().includes(searchTerm.toLowerCase()) || r.city.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by city
    if (cityFilter !== "all") {
      filtered = filtered.filter(r => r.city === cityFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(r => r.product_type === typeFilter);
    }

    // Filter by regional style
    if (styleFilter !== "all") {
      const targetStyle = MIE_AYAM_STYLES[styleFilter as keyof typeof MIE_AYAM_STYLES];
      if (targetStyle) {
        filtered = filtered.filter(r => {
          const sweetness = r.sweetness ?? 0;
          const complexity = r.complexity ?? 0;
          // Calculate distance to target style coordinates
          const distance = Math.sqrt(
            Math.pow(sweetness - targetStyle.typicalCoords.sweetness, 2) + 
            Math.pow(complexity - targetStyle.typicalCoords.complexity, 2)
          );
          return distance <= 2.5; // Within 2.5 units of target style
        });
      }
    }

    // Filter by complexity (skip if Off state -6 is selected)
    if (complexityFilter !== -6) {
      filtered = filtered.filter(r => {
        const complexity = r.complexity ?? 0;
        // Match reviews within ±1 of the selected value
        return Math.abs(complexity - complexityFilter) <= 1;
      });
    }

    // Filter by sweetness (skip if Off state -6 is selected)
    if (sweetnessFilter !== -6) {
      filtered = filtered.filter(r => {
        const sweetness = r.sweetness ?? 0;
        // Match reviews within ±1 of the selected value
        return Math.abs(sweetness - sweetnessFilter) <= 1;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "score-high":
        filtered = [...filtered].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
        break;
      case "score-low":
        filtered = [...filtered].sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0));
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    setFilteredReviews(filtered);
  }, [searchTerm, cityFilter, typeFilter, styleFilter, complexityFilter, sweetnessFilter, sortBy, reviews]);
  const cities = Array.from(new Set(reviews.map(r => r.city)));
  const perceptualData = reviews.map(r => ({
    name: r.outlet_name,
    complexity: r.complexity ?? 0,
    // Use -5 to +5 scale directly (default to middle value 0)
    sweetness: r.sweetness ?? 0,
    // Use -5 to +5 scale directly (default to middle value 0)
    type: r.product_type
  }));
  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container py-10">
          {/* Hero Skeleton */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          
          {/* Hall of Fame Skeleton with shimmer */}
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-32 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <HallOfFameSkeleton />
          
          {/* Reviews Grid Skeleton */}
          <div className="mt-16">
            <Skeleton className="h-8 w-48 mx-auto mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(9)].map((_, i) => <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-subtle">
      <SEOHead 
        title="Mie Ayam Ranger - Review Warung Mie Ayam Terbaik Indonesia"
        description="Platform review mie ayam Indonesia dengan penilaian objektif. Temukan warung mie ayam terbaik berdasarkan rasa, harga, fasilitas. Hall of Fame, Budget Pick, dan perbandingan."
        keywords="mie ayam, review mie ayam, kuliner indonesia, warung mie ayam, mie ayam enak, rekomendasi mie ayam, mie ayam terbaik, mie ayam jakarta, mie ayam bandung, mie ayam solo"
        ogUrl="https://mieayamranger.web.id"
      />
      <OrganizationSchema />
      <CollectionSchema reviews={topReviews} title="Top 5 Mie Ayam Terbaik Indonesia" />
      <Navbar />
      
      {/* Error Alert */}
      {error && <div className="container pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Silakan coba lagi nanti atau hubungi tim kami jika masalah berlanjut.
            </AlertDescription>
          </Alert>
        </div>}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20" role="banner">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
              Mie Ayam Ranger
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Direktori review warung mie ayam dengan sistem penilaian yang adil dan transparan
            </p>
            <Button size="lg" className="bg-white text-primary font-bold px-8 py-6 text-lg shadow-xl hover:bg-primary hover:text-white hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white group" aria-label="Explore all reviews" onClick={() => setWizardOpen(true)}>
              <TrendingUp className="mr-2 h-5 w-5 group-hover:animate-bounce" aria-hidden="true" />
              ​KLIK UNTUK CARI MIE AYAMMU!       
            </Button>
          </div>
        </div>
      </section>

      {/* Hall of Fame - Best of the Best Section */}
      {topReviews.length > 0 && <section className="container py-16" aria-labelledby="best-of-best-heading">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-primary">Hall of Fame</span>
            </div>
            <h2 id="best-of-best-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              The 5 Best of the Best
            </h2>
            <p className="text-muted-foreground mt-2">Warung mie ayam dengan skor tertinggi</p>
          </div>
          
          {/* Desktop: Grid tile layout */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {topReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
          
          {/* Tablet & Mobile: Stacked list layout */}
          <div className="lg:hidden max-w-2xl mx-auto space-y-3">
            {topReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
        </section>}

      {/* Hall of Fame - Budget Friendly Section */}
      {budgetReviews.length > 0 && <section className="container py-16 bg-muted/30" aria-labelledby="budget-friendly-heading">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full mb-4">
              <Coins className="h-5 w-5 text-green-600" aria-hidden="true" />
              <span className="text-sm font-medium text-green-600">Budget Friendly</span>
            </div>
            <h2 id="budget-friendly-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              Top 5 Budget Friendly
            </h2>
            <p className="text-muted-foreground mt-2">Mie ayam paling worth-it untuk kaum budget friendly</p>
          </div>
          
          {/* Desktop: Grid tile layout */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {budgetReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
          
          {/* Tablet & Mobile: Stacked list layout */}
          <div className="lg:hidden max-w-2xl mx-auto space-y-3">
            {budgetReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
        </section>}

      {/* Recently Added Section */}
      {recentReviews.length > 0 && <section className="container py-16" aria-labelledby="recently-added-heading">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full mb-4">
              <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <span className="text-sm font-medium text-blue-600">Baru Ditambahkan</span>
            </div>
            <h2 id="recently-added-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              Recently Added
            </h2>
            <p className="text-muted-foreground mt-2">Review terbaru yang baru saja ditambahkan</p>
          </div>
          
          {/* Desktop: Grid tile layout */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {recentReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
          
          {/* Tablet & Mobile: Stacked list layout */}
          <div className="lg:hidden max-w-2xl mx-auto space-y-3">
            {recentReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} />)}
          </div>
        </section>}

      {/* Trending Reviews Section */}
      {trendingReviews.length > 0 && <section className="container py-16 bg-gradient-to-b from-orange-500/5 to-red-500/5" aria-labelledby="trending-heading">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-full mb-4">
              <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
              <span className="text-sm font-medium bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Trending Now</span>
            </div>
            <h2 id="trending-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              🔥 Paling Banyak Dilihat
            </h2>
            <p className="text-muted-foreground mt-2">Review yang sedang populer dan paling banyak dikunjungi</p>
          </div>
          
          {/* Desktop: Grid tile layout */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {trendingReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={true} />)}
          </div>
          
          {/* Tablet & Mobile: Stacked list layout */}
          <div className="lg:hidden max-w-2xl mx-auto space-y-3">
            {trendingReviews.map((review, index) => <HallOfFameCard key={review.id} id={review.id} slug={review.slug} rank={index + 1} outlet_name={review.outlet_name} address={review.address} city={review.city} overall_score={review.overall_score} image_url={review.image_url} image_urls={review.image_urls} product_type={review.product_type} price={review.price} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={true} />)}
          </div>
        </section>}

      {perceptualData.length > 0 && <section className="container py-16" aria-labelledby="perceptual-map-heading">
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-card max-w-4xl mx-auto">
            <h2 id="perceptual-map-heading" className="sr-only">Perceptual Mapping</h2>
            <PerceptualMap data={perceptualData} />
          </div>
        </section>}

      {/* All Reviews Grid */}
      <section className="container py-16" aria-labelledby="all-reviews-heading">
        <div className="flex items-center justify-between mb-8">
          <h2 id="all-reviews-heading" className="text-2xl md:text-3xl font-bold text-center flex-1">Semua Review</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapViewOpen(true)}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Peta</span>
          </Button>
        </div>
        
        {/* Filters */}
        <div className="mb-8 border border-border rounded-lg p-6 bg-card" role="search" aria-label="Filter reviews">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Cari nama outlet, alamat, kota..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" aria-label="Search reviews by name, address, or city" />
            </div>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="kuah">Kuah</SelectItem>
                <SelectItem value="goreng">Goreng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Style</SelectItem>
                {Object.entries(MIE_AYAM_STYLES).map(([key, style]) => (
                  <SelectItem key={key} value={key}>{style.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options - Mobile-friendly compact design */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" />
              <span>{filteredReviews.length} hasil</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { value: "newest", label: "Baru", icon: "🕐" },
                { value: "score-high", label: "Top", icon: "⭐" },
                { value: "score-low", label: "Low", icon: "📉" },
                { value: "price-low", label: "💰", icon: null },
                { value: "price-high", label: "💎", icon: null },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`text-xs px-2.5 py-1.5 rounded-full transition-all ${
                    sortBy === option.value 
                      ? "bg-primary text-primary-foreground shadow-md font-medium" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                  title={option.label}
                >
                  {option.icon && <span className="mr-0.5">{option.icon}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filter - Perceptual Mapping */}
          <Accordion type="single" collapsible className="border-t pt-4">
            <AccordionItem value="advanced-filter" className="border-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="font-medium">Filter Preferensi Rasa Lanjutan</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {/* Complexity Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Kompleksitas Rasa</label>
                    <span className="text-xs text-muted-foreground">
                      {complexityFilter === -6 ? 'Off' : complexityFilter}
                    </span>
                  </div>
                  <Slider min={-6} max={5} step={1} value={[complexityFilter]} onValueChange={value => setComplexityFilter(value[0])} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Off</span>
                    <span>Simpel (-5)</span>
                    <span>Subtle (0)</span>
                    <span>Complex (+5)</span>
                  </div>
                </div>

                {/* Sweetness Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Tingkat Rasa</label>
                    <span className="text-xs text-muted-foreground">
                      {sweetnessFilter === -6 ? 'Off' : sweetnessFilter}
                    </span>
                  </div>
                  <Slider min={-6} max={5} step={1} value={[sweetnessFilter]} onValueChange={value => setSweetnessFilter(value[0])} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Off</span>
                    <span>Salty (-5)</span>
                    <span>Savory (0)</span>
                    <span>Sweet (+5)</span>
                  </div>
                </div>

                {/* Reset Button */}
                <Button variant="outline" size="sm" onClick={() => {
                  setComplexityFilter(-6);
                  setSweetnessFilter(-6);
                  setStyleFilter("all");
                }} className="w-full">
                  Reset Semua Filter Rasa
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {filteredReviews.length === 0 ? <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {reviews.length === 0 ? "Belum ada review tersedia" : "Tidak ada review yang sesuai dengan filter"}
            </p>
          </div> : <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {displayedReviews.map(review => <ReviewCard key={review.id} id={review.id} slug={review.slug} outlet_name={review.outlet_name} address={review.address} city={review.city} visit_date={review.visit_date} price={review.price} product_type={review.product_type} notes={review.notes} image_url={review.image_url} image_urls={review.image_urls} overall_score={review.overall_score} editor_choice={review.editor_choice} take_it_or_leave_it={review.take_it_or_leave_it} view_count={review.view_count} isTrending={trendingIds.has(review.id)} scores={review.scores} kuah_kekentalan={review.kuah_kekentalan} kuah_kaldu={review.kuah_kaldu} kuah_keseimbangan={review.kuah_keseimbangan} mie_tekstur={review.mie_tekstur} ayam_bumbu={review.ayam_bumbu} />)}
            </div>
            
            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="py-8 flex flex-col items-center justify-center">
              {isLoadingMore && <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memuat lebih banyak...</span>
                </div>}
              {!hasMore && loadedCount > 0 && <p className="text-muted-foreground text-sm">
                  Menampilkan semua {totalCount} review
                </p>}
            </div>
          </>}
      </section>

      {/* Loading Screen */}
      {showLoadingScreen && <LoadingScreen onComplete={() => setShowLoadingScreen(false)} duration={2500} />}

      {/* Footer */}
      <Footer />

      {/* Preference Wizard */}
      <PreferenceWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onOpenChatbot={() => setChatbotOpen(true)} />

      {/* Map View */}
      <MapView 
        reviews={filteredReviews} 
        isOpen={mapViewOpen} 
        onClose={() => setMapViewOpen(false)} 
      />

      {/* AI Chatbot */}
      <AIChatbot isOpen={chatbotOpen} onOpenChange={setChatbotOpen} />
    </div>;
};
export default Home;