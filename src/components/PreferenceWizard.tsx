import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, HelpCircle, MapPin, MessageSquare, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type WizardStep = "welcome" | "type" | "taste" | "complexity" | "result";

interface Review {
  id: string;
  outlet_name: string;
  address: string;
  city: string;
  product_type: string;
  complexity: number | null;
  sweetness: number | null;
  overall_score: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  notes: string | null;
  price: number;
  google_map_url: string | null;
}

interface PreferenceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatbot: () => void;
}

const PreferenceWizard = ({ isOpen, onClose, onOpenChatbot }: PreferenceWizardProps) => {
  const [step, setStep] = useState<WizardStep>("welcome");
  const [prevStep, setPrevStep] = useState<WizardStep>("welcome");
  const [animating, setAnimating] = useState(false);
  const [selectedType, setSelectedType] = useState<"kuah" | "goreng" | null>(null);
  const [selectedTaste, setSelectedTaste] = useState<"salty" | "savory" | "sweet" | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<"simple" | "subtle" | "complex" | null>(null);
  const [matchedReview, setMatchedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  const goToStep = (newStep: WizardStep) => {
    setAnimating(true);
    setPrevStep(step);
    setTimeout(() => {
      setStep(newStep);
      setAnimating(false);
    }, 150);
  };

  // Reset wizard when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("welcome");
        setSelectedType(null);
        setSelectedTaste(null);
        setSelectedComplexity(null);
        setMatchedReview(null);
      }, 300);
    }
  }, [isOpen]);

  const findBestMatch = async () => {
    setLoading(true);
    try {
      // Convert selections to numeric ranges
      let sweetnessMin = -5, sweetnessMax = 5;
      let complexityMin = -5, complexityMax = 5;

      if (selectedTaste === "salty") {
        sweetnessMin = -5; sweetnessMax = -2;
      } else if (selectedTaste === "savory") {
        sweetnessMin = -2; sweetnessMax = 2;
      } else if (selectedTaste === "sweet") {
        sweetnessMin = 2; sweetnessMax = 5;
      }

      if (selectedComplexity === "simple") {
        complexityMin = -5; complexityMax = -2;
      } else if (selectedComplexity === "subtle") {
        complexityMin = -2; complexityMax = 2;
      } else if (selectedComplexity === "complex") {
        complexityMin = 2; complexityMax = 5;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_type", selectedType)
        .gte("sweetness", sweetnessMin)
        .lte("sweetness", sweetnessMax)
        .gte("complexity", complexityMin)
        .lte("complexity", complexityMax)
        .order("overall_score", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setMatchedReview(data[0]);
      } else {
        // Fallback: get best match by type only
        const { data: fallbackData } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_type", selectedType)
          .order("overall_score", { ascending: false })
          .limit(1);
        
        if (fallbackData && fallbackData.length > 0) {
          setMatchedReview(fallbackData[0]);
        }
      }
    } catch (error) {
      console.error("Error finding match:", error);
    } finally {
      setLoading(false);
      setStep("result");
    }
  };

  const handleTasteSelect = (taste: "salty" | "savory" | "sweet") => {
    setSelectedTaste(taste);
    goToStep("complexity");
  };

  const handleComplexitySelect = (complexity: "simple" | "subtle" | "complex") => {
    setSelectedComplexity(complexity);
    findBestMatch();
  };

  const handleAskBot = () => {
    onClose();
    setTimeout(() => onOpenChatbot(), 300);
  };

  const handleReset = () => {
    setStep("welcome");
    setSelectedType(null);
    setSelectedTaste(null);
    setSelectedComplexity(null);
    setMatchedReview(null);
  };

  const getComplexityLabel = (complexity: number | null) => {
    if (complexity === null) return "Balanced";
    if (complexity <= -2) return "Simple";
    if (complexity >= 2) return "Complex";
    return "Seimbang";
  };

  const getTasteLabel = (sweetness: number | null) => {
    if (sweetness === null) return "Savory";
    if (sweetness <= -2) return "Asin Gurih";
    if (sweetness >= 2) return "Gurih Manis";
    return "Gurih Umami";
  };

  const getPriceCategory = (price: number) => {
    if (price < 8000) return "Budget";
    if (price <= 15000) return "Moderate";
    return "Premium";
  };

  const getTags = (review: Review) => {
    const tags: string[] = [];
    tags.push(getComplexityLabel(review.complexity));
    tags.push(getTasteLabel(review.sweetness));
    tags.push(getPriceCategory(review.price));
    return tags;
  };

  if (!isOpen) return null;

  // Progress bar
  const progressSteps = ["welcome", "type", "taste", "complexity", "result"];
  const currentProgress = progressSteps.indexOf(step);
  const progressPercent = (currentProgress / (progressSteps.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        {/* Progress Bar */}
        {step !== "welcome" && (
          <div className="h-1.5 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className={`p-6 transition-all duration-150 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
          {/* Welcome Step */}
          {step === "welcome" && (
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Selamat Datang, Mie Lovers!</h2>
              <p className="text-muted-foreground mb-6">
                Aku akan bantuin kamu cari jodoh mie ayam yang pas. Siap?
              </p>
              <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-5xl">👨‍🍳</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Jawab beberapa pertanyaan simpel biar kita nggak salah kasih rekomendasi. Review kita ketat dan objektif, no tipu-tipu!
              </p>
              <Button 
                size="lg" 
                className="rounded-full px-8"
                onClick={() => goToStep("type")}
              >
                Mulai Cari 🚀
              </Button>
            </div>
          )}

          {/* Type Selection */}
          {step === "type" && (
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Tim Kuah atau Tim Kering?</h2>
              <p className="text-muted-foreground mb-8">Pilih aliran kepercayaanmu.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => { setSelectedType("kuah"); goToStep("taste"); }}
                  className={`p-6 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02] ${
                    selectedType === "kuah" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <span className="text-4xl block mb-3">🍜</span>
                  <h3 className="font-bold text-foreground">Tim Kuah</h3>
                  <p className="text-xs text-muted-foreground mt-1">Banjir kuah kaldu segar</p>
                </button>
                <button
                  onClick={() => { setSelectedType("goreng"); goToStep("taste"); }}
                  className={`p-6 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02] ${
                    selectedType === "goreng" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <span className="text-4xl block mb-3">🍝</span>
                  <h3 className="font-bold text-foreground">Tim Goreng</h3>
                  <p className="text-xs text-muted-foreground mt-1">Kering, manis, gurih</p>
                </button>
              </div>

              <button 
                onClick={handleAskBot}
                className="flex items-center justify-center gap-2 text-primary hover:underline mx-auto text-sm"
              >
                <HelpCircle className="h-4 w-4" />
                Bingung bedanya? Tanya Ranger Bot
              </button>
            </div>
          )}

          {/* Taste Selection */}
          {step === "taste" && (
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Seleramu Gimana?</h2>
              <p className="text-muted-foreground mb-8">Pilih profil rasa yang paling bikin ngiler.</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => handleTasteSelect("salty")}
                  className="p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl block mb-2">🧂</span>
                  <h3 className="font-bold text-foreground text-sm">Asin Gurih</h3>
                  <p className="text-xs text-muted-foreground mt-1">Dominan asin & lada, nendang!</p>
                </button>
                <button
                  onClick={() => handleTasteSelect("savory")}
                  className="p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl block mb-2">🥣</span>
                  <h3 className="font-bold text-foreground text-sm">Gurih Umami</h3>
                  <p className="text-xs text-muted-foreground mt-1">Kaldu rich & balanced banget</p>
                </button>
                <button
                  onClick={() => handleTasteSelect("sweet")}
                  className="p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl block mb-2">🍯</span>
                  <h3 className="font-bold text-foreground text-sm">Gurih Manis</h3>
                  <p className="text-xs text-muted-foreground mt-1">Manis kecap berempah</p>
                </button>
              </div>

              <button 
                onClick={handleAskBot}
                className="flex items-center justify-center gap-2 text-primary hover:underline mx-auto text-sm"
              >
                <HelpCircle className="h-4 w-4" />
                Bingung rasanya? Tanya Ranger Bot
              </button>
            </div>
          )}

          {/* Complexity Selection */}
          {step === "complexity" && (
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Kompleksitas Bumbu?</h2>
              <p className="text-muted-foreground mb-6">Seberapa 'nendang' bumbu yang kamu cari?</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleComplexitySelect("simple")}
                  className="w-full p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">💧</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-foreground">Kuah Kaldu Ringan</h3>
                    <p className="text-xs text-muted-foreground">Encer, bening, dan segar di tenggorokan.</p>
                  </div>
                </button>
                <button
                  onClick={() => handleComplexitySelect("subtle")}
                  className="w-full p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-foreground">Kuah Berbumbu Seimbang</h3>
                    <p className="text-xs text-muted-foreground">Pas, gak terlalu medok tapi gak hambar.</p>
                  </div>
                </button>
                <button
                  onClick={() => handleComplexitySelect("complex")}
                  className="w-full p-4 rounded-xl border-2 border-border transition-all hover:border-primary hover:bg-primary/5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-foreground">Kuah Pekat & Kental</h3>
                    <p className="text-xs text-muted-foreground">Medok, rempah kuat, kental banget.</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={handleAskBot}
                className="flex items-center justify-center gap-2 text-primary hover:underline mx-auto text-sm"
              >
                <HelpCircle className="h-4 w-4" />
                Bingung pilih mana? Tanya Ranger Bot
              </button>
            </div>
          )}

          {/* Result Step */}
          {step === "result" && (
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Hasil Pencarian</h2>
              <p className="text-muted-foreground mb-6">
                {matchedReview ? "Ini dia jodoh mie ayam kamu!" : "Belum ada yang cocok, coba kombinasi lain!"}
              </p>

              {loading ? (
                <div className="py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : matchedReview ? (
                <>
                  {/* Result Card */}
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    <img
                      src={matchedReview.image_urls?.[0] || matchedReview.image_url || "/placeholder.svg"}
                      alt={matchedReview.outlet_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <span>🏆</span>
                      {Math.min(10, matchedReview.overall_score || 0).toFixed(1)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
                      <p className="text-white/70 text-xs">Best Match for you:</p>
                      <h3 className="text-white font-bold text-lg">{matchedReview.outlet_name}</h3>
                    </div>
                  </div>

                  {/* Notes Quote */}
                  {matchedReview.notes && (
                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground italic">
                        "{matchedReview.notes.substring(0, 120)}{matchedReview.notes.length > 120 ? '...' : ''}"
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {getTags(matchedReview).map((tag, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          i === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button variant="outline" onClick={onClose}>
                      Tutup
                    </Button>
                    <Button onClick={handleReset} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Ulangi
                    </Button>
                  </div>

                  {matchedReview.google_map_url && (
                    <a
                      href={matchedReview.google_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full p-3 border border-border rounded-xl hover:bg-muted transition-colors mb-3"
                    >
                      <MapPin className="h-4 w-4" />
                      Lihat Lokasi di Maps
                    </a>
                  )}

                  <Link
                    to={`/review/${matchedReview.id}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full p-3 border border-border rounded-xl hover:bg-muted transition-colors mb-3"
                  >
                    Lihat Detail Review
                  </Link>

                  <button
                    onClick={handleAskBot}
                    className="flex items-center justify-center gap-2 w-full p-3 border border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Cari Alternatif (AI)
                  </button>
                </>
              ) : (
                <div className="py-8">
                  <p className="text-muted-foreground mb-6">
                    Belum ada review yang sesuai dengan preferensimu. Coba kombinasi lain atau tanya AI!
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Ulangi
                    </Button>
                    <Button onClick={handleAskBot}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Tanya AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferenceWizard;
