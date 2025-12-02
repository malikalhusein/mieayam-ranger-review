import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, TrendingUp } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Tentang Mie Ayam Ranger</h1>
            <p className="text-xl text-muted-foreground">
              Platform review mie ayam dengan sistem penilaian yang objektif dan transparan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center shadow-card">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold mb-2">Objektif</h3>
                <p className="text-sm text-muted-foreground">
                  Penilaian berdasarkan formula matematis yang adil
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Award className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="font-bold mb-2">Transparan</h3>
                <p className="text-sm text-muted-foreground">
                  Semua skor dan metodologi terbuka untuk publik
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="font-bold mb-2">Komprehensif</h3>
                <p className="text-sm text-muted-foreground">
                  Menilai berbagai aspek dari rasa hingga fasilitas
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-3">Misi Kami</h2>
                <p className="text-muted-foreground">
                  Mie Ayam Ranger hadir untuk memberikan panduan objektif dalam memilih warung mie ayam terbaik. 
                  Kami percaya bahwa setiap orang berhak mendapatkan informasi yang jelas dan adil tentang kualitas 
                  makanan yang mereka konsumsi.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Metodologi Penilaian</h2>
                <p className="text-muted-foreground mb-4">
                  Sistem penilaian Mie Ayam Ranger terinspirasi dari <strong>Coffee Value Assessment</strong> yang dipublikasikan oleh <strong>SCA (Specialty Coffee Association)</strong>, 
                  di mana kami mengadopsi pendekatan objektif dan terstruktur dalam menilai kualitas produk kuliner.
                </p>
              </div>

              {/* Cara Kerja Penilaian Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Cara Kerja Penilaian</h2>
                
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Formula Penilaian</h3>
                  <p className="mb-2">
                    <code className="bg-background px-2 py-1 rounded text-sm">Score = (BASE_SCORE + TIME_SCORE) × VALUE_FACTOR</code>
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>BASE_SCORE</strong> = (Rasa × 80%) + (Fasilitas × 20%)</li>
                    <li>• <strong>TIME_SCORE</strong> = Bonus/Penalti berdasarkan waktu penyajian (standar: 8 menit)</li>
                    <li>• VALUE_FACTOR = Faktor harga, set normatif Rp 17.000 sebagai treshold parameter.<strong>VALUE_FACTOR</strong> = 17.000 / Harga (dibatasi 0.85-1.15)</li>
                  </ul>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">Indikator Penilaian</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-2">Untuk Mie Ayam Kuah:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Tekstur Mie, Bumbu Ayam, Potongan Ayam</li>
                        <li>• Body Kuah, Keseimbangan Rasa Kuah</li>
                        <li>• Kaldu/Umami/Depth, Aroma Kuah</li>
                        <li>• Kejernihan/Visual Kuah</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Untuk Mie Ayam Goreng:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Tekstur Mie, Bumbu Ayam, Potongan Ayam</li>
                        <li>• Keseimbangan Minyak</li>
                        <li>• Bumbu Tumisan/Coating</li>
                        <li>• Aroma Tumisan</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm mt-3 text-muted-foreground">
                    <strong>Fasilitas:</strong> Kebersihan, Alat Makan, Tempat
                  </p>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">Kategori Harga</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• &lt; Rp 8.000 = Murah Ga Masuk Akal ⭐</li>
                    <li>• Rp 8.000 - 10.000 = Murah ⭐⭐</li>
                    <li>• Rp 11.000 - 12.000 = Normal ⭐⭐⭐</li>
                    <li>• Rp 13.000 - 15.000 = Resto Menengah ⭐⭐⭐⭐</li>
                    <li>• Rp 18.000 - 20.000 = Cukup Mahal ⭐⭐⭐⭐⭐</li>
                    <li>• &gt; Rp 20.000 = Mahal ⭐⭐⭐⭐⭐⭐</li>
                  </ul>
                  <p className="text-xs mt-3 italic text-muted-foreground">* Kategori harga dibuah sebagai bentuk kompensasi, semakin mahal semakin banyak value yang bisa kita tuntut. Sebaliknya semakin murah mie ayam semakin sedikit hal yang bisa diekspektasikan, semisal mie ayam 8rb tidak bisa dibandingkan dengan yang harganya 15rb baik untuk rasa maupun dari segi fasilitas lainnya.</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Waktu Penyajian (Toleransi 8 Menit)</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• <strong>Standar 8 menit:</strong> Tidak ada penalti atau bonus</li>
                    <li>• <strong>Lebih cepat dari 8 menit:</strong> Mendapat bonus poin ((8 − waktu) × 1.5)</li>
                    <li>• <strong>Lebih lambat dari 8 menit:</strong> Terkena penalti ((8 − waktu) × 2)</li>
                  </ul>
                  <p className="text-xs mt-3 text-muted-foreground italic">
                    Contoh: Waktu 5 menit = bonus +4.5 poin, Waktu 12 menit = penalti -8 poin
                  </p>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Catatan Penting</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Algoritma terinspirasi dari Coffee Value Assessment (SCA)</li>
                    <li>• Kompleksitas rasa dan profil rasa tidak mempengaruhi skor - hanya metadata</li>
                    <li>• Standar harga nasional: Rp 17.000</li>
                    <li>• Skor maksimal: 10 (skala 0-10)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Perceptual Mapping</h2>
                <p className="text-muted-foreground mb-3">
                  Kami menggunakan <strong>perceptual mapping</strong> untuk memvisualisasikan karakteristik rasa setiap 
                  warung mie ayam dalam dua dimensi:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Sumbu X (Kompleksitas):
-5 = Simple (rasa sederhana, langsung)
0 = Subtle (rasa seimbang)
+5 = Complex (rasa berlapis, kaya)<strong>Sumbu X (Kompleksitas)</strong>: Skala -5 hingga +5
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>-5 = Simple (kuah berbody tipis, segar tidak terlalu banyak bumbu/rempah)</li>
                      <li>0 = Subtle (kuah kaldu masih terasa segar, perpaduan bumbu rempah masih berasa, seimbang)</li>
                      <li>+5 = Complex (kuah didominasi dengan bumbu/rempah, kaldu tipis)</li>
                    </ul>
                  </li>
                  <li>Sumbu Y (Profil Rasa): 
-5 = Salty (asin-gurih dominan)
0 = Savory (gurih seimbang)
+5 = Sweet (manis kecap dominan)<strong>Sumbu Y (Profil Rasa)</strong>: Skala -5 hingga +5
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>-5 = Salty (asin-gurih dominan)</li>
                      <li>0 = Savory (manis, gurih, umami seimbang)</li>
                      <li>+5 = Sweet (rasa manis lebih dominan)</li>
                    </ul>
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-2 mt-4">Cara Membaca Perceptual Map</h3>
                <p className="text-muted-foreground mb-2">
                  Setiap titik pada peta mewakili satu warung mie ayam. Posisinya menunjukkan karakteristik rasanya:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Kanan atas</strong>: Rasa kompleks dan manis (mie ayam oriental premium)</li>
                  <li><strong>Kiri atas</strong>: Rasa simple dan manis (mie ayam Jawa klasik)</li>
                  <li><strong>Tengah</strong>: Rasa seimbang dan gurih (mie ayam rumahan)</li>
                  <li><strong>Kiri bawah</strong>: Rasa simple dan asin (mie ayam pinggir jalan)</li>
                  <li><strong>Kanan bawah</strong>: Rasa kompleks dan asin (mie ayam oriental gurih)</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-3">
                  Gunakan peta ini untuk menemukan mie ayam yang sesuai dengan preferensi rasa Anda!
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Tim Kami</h2>
                <p className="text-muted-foreground">
                  Mie Ayam Ranger dijalankan oleh food enthusiast yang passionate terhadap kuliner lokal Indonesia, 
                  khususnya mie ayam. Setiap review dilakukan dengan standar yang sama untuk menjaga konsistensi 
                  dan keadilan penilaian.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default About;