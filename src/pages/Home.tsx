import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import PerceptualMap from "@/components/PerceptualMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Search, AlertCircle, SlidersHorizontal } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { calculateScore, calculateLegacyScore, type ReviewData } from "@/lib/scoring";

const Home = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [topReviews, setTopReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [complexityFilter, setComplexityFilter] = useState<number>(-6);
  const [sweetnessFilter, setSweetnessFilter] = useState<number>(-6);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        // @ts-ignore - Supabase types are auto-generated
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedReviews = (data || []).map((review) => {
        // Use new scoring algorithm if new fields are present, otherwise use legacy
        const hasNewFields = review.kuah_kejernihan !== null || 
                             review.goreng_keseimbangan_minyak !== null ||
                             review.goreng_bumbu_tumisan !== null ||
                             review.goreng_aroma_tumisan !== null;

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
        };

        const totalScore = hasNewFields 
          ? calculateScore(reviewData).final_score_10
          : review.overall_score || calculateLegacyScore(reviewData);

        return {
          ...review,
          scores: calculateScores(review),
          totalScore: totalScore,
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
      
      // Get top 5 based on overall_score
      const sorted = [...uniqueOutletReviews].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
      setTopReviews(sorted.slice(0, 5));
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || "Gagal memuat data review";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (review: any) => {
    const kuahScore = review.product_type === "kuah" 
      ? ((review.kuah_kekentalan || 0) + (review.kuah_kaldu || 0) + (review.kuah_keseimbangan || 0) + (review.kuah_aroma || 0)) / 4
      : 0;
    
    const mieScore = review.mie_tekstur || 0;
    const ayamScore = ((review.ayam_bumbu || 0) + (review.ayam_potongan || 0)) / 2;
    const fasilitasScore = ((review.fasilitas_kebersihan || 0) + (review.fasilitas_alat_makan || 0) + (review.fasilitas_tempat || 0)) / 3;

    return {
      kuah: parseFloat(kuahScore.toFixed(1)),
      mie: parseFloat(mieScore.toFixed(1)),
      ayam: parseFloat(ayamScore.toFixed(1)),
      fasilitas: parseFloat(fasilitasScore.toFixed(1)),
    };
  };

  const calculateTotalScore = (review: any) => {
    const scores = calculateScores(review);
    const avgRasa = (scores.kuah + scores.mie + scores.ayam) / 3;
    return ((avgRasa + scores.fasilitas) / review.price) * 1000;
  };

  useEffect(() => {
    let filtered = reviews;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by city
    if (cityFilter !== "all") {
      filtered = filtered.filter(r => r.city === cityFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(r => r.product_type === typeFilter);
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

    setFilteredReviews(filtered);
  }, [searchTerm, cityFilter, typeFilter, complexityFilter, sweetnessFilter, reviews]);

  const cities = Array.from(new Set(reviews.map(r => r.city)));

  const perceptualData = reviews.map(r => ({
    name: r.outlet_name,
    complexity: r.complexity ?? 0, // Use -5 to +5 scale directly (default to middle value 0)
    sweetness: r.sweetness ?? 0,   // Use -5 to +5 scale directly (default to middle value 0)
    type: r.product_type,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container py-10">
          {/* Hero Skeleton */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Error Alert */}
      {error && (
        <div className="container pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Silakan coba lagi nanti atau hubungi tim kami jika masalah berlanjut.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
            <Button 
              size="lg" 
              variant="secondary" 
              className="shadow-glow focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Explore all reviews"
            >
              <TrendingUp className="mr-2 h-5 w-5" aria-hidden="true" />
              Explore Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Top 5 Section */}
      {topReviews.length > 0 && (
        <section className="container py-16" aria-labelledby="top-5-heading">
          <div className="flex items-center justify-center mb-8">
            <Trophy className="h-8 w-8 text-primary mr-3" aria-hidden="true" />
            <h2 id="top-5-heading" className="text-2xl md:text-3xl font-bold">Top 5 Rekomendasi</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topReviews.map((review, index) => (
              <div key={review.id} className="relative">
                <div className="absolute -top-3 -left-3 z-10 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <ReviewCard
                  id={review.id}
                  outlet_name={review.outlet_name}
                  address={review.address}
                  city={review.city}
                  visit_date={review.visit_date}
                  price={review.price}
                  product_type={review.product_type}
                  notes={review.notes}
                  image_url={review.image_url}
                  image_urls={review.image_urls}
                  overall_score={review.overall_score}
                  scores={review.scores}
                  kuah_kekentalan={review.kuah_kekentalan}
                  kuah_kaldu={review.kuah_kaldu}
                  kuah_keseimbangan={review.kuah_keseimbangan}
                  mie_tekstur={review.mie_tekstur}
                  ayam_bumbu={review.ayam_bumbu}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Perceptual Map */}
      {perceptualData.length > 0 && (
        <section className="container py-16" aria-labelledby="perceptual-map-heading">
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-card">
            <h2 id="perceptual-map-heading" className="sr-only">Perceptual Mapping</h2>
            <PerceptualMap data={perceptualData} />
          </div>
        </section>
      )}

      {/* All Reviews Grid */}
      <section className="container py-16" aria-labelledby="all-reviews-heading">
        <h2 id="all-reviews-heading" className="text-2xl md:text-3xl font-bold mb-8 text-center">Semua Review</h2>
        
        {/* Filters */}
        <div className="mb-8 border border-border rounded-lg p-6 bg-card" role="search" aria-label="Filter reviews">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Cari nama outlet, alamat, kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search reviews by name, address, or city"
              />
            </div>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
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
          </div>

          {/* Advanced Filter - Perceptual Mapping */}
          <Accordion type="single" collapsible className="border-t pt-4">
            <AccordionItem value="advanced-filter" className="border-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="font-medium">Filter Preferensi Rasa</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {/* Complexity Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Kompleksitas Rasa</label>
                    <span className="text-xs text-muted-foreground">
                      {complexityFilter === -6 
                        ? 'Off' 
                        : complexityFilter}
                    </span>
                  </div>
                  <Slider
                    min={-6}
                    max={5}
                    step={1}
                    value={[complexityFilter]}
                    onValueChange={(value) => setComplexityFilter(value[0])}
                    className="w-full"
                  />
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
                      {sweetnessFilter === -6 
                        ? 'Off' 
                        : sweetnessFilter}
                    </span>
                  </div>
                  <Slider
                    min={-6}
                    max={5}
                    step={1}
                    value={[sweetnessFilter]}
                    onValueChange={(value) => setSweetnessFilter(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Off</span>
                    <span>Salty (-5)</span>
                    <span>Savory (0)</span>
                    <span>Sweet (+5)</span>
                  </div>
                </div>

                {/* Reset Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setComplexityFilter(-6);
                    setSweetnessFilter(-6);
                  }}
                  className="w-full"
                >
                  Reset Filter Preferensi
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {reviews.length === 0 ? "Belum ada review tersedia" : "Tidak ada review yang sesuai dengan filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                outlet_name={review.outlet_name}
                address={review.address}
                city={review.city}
                visit_date={review.visit_date}
                price={review.price}
                product_type={review.product_type}
                notes={review.notes}
                image_url={review.image_url}
                image_urls={review.image_urls}
                overall_score={review.overall_score}
                scores={review.scores}
                kuah_kekentalan={review.kuah_kekentalan}
                kuah_kaldu={review.kuah_kaldu}
                kuah_keseimbangan={review.kuah_keseimbangan}
                mie_tekstur={review.mie_tekstur}
                ayam_bumbu={review.ayam_bumbu}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-primary text-2xl">🍜</span>
            <h3 className="text-lg font-bold text-foreground">Mie Ayam Ranger</h3>
          </div>
          <p className="text-muted-foreground">
            © 2025 Mie Ayam Ranger. Dibuat dengan ❤️ dan 🍜.
          </p>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Home;
