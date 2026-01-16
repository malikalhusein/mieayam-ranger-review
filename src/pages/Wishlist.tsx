import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Send, Heart, Loader2, Store, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WishlistVoteButton from "@/components/WishlistVoteButton";

const wishlistSchema = z.object({
  place_name: z.string().min(1, "Nama tempat wajib diisi"),
  location: z.string().min(1, "Lokasi wajib diisi"),
  notes: z.string().optional(),
});

type WishlistFormData = z.infer<typeof wishlistSchema>;

interface WishlistEntry {
  id: string;
  place_name: string;
  location: string;
  notes: string | null;
  status: string;
  created_at: string;
  vote_count: number;
}

const Wishlist = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("popular");

  const form = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      place_name: "",
      location: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchApprovedEntries();
  }, [sortBy]);

  const fetchApprovedEntries = async () => {
    setLoading(true);
    const query = supabase
      .from("wishlist_entries")
      .select("*")
      .eq("status", "approved");

    if (sortBy === "popular") {
      query.order("vote_count", { ascending: false });
    } else {
      query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching wishlist:", error);
    } else {
      setEntries((data || []).map(e => ({
        ...e,
        vote_count: e.vote_count || 0
      })));
    }
    setLoading(false);
  };

  const onSubmit = async (data: WishlistFormData) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("wishlist_entries")
      .insert({
        place_name: data.place_name,
        location: data.location,
        notes: data.notes || null,
        status: "pending",
      });

    if (error) {
      toast({
        title: language === "id" ? "Gagal mengirim" : "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: language === "id" ? "Terima kasih!" : "Thank you!",
        description: language === "id" 
          ? "Rekomendasi Anda akan ditinjau oleh admin." 
          : "Your recommendation will be reviewed by admin.",
      });
      form.reset();
    }
    setSubmitting(false);
  };

  const handleVoteChange = (entryId: string, newCount: number) => {
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { ...e, vote_count: newCount } : e
    ));
  };

  const translations = {
    id: {
      pageTitle: "Wishlist Mie Ayam",
      pageSubtitle: "Rekomendasi Komunitas",
      heroDesc: "Bantu kami menemukan warung mie ayam tersembunyi yang layak untuk direview! Kirimkan rekomendasi Anda dan menjadi bagian dari komunitas pecinta mie ayam.",
      formTitle: "Rekomendasikan Tempat",
      formDesc: "Punya rekomendasi warung mie ayam favorit? Kirimkan di sini!",
      placeName: "Nama Tempat",
      placeNamePlaceholder: "Contoh: Mie Ayam Pak Kumis",
      location: "Lokasi",
      locationPlaceholder: "Alamat atau link Google Maps",
      whyRecommend: "Mengapa Anda Rekomendasikan?",
      whyRecommendPlaceholder: "Ceritakan apa yang spesial dari tempat ini...",
      submit: "Kirim Rekomendasi",
      submitting: "Mengirim...",
      pendingNotice: "Catatan: Rekomendasi akan muncul setelah disetujui admin.",
      communityPicks: "Pilihan Komunitas",
      communityPicksDesc: "Tempat-tempat yang direkomendasikan oleh komunitas. Vote untuk tempat favoritmu!",
      noEntries: "Belum ada rekomendasi yang disetujui",
      beFirst: "Jadilah yang pertama merekomendasikan tempat favorit Anda!",
      sortNewest: "Terbaru",
      sortPopular: "Terpopuler",
      votes: "suara",
    },
    en: {
      pageTitle: "Mie Ayam Wishlist",
      pageSubtitle: "Community Recommendations",
      heroDesc: "Help us discover hidden chicken noodle gems worth reviewing! Submit your recommendations and be part of the mie ayam community.",
      formTitle: "Recommend a Place",
      formDesc: "Have a favorite chicken noodle spot? Share it here!",
      placeName: "Place Name",
      placeNamePlaceholder: "E.g.: Mie Ayam Pak Kumis",
      location: "Location",
      locationPlaceholder: "Address or Google Maps link",
      whyRecommend: "Why Do You Recommend It?",
      whyRecommendPlaceholder: "Tell us what's special about this place...",
      submit: "Submit Recommendation",
      submitting: "Submitting...",
      pendingNotice: "Note: Recommendations will appear after admin approval.",
      communityPicks: "Community Picks",
      communityPicksDesc: "Places recommended by the community. Vote for your favorites!",
      noEntries: "No approved recommendations yet",
      beFirst: "Be the first to recommend your favorite spot!",
      sortNewest: "Newest",
      sortPopular: "Most Popular",
      votes: "votes",
    },
  };

  const txt = translations[language];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${txt.pageTitle} - Mie Ayam Ranger`}
        description={txt.heroDesc}
      />
      <Navbar />
      
      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">{txt.pageSubtitle}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">{txt.pageTitle}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{txt.heroDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Submission Form */}
          <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {txt.formTitle}
              </CardTitle>
              <CardDescription>{txt.formDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="place_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{txt.placeName}</FormLabel>
                        <FormControl>
                          <Input placeholder={txt.placeNamePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{txt.location}</FormLabel>
                        <FormControl>
                          <Input placeholder={txt.locationPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{txt.whyRecommend}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={txt.whyRecommendPlaceholder}
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {txt.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {txt.submit}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {txt.pendingNotice}
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Approved Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Store className="h-6 w-6" />
                  {txt.communityPicks}
                </h2>
                <p className="text-muted-foreground text-sm">{txt.communityPicksDesc}</p>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "popular")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {txt.sortPopular}
                    </span>
                  </SelectItem>
                  <SelectItem value="newest">{txt.sortNewest}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : entries.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="pt-6 text-center">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">{txt.noEntries}</p>
                    <p className="text-sm text-muted-foreground">{txt.beFirst}</p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{entry.place_name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {entry.location.startsWith("http") ? (
                              <a 
                                href={entry.location} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                {language === "id" ? "Lihat di Maps" : "View on Maps"}
                              </a>
                            ) : (
                              <span className="truncate">{entry.location}</span>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-sm mt-2 italic text-muted-foreground line-clamp-2">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                        <WishlistVoteButton 
                          entryId={entry.id}
                          initialVoteCount={entry.vote_count}
                          onVoteChange={(newCount) => handleVoteChange(entry.id, newCount)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;