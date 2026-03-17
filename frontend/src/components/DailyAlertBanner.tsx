import { useState, useEffect } from "react";
import { AlertTriangle, X, Sparkles, Clock, TrendingUp, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";

interface StateAlert {
  rank: number;
  state: string;
  city: string;
  daily_total: number;
  peak_predicted: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  peak_hour: string;
  day: string;
}

interface StateAlertsResponse {
  top5_states: StateAlert[];
  day: string;
}

const RANK_EMOJI = ["🥇", "🥈", "🥉", "#4", "#5"];

const RISK_STYLE = {
  high: { bg: "bg-red-800/60", scoreTxt: "text-yellow-200", border: "border-red-500/40" },
  medium: { bg: "bg-orange-700/50", scoreTxt: "text-orange-100", border: "border-orange-500/40" },
  low: { bg: "bg-white/10", scoreTxt: "text-white/80", border: "border-white/20" },
};

export function DailyAlertBanner() {
  const [top5, setTop5] = useState<StateAlert[]>([]);
  const [dayLabel, setDayLabel] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPeakHour, setIsPeakHour] = useState(false);

  const fetchStateAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/state-alerts`);
      if (!res.ok) throw new Error("bad response");
      const data: StateAlertsResponse = await res.json();
      setTop5(data.top5_states);
      setDayLabel(data.day);
      const h = new Date().getHours();
      setIsPeakHour((h >= 7 && h <= 9) || (h >= 17 && h <= 20));
      setTimeout(() => setIsVisible(true), 400);
    } catch {
      // Fallback if backend unavailable
      const now = new Date();
      setDayLabel(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
      const h = now.getHours();
      setIsPeakHour((h >= 7 && h <= 9) || (h >= 17 && h <= 20));
      setTimeout(() => setIsVisible(true), 400);
    }
  };

  useEffect(() => {
    fetchStateAlerts();
    const interval = setInterval(fetchStateAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  const highCount = top5.filter(s => s.risk_level === "high").length;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out",
        isClosing ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 shadow-xl">
        <div className="container py-3 px-4">
          <div className="flex items-start gap-3">

            {/* Pulsing AI icon */}
            <div className="flex-shrink-0 flex items-center gap-2 mt-1">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* Header pills */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                  <Clock className="h-3 w-3" />
                  AI Daily Risk Alert · {dayLabel}
                </span>
                {isPeakHour && (
                  <span className="inline-flex items-center gap-1 bg-red-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                    🚨 PEAK HOUR ACTIVE
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-red-900/50 rounded-full px-2.5 py-0.5 text-xs font-semibold text-yellow-200">
                    ⚠️ {highCount} HIGH-RISK {highCount === 1 ? "STATE" : "STATES"}
                  </span>
                )}
              </div>

              {/* Headline */}
              {top5.length > 0 ? (
                <p className="text-white font-semibold text-sm mb-2">
                  🗺️ ML model identified the <strong>Top 5 most dangerous Indian states</strong> today — each state's peak risk hour shown below:
                </p>
              ) : (
                <p className="text-white font-semibold text-sm mb-2">
                  {isPeakHour
                    ? "🚨 Peak hour active — exercise extra caution on roads!"
                    : "⚠️ Stay alert on roads today. Drive safely."}
                </p>
              )}

              {/* ── TOP 5 STATES GRID ── */}
              {top5.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
                  {top5.map((s, idx) => {
                    const style = RISK_STYLE[s.risk_level] ?? RISK_STYLE.low;
                    return (
                      <div
                        key={s.state}
                        className={cn(
                          "flex flex-col items-center rounded-lg px-2 py-2 border text-center",
                          style.bg,
                          style.border,
                          s.risk_level === "high" && "animate-[pulse_3s_ease-in-out_infinite]"
                        )}
                      >
                        {/* Rank */}
                        <span className="text-base font-bold text-white leading-none mb-0.5">
                          {RANK_EMOJI[idx]}
                        </span>

                        {/* State name */}
                        <span className="text-white font-bold text-xs leading-tight text-center">
                          {s.state}
                        </span>

                        {/* City */}
                        <span className="text-white/60 text-[10px] flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-2 w-2" />
                          {s.city}
                        </span>

                        {/* Risk bar */}
                        <div className="w-full h-1 rounded-full bg-white/20 mt-1.5 mb-1 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white/90 transition-all duration-700"
                            style={{ width: `${Math.min(s.risk_score, 100)}%` }}
                          />
                        </div>

                        {/* Accident count */}
                        <span className={cn("text-xs font-bold tabular-nums", style.scoreTxt)}>
                          {s.daily_total.toFixed(0)} / day
                        </span>
                        <span className="text-white/60 text-[10px] capitalize mt-0.5">
                          peak {s.peak_hour} · {s.risk_score.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer link */}
              <Link
                to="/alerts"
                className="inline-flex items-center gap-1 text-white/90 hover:text-white text-xs underline underline-offset-2 transition-colors"
              >
                <TrendingUp className="h-3 w-3" />
                View full 24-hour ML forecast & hourly breakdown
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors mt-0.5"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4 text-white" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
