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

const getFlavorDescription = (complexity: number, sweetness: number): string => {
  // Determine complexity category
  let complexityCategory: 'simple' | 'subtle' | 'complex';
  if (complexity >= -5 && complexity <= -2) complexityCategory = 'simple';
  else if (complexity >= -1 && complexity <= 1) complexityCategory = 'subtle';
  else complexityCategory = 'complex';

  // Determine taste category
  let tasteCategory: 'salty' | 'savory' | 'sweet';
  if (sweetness >= -5 && sweetness <= -2) tasteCategory = 'salty';
  else if (sweetness >= -1 && sweetness <= 1) tasteCategory = 'savory';
  else tasteCategory = 'sweet';

  // Return description based on matrix
  const descriptions = {
    simple: {
      salty: "Rasa asin-gurih yang langsung nendang tanpa banyak lapisan rasa; mirip mie ayam pinggir jalan yang kuahnya kuat tapi sederhana.",
      savory: "Gurih ringan tanpa aftertaste panjang, rasanya bersih dan simple.",
      sweet: "Manis langsung terasa dari kecap atau bumbu dasar, cenderung simple dan mudah dikenali."
    },
    subtle: {
      salty: "Asin yang pas dan gurih lembut, kaldu ayam terasa tapi nggak berlebihan.",
      savory: "Gurih seimbang — kombinasi kaldu ayam, bawang, dan minyak yang harmonis banget, khas mie ayam rumahan.",
      sweet: "Manis-gurih yang lembut, rasa kecap berpadu halus sama kaldu ayam — khas mie ayam Jawa."
    },
    complex: {
      salty: "Asin berlapis dengan sentuhan kecap asin dan aroma rempah; mirip mie ayam oriental yang lebih berkarakter.",
      savory: "Gurihnya berlapis dan dalem; ada aroma minyak wijen, jamur, dan rempah yang bikin rasanya makin kaya.",
      sweet: "Rasa manis yang kompleks dan kaya — ada kecap manis, kaldu pekat, bawang goreng, dan rempah yang muncul bergantian di setiap suapan."
    }
  };

  return descriptions[complexityCategory][tasteCategory];
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
            dataKey="complexity" 
            name="Complexity" 
            domain={[-5, 5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            label={{ value: 'Simple ← Subtle → Complex', position: 'insideBottom', offset: -10, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <YAxis 
            type="number" 
            dataKey="sweetness" 
            name="Sweetness" 
            domain={[-5, 5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
            label={{ value: 'Salty ← Savory → Sweet', angle: -90, position: 'insideLeft', offset: -5, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const description = getFlavorDescription(data.complexity, data.sweetness);
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
            {getFlavorDescription(data[0].complexity, data[0].sweetness)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PerceptualMap;
