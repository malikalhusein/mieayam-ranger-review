import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Star, 
  Award, 
  AlertTriangle,
  Utensils
} from "lucide-react";

interface Review {
  id: string;
  outlet_name: string;
  city: string;
  overall_score: number | null;
  product_type: string;
  price: number;
  editor_choice?: boolean;
  take_it_or_leave_it?: boolean;
  created_at: string;
}

interface AdminStatsDashboardProps {
  reviews: Review[];
}

const AdminStatsDashboard = ({ reviews }: AdminStatsDashboardProps) => {
  const stats = useMemo(() => {
    if (!reviews.length) return null;

    // Total reviews
    const totalReviews = reviews.length;

    // Average score
    const validScores = reviews.filter(r => r.overall_score !== null);
    const avgScore = validScores.length > 0 
      ? validScores.reduce((sum, r) => sum + (r.overall_score || 0), 0) / validScores.length 
      : 0;

    // City distribution
    const cityDistribution = reviews.reduce((acc, r) => {
      acc[r.city] = (acc[r.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedCities = Object.entries(cityDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    // Price statistics
    const prices = reviews.map(r => r.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Price distribution by range
    const priceRanges = {
      "< Rp8K": reviews.filter(r => r.price < 8000).length,
      "Rp8K-10K": reviews.filter(r => r.price >= 8000 && r.price <= 10000).length,
      "Rp10K-12K": reviews.filter(r => r.price > 10000 && r.price <= 12000).length,
      "Rp12K-15K": reviews.filter(r => r.price > 12000 && r.price <= 15000).length,
      "> Rp15K": reviews.filter(r => r.price > 15000).length,
    };

    // Type distribution
    const typeDistribution = {
      kuah: reviews.filter(r => r.product_type === "kuah").length,
      goreng: reviews.filter(r => r.product_type === "goreng").length,
    };

    // Editor badges count
    const editorChoiceCount = reviews.filter(r => r.editor_choice).length;
    const takeItOrLeaveItCount = reviews.filter(r => r.take_it_or_leave_it).length;

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = reviews.filter(r => {
        const reviewDate = new Date(r.created_at);
        return reviewDate >= date && reviewDate <= monthEnd;
      }).length;
      return {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        count,
      };
    });

    // Score distribution
    const scoreRanges = {
      "0-4": reviews.filter(r => (r.overall_score || 0) < 4).length,
      "4-6": reviews.filter(r => (r.overall_score || 0) >= 4 && (r.overall_score || 0) < 6).length,
      "6-7": reviews.filter(r => (r.overall_score || 0) >= 6 && (r.overall_score || 0) < 7).length,
      "7-8": reviews.filter(r => (r.overall_score || 0) >= 7 && (r.overall_score || 0) < 8).length,
      "8-9": reviews.filter(r => (r.overall_score || 0) >= 8 && (r.overall_score || 0) < 9).length,
      "9-10": reviews.filter(r => (r.overall_score || 0) >= 9).length,
    };

    return {
      totalReviews,
      avgScore,
      cityDistribution: sortedCities,
      avgPrice,
      minPrice,
      maxPrice,
      priceRanges,
      typeDistribution,
      editorChoiceCount,
      takeItOrLeaveItCount,
      monthlyTrend,
      scoreRanges,
    };
  }, [reviews]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Belum ada data review untuk ditampilkan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Review</CardTitle>
            <Utensils className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.avgScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">dari 10</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Harga</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp{stats.avgPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Rp{stats.minPrice.toLocaleString('id-ID')} - Rp{stats.maxPrice.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kota</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(stats.cityDistribution).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Badges & Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribusi Tipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🍜</span>
                <span className="text-sm font-medium">Kuah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(stats.typeDistribution.kuah / stats.totalReviews) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right">{stats.typeDistribution.kuah}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🍝</span>
                <span className="text-sm font-medium">Goreng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${(stats.typeDistribution.goreng / stats.totalReviews) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right">{stats.typeDistribution.goreng}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Badges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badge Spesial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Editor's Choice</span>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats.editorChoiceCount}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Take It or Leave It</span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {stats.takeItOrLeaveItCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trend Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-16 gap-1">
              {stats.monthlyTrend.map((month, index) => {
                const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count), 1);
                const height = (month.count / maxCount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${month.count} review`}
                    />
                    <span className="text-[10px] text-muted-foreground">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distribusi Kota (Top 6)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.cityDistribution.map(([city, count], index) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground w-4">{index + 1}</span>
                  <span className="text-sm font-medium">{city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Price & Score Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Distribusi Harga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.priceRanges).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm font-medium">{range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Distribusi Skor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(stats.scoreRanges).map(([range, count]) => (
              <div key={range} className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-yellow-500/80 rounded-t transition-all hover:bg-yellow-500"
                    style={{ 
                      height: `${Math.max((count / stats.totalReviews) * 150, 8)}px`,
                      minHeight: '8px' 
                    }}
                  />
                  <span className="text-xs font-bold">{count}</span>
                  <span className="text-[10px] text-muted-foreground">{range}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsDashboard;
