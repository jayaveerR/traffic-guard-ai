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
import { usePrediction } from "@/context/PredictionContext";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
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
import { useEffect } from "react";

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

const RISK_COLORS = {
  low: "hsl(var(--success))",
  medium: "hsl(var(--warning))",
  high: "hsl(var(--danger))",
};

export default function Dashboard() {
  const { latestPrediction, predictionHistory, fetchHistory } = usePrediction();
  const { session, signOut } = useAuth();

  useEffect(() => {
    const loadHistory = async () => {
      if (session?.access_token) {
        const status = await fetchHistory(session.access_token);
        if (status === 401) {
          signOut();
        }
      }
    };
    loadHistory();
  }, [session]);

  // Effective history: always includes latestPrediction so charts work right after first prediction
  const effectiveHistory = useMemo(() => {
    if (!latestPrediction) return predictionHistory;
    // prepend latestPrediction if not already first item
    const first = predictionHistory[0];
    if (first && first.date === latestPrediction.date && first.time === latestPrediction.time) {
      return predictionHistory;
    }
    return [latestPrediction, ...predictionHistory];
  }, [latestPrediction, predictionHistory]);

  // 1. Predictions per day (Line Chart)
  const predictionsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    effectiveHistory.forEach(p => {
      if (!p.date) return;
      days[p.date] = (days[p.date] || 0) + 1;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count })).slice(-7);
  }, [effectiveHistory]);

  // 2. Risk distribution (Pie chart)
  const riskDistribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    effectiveHistory.forEach(p => {
      if (p.riskLevel && p.riskLevel in counts) counts[p.riskLevel as keyof typeof counts]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [effectiveHistory]);

  // 3. Most dangerous locations (Bar chart)
  const dangerousLocations = useMemo(() => {
    const locs: Record<string, number> = {};
    effectiveHistory
      .filter(p => p.riskLevel === "high" || p.riskLevel === "medium")
      .forEach(p => {
        const name = p.location?.name || "Unknown";
        locs[name] = (locs[name] || 0) + 1;
      });
    return Object.entries(locs).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);
  }, [effectiveHistory]);

  // 4. Peak accident hours (Area chart)
  const peakHoursData = useMemo(() => {
    const hours: Record<string, number> = {};
    effectiveHistory.forEach(p => {
      if (!p.time) return;
      const hour = p.time.split(":")[0];
      hours[hour] = (hours[hour] || 0) + (p.predictedCount || 1);
    });
    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [effectiveHistory]);

  const totalPredictions = effectiveHistory.length;
  const highRiskCount = effectiveHistory.filter(p => p.riskLevel === "high").length;
  const avgConfidence = effectiveHistory.length > 0
    ? Math.round(effectiveHistory.reduce((acc, p) => acc + (p.confidence || 0), 0) / effectiveHistory.length)
    : 0;

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* User Profile Section */}
        {session?.user && (
          <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {session.user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {session.user.email?.split('@')[0]}'s Analytics
              </p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Searches</p>
              <p className="text-lg font-bold text-primary">{totalPredictions}</p>
            </div>
          </div>
        )}

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
            title="Total Predictions"
            value={totalPredictions.toString()}
            subtitle="Your search history"
            icon={Target}
            variant="default"
          />
          <StatCard
            title="High Risks Found"
            value={highRiskCount.toString()}
            subtitle="Dangerous conditions"
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title="Last Search Location"
            value={latestPrediction?.location?.name || "N/A"}
            subtitle={latestPrediction?.time || "No recent search"}
            icon={MapPin}
            variant="default"
          />
          <StatCard
            title="Average Confidence"
            value={`${avgConfidence}%`}
            subtitle="Model stability"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Prediction History */}
        {effectiveHistory.length > 1 && (
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {effectiveHistory.slice(0, 5).map((pred, index) => (
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

        {/* Charts Grid - Predictions & Risks */}
        {effectiveHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-muted/20 mb-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No prediction data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Go to the <span className="text-primary font-medium">AI Prediction</span> page, run a prediction, and your charts will appear here.</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Predictions per Day */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Predictions Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {predictionsByDay.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictionsByDay}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {riskDistribution.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {riskDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid - Locations & Hours */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Dangerous Locations */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Most Dangerous Locations (High & Medium Risk)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {dangerousLocations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                        <MapPin className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">No high/medium risk locations yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dangerousLocations} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="count" fill="hsl(var(--danger))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Peak Accident Hours */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Peak Accident Probability by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {peakHoursData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                        <Clock className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">No hourly data yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={peakHoursData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Area type="monotone" dataKey="count" stroke="hsl(var(--warning))" fill="hsl(var(--warning)/0.2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
