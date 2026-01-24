import { useState, useEffect } from "react";
import { AlertTriangle, X, Sparkles, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertData {
  alert: string;
  date: string;
  day: string;
  totalAccidents?: number;
  topState?: string;
  topStateAccidents?: number;
  highRiskStates?: string[];
  isPeakHour?: boolean;
}

export function DailyAlertBanner() {
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const fetchAlert = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-alert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallbackAlert) {
          setAlertData({ 
            alert: errorData.fallbackAlert, 
            date: new Date().toLocaleDateString(), 
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
          });
          if (isInitial) setIsVisible(true);
        }
        return;
      }

      const data = await response.json();
      setAlertData(data);
      
      if (isInitial) {
        setTimeout(() => setIsVisible(true), 500);
      }
    } catch (error) {
      console.error("Failed to fetch daily alert:", error);
      const now = new Date();
      setAlertData({
        alert: `⚠️ ${now.toLocaleDateString('en-US', { weekday: 'long' })}: Stay alert on Indian roads. Peak hour traffic requires extra caution.`,
        date: now.toLocaleDateString(),
        day: now.toLocaleDateString('en-US', { weekday: 'long' })
      });
      if (isInitial) setTimeout(() => setIsVisible(true), 500);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAlert(true);
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlert(false);
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || !alertData) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out",
        isClosing ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg">
        <div className="container py-3 px-4">
          <div className="flex items-start gap-3">
            {/* AI Icon with pulse */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            </div>

            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                  <Clock className="h-3 w-3" />
                  AI Daily Alert
                </span>
                {alertData.isPeakHour && (
                  <span className="inline-flex items-center gap-1 bg-red-600/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-white animate-pulse">
                    🚨 PEAK HOUR
                  </span>
                )}
              </div>
              
              <p className="text-white font-medium text-sm md:text-base leading-relaxed">
                {alertData.alert}
              </p>

              {/* Additional info row */}
              {alertData.topState && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-white/90 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Highest Risk: {alertData.topState}
                  </span>
                  {alertData.totalAccidents && (
                    <span className="inline-flex items-center gap-1">
                      📊 {alertData.totalAccidents} predicted incidents
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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
