import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
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
                
                <h3 className="text-lg font-semibold mb-2 mt-4">Formula Penilaian</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <code className="text-sm">Score = (Total Skor Rasa & Fasilitas) / (Harga + Waktu Penyajian × 100) × 1000</code>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  Formula ini memastikan bahwa warung dengan <strong>harga lebih murah</strong> dan <strong>waktu penyajian lebih cepat</strong> namun kualitas baik 
                  akan mendapat skor lebih tinggi dibanding warung mahal atau lambat dengan kualitas serupa.
                </p>

                <h3 className="text-lg font-semibold mb-2 mt-4">Komponen Penilaian</h3>
                <p className="text-muted-foreground mb-2">
                  Setiap aspek dinilai dengan skala 1-10 berdasarkan kriteria yang konsisten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li><strong>Kuah</strong> (untuk mie kuah): kekentalan, kaldu, keseimbangan rasa, aroma</li>
                  <li><strong>Mie</strong>: tipe dan tekstur (kenyal, lembut, atau mengembang)</li>
                  <li><strong>Ayam</strong>: bumbu dan ukuran potongan</li>
                  <li><strong>Fasilitas</strong>: kebersihan, alat makan, kenyamanan tempat</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2 mt-4">Kategori Harga</h3>
                <p className="text-muted-foreground mb-2">
                  Kami mengklasifikasikan warung mie ayam berdasarkan rentang harga:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li><strong>Budget</strong>: &lt; Rp 15.000</li>
                  <li><strong>Moderate</strong>: Rp 15.000 - Rp 25.000</li>
                  <li><strong>Premium</strong>: &gt; Rp 25.000</li>
                </ul>
                <p className="text-muted-foreground text-sm">
                  *Kategori harga mempengaruhi ekspektasi kualitas dan fasilitas yang disediakan
                </p>

                <h3 className="text-lg font-semibold mb-2 mt-4">Waktu Penyajian</h3>
                <p className="text-muted-foreground mb-2">
                  Waktu penyajian (dalam menit) menjadi faktor pengurang dalam penilaian akhir. Semakin cepat makanan disajikan, 
                  semakin baik nilai overall score-nya. Setiap 1 menit waktu penyajian setara dengan penalti Rp 100 pada harga.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Perceptual Mapping</h2>
                <p className="text-muted-foreground mb-3">
                  Kami menggunakan <strong>perceptual mapping</strong> untuk memvisualisasikan karakteristik rasa setiap 
                  warung mie ayam dalam dua dimensi:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>
                    <strong>Sumbu X (Kompleksitas)</strong>: Skala -5 hingga +5
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>-5 = Simple (rasa sederhana, langsung)</li>
                      <li>0 = Subtle (rasa seimbang)</li>
                      <li>+5 = Complex (rasa berlapis, kaya)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Sumbu Y (Profil Rasa)</strong>: Skala -5 hingga +5
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>-5 = Salty (asin-gurih dominan)</li>
                      <li>0 = Savory (gurih seimbang)</li>
                      <li>+5 = Sweet (manis kecap dominan)</li>
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
    </div>
  );
};

export default About;
