import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface DataPoint {
  name: string;
  complexity: number;
  sweetness: number;
  type: "kuah" | "goreng";
}

interface PerceptualMapProps {
  data: DataPoint[];
}

const PerceptualMap = ({ data }: PerceptualMapProps) => {
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
            domain={[0, 8]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
            label={{ value: 'Simple ← Subtle → Complex', position: 'insideBottom', offset: -10, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <YAxis 
            type="number" 
            dataKey="sweetness" 
            name="Sweetness" 
            domain={[0, 8]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
            label={{ value: 'Salty ← Savory → Sweet', angle: -90, position: 'insideLeft', offset: -5, fill: "hsl(var(--foreground))", fontSize: 12 }}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">Complexity: {data.complexity}</p>
                    <p className="text-sm">Sweetness: {data.sweetness}</p>
                    <p className="text-sm capitalize">Type: {data.type}</p>
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
    </div>
  );
};

export default PerceptualMap;
