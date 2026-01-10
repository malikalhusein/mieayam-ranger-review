import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Star, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const editorChoiceIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
  google_map_url?: string | null;
}

interface MapViewProps {
  reviews: Review[];
  isOpen: boolean;
  onClose: () => void;
}

// Extended geocoding with more precise coordinates for Indonesian cities
const cityCoordinates: Record<string, [number, number]> = {
  // Jakarta regions
  "Jakarta": [-6.2088, 106.8456],
  "Jakarta Selatan": [-6.2615, 106.8106],
  "Jakarta Barat": [-6.1681, 106.7588],
  "Jakarta Timur": [-6.2250, 106.9004],
  "Jakarta Utara": [-6.1384, 106.8635],
  "Jakarta Pusat": [-6.1862, 106.8341],
  
  // Yogyakarta regions
  "Yogyakarta": [-7.7956, 110.3695],
  "DIY": [-7.7956, 110.3695],
  "Wirobrajan": [-7.7974, 110.3445],
  "Kotagede": [-7.8185, 110.3988],
  "Sleman": [-7.7161, 110.3550],
  "Bantul": [-7.8886, 110.3250],
  "Gondokusuman": [-7.7823, 110.3832],
  "Umbulharjo": [-7.8093, 110.3852],
  "Mergangsan": [-7.8050, 110.3675],
  "Kraton": [-7.8083, 110.3597],
  "Gondomanan": [-7.7995, 110.3655],
  "Ngampilan": [-7.7963, 110.3568],
  "Mantrijeron": [-7.8178, 110.3578],
  "Jetis": [-7.7845, 110.3612],
  "Tegalrejo": [-7.7723, 110.3428],
  "Gedongtengen": [-7.7883, 110.3578],
  "Danurejan": [-7.7918, 110.3678],
  "Pakualaman": [-7.7953, 110.3728],
  "Depok Sleman": [-7.7695, 110.3916],
  "Mlati": [-7.7622, 110.3475],
  "Ngaglik": [-7.7178, 110.4010],
  "Godean": [-7.7670, 110.2998],
  "Gamping": [-7.7883, 110.3150],
  
  // Central Java
  "Semarang": [-6.9932, 110.4203],
  "Solo": [-7.5755, 110.8243],
  "Surakarta": [-7.5755, 110.8243],
  "Magelang": [-7.4797, 110.2177],
  "Purwokerto": [-7.4312, 109.2359],
  "Salatiga": [-7.3305, 110.5084],
  "Klaten": [-7.7053, 110.6019],
  "Wonosari": [-7.9650, 110.6000],
  "Wonosobo": [-7.3600, 109.9000],
  "Temanggung": [-7.3167, 110.1750],
  "Boyolali": [-7.5333, 110.6000],
  "Karanganyar": [-7.6000, 110.9500],
  "Sukoharjo": [-7.6833, 110.8333],
  "Wonogiri": [-7.8167, 110.9167],
  "Sragen": [-7.4333, 111.0167],
  "Kendal": [-7.0333, 110.2000],
  "Demak": [-6.8917, 110.6389],
  "Kudus": [-6.8047, 110.8406],
  "Pati": [-6.7500, 111.0500],
  "Jepara": [-6.5917, 110.6750],
  "Blora": [-6.9667, 111.4167],
  "Rembang": [-6.7083, 111.3500],
  "Pemalang": [-6.8917, 109.3833],
  "Tegal": [-6.8694, 109.1403],
  "Brebes": [-6.8717, 109.0419],
  "Pekalongan": [-6.8885, 109.6753],
  "Batang": [-6.8956, 109.7256],
  "Cilacap": [-7.7167, 109.0167],
  "Banyumas": [-7.5167, 109.3000],
  "Purbalingga": [-7.3833, 109.3667],
  "Banjarnegara": [-7.3917, 109.6917],
  "Kebumen": [-7.6667, 109.6500],
  "Purworejo": [-7.7167, 110.0000],
  
  // West Java
  "Bandung": [-6.9175, 107.6191],
  "Bekasi": [-6.2349, 106.9896],
  "Depok": [-6.4025, 106.7942],
  "Bogor": [-6.5971, 106.8060],
  "Tangerang": [-6.1702, 106.6403],
  "Tangerang Selatan": [-6.2894, 106.7108],
  "Cirebon": [-6.7320, 108.5523],
  "Sukabumi": [-6.9179, 106.9298],
  "Tasikmalaya": [-7.3274, 108.2207],
  "Garut": [-7.2275, 107.9089],
  "Subang": [-6.5714, 107.7528],
  "Karawang": [-6.3064, 107.3381],
  "Cianjur": [-6.8167, 107.1333],
  "Cimahi": [-6.8841, 107.5413],
  "Purwakarta": [-6.5583, 107.4333],
  "Indramayu": [-6.3278, 108.3250],
  "Majalengka": [-6.8361, 108.2278],
  "Kuningan": [-6.9756, 108.4833],
  
  // East Java
  "Surabaya": [-7.2575, 112.7521],
  "Malang": [-7.9666, 112.6326],
  "Sidoarjo": [-7.4478, 112.7183],
  "Gresik": [-7.1611, 112.6528],
  "Mojokerto": [-7.4722, 112.4333],
  "Kediri": [-7.8167, 112.0167],
  "Blitar": [-8.0956, 112.1611],
  "Tulungagung": [-8.0656, 111.9028],
  "Trenggalek": [-8.0500, 111.7083],
  "Nganjuk": [-7.6056, 111.9028],
  "Jombang": [-7.5500, 112.2333],
  "Madiun": [-7.6167, 111.5167],
  "Ponorogo": [-7.8667, 111.4667],
  "Pacitan": [-8.1833, 111.1000],
  "Magetan": [-7.6500, 111.3333],
  "Ngawi": [-7.4083, 111.4500],
  "Bojonegoro": [-7.1500, 111.8833],
  "Tuban": [-6.8972, 112.0500],
  "Lamongan": [-7.1167, 112.4167],
  "Probolinggo": [-7.7531, 113.2158],
  "Pasuruan": [-7.6456, 112.9061],
  "Lumajang": [-8.1333, 113.2167],
  "Jember": [-8.1722, 113.7000],
  "Bondowoso": [-7.9167, 113.8167],
  "Situbondo": [-7.7061, 114.0083],
  "Banyuwangi": [-8.2194, 114.3572],
  "Bangkalan": [-7.0333, 112.7333],
  "Sampang": [-7.1833, 113.2500],
  "Pamekasan": [-7.1667, 113.4833],
  "Sumenep": [-7.0167, 113.8667],
  
  // Bali
  "Denpasar": [-8.6500, 115.2167],
  "Badung": [-8.5833, 115.1833],
  "Gianyar": [-8.5417, 115.3250],
  "Tabanan": [-8.5500, 115.1250],
  "Buleleng": [-8.1167, 115.0833],
  "Karangasem": [-8.4500, 115.6167],
  "Bangli": [-8.4500, 115.3500],
  "Klungkung": [-8.5333, 115.4083],
  
  // Other major cities
  "Medan": [3.5952, 98.6722],
  "Palembang": [-2.9167, 104.7458],
  "Makassar": [-5.1477, 119.4327],
  "Balikpapan": [-1.2675, 116.8289],
  "Samarinda": [-0.5022, 117.1536],
  "Pontianak": [-0.0263, 109.3425],
  "Banjarmasin": [-3.3167, 114.5833],
  "Manado": [1.4748, 124.8421],
  "Padang": [-0.9492, 100.3543],
  "Pekanbaru": [0.5071, 101.4478],
  "Lampung": [-5.4500, 105.2667],
  "Batam": [1.0456, 104.0305],
};

const getCoordinatesForCity = (city: string): [number, number] | null => {
  // Check exact match first
  if (cityCoordinates[city]) {
    return cityCoordinates[city];
  }
  
  // Check partial match
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  return null;
};

const MapView = ({ reviews, isOpen, onClose }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [reviewsWithCoords, setReviewsWithCoords] = useState<(Review & { coords: [number, number] })[]>([]);

  useEffect(() => {
    // Assign coordinates to reviews based on city
    const mapped = reviews
      .map((review, index) => {
        const baseCoords = getCoordinatesForCity(review.city);
        if (!baseCoords) return null;
        
        // Add small random offset to prevent marker overlap
        const offset = index * 0.002;
        const coords: [number, number] = [
          baseCoords[0] + (Math.random() - 0.5) * 0.01 + offset * 0.1,
          baseCoords[1] + (Math.random() - 0.5) * 0.01 + offset * 0.1,
        ];
        
        return { ...review, coords };
      })
      .filter((r): r is Review & { coords: [number, number] } => r !== null);
    
    setReviewsWithCoords(mapped);
  }, [reviews]);

  useEffect(() => {
    if (!isOpen || !mapRef.current || reviewsWithCoords.length === 0) return;

    // Cleanup previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Calculate center
    const centerLat = reviewsWithCoords.reduce((sum, r) => sum + r.coords[0], 0) / reviewsWithCoords.length;
    const centerLng = reviewsWithCoords.reduce((sum, r) => sum + r.coords[1], 0) / reviewsWithCoords.length;

    // Initialize map
    const map = L.map(mapRef.current).setView([centerLat, centerLng], 11);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add markers
    reviewsWithCoords.forEach((review) => {
      const icon = review.editor_choice ? editorChoiceIcon : defaultIcon;
      const marker = L.marker(review.coords, { icon }).addTo(map);
      
      const imageUrl = review.image_urls?.[0] || review.image_url || "";
      const reviewUrl = review.slug ? `/reviews/${review.slug}` : `/review/${review.id}`;
      
      const popupContent = `
        <div style="width: 200px; font-family: system-ui, sans-serif;">
          ${imageUrl ? `<img src="${imageUrl}" alt="${review.outlet_name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px 6px 0 0; margin: -10px -10px 8px -10px; width: calc(100% + 20px);" />` : ""}
          <div style="padding: 0 2px;">
            <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #1a1a1a; line-height: 1.3;">${review.outlet_name}</h3>
            <p style="font-size: 11px; color: #666; margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${review.address}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #f59e0b;">★</span>
                <span style="font-weight: 600; font-size: 13px;">${(review.overall_score || 0).toFixed(1)}</span>
              </div>
              <span style="font-size: 11px; color: #666;">Rp${review.price.toLocaleString("id-ID")}</span>
            </div>
            <a href="${reviewUrl}" style="display: block; text-align: center; background: hsl(32, 95%, 44%); color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">Lihat Detail</a>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, { maxWidth: 220 });
    });

    // Fit bounds to show all markers
    if (reviewsWithCoords.length > 1) {
      const bounds = L.latLngBounds(reviewsWithCoords.map(r => r.coords));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, reviewsWithCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Peta Lokasi Warung</h2>
            <span className="text-sm text-muted-foreground">
              ({reviewsWithCoords.length} lokasi)
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Warung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Editor's Choice</span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          {reviewsWithCoords.length > 0 ? (
            <div ref={mapRef} className="h-full w-full" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Tidak ada lokasi yang bisa ditampilkan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
