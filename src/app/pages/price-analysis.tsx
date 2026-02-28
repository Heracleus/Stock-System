import { useState } from "react";
import { useData } from "../context/data-context";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Badge } from "../components/ui/badge";

export function PriceAnalysis() {
  const { priceHistory, products } = useData();
  const [selectedCrop, setSelectedCrop] = useState<string>("ข้าวหอมมะลิ");

  // Get available crops from price history
  const availableCrops = priceHistory.length > 0
    ? Object.keys(priceHistory[0]).filter((key) => key !== "date")
    : [];

  // Calculate price statistics for selected crop
  const getPriceStats = (cropName: string) => {
    const prices = priceHistory.map((h) => h[cropName] as number);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(1);

    return {
      currentPrice,
      previousPrice,
      avgPrice,
      maxPrice,
      minPrice,
      priceChange,
      priceChangePercent,
    };
  };

  const stats = selectedCrop ? getPriceStats(selectedCrop) : null;

  // Best month to sell (highest price)
  const getBestMonthToSell = (cropName: string) => {
    const prices = priceHistory.map((h) => ({
      month: h.date,
      price: h[cropName] as number,
    }));
    const bestMonth = prices.reduce((best, current) =>
      current.price > best.price ? current : best
    );
    return bestMonth;
  };

  const bestMonth = selectedCrop ? getBestMonthToSell(selectedCrop) : null;

  // Recommendations based on price trends
  const getRecommendations = (cropName: string) => {
    const stats = getPriceStats(cropName);
    const recommendations = [];

    if (stats.currentPrice > stats.avgPrice * 1.1) {
      recommendations.push({
        type: "success",
        message: "ราคาสูงกว่าค่าเฉลี่ย - เหมาะสำหรับการขาย",
        icon: TrendingUp,
      });
    }

    if (stats.currentPrice === stats.maxPrice) {
      recommendations.push({
        type: "success",
        message: "ราคาอยู่ในจุดสูงสุด - แนะนำให้ขายเดี๋ยวนี้",
        icon: DollarSign,
      });
    }

    if (stats.priceChange < 0) {
      recommendations.push({
        type: "warning",
        message: "ราคากำลังลดลง - ควรรอจังหวะที่เหมาะสม",
        icon: TrendingDown,
      });
    }

    if (stats.currentPrice < stats.avgPrice * 0.9) {
      recommendations.push({
        type: "info",
        message: "ราคาต่ำกว่าค่าเฉลี่ย - เหมาะสำหรับเก็บสต็อก",
        icon: Lightbulb,
      });
    }

    return recommendations;
  };

  const recommendations = selectedCrop ? getRecommendations(selectedCrop) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          วิเคราะห์ราคาและแนวโน้ม
        </h2>
        <p className="text-gray-600 mt-1">
          ติดตามและวิเคราะห์ราคาผลผลิตเพื่อการตัดสินใจที่ดีขึ้น
        </p>
      </div>

      {/* Crop Selector */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">เลือกพืชผล:</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="เลือกพืชผล" />
            </SelectTrigger>
            <SelectContent>
              {availableCrops.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Price Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-700">ราคาปัจจุบัน</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ฿{stats.currentPrice}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {stats.priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm ${
                  stats.priceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.priceChangePercent}% จากเดือนที่แล้ว
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-700 mb-2">ราคาเฉลี่ย</h3>
            <p className="text-3xl font-bold text-blue-600">
              ฿{stats.avgPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-2">จาก 6 เดือนที่ผ่านมา</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-700 mb-2">ราคาสูงสุด</h3>
            <p className="text-3xl font-bold text-orange-600">
              ฿{stats.maxPrice}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              สูงกว่าปัจจุบัน ฿{stats.maxPrice - stats.currentPrice}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-700 mb-2">ราคาต่ำสุด</h3>
            <p className="text-3xl font-bold text-purple-600">
              ฿{stats.minPrice}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ต่ำกว่าปัจจุบัน ฿{stats.currentPrice - stats.minPrice}
            </p>
          </Card>
        </div>
      )}

      {/* Price Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          แนวโน้มราคา 6 เดือนย้อนหลัง
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {availableCrops.map((crop, index) => {
              const colors = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];
              return (
                <Line
                  key={crop}
                  type="monotone"
                  dataKey={crop}
                  stroke={colors[index % colors.length]}
                  strokeWidth={crop === selectedCrop ? 3 : 2}
                  opacity={crop === selectedCrop ? 1 : 0.3}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Comparison Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          เปรียบเทียบราคาเฉลี่ยทุกพืชผล
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={availableCrops.map((crop) => ({
              name: crop,
              avgPrice: getPriceStats(crop).avgPrice,
              currentPrice: getPriceStats(crop).currentPrice,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgPrice" fill="#94a3b8" name="ราคาเฉลี่ย" />
            <Bar dataKey="currentPrice" fill="#10b981" name="ราคาปัจจุบัน" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">
              คำแนะนำสำหรับ {selectedCrop}
            </h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const bgColor =
                rec.type === "success"
                  ? "bg-green-50 border-green-200"
                  : rec.type === "warning"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-blue-50 border-blue-200";
              const textColor =
                rec.type === "success"
                  ? "text-green-800"
                  : rec.type === "warning"
                  ? "text-amber-800"
                  : "text-blue-800";

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 border rounded-lg ${bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${textColor}`} />
                  <p className={`${textColor} font-medium`}>{rec.message}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Best Time to Sell */}
      {bestMonth && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">ช่วงเวลาที่ราคาดีที่สุด</h3>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-semibold">{selectedCrop}</span> มีราคาสูงสุดในเดือน{" "}
              <span className="font-bold text-green-700">{bestMonth.month}</span>{" "}
              ที่ราคา{" "}
              <span className="font-bold text-green-700">
                ฿{bestMonth.price}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              💡 วางแผนการเก็บเกี่ยวให้ตรงกับช่วงนี้เพื่อรายได้สูงสุด
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
