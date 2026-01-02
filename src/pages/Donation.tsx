import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Coffee } from "lucide-react";

const Donation = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Dukung Kami</h1>
            <p className="text-xl text-muted-foreground">
              Bantu kami terus menghadirkan review mie ayam yang objektif dan bermanfaat
            </p>
          </div>

          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="mr-2 h-5 w-5 text-primary" />
                Traktir Kami Semangkuk Mie Ayam
              </CardTitle>
              <CardDescription>
                Dukungan Anda membantu kami untuk terus mengunjungi lebih banyak warung mie ayam 
                dan memberikan review yang berkualitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Kenapa Donasi?</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Membantu biaya operasional website dan server</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Mendukung tim untuk mengunjungi lebih banyak warung</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Membiayai foto dan dokumentasi berkualitas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pengembangan fitur baru untuk pengalaman yang lebih baik</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <a 
                  href="https://saweria.co/mieayamranger" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-hero hover:opacity-90 transition-opacity rounded-lg shadow-elegant"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Donasi via Saweria
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  Klik tombol di atas untuk memberikan dukungan melalui Saweria
                </p>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Terima kasih atas dukungan Anda! Setiap kontribusi, sekecil apapun, 
                  sangat berarti bagi kami. ❤️
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground">
              Punya pertanyaan? Hubungi kami di{" "}
              <a href="mailto:contact@mieayamranger.web.id" className="text-primary hover:underline">
                contact@mieayamranger.web.id
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donation;
