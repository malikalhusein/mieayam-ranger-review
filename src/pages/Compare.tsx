import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import RadarChart from "@/components/RadarChart";
import PerceptualMap from "@/components/PerceptualMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, X, Plus, Trophy, Check, X as XIcon, Filter, Download, Share2, Save, FolderOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface Review {
  id: string;
  slug?: string;
  outlet_name: string;
  address: string;
  city: string;
  overall_score: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  product_type: string;
  price: number;
  editor_choice?: boolean;
  mie_tekstur: number | null;
  ayam_bumbu: number | null;
  ayam_potongan: number | null;
  kuah_kekentalan: number | null;
  kuah_kaldu: number | null;
  kuah_keseimbangan: number | null;
  kuah_aroma: number | null;
  kuah_kejernihan: number | null;
  goreng_aroma_tumisan: number | null;
  goreng_bumbu_tumisan: number | null;
  goreng_keseimbangan_minyak: number | null;
  fasilitas_kebersihan: number | null;
  fasilitas_alat_makan: number | null;
  fasilitas_tempat: number | null;
  complexity: number | null;
  sweetness: number | null;
  topping_ceker: boolean | null;
  topping_bakso: boolean | null;
  topping_ekstra_ayam: boolean | null;
  topping_ekstra_sawi: boolean | null;
  topping_balungan: boolean | null;
  topping_tetelan: boolean | null;
  topping_mie_jumbo: boolean | null;
  topping_jenis_mie: boolean | null;
  topping_pangsit_basah: boolean | null;
  topping_pangsit_kering: boolean | null;
  topping_dimsum: boolean | null;
  topping_variasi_bumbu: boolean | null;
  scores?: {
    kuah: number;
    mie: number;
    ayam: number;
    fasilitas: number;
  };
}

const COMPARE_STORAGE_KEY = "mieayam-saved-comparison";

const Compare = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([]);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [hasSavedComparison, setHasSavedComparison] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReviews();
    // Check if there's a saved comparison
    const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
    setHasSavedComparison(!!saved);
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("overall_score", { ascending: false });

      if (error) throw error;

      const processedReviews = (data || []).map((review) => ({
        ...review,
        scores: calculateScores(review),
      }));

      // Group by outlet
      const groupedByOutlet = processedReviews.reduce((acc, review) => {
        const outletKey = `${review.outlet_name}-${review.address}`;
        if (!acc[outletKey] || (review.overall_score || 0) > (acc[outletKey].overall_score || 0)) {
          acc[outletKey] = review;
        }
        return acc;
      }, {} as Record<string, Review>);

      setReviews(Object.values(groupedByOutlet));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (review: any) => {
    const kuahScore =
      review.product_type === "kuah"
        ? ((review.kuah_kekentalan || 0) + (review.kuah_kaldu || 0) + (review.kuah_keseimbangan || 0) + (review.kuah_aroma || 0)) / 4
        : ((review.goreng_aroma_tumisan || 0) + (review.goreng_bumbu_tumisan || 0) + (review.goreng_keseimbangan_minyak || 0)) / 3;
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

  // Get unique cities from reviews
  const cities = useMemo(() => {
    return Array.from(new Set(reviews.map((r) => r.city))).sort();
  }, [reviews]);

  // Filter reviews based on city and type
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchCity = cityFilter === "all" || r.city === cityFilter;
      const matchType = typeFilter === "all" || r.product_type === typeFilter;
      return matchCity && matchType;
    });
  }, [reviews, cityFilter, typeFilter]);

  const addToCompare = async (reviewId: string) => {
    if (selectedReviews.length >= 3) return;
    const review = filteredReviews.find((r) => r.id === reviewId);
    if (review && !selectedReviews.find((r) => r.id === reviewId)) {
      setSelectedReviews([...selectedReviews, review]);
      
      // Increment compare count for this review
      try {
        const { data } = await supabase
          .from("reviews")
          .select("compare_count")
          .eq("id", reviewId)
          .single();
        
        if (data) {
          await supabase
            .from("reviews")
            .update({ compare_count: (data.compare_count || 0) + 1 })
            .eq("id", reviewId);
        }
      } catch (error) {
        console.error("Failed to update compare count:", error);
      }
    }
  };

  const removeFromCompare = (reviewId: string) => {
    setSelectedReviews(selectedReviews.filter((r) => r.id !== reviewId));
  };

  const clearAll = () => {
    setSelectedReviews([]);
  };

  // Save comparison to localStorage
  const saveComparison = () => {
    const ids = selectedReviews.map(r => r.id);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
    setHasSavedComparison(true);
    toast({
      title: language === "id" ? "Tersimpan!" : "Saved!",
      description: language === "id" ? "Perbandingan disimpan" : "Comparison saved",
    });
  };

  // Load saved comparison
  const loadSavedComparison = () => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved);
        const savedReviews = reviews.filter(r => ids.includes(r.id));
        setSelectedReviews(savedReviews);
        toast({
          title: language === "id" ? "Dimuat!" : "Loaded!",
          description: language === "id" ? "Perbandingan tersimpan dimuat" : "Saved comparison loaded",
        });
      }
    } catch (error) {
      console.error("Failed to load comparison:", error);
    }
  };

  // Export comparison to image
  const exportToImage = async () => {
    if (!comparisonRef.current || selectedReviews.length < 2) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(comparisonRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `mieayam-comparison-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: language === "id" ? "Berhasil!" : "Success!",
        description: language === "id" ? "Gambar telah diunduh" : "Image downloaded",
      });
    } catch (error) {
      console.error("Failed to export:", error);
      toast({
        title: language === "id" ? "Gagal" : "Failed",
        description: language === "id" ? "Gagal mengunduh gambar" : "Failed to download image",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const names = selectedReviews.map(r => r.outlet_name).join(" vs ");
    const scores = selectedReviews.map(r => `${r.outlet_name}: ${(r.overall_score || 0).toFixed(1)}/10`).join("\n");
    const text = `🍜 Perbandingan Mie Ayam\n\n${names}\n\n${scores}\n\nLihat detail di Mie Ayam Ranger!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Share to Twitter
  const shareToTwitter = () => {
    const names = selectedReviews.map(r => r.outlet_name).join(" vs ");
    const text = `🍜 Perbandingan Mie Ayam: ${names} - Mana yang lebih enak? Cek di Mie Ayam Ranger!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: language === "id" ? "Tersalin!" : "Copied!",
        description: language === "id" ? "Link telah disalin" : "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const availableReviews = filteredReviews.filter((r) => !selectedReviews.find((s) => s.id === r.id));

  const toppingKeys = [
    { key: "topping_ceker", label: t.toppingCeker },
    { key: "topping_bakso", label: t.toppingBakso },
    { key: "topping_ekstra_ayam", label: t.toppingEkstraAyam },
    { key: "topping_ekstra_sawi", label: t.toppingEkstraSawi },
    { key: "topping_balungan", label: t.toppingBalungan },
    { key: "topping_tetelan", label: t.toppingTetelan },
    { key: "topping_mie_jumbo", label: t.toppingMieJumbo },
    { key: "topping_jenis_mie", label: t.toppingJenisMie },
    { key: "topping_pangsit_basah", label: t.toppingPangsitBasah },
    { key: "topping_pangsit_kering", label: t.toppingPangsitKering },
    { key: "topping_dimsum", label: t.toppingDimsum },
    { key: "topping_variasi_bumbu", label: t.toppingVariasiBumbu },
  ];

  const getHighestValue = (key: string) => {
    const values = selectedReviews.map((r) => {
      if (key.startsWith("scores.")) {
        const scoreKey = key.replace("scores.", "") as keyof Review["scores"];
        return r.scores?.[scoreKey] || 0;
      }
      return (r as any)[key] || 0;
    });
    return Math.max(...values);
  };

  const isHighest = (review: Review, key: string) => {
    let value: number;
    if (key.startsWith("scores.")) {
      const scoreKey = key.replace("scores.", "") as keyof Review["scores"];
      value = review.scores?.[scoreKey] || 0;
    } else {
      value = (review as any)[key] || 0;
    }
    return value === getHighestValue(key) && value > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container py-10 max-w-7xl mx-auto px-4">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEOHead
        title={`${t.compareTitle} | Mie Ayam Ranger`}
        description={t.compareSubtitle}
      />
      <Navbar />

      <div className="container py-8 md:py-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">{t.comparison}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{t.compareTitle}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t.compareSubtitle}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.filterByCity} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCities}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={t.filterByType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    <SelectItem value="kuah">🍜 {t.kuah}</SelectItem>
                    <SelectItem value="goreng">🍝 {t.goreng}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selection Area */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
            {selectedReviews.length < 3 && (
              <Select onValueChange={addToCompare}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={t.selectWarung} />
                </SelectTrigger>
                <SelectContent>
                  {availableReviews.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {t.noReviewsFound}
                    </SelectItem>
                  ) : (
                    availableReviews.map((review) => (
                      <SelectItem key={review.id} value={review.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{review.outlet_name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {(review.overall_score || 0).toFixed(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {review.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {selectedReviews.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <X className="h-4 w-4 mr-1" />
                  {t.clearAll}
                </Button>
                {selectedReviews.length >= 2 && (
                  <>
                    <Button variant="outline" size="sm" onClick={saveComparison}>
                      <Save className="h-4 w-4 mr-1" />
                      {language === "id" ? "Simpan" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToImage} disabled={exporting}>
                      {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                      {language === "id" ? "Unduh" : "Export"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareToWhatsApp}>
                      <Share2 className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </>
                )}
                {hasSavedComparison && selectedReviews.length === 0 && (
                  <Button variant="outline" size="sm" onClick={loadSavedComparison}>
                    <FolderOpen className="h-4 w-4 mr-1" />
                    {language === "id" ? "Muat Tersimpan" : "Load Saved"}
                  </Button>
                )}
              </div>
            )}
            {hasSavedComparison && selectedReviews.length === 0 && (
              <Button variant="outline" size="sm" onClick={loadSavedComparison}>
                <FolderOpen className="h-4 w-4 mr-1" />
                {language === "id" ? "Muat Tersimpan" : "Load Saved"}
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Cards */}
        {selectedReviews.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">{t.noWarungSelected}</p>
              <p className="text-sm text-muted-foreground mt-2">{t.selectAtLeast2}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6" ref={comparisonRef}>
            {/* Cards Grid */}
            <div className={`grid gap-4 md:gap-6 ${
              selectedReviews.length === 1 
                ? "grid-cols-1 max-w-sm mx-auto" 
                : selectedReviews.length === 2 
                ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" 
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {selectedReviews.map((review) => (
                <Card key={review.id} className="relative overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeFromCompare(review.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Image */}
                  <div className="aspect-video relative bg-muted">
                    {(review.image_urls?.[0] || review.image_url) ? (
                      <img
                        src={review.image_urls?.[0] || review.image_url || ""}
                        alt={review.outlet_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍜</span>
                      </div>
                    )}
                    {review.editor_choice && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        {t.editorsChoice}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <Link to={review.slug ? `/reviews/${review.slug}` : `/review/${review.id}`}>
                      <h3 className="font-bold text-base md:text-lg hover:text-primary transition-colors line-clamp-1">
                        {review.outlet_name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3">{review.city}</p>

                    {/* Score */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {(review.overall_score || 0).toFixed(1)}
                        <span className="text-xs md:text-sm text-muted-foreground font-normal">/10</span>
                      </div>
                      <Badge variant={review.product_type === "kuah" ? "default" : "secondary"} className="text-xs">
                        {review.product_type === "kuah" ? "🍜 " + t.kuah : "🍝 " + t.goreng}
                      </Badge>
                    </div>

                    {/* Radar Chart */}
                    {review.scores && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <RadarChart data={review.scores} size="small" />
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-4 text-center py-2 rounded-lg bg-accent/10">
                      <span className="font-semibold text-sm md:text-base">
                        Rp {review.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add More Slot */}
              {selectedReviews.length < 3 && (
                <Card className="border-dashed flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                  <CardContent className="text-center py-8">
                    <Plus className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm">{t.addToCompare}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Detailed Parameters Comparison Table */}
            {selectedReviews.length >= 2 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">{t.detailScoring}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left py-3 px-3 font-medium text-muted-foreground text-sm">{t.aspect}</th>
                          {selectedReviews.map((review) => (
                            <th key={review.id} className="text-center py-3 px-2 font-medium text-sm">
                              <div className="flex flex-col items-center gap-1">
                                <span className="line-clamp-1">{review.outlet_name}</span>
                                <Badge variant={review.product_type === "kuah" ? "default" : "secondary"} className="text-xs">
                                  {review.product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
                                </Badge>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Overall Score */}
                        <tr className="border-b bg-primary/5">
                          <td className="py-3 px-3 font-bold text-sm">{t.overallScore}</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-3 px-2 font-bold text-lg ${isHighest(review, "overall_score") ? "text-primary" : ""}`}>
                              {(review.overall_score || 0).toFixed(1)}
                            </td>
                          ))}
                        </tr>

                        {/* Section: Kuah (for kuah type) */}
                        <tr className="border-b bg-muted/50">
                          <td colSpan={selectedReviews.length + 1} className="py-2 px-3 font-semibold text-sm text-primary">
                            🍜 {t.broth} (Kuah)
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Kekentalan</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "kuah" && isHighest(review, "kuah_kekentalan") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "kuah" ? (review.kuah_kekentalan || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Kaldu/Umami</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "kuah" && isHighest(review, "kuah_kaldu") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "kuah" ? (review.kuah_kaldu || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Keseimbangan Rasa</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "kuah" && isHighest(review, "kuah_keseimbangan") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "kuah" ? (review.kuah_keseimbangan || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Aroma Kuah</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "kuah" && isHighest(review, "kuah_aroma") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "kuah" ? (review.kuah_aroma || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>

                        {/* Section: Goreng (for goreng type) */}
                        <tr className="border-b bg-muted/50">
                          <td colSpan={selectedReviews.length + 1} className="py-2 px-3 font-semibold text-sm text-secondary-foreground">
                            🍝 {t.friedSeasoning} (Goreng)
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Aroma Tumisan</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "goreng" && isHighest(review, "goreng_aroma_tumisan") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "goreng" ? (review.goreng_aroma_tumisan || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Bumbu Tumisan</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "goreng" && isHighest(review, "goreng_bumbu_tumisan") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "goreng" ? (review.goreng_bumbu_tumisan || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Keseimbangan Minyak</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${review.product_type === "goreng" && isHighest(review, "goreng_keseimbangan_minyak") ? "text-primary font-bold" : ""}`}>
                              {review.product_type === "goreng" ? (review.goreng_keseimbangan_minyak || "-") : <span className="text-muted-foreground">-</span>}
                            </td>
                          ))}
                        </tr>

                        {/* Section: Mie */}
                        <tr className="border-b bg-muted/50">
                          <td colSpan={selectedReviews.length + 1} className="py-2 px-3 font-semibold text-sm">
                            🍜 {t.noodle}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Tekstur Mie</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "mie_tekstur") ? "text-primary font-bold" : ""}`}>
                              {review.mie_tekstur || "-"}
                            </td>
                          ))}
                        </tr>

                        {/* Section: Ayam */}
                        <tr className="border-b bg-muted/50">
                          <td colSpan={selectedReviews.length + 1} className="py-2 px-3 font-semibold text-sm">
                            🍗 {t.chicken}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Bumbu Ayam</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "ayam_bumbu") ? "text-primary font-bold" : ""}`}>
                              {review.ayam_bumbu || "-"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Potongan Ayam</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "ayam_potongan") ? "text-primary font-bold" : ""}`}>
                              {review.ayam_potongan || "-"}
                            </td>
                          ))}
                        </tr>

                        {/* Section: Fasilitas */}
                        <tr className="border-b bg-muted/50">
                          <td colSpan={selectedReviews.length + 1} className="py-2 px-3 font-semibold text-sm">
                            🏠 {t.facilities}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Kebersihan</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "fasilitas_kebersihan") ? "text-primary font-bold" : ""}`}>
                              {review.fasilitas_kebersihan || "-"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Alat Makan</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "fasilitas_alat_makan") ? "text-primary font-bold" : ""}`}>
                              {review.fasilitas_alat_makan || "-"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-sm pl-6">Tempat</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className={`text-center py-2 px-2 text-sm ${isHighest(review, "fasilitas_tempat") ? "text-primary font-bold" : ""}`}>
                              {review.fasilitas_tempat || "-"}
                            </td>
                          ))}
                        </tr>

                        {/* Price */}
                        <tr className="border-b bg-accent/10">
                          <td className="py-3 px-3 font-medium text-sm">{t.price}</td>
                          {selectedReviews.map((review) => (
                            <td key={review.id} className="text-center py-3 px-2 text-sm font-semibold">
                              Rp {review.price.toLocaleString("id-ID")}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Perceptual Map */}
            {selectedReviews.length >= 2 && selectedReviews.some(r => r.complexity !== null && r.sweetness !== null) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">Perceptual Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerceptualMap 
                    data={selectedReviews
                      .filter(r => r.complexity !== null && r.sweetness !== null)
                      .map(r => ({
                        name: r.outlet_name,
                        complexity: r.complexity || 0,
                        sweetness: r.sweetness || 0,
                        type: r.product_type as "kuah" | "goreng"
                      }))} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Toppings Comparison */}
            {selectedReviews.length >= 2 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">{t.toppings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-3 font-medium text-muted-foreground text-sm">Topping</th>
                          {selectedReviews.map((review) => (
                            <th key={review.id} className="text-center py-3 px-2 font-medium text-sm">
                              <span className="line-clamp-1">{review.outlet_name}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {toppingKeys.map(({ key, label }) => (
                          <tr key={key} className="border-b">
                            <td className="py-3 px-3 text-sm">{label}</td>
                            {selectedReviews.map((review) => (
                              <td key={review.id} className="text-center py-3 px-2">
                                {(review as any)[key] ? (
                                  <Check className="h-5 w-5 text-accent mx-auto" />
                                ) : (
                                  <XIcon className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Compare;
