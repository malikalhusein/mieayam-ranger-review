import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RadarChart from "@/components/RadarChart";
import PerceptualMap from "@/components/PerceptualMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Calendar, DollarSign, Clock, ArrowLeft, ExternalLink, Image as ImageIcon, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReviewDetail = () => {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingScorecard, setGeneratingScorecard] = useState(false);
  const [scorecardImage, setScorecardImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const { data, error } = await supabase
        // @ts-ignore - Supabase types are auto-generated
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const scores = calculateScores(data);
      // @ts-ignore
      setReview({ ...data, scores });

      // Fetch all visits for this outlet
      const { data: allVisits, error: visitsError } = await supabase
        // @ts-ignore
        .from("reviews")
        .select("*")
        .eq("outlet_name", data.outlet_name)
        .eq("address", data.address)
        .order("visit_date", { ascending: false });

      if (!visitsError && allVisits) {
        const processedVisits = allVisits.map(v => ({
          ...v,
          scores: calculateScores(v)
        }));
        setVisitHistory(processedVisits);
      }

      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || "Gagal memuat detail review";
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

  const getPriceCategory = (price: number) => {
    if (price < 8000) return { label: "Murah Ga Masuk Akal", stars: 1 };
    if (price <= 10000) return { label: "Murah", stars: 2 };
    if (price <= 12000) return { label: "Normal", stars: 3 };
    if (price <= 15000) return { label: "Resto Menengah", stars: 4 };
    if (price <= 20000) return { label: "Cukup Mahal", stars: 5 };
    return { label: "Mahal", stars: 6 };
  };

  const generateScorecard = async () => {
    if (!review) return;

    setGeneratingScorecard(true);
    setScorecardImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-scorecard', {
        body: { review }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setScorecardImage(data.imageUrl);
        toast({
          title: "Scorecard Generated!",
          description: "Your scorecard image is ready to download.",
        });
      }
    } catch (error: any) {
      console.error('Error generating scorecard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate scorecard",
        variant: "destructive",
      });
    } finally {
      setGeneratingScorecard(false);
    }
  };

  const downloadScorecard = () => {
    if (!scorecardImage) return;

    const link = document.createElement('a');
    link.href = scorecardImage;
    link.download = `${review.outlet_name.replace(/\s+/g, '-')}-scorecard.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container py-20 text-center max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-muted-foreground mb-4">Review tidak ditemukan</p>
          <Link to="/">
            <Button>Kembali ke Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const priceCategory = getPriceCategory(review.price);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container py-6 md:py-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-accent transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>

        {/* Hero Section - Title & Overall Score */}
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-foreground">
                {review.outlet_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={review.product_type === "kuah" ? "default" : "secondary"} className="text-sm">
                  {review.product_type === "kuah" ? "🍜 Kuah" : "🍝 Goreng"}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {priceCategory.label}
                </Badge>
              </div>
            </div>
            
            {/* Overall Score Badge - Prominent */}
            {review.overall_score && (
              <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg min-w-[140px]">
                <div className="text-sm font-medium opacity-90 mb-1">Overall Score</div>
                <div className="text-5xl md:text-6xl font-bold">{review.overall_score.toFixed(1)}</div>
                <div className="text-sm opacity-75 mt-1">/ 10</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Images & Basic Info (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            {((review.image_urls && review.image_urls.length > 0) || review.image_url) && (
              <Card className="overflow-hidden shadow-md">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(review.image_urls && review.image_urls.length > 0 ? review.image_urls.slice(0, 6) : [review.image_url]).map((imgUrl: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-video md:aspect-[16/10] bg-muted">
                          <img 
                            src={imgUrl} 
                            alt={`${review.outlet_name} - Foto ${index + 1} dari ${review.image_urls?.length || 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {((review.image_urls && review.image_urls.length > 1) || (!review.image_urls && review.image_url)) && (
                    <>
                      <CarouselPrevious className="left-2 md:left-4" />
                      <CarouselNext className="right-2 md:right-4" />
                    </>
                  )}
                </Carousel>
              </Card>
            )}

            {/* Location & Visit Info */}
            <Card className="shadow-md">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Informasi Kunjungan
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{review.address}</p>
                      <p className="font-semibold text-foreground">{review.city}</p>
                    </div>
                  </div>

                  {review.google_map_url && (
                    <a 
                      href={review.google_map_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka di Google Maps
                    </a>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tanggal Kunjungan</p>
                        <p className="text-sm font-medium">{new Date(review.visit_date).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Harga</p>
                        <p className="text-sm font-semibold text-foreground">
                          Rp {review.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {review.service_durasi && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Waktu Penyajian</p>
                          <p className="text-sm font-medium">{review.service_durasi} menit</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {review.notes && (
                  <div className="mt-5 pt-5 border-t">
                    <h3 className="font-semibold mb-2 flex items-center text-foreground">
                      💬 Catatan
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {review.notes.split('\n').map((paragraph: string, index: number) => {
                        if (!paragraph.trim()) return null;
                        
                        // Replace **text** with bold
                        const formattedText = paragraph.split(/(\*\*.*?\*\*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        });
                        
                        return (
                          <p key={index} className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
                            {formattedText}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Scores - Desktop */}
            <Card className="shadow-md">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-5 flex items-center">
                  📊 Detail Penilaian
                </h2>
                
                {review.product_type === "kuah" && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold mb-3 text-base md:text-lg flex items-center">
                      🍜 Kuah
                    </h3>
                    <div className="space-y-3">
                      <ScoreBar label="Kekentalan" score={review.kuah_kekentalan} />
                      <ScoreBar label="Kaldu" score={review.kuah_kaldu} />
                      <ScoreBar label="Keseimbangan" score={review.kuah_keseimbangan} />
                      <ScoreBar label="Aroma" score={review.kuah_aroma} />
                    </div>
                  </div>
                )}

                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 text-base md:text-lg flex items-center">
                    🍝 Mie
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">Tipe: {review.mie_tipe || "-"}</p>
                  <ScoreBar label="Tekstur" score={review.mie_tekstur} />
                </div>

                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 text-base md:text-lg flex items-center">
                    🍗 Ayam
                  </h3>
                  <div className="space-y-3">
                    <ScoreBar label="Bumbu" score={review.ayam_bumbu} />
                    <ScoreBar label="Potongan" score={review.ayam_potongan} />
                  </div>
                </div>

                <div className={`${(review.complexity || review.sweetness) ? 'mb-6 pb-6 border-b' : ''}`}>
                  <h3 className="font-semibold mb-3 text-base md:text-lg flex items-center">
                    🏠 Fasilitas
                  </h3>
                  <div className="space-y-3">
                    <ScoreBar label="Kebersihan" score={review.fasilitas_kebersihan} />
                    <ScoreBar label="Alat Makan" score={review.fasilitas_alat_makan} />
                    <ScoreBar label="Tempat" score={review.fasilitas_tempat} />
                  </div>
                </div>

                {(review.complexity !== null && review.complexity !== undefined) || 
                 (review.sweetness !== null && review.sweetness !== undefined) && (
                  <div>
                    <h3 className="font-semibold mb-3 text-base md:text-lg flex items-center">
                      📈 Perceptual Mapping
                    </h3>
                    <div className="space-y-3">
                      {review.complexity !== null && review.complexity !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm md:text-base font-medium">Complexity</span>
                          <span className="text-sm md:text-base font-bold text-primary">{review.complexity}</span>
                        </div>
                      )}
                      {review.sweetness !== null && review.sweetness !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm md:text-base font-medium">Sweetness</span>
                          <span className="text-sm md:text-base font-bold text-primary">{review.sweetness}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Scores & Actions (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* Radar Chart */}
            <Card className="shadow-md">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
                  Ringkasan Skor
                </h2>
                <div className="bg-muted/30 rounded-lg p-4">
                  <RadarChart data={review.scores} size="large" />
                </div>
                
                {/* Score Legend */}
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🍜</div>
                    <div className="text-xs text-muted-foreground">Kuah</div>
                    <div className="text-sm font-bold text-primary">{review.scores.kuah}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🍝</div>
                    <div className="text-xs text-muted-foreground">Mie</div>
                    <div className="text-sm font-bold text-primary">{review.scores.mie}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🍗</div>
                    <div className="text-xs text-muted-foreground">Ayam</div>
                    <div className="text-sm font-bold text-primary">{review.scores.ayam}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏠</div>
                    <div className="text-xs text-muted-foreground">Fasilitas</div>
                    <div className="text-sm font-bold text-primary">{review.scores.fasilitas}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perceptual Mapping */}
            {review.complexity !== null && review.complexity !== undefined && 
             review.sweetness !== null && review.sweetness !== undefined && (
              <Card className="shadow-md">
                <CardContent className="p-5 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
                    Posisi Rasa
                  </h2>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <PerceptualMap 
                      data={[{
                        name: review.outlet_name,
                        complexity: review.complexity,
                        sweetness: review.sweetness,
                        type: review.product_type
                      }]}
                      showDescription={true}
                    />
                  </div>

                  {/* Position Info */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Complexity</div>
                      <div className="text-sm font-bold text-primary">{review.complexity}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {review.complexity <= -2 ? "Simple" : review.complexity >= 2 ? "Complex" : "Subtle"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Sweetness</div>
                      <div className="text-sm font-bold text-primary">{review.sweetness}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {review.sweetness <= -2 ? "Salty" : review.sweetness >= 2 ? "Sweet" : "Savory"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Scorecard */}
            <Card className="shadow-md">
              <CardContent className="p-5 md:p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                  Scorecard
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  Generate dan bagikan scorecard ke media sosial
                </p>
                <Button 
                  onClick={generateScorecard} 
                  disabled={generatingScorecard}
                  className="w-full hover:scale-105 transition-transform"
                  size="lg"
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  {generatingScorecard ? "Generating..." : "Generate Scorecard"}
                </Button>

                {scorecardImage && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <img 
                      src={scorecardImage} 
                      alt="Generated Scorecard"
                      className="w-full rounded-lg border-2 border-primary/20 shadow-sm"
                    />
                    <Button 
                      onClick={downloadScorecard}
                      variant="outline"
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Scorecard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visit History */}
            {visitHistory.length > 1 && (
              <Card className="shadow-md">
                <CardContent className="p-5 md:p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Riwayat Kunjungan ({visitHistory.length})
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4">
                    Menampilkan semua kunjungan ke outlet ini
                  </p>
                  <div className="space-y-3">
                    {visitHistory.map((visit, index) => {
                      const isCurrentVisit = visit.id === review.id;
                      const scoreDiff = index < visitHistory.length - 1 
                        ? (visit.overall_score || 0) - (visitHistory[index + 1].overall_score || 0)
                        : null;
                      
                      return (
                        <div 
                          key={visit.id}
                          className={`p-3 rounded-lg border ${isCurrentVisit ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={isCurrentVisit ? "default" : "outline"} className="text-xs">
                                  {new Date(visit.visit_date).toLocaleDateString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </Badge>
                                {index === 0 && (
                                  <Badge variant="secondary" className="text-xs">Terbaru</Badge>
                                )}
                              </div>
                              {scoreDiff !== null && (
                                <p className={`text-xs mt-1 ${scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {scoreDiff > 0 ? '↑' : scoreDiff < 0 ? '↓' : '='} {Math.abs(scoreDiff).toFixed(1)} dari kunjungan sebelumnya
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {(visit.overall_score || 0).toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          </div>
                          
                          {visit.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                              {visit.notes.split('\n')[0]}
                            </p>
                          )}
                          
                          {!isCurrentVisit && (
                            <Link to={`/review/${visit.id}`}>
                              <Button size="sm" variant="ghost" className="w-full mt-2 text-xs">
                                Lihat Detail
                              </Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const percentage = (score / 10) * 100;
  
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm md:text-base font-medium text-foreground">{label}</span>
        <span className="text-sm md:text-base font-bold text-primary tabular-nums">{score.toFixed(1)}/10</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-primary transition-all duration-500 ease-out group-hover:opacity-90"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ReviewDetail;
