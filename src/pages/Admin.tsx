import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, X, Home, TrendingUp, BarChart3, Award } from "lucide-react";
import { SemanticDifferential } from "@/components/ui/semantic-differential";
import { Alert, AlertDescription } from "@/components/ui/alert";

const reviewSchema = z.object({
  outlet_name: z.string().min(1, "Nama outlet wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  city: z.string().min(1, "Kota wajib diisi"),
  visit_date: z.string().min(1, "Tanggal kunjungan wajib diisi"),
  price: z.string().min(1, "Harga wajib diisi"),
  product_type: z.enum(["kuah", "goreng"]),
  mie_tipe: z.string().optional(),
  google_map_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  notes: z.string().optional(),
  fasilitas_kebersihan: z.number().min(0).max(10).optional(),
  fasilitas_alat_makan: z.number().min(0).max(10).optional(),
  fasilitas_tempat: z.number().min(0).max(10).optional(),
  service_durasi: z.number().min(0).max(10).optional(),
  complexity: z.number().min(0).max(8).optional(),
  sweetness: z.number().min(0).max(8).optional(),
  kuah_kekentalan: z.number().min(0).max(10).optional(),
  kuah_kaldu: z.number().min(0).max(10).optional(),
  kuah_keseimbangan: z.number().min(0).max(10).optional(),
  kuah_aroma: z.number().min(0).max(10).optional(),
  mie_tekstur: z.number().min(0).max(10).optional(),
  ayam_bumbu: z.number().min(0).max(10).optional(),
  ayam_potongan: z.number().min(0).max(10).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product_type: "kuah",
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  // Calculate preview score in real-time
  useEffect(() => {
    const subscription = form.watch((value) => {
      const kuahScore = value.product_type === "kuah" 
        ? ((Number(value.kuah_kekentalan) || 0) + (Number(value.kuah_kaldu) || 0) + 
           (Number(value.kuah_keseimbangan) || 0) + (Number(value.kuah_aroma) || 0)) / 4
        : 0;
      const mieScore = Number(value.mie_tekstur) || 0;
      const ayamScore = ((Number(value.ayam_bumbu) || 0) + (Number(value.ayam_potongan) || 0)) / 2;
      const fasilitasScore = ((Number(value.fasilitas_kebersihan) || 0) + 
                             (Number(value.fasilitas_alat_makan) || 0) + 
                             (Number(value.fasilitas_tempat) || 0)) / 3;
      
      let score: number;
      if (value.product_type === "kuah") {
        score = (kuahScore * 0.3) + (mieScore * 0.3) + (ayamScore * 0.25) + (fasilitasScore * 0.15);
      } else {
        score = (mieScore * 0.4) + (ayamScore * 0.4) + (fasilitasScore * 0.2);
      }
      
      setPreviewScore(score);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      // @ts-ignore - Supabase types are auto-generated
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading reviews", variant: "destructive" });
      return;
    }

    setReviews(data || []);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roleData } = await supabase
      // @ts-ignore - Supabase types are auto-generated
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      navigate("/");
      return;
    }

    setUser(user);
    setLoading(false);
  };

  const startEdit = (review: any) => {
    setEditingReview(review);
    setShowCreateForm(false);
    
    // Populate form with existing data
    form.reset({
      outlet_name: review.outlet_name,
      address: review.address,
      city: review.city,
      visit_date: review.visit_date,
      price: review.price.toString(),
      product_type: review.product_type,
      mie_tipe: review.mie_tipe || "",
      google_map_url: review.google_map_url || "",
      notes: review.notes || "",
      fasilitas_kebersihan: review.fasilitas_kebersihan,
      fasilitas_alat_makan: review.fasilitas_alat_makan,
      fasilitas_tempat: review.fasilitas_tempat,
      service_durasi: review.service_durasi,
      complexity: review.complexity,
      sweetness: review.sweetness,
      kuah_kekentalan: review.kuah_kekentalan,
      kuah_kaldu: review.kuah_kaldu,
      kuah_keseimbangan: review.kuah_keseimbangan,
      kuah_aroma: review.kuah_aroma,
      mie_tekstur: review.mie_tekstur,
      ayam_bumbu: review.ayam_bumbu,
      ayam_potongan: review.ayam_potongan,
    });

    // Set existing images
    setExistingImageUrls(review.image_urls || []);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setShowCreateForm(false);
    form.reset();
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Yakin ingin menghapus review ini?")) return;

    const { error } = await supabase
      // @ts-ignore - Supabase types are auto-generated
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting review", variant: "destructive" });
      return;
    }

    toast({ title: "Review berhasil dihapus" });
    fetchReviews();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImageUrls.length + imageFiles.length + files.length;
    
    if (totalImages > 6) {
      toast({ title: "Maksimal 6 gambar", variant: "destructive" });
      return;
    }

    setImageFiles([...imageFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls(existingImageUrls.filter(u => u !== url));
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (editingReview) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleUpdate = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      const newImageUrls = await uploadImages();
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const reviewData = {
        outlet_name: data.outlet_name,
        address: data.address,
        city: data.city,
        visit_date: data.visit_date,
        price: parseInt(data.price),
        product_type: data.product_type,
        mie_tipe: data.mie_tipe || null,
        google_map_url: data.google_map_url || null,
        notes: data.notes || null,
        image_urls: allImageUrls,
        fasilitas_kebersihan: data.fasilitas_kebersihan || null,
        fasilitas_alat_makan: data.fasilitas_alat_makan || null,
        fasilitas_tempat: data.fasilitas_tempat || null,
        service_durasi: data.service_durasi || null,
        complexity: data.complexity || null,
        sweetness: data.sweetness || null,
        kuah_kekentalan: data.kuah_kekentalan || null,
        kuah_kaldu: data.kuah_kaldu || null,
        kuah_keseimbangan: data.kuah_keseimbangan || null,
        kuah_aroma: data.kuah_aroma || null,
        mie_tekstur: data.mie_tekstur || null,
        ayam_bumbu: data.ayam_bumbu || null,
        ayam_potongan: data.ayam_potongan || null,
      };

      // overall_score is auto-generated by database
      const { error } = await supabase
        // @ts-ignore - Supabase types are auto-generated
        .from("reviews")
        // @ts-ignore
        .update(reviewData)
        .eq("id", editingReview.id);

      if (error) throw error;

      toast({ title: "Review berhasil diupdate!" });
      cancelEdit();
      fetchReviews();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();

      const reviewData = {
        outlet_name: data.outlet_name,
        address: data.address,
        city: data.city,
        visit_date: data.visit_date,
        price: parseInt(data.price),
        product_type: data.product_type,
        mie_tipe: data.mie_tipe || null,
        google_map_url: data.google_map_url || null,
        notes: data.notes || null,
        image_urls: imageUrls,
        fasilitas_kebersihan: data.fasilitas_kebersihan || null,
        fasilitas_alat_makan: data.fasilitas_alat_makan || null,
        fasilitas_tempat: data.fasilitas_tempat || null,
        service_durasi: data.service_durasi || null,
        complexity: data.complexity || null,
        sweetness: data.sweetness || null,
        kuah_kekentalan: data.kuah_kekentalan || null,
        kuah_kaldu: data.kuah_kaldu || null,
        kuah_keseimbangan: data.kuah_keseimbangan || null,
        kuah_aroma: data.kuah_aroma || null,
        mie_tekstur: data.mie_tekstur || null,
        ayam_bumbu: data.ayam_bumbu || null,
        ayam_potongan: data.ayam_potongan || null,
      };

      // overall_score is auto-generated by database
      const { error } = await supabase
        // @ts-ignore - Supabase types are auto-generated
        .from("reviews")
        // @ts-ignore
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Review berhasil dibuat!" });
      cancelEdit();
      fetchReviews();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const productType = form.watch("product_type");

  // Calculate statistics
  const avgOverallScore = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.length 
    : 0;
  
  const typeDistribution = reviews.reduce((acc, r) => {
    acc[r.product_type] = (acc[r.product_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const outletPerformance = reviews.reduce((acc, r) => {
    if (!acc[r.outlet_name]) {
      acc[r.outlet_name] = { count: 0, totalScore: 0 };
    }
    acc[r.outlet_name].count += 1;
    acc[r.outlet_name].totalScore += r.overall_score || 0;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number }>);

  const topOutlets = Object.entries(outletPerformance)
    .map(([name, data]) => {
      const performanceData = data as { count: number; totalScore: number };
      return {
        name,
        avgScore: performanceData.totalScore / performanceData.count,
        reviewCount: performanceData.count
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="container max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {!showCreateForm && !editingReview && (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata-rata Overall Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgOverallScore.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Dari {reviews.length} review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Distribusi Tipe</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Kuah:</span>
                      <span className="font-bold">{typeDistribution.kuah || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Goreng:</span>
                      <span className="font-bold">{typeDistribution.goreng || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Outlet</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {topOutlets.length > 0 ? (
                    <div className="space-y-1">
                      <div className="font-bold text-sm">{topOutlets[0].name}</div>
                      <div className="text-2xl font-bold">{topOutlets[0].avgScore.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">{topOutlets[0].reviewCount} review</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada data</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {topOutlets.length > 1 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top 5 Outlet Terbaik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topOutlets.map((outlet, index) => (
                      <div key={outlet.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{outlet.name}</div>
                            <div className="text-sm text-muted-foreground">{outlet.reviewCount} review</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold">{outlet.avgScore.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!showCreateForm && !editingReview && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Daftar Review</h2>
              <Button onClick={() => setShowCreateForm(true)}>
                Buat Review Baru
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left">Outlet</th>
                        <th className="px-4 py-3 text-left">Kota</th>
                        <th className="px-4 py-3 text-left">Tipe</th>
                        <th className="px-4 py-3 text-left">Score</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">{review.outlet_name}</td>
                          <td className="px-4 py-3">{review.city}</td>
                          <td className="px-4 py-3">
                            <span className="capitalize">{review.product_type}</span>
                          </td>
                          <td className="px-4 py-3">
                            {review.overall_score ? review.overall_score.toFixed(1) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(review.visit_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startEdit(review)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteReview(review.id)}
                            >
                              Hapus
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(showCreateForm || editingReview) && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {editingReview ? "Edit Review" : "Buat Review Baru"}
              </h2>
              <Button variant="outline" onClick={cancelEdit}>
                Batal
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                
                <div>
                  <Label htmlFor="outlet_name">Nama Outlet</Label>
                  <Input id="outlet_name" {...form.register("outlet_name")} />
                  {form.formState.errors.outlet_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.outlet_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input id="address" {...form.register("address")} />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input id="city" {...form.register("city")} />
                    {form.formState.errors.city && (
                      <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="visit_date">Tanggal Kunjungan</Label>
                    <Input id="visit_date" type="date" {...form.register("visit_date")} />
                    {form.formState.errors.visit_date && (
                      <p className="text-sm text-destructive">{form.formState.errors.visit_date.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input id="price" type="number" {...form.register("price")} />
                    {form.formState.errors.price && (
                      <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="product_type">Tipe Produk</Label>
                    <Select onValueChange={(value) => form.setValue("product_type", value as "kuah" | "goreng")} defaultValue="kuah">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kuah">Kuah</SelectItem>
                        <SelectItem value="goreng">Goreng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mie_tipe">Tipe Mie (opsional)</Label>
                  <Input id="mie_tipe" {...form.register("mie_tipe")} placeholder="contoh: telur, keriting" />
                </div>

                <div>
                  <Label htmlFor="google_map_url">Google Maps URL (opsional)</Label>
                  <Input id="google_map_url" {...form.register("google_map_url")} placeholder="https://maps.google.com/..." />
                  {form.formState.errors.google_map_url && (
                    <p className="text-sm text-destructive">{form.formState.errors.google_map_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea id="notes" {...form.register("notes")} rows={3} />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gambar (max 6)</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {existingImageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img src={url} alt={`Existing ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeExistingImage(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(existingImageUrls.length + imageFiles.length) < 6 && (
                    <label className="border-2 border-dashed rounded h-32 flex items-center justify-center cursor-pointer hover:bg-muted/50">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Penilaian (0-10)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fasilitas_kebersihan">Kebersihan</Label>
                    <Input id="fasilitas_kebersihan" type="number" step="0.1" min="0" max="10" 
                      {...form.register("fasilitas_kebersihan", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="fasilitas_alat_makan">Alat Makan</Label>
                    <Input id="fasilitas_alat_makan" type="number" step="0.1" min="0" max="10"
                      {...form.register("fasilitas_alat_makan", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="fasilitas_tempat">Tempat</Label>
                    <Input id="fasilitas_tempat" type="number" step="0.1" min="0" max="10"
                      {...form.register("fasilitas_tempat", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="service_durasi">Durasi Service</Label>
                    <Input id="service_durasi" type="number" step="0.1" min="0" max="10"
                      {...form.register("service_durasi", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="mie_tekstur">Tekstur Mie</Label>
                    <Input id="mie_tekstur" type="number" step="0.1" min="0" max="10"
                      {...form.register("mie_tekstur", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="ayam_bumbu">Bumbu Ayam</Label>
                    <Input id="ayam_bumbu" type="number" step="0.1" min="0" max="10"
                      {...form.register("ayam_bumbu", { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="ayam_potongan">Potongan Ayam</Label>
                    <Input id="ayam_potongan" type="number" step="0.1" min="0" max="10"
                      {...form.register("ayam_potongan", { valueAsNumber: true })} />
                  </div>

                  <div className="col-span-2">
                    <SemanticDifferential
                      id="complexity"
                      label="Kompleksitas Rasa (-5: Simple, 0: Subtle, +5: Complex)"
                      leftLabel="Simple"
                      centerLabel="Subtle"
                      rightLabel="Complex"
                      value={form.watch("complexity")}
                      onChange={(value) => form.setValue("complexity", value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <SemanticDifferential
                      id="sweetness"
                      label="Profil Rasa (-5: Salty, 0: Savory, +5: Sweet)"
                      leftLabel="Salty"
                      centerLabel="Savory"
                      rightLabel="Sweet"
                      value={form.watch("sweetness")}
                      onChange={(value) => form.setValue("sweetness", value)}
                    />
                  </div>
                </div>

                {/* Real-time Score Preview */}
                {previewScore !== null && (
                  <Alert className="bg-primary/10 border-primary">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-semibold">Preview Overall Score: </span>
                      <span className="text-2xl font-bold text-primary">{previewScore.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({productType === "kuah" 
                          ? "Kuah 30% + Mie 30% + Ayam 25% + Fasilitas 15%" 
                          : "Mie 40% + Ayam 40% + Fasilitas 20%"})
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {productType === "kuah" && (
                  <>
                    <h4 className="font-medium mt-4">Penilaian Kuah</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kuah_kekentalan">Kekentalan</Label>
                        <Input id="kuah_kekentalan" type="number" step="0.1" min="0" max="10"
                          {...form.register("kuah_kekentalan", { valueAsNumber: true })} />
                      </div>

                      <div>
                        <Label htmlFor="kuah_kaldu">Kaldu</Label>
                        <Input id="kuah_kaldu" type="number" step="0.1" min="0" max="10"
                          {...form.register("kuah_kaldu", { valueAsNumber: true })} />
                      </div>

                      <div>
                        <Label htmlFor="kuah_keseimbangan">Keseimbangan</Label>
                        <Input id="kuah_keseimbangan" type="number" step="0.1" min="0" max="10"
                          {...form.register("kuah_keseimbangan", { valueAsNumber: true })} />
                      </div>

                      <div>
                        <Label htmlFor="kuah_aroma">Aroma</Label>
                        <Input id="kuah_aroma" type="number" step="0.1" min="0" max="10"
                          {...form.register("kuah_aroma", { valueAsNumber: true })} />
                      </div>
                    </div>
                  </>
                )}
              </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Menyimpan..." : editingReview ? "Update Review" : "Buat Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
