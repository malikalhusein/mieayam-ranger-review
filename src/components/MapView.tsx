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

// Simple geocoding using city names to approximate coordinates
const cityCoordinates: Record<string, [number, number]> = {
  "Jakarta": [-6.2088, 106.8456],
  "Jakarta Selatan": [-6.2615, 106.8106],
  "Jakarta Barat": [-6.1681, 106.7588],
  "Jakarta Timur": [-6.2250, 106.9004],
  "Jakarta Utara": [-6.1384, 106.8635],
  "Jakarta Pusat": [-6.1862, 106.8341],
  "Bandung": [-6.9175, 107.6191],
  "Surabaya": [-7.2575, 112.7521],
  "Yogyakarta": [-7.7956, 110.3695],
  "Wirobrajan": [-7.7896, 110.3486],
  "Kotagede": [-7.8225, 110.4006],
  "Sleman": [-7.7161, 110.3550],
  "Bantul": [-7.8886, 110.3250],
  "Semarang": [-6.9932, 110.4203],
  "Malang": [-7.9666, 112.6326],
  "Solo": [-7.5755, 110.8243],
  "Surakarta": [-7.5755, 110.8243],
  "Bekasi": [-6.2349, 106.9896],
  "Depok": [-6.4025, 106.7942],
  "Tangerang": [-6.1702, 106.6403],
  "Tangerang Selatan": [-6.2894, 106.7108],
  "Bogor": [-6.5971, 106.8060],
  "Cirebon": [-6.7320, 108.5523],
  "Magelang": [-7.4797, 110.2177],
  "Purwokerto": [-7.4312, 109.2359],
  "Salatiga": [-7.3305, 110.5084],
  "Klaten": [-7.7053, 110.6019],
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
