import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface DataPoint {
  name: string;
  complexity: number;
  sweetness: number;
  type: "kuah" | "goreng";
}

interface PerceptualMapProps {
  data: DataPoint[];
  showDescription?: boolean;
}

// Regional style definitions for reference
export const MIE_AYAM_STYLES = {
  rumahan: {
    description: "Mie ayam rumahan khas Indonesia dengan ciri kaldu ayam bening yang hangat, topping ayam cincang tumis sederhana dengan bawang putih, dan mie kuning kenyal. Rasanya gurih natural dari kaldu tulang ayam yang direbus lama, tanpa bumbu berlebihan. Comfort food yang familiar dan tidak berlebihan.",
    typicalCoords: { sweetness: 0, complexity: 0 }
  },
  wonogirian: {
    description: "Mie ayam Wonogiri/Solo dengan karakter manis yang kuat dari gula Jawa dan bumbu tumis yang legit. Kuahnya lebih pekat dan berbumbu, ayamnya dimasak dengan bumbu manis gurih yang kental. Mie-nya cenderung lebih tebal dan kenyal. Ciri khas Jawa Tengah yang comfort dan hangat.",
    typicalCoords: { sweetness: 3, complexity: 2 }
  },
  bangka: {
    description: "Mie ayam Bangka/Pangkalpinang dengan karakter asin yang tegas dari kaldu ikan teri dan kecap asin. Kuahnya jernih tapi gurih kuat, sering disajikan dengan pangsit goreng kering. Rasanya lebih 'nendang' dan straightforward tanpa manis berlebihan.",
    typicalCoords: { sweetness: -3, complexity: 1 }
  },
  yamin: {
    description: "Mie Yamin Jakarta dengan bumbu kering yang kompleks — campuran minyak wijen, saus tiram, bawang goreng, dan kadang cabai. Tidak berkuah atau kuah dipisah. Karakternya lebih 'Chinese-influenced' dengan lapisan rasa yang berlapis dari berbagai condiment dan topping.",
    typicalCoords: { sweetness: 1, complexity: 4 }
  }
};

// Detailed coordinate-based flavor descriptions
// X-axis (sweetness): -5 to 5 → Salty ← Savory → Sweet
// Y-axis (complexity): -5 to 5 → Simple ← Subtle → Complex
const getFlavorDescription = (sweetness: number, complexity: number): string => {
  // More granular coordinate system for precise descriptions
  
  // Extreme Salty (-5 to -4)
  if (sweetness <= -4) {
    if (complexity <= -3) {
      return "Asin kuat dan langsung terasa tanpa banyak lapisan — kaldu ikan teri atau garam yang dominan. Mirip mie ayam Bangka versi paling straightforward.";
    } else if (complexity <= 0) {
      return "Asin gurih yang tegas dengan sedikit depth dari bawang goreng dan minyak ayam. Karakter Bangka yang lebih seimbang.";
    } else if (complexity <= 3) {
      return "Asin berlapis dengan aroma wijen dan bumbu oriental. Ada sentuhan umami yang dalam dari fermentasi.";
    } else {
      return "Asin kompleks dengan banyak dimensi — fermentasi, rempah, dan aroma panggang yang menyatu dalam harmoni yang intens.";
    }
  }
  
  // Moderately Salty (-3 to -2)
  if (sweetness <= -2) {
    if (complexity <= -3) {
      return "Gurih dengan kecenderungan asin yang jelas. Kaldu ayam sederhana dengan garam yang pas — mie ayam pinggir jalan yang jujur.";
    } else if (complexity <= 0) {
      return "Asin-gurih seimbang dengan kaldu yang sudah lebih berbumbu. Ada bawang putih dan sedikit lada yang menambah dimensi.";
    } else if (complexity <= 3) {
      return "Gurih-asin dengan kompleksitas menengah — ada minyak wijen, bawang merah goreng, dan hint rempah yang subtle.";
    } else {
      return "Asin elegan dengan banyak layer — kaldu pekat, minyak aromatik, dan bumbu yang terintegrasi dengan baik.";
    }
  }
  
  // Savory Center (-1 to 1)
  if (sweetness <= 1) {
    if (complexity <= -3) {
      return "Gurih bersih dan sederhana — kaldu ayam natural tanpa bumbu berlebihan. Comfort food yang tidak complicated.";
    } else if (complexity <= -1) {
      return "Gurih ringan dengan aftertaste yang clean. Kaldu tulang ayam yang direbus lama dengan bawang putih — esensi mie ayam rumahan.";
    } else if (complexity <= 1) {
      return "Gurih seimbang — harmoni kaldu ayam, bawang, dan minyak ayam yang pas. Khas mie ayam rumahan Indonesia yang familiar dan comforting.";
    } else if (complexity <= 3) {
      return "Gurih berlapis dengan depth yang menarik — ada jamur, minyak wijen, dan bumbu tumis yang well-integrated.";
    } else {
      return "Gurih yang sangat kompleks — multiple layers dari kaldu, rempah, dan aromatics yang saling melengkapi. Mendekati karakter mie Yamin.";
    }
  }
  
  // Slightly Sweet (2 to 3)
  if (sweetness <= 3) {
    if (complexity <= -3) {
      return "Manis ringan yang straightforward — sentuhan gula dalam bumbu tumis yang sederhana. Approachable dan tidak overwhelming.";
    } else if (complexity <= 0) {
      return "Manis-gurih lembut dengan karakter Jawa yang subtle. Gula aren atau gula Jawa yang menyatu dengan kaldu ayam.";
    } else if (complexity <= 3) {
      return "Manis-gurih berlapis khas Wonogirian — gula Jawa, bawang goreng, dan bumbu tumis yang legit. Comfort food Jawa Tengah.";
    } else {
      return "Manis kompleks dengan banyak dimensi — karamelisasi bawang, gula Jawa, dan rempah yang membentuk profil rasa yang kaya.";
    }
  }
  
  // Very Sweet (4 to 5)
  if (complexity <= -3) {
    return "Manis yang dominan dan langsung terasa — bumbu gula yang straightforward. Cocok untuk yang suka rasa manis yang jelas.";
  } else if (complexity <= 0) {
    return "Manis-legit dengan karakter bumbu Jawa yang kental. Gula aren yang menonjol dengan base kaldu yang supportive.";
  } else if (complexity <= 3) {
    return "Manis berlapis dengan karamelisasi yang dalam — bawang yang dimasak lama, gula Jawa, dan rempah manis seperti kayu manis atau bunga lawang.";
  } else {
    return "Profil manis yang sangat kompleks — multiple sources of sweetness yang terintegrasi dengan bumbu aromatik. Dekaden dan kaya.";
  }
};

const PerceptualMap = ({ data, showDescription = false }: PerceptualMapProps) => {
  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-4 text-center">Perceptual Mapping</h3>
      <p className="text-center text-muted-foreground mb-6">
        Visualisasi kompleksitas rasa vs tingkat kemanisan
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="sweetness" 
            name="Sweetness" 
            domain={[-5, 5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            label={{ value: 'Salty ← Savory → Sweet', position: 'insideBottom', offset: -10, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <YAxis 
            type="number" 
            dataKey="complexity" 
            name="Complexity" 
            domain={[-5, 5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            label={{ value: 'Simple ← Subtle → Complex', angle: -90, position: 'insideLeft', offset: -5, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const description = getFlavorDescription(data.sweetness, data.complexity);
                return (
                  <div className="bg-card p-3 border rounded-lg shadow-lg max-w-xs">
                    <p className="font-semibold mb-1">{data.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Complexity: {data.complexity} | Sweetness: {data.sweetness}
                    </p>
                    <p className="text-xs italic">{description}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          <Scatter name="Kuah" data={data.filter(d => d.type === "kuah")} fill="hsl(var(--primary))">
            {data.filter(d => d.type === "kuah").map((entry, index) => (
              <Cell key={`kuah-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Scatter>
          <Scatter name="Goreng" data={data.filter(d => d.type === "goreng")} fill="hsl(var(--secondary))">
            {data.filter(d => d.type === "goreng").map((entry, index) => (
              <Cell key={`goreng-${index}`} fill="hsl(var(--secondary))" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {showDescription && data.length === 1 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Karakteristik Rasa</h4>
          <p className="text-sm text-muted-foreground italic">
            {getFlavorDescription(data[0].sweetness, data[0].complexity)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PerceptualMap;
