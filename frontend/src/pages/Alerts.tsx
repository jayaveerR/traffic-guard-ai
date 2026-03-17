import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Clock,
    TrendingUp,
    Shield,
    RefreshCw,
    Zap,
    Info,
    CheckCircle2,
    XCircle,
    BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { API_BASE_URL } from "@/config";

interface AlertEntry {
    hour: number;
    label: string;
    predicted_count: number;
    risk_score: number;
    risk_level: "low" | "medium" | "high";
    factors: string[];
    day: string;
    date: string;
    is_current_hour: boolean;
}

interface AlertsResponse {
    alerts: AlertEntry[];
    timeline: AlertEntry[];
    generated_at: string;
    day: string;
    model: string;
}

const RISK_CONFIG = {
    high: {
        bg: "bg-danger/10",
        border: "border-danger/40",
        badge: "bg-danger/15 text-danger border-danger/30",
        iconColor: "text-danger",
        barColor: "hsl(var(--danger))",
        label: "High Risk",
        Icon: XCircle,
    },
    medium: {
        bg: "bg-warning/10",
        border: "border-warning/40",
        badge: "bg-warning/15 text-warning border-warning/30",
        iconColor: "text-warning",
        barColor: "hsl(var(--warning))",
        label: "Medium Risk",
        Icon: AlertTriangle,
    },
    low: {
        bg: "bg-success/10",
        border: "border-success/40",
        badge: "bg-success/15 text-success border-success/30",
        iconColor: "text-success",
        barColor: "hsl(var(--success))",
        label: "Low Risk",
        Icon: CheckCircle2,
    },
};

const chartTooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
};

export default function Alerts() {
    const [data, setData] = useState<AlertsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchAlerts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/alerts`);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const json = await res.json();
            setData(json);
            setLastRefresh(new Date());
        } catch (e: any) {
            setError(e.message || "Failed to fetch alerts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const highRiskAlerts = data?.alerts.filter((a) => a.risk_level === "high") ?? [];
    const mediumRiskAlerts = data?.alerts.filter((a) => a.risk_level === "medium") ?? [];
    const currentHour = data?.timeline.find((a) => a.is_current_hour);

    return (
        <div className="py-8 md:py-12">
            <div className="container">

                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-danger" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-display">Live Risk Alerts</h1>
                            <p className="text-muted-foreground">
                                ML-predicted high-risk time slots for today —{" "}
                                <span className="text-foreground font-medium">{data?.day}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchAlerts}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                        {lastRefresh && (
                            <p className="text-xs text-muted-foreground">
                                Updated {lastRefresh.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30 mb-6 text-danger">
                        <XCircle className="h-5 w-5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Could not load alerts</p>
                            <p className="text-sm opacity-80">{error} — Is the backend running?</p>
                        </div>
                    </div>
                )}

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 rounded-xl bg-muted" />
                        ))}
                    </div>
                )}

                {!isLoading && data && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Card className="shadow-card border-danger/20">
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-danger/10 flex items-center justify-center">
                                            <XCircle className="h-5 w-5 text-danger" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">High Risk Hours</p>
                                            <p className="text-2xl font-bold text-danger">{highRiskAlerts.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-card border-warning/20">
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Medium Risk Hours</p>
                                            <p className="text-2xl font-bold text-warning">{mediumRiskAlerts.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-card">
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Current Hour Risk</p>
                                            <p className={cn("text-2xl font-bold capitalize", {
                                                "text-danger": currentHour?.risk_level === "high",
                                                "text-warning": currentHour?.risk_level === "medium",
                                                "text-success": currentHour?.risk_level === "low",
                                            })}>
                                                {currentHour?.risk_level ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-card">
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Safe Hours Today</p>
                                            <p className="text-2xl font-bold text-success">
                                                {data.timeline.filter((a) => a.risk_level === "low").length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 24-Hour Risk Timeline Chart */}
                        <Card className="shadow-card mb-8">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">24-Hour Accident Risk Timeline</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ML model prediction across all hours of today · <span className="text-primary">{data.model}</span>
                                    </p>
                                </div>
                                <Badge variant="outline" className="gap-1">
                                    <Zap className="h-3 w-3 text-warning" />
                                    Live Today
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.timeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                                                interval={2}
                                            />
                                            <YAxis
                                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                                label={{ value: "Risk %", angle: -90, position: "insideLeft", offset: 20, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                                            />
                                            <Tooltip
                                                contentStyle={chartTooltipStyle}
                                                formatter={(value: number) => [`${value.toFixed(1)}%`, "Risk Score"]}
                                                labelFormatter={(label) => `Time: ${label}`}
                                            />
                                            <ReferenceLine y={70} stroke="hsl(var(--danger))" strokeDasharray="4 4" label={{ value: "High Risk", fill: "hsl(var(--danger))", fontSize: 10 }} />
                                            <ReferenceLine y={30} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "Med Risk", fill: "hsl(var(--warning))", fontSize: 10 }} />
                                            {/* Current hour indicator */}
                                            {currentHour && (
                                                <ReferenceLine
                                                    x={currentHour.label}
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={2}
                                                    label={{ value: "Now", fill: "hsl(var(--primary))", fontSize: 10 }}
                                                />
                                            )}
                                            <Area
                                                type="monotone"
                                                dataKey="risk_score"
                                                stroke="hsl(var(--danger))"
                                                fill="url(#riskGradient)"
                                                strokeWidth={2.5}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    if (payload.risk_level === "high") {
                                                        return <circle key={`dot-${payload.hour}`} cx={cx} cy={cy} r={5} fill="hsl(var(--danger))" stroke="white" strokeWidth={1.5} />;
                                                    }
                                                    return <circle key={`dot-${payload.hour}`} cx={cx} cy={cy} r={3} fill="hsl(var(--danger))" opacity={0.4} />;
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Alert Cards */}
                        <div className="mb-4 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <h2 className="font-semibold text-lg">Top Risk Periods Today</h2>
                            <Badge variant="secondary" className="ml-auto text-xs">
                                Ranked by ML prediction score
                            </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {data.alerts.map((alert, idx) => {
                                const cfg = RISK_CONFIG[alert.risk_level] ?? RISK_CONFIG.low;
                                const RiskIcon = cfg.Icon;
                                return (
                                    <div
                                        key={alert.hour}
                                        className={cn(
                                            "relative rounded-xl border p-5 transition-all hover:shadow-md",
                                            cfg.bg,
                                            cfg.border,
                                            alert.is_current_hour && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        )}
                                    >
                                        {/* Rank badge */}
                                        <div className="absolute -top-2.5 -left-2.5 h-6 w-6 rounded-full bg-card border border-border text-xs font-bold flex items-center justify-center shadow-sm">
                                            {idx + 1}
                                        </div>

                                        {alert.is_current_hour && (
                                            <div className="absolute -top-2.5 right-4">
                                                <Badge className="bg-primary text-primary-foreground text-xs gap-1 px-2 py-0.5">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-foreground" />
                                                    </span>
                                                    Current Hour
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={cn("h-11 w-11 rounded-lg bg-card/80 flex items-center justify-center shrink-0", cfg.iconColor)}>
                                                <RiskIcon className="h-6 w-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-bold text-lg">{alert.label}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("text-xs px-2 py-0", cfg.badge)}
                                                    >
                                                        {cfg.label}
                                                    </Badge>
                                                </div>

                                                {/* Risk Bar */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all",
                                                                {
                                                                    "bg-danger": alert.risk_level === "high",
                                                                    "bg-warning": alert.risk_level === "medium",
                                                                    "bg-success": alert.risk_level === "low",
                                                                }
                                                            )}
                                                            style={{ width: `${alert.risk_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold tabular-nums w-10 text-right">
                                                        {alert.risk_score.toFixed(0)}%
                                                    </span>
                                                </div>

                                                {/* Stats row */}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                        ~{alert.predicted_count.toFixed(1)} predicted accidents
                                                    </span>
                                                </div>

                                                {/* Factors */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {alert.factors.map((factor) => (
                                                        <span
                                                            key={factor}
                                                            className="inline-flex items-center gap-1 text-xs bg-card/70 border border-border rounded-full px-2 py-0.5"
                                                        >
                                                            <Info className="h-2.5 w-2.5 text-muted-foreground" />
                                                            {factor}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Model info footer */}
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/40 border border-border/60 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 text-primary shrink-0" />
                            <p>
                                Alerts are generated in real-time by the <strong className="text-foreground">{data.model}</strong> trained
                                on historical crash data. Predictions reflect accident probability for each time slot based on today's date
                                and day-of-week patterns. Generated at {new Date(data.generated_at).toLocaleString()}.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
