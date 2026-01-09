import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { Link } from "react-router-dom";
import { Star, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const editorChoiceIcon = new Icon({
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
  "Semarang": [-6.9932, 110.4203],
  "Malang": [-7.9666, 112.6326],
  "Solo": [-7.5755, 110.8243],
  "Bekasi": [-6.2349, 106.9896],
  "Depok": [-6.4025, 106.7942],
  "Tangerang": [-6.1702, 106.6403],
  "Bogor": [-6.5971, 106.8060],
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

  if (!isOpen) return null;

  // Calculate center and bounds
  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta
  const center = reviewsWithCoords.length > 0
    ? [
        reviewsWithCoords.reduce((sum, r) => sum + r.coords[0], 0) / reviewsWithCoords.length,
        reviewsWithCoords.reduce((sum, r) => sum + r.coords[1], 0) / reviewsWithCoords.length,
      ] as [number, number]
    : defaultCenter;

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
            <MapContainer
              center={center}
              zoom={11}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reviewsWithCoords.map((review) => (
                <Marker
                  key={review.id}
                  position={review.coords}
                  icon={review.editor_choice ? editorChoiceIcon : defaultIcon}
                >
                  <Popup className="map-popup">
                    <div className="w-56">
                      {(review.image_urls?.[0] || review.image_url) && (
                        <img
                          src={review.image_urls?.[0] || review.image_url || ""}
                          alt={review.outlet_name}
                          className="w-full h-28 object-cover rounded-t-md -mt-3 -mx-3 mb-2"
                          style={{ width: "calc(100% + 24px)" }}
                        />
                      )}
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-foreground line-clamp-1">
                          {review.outlet_name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {review.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">
                              {(review.overall_score || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Rp{review.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <Link
                          to={review.slug ? `/reviews/${review.slug}` : `/review/${review.id}`}
                          className="block w-full text-center text-xs bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/90 transition-colors mt-2"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
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
