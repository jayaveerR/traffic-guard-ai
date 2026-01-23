import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Target,
  BarChart3,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  hourlyAccidentData,
  monthlyAccidentData,
  peakHourTrendData,
  highRiskTimeSlots,
} from "@/lib/dummy-data";
import { usePrediction } from "@/context/PredictionContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export default function Dashboard() {
  const { latestPrediction, predictionHistory } = usePrediction();

  // Calculate stats based on latest prediction or defaults
  const totalAccidents = latestPrediction 
    ? latestPrediction.predictedCount 
    : 1823;
  
  const highRiskHours = latestPrediction?.riskLevel === "high" 
    ? 4 
    : latestPrediction?.riskLevel === "medium" 
      ? 2 
      : 1;
  
  const peakTime = latestPrediction?.time || "5:30 PM";
  const accuracy = latestPrediction?.confidence || 91.2;

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                {latestPrediction 
                  ? `Showing prediction for ${latestPrediction.location?.name || "selected location"}`
                  : "Real-time traffic accident insights and predictions"}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Prediction Banner */}
        {latestPrediction && (
          <Card className={cn(
            "mb-6 shadow-card border-l-4 animate-fade-in",
            {
              "border-l-success bg-success/5": latestPrediction.riskLevel === "low",
              "border-l-warning bg-warning/5": latestPrediction.riskLevel === "medium",
              "border-l-danger bg-danger/5": latestPrediction.riskLevel === "high",
            }
          )}>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    {
                      "bg-success/10": latestPrediction.riskLevel === "low",
                      "bg-warning/10": latestPrediction.riskLevel === "medium",
                      "bg-danger/10": latestPrediction.riskLevel === "high",
                    }
                  )}>
                    <MapPin className={cn("h-6 w-6", {
                      "text-success": latestPrediction.riskLevel === "low",
                      "text-warning": latestPrediction.riskLevel === "medium",
                      "text-danger": latestPrediction.riskLevel === "high",
                    })} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latest Prediction</p>
                    <p className="font-semibold text-foreground">
                      {latestPrediction.location?.name || "Custom Location"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{latestPrediction.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{latestPrediction.time}</span>
                </div>
                <RiskBadge level={latestPrediction.riskLevel} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={latestPrediction ? "Predicted Accidents" : "Total Accidents (YTD)"}
            value={totalAccidents.toLocaleString()}
            subtitle={latestPrediction ? `For ${latestPrediction.location?.name || "location"}` : "This year"}
            icon={AlertTriangle}
            trend={latestPrediction ? undefined : { value: 12, positive: false }}
            variant={latestPrediction?.riskLevel === "high" ? "danger" : latestPrediction?.riskLevel === "medium" ? "warning" : "danger"}
          />
          <StatCard
            title="High Risk Hours"
            value={highRiskHours.toString()}
            subtitle={latestPrediction ? "Based on prediction" : "Identified daily"}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Peak Accident Time"
            value={peakTime}
            subtitle={latestPrediction ? "Selected time" : "Evening rush"}
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="Prediction Accuracy"
            value={`${accuracy}%`}
            subtitle="Model performance"
            icon={Target}
            trend={latestPrediction ? undefined : { value: 3.2, positive: true }}
            variant="success"
          />
        </div>

        {/* Prediction History */}
        {predictionHistory.length > 1 && (
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictionHistory.slice(0, 5).map((pred, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={cn("h-4 w-4", {
                        "text-success": pred.riskLevel === "low",
                        "text-warning": pred.riskLevel === "medium",
                        "text-danger": pred.riskLevel === "high",
                      })} />
                      <div>
                        <p className="font-medium text-sm">{pred.location?.name || "Custom Location"}</p>
                        <p className="text-xs text-muted-foreground">{pred.date} at {pred.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{pred.predictedCount} accidents</span>
                      <RiskBadge level={pred.riskLevel} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Accidents per Hour */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Accidents per Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyAccidentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      interval={1}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar
                      dataKey="accidents"
                      fill="hsl(var(--chart-primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Peak Hour Trend */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Peak Hour Trend by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={peakHourTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="morning"
                      name="Morning Peak"
                      stroke="hsl(var(--chart-warning))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-warning))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="evening"
                      name="Evening Peak"
                      stroke="hsl(var(--chart-danger))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-danger))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Area Chart */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Accident Trend (Actual vs Predicted)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyAccidentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accidents"
                    name="Actual"
                    stroke="hsl(var(--chart-secondary))"
                    fill="hsl(var(--chart-secondary) / 0.2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted"
                    stroke="hsl(var(--chart-primary))"
                    fill="hsl(var(--chart-primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Time Slots */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">High Risk Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highRiskTimeSlots.map((slot, index) => (
                <div
                  key={slot.time}
                  className="bg-muted/50 rounded-lg p-4 border border-border animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <RiskBadge level={slot.risk} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">{slot.time}</p>
                  <p className="text-sm text-muted-foreground">
                    Avg. {slot.avgAccidents} accidents/day
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
