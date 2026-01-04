import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MIE_AYAM_STYLES } from "./PerceptualMap";
import { Info } from "lucide-react";

interface StyleLegendProps {
  compact?: boolean;
  showCoords?: boolean;
}

const StyleLegend = ({ compact = false, showCoords = false }: StyleLegendProps) => {
  const styles = Object.entries(MIE_AYAM_STYLES);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {styles.map(([key, style]) => (
          <Badge 
            key={key} 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: style.color, color: style.color }}
          >
            {style.name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Panduan Style Mie Ayam Regional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {styles.map(([key, style]) => (
          <div 
            key={key} 
            className="p-3 rounded-lg border-l-4 bg-muted/30"
            style={{ borderLeftColor: style.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">{style.name}</h4>
              {showCoords && (
                <Badge variant="secondary" className="text-xs">
                  S:{style.typicalCoords.sweetness} C:{style.typicalCoords.complexity}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {style.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StyleLegend;
