import { useState, useEffect, useCallback } from "react";
import { MapPin, TrendingUp, Activity, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";

// Interfaces for new fetched data
interface StateAlert {
  state: string;
  daily_total: number;
  risk_level: string;
  risk_score: number;
  peak_predicted: number;
  peak_hour: string;
}

interface HourlyAlert {
  hour: number;
  label: string;
  predicted_count: number;
  risk_level: string;
  factors: string[];
}

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [statesData, setStatesData] = useState<StateAlert[]>([]);
  const [alertSlides, setAlertSlides] = useState<HourlyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Real ML Data
  useEffect(() => {
    let isMounted = true;

    const fetchStates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/state-alerts`);
        if (res.ok && isMounted) {
          const stateData = await res.json();
          setStatesData(stateData.all_states || []);
        }
      } catch (err) {
        console.error("Failed to fetch ML data for About page states", err);
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/alerts`);
        if (res.ok && isMounted) {
          const alertData = await res.json();
          if (alertData.alerts && alertData.alerts.length > 0) {
            setAlertSlides(alertData.alerts.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Failed to fetch ML data for About page alerts", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStates();
    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Live time update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (alertSlides.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentSlide, alertSlides.length]);

  const nextSlide = () => {
    if (alertSlides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % alertSlides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (alertSlides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + alertSlides.length) % alertSlides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const maxAccidents = statesData.length > 0
    ? Math.max(...statesData.map((d) => d.daily_total))
    : 100;

  const getSlideGradient = (riskLevel: string) => {
    if (riskLevel === 'high') return "from-rose-900 via-red-900 to-red-950";
    if (riskLevel === 'medium') return "from-orange-900 via-amber-800 to-yellow-900";
    return "from-emerald-900 via-teal-800 to-cyan-900";
  };

  const getStateGradient = (riskLevel: string) => {
    if (riskLevel === 'high') return "from-rose-500 to-pink-600";
    if (riskLevel === 'medium') return "from-amber-400 to-yellow-500";
    return "from-emerald-400 to-teal-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Hero Carousel Section */}
      <div className="relative h-[40vh] min-h-[320px]">
        {/* Animated Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${alertSlides.length > 0 ? getSlideGradient(alertSlides[currentSlide].risk_level) : "from-slate-900 to-slate-800"
            } transition-all duration-700`}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Slide Content */}
        {!isLoading && alertSlides.length > 0 && (
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <div
              className={`transform transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-white" />
                <span className="text-white/90 text-sm font-bold uppercase tracking-wider">
                  {alertSlides[currentSlide].risk_level} RISK ALERT - {alertSlides[currentSlide].label}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-display">
                ~{alertSlides[currentSlide].predicted_count.toFixed(1)} Predicted Accidents
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto flex flex-wrap gap-2 justify-center">
                {alertSlides[currentSlide].factors.map((f, idx) => (
                  <span key={idx} className="bg-black/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Info className="h-3 w-3" /> {f}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full z-20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {alertSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="container py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">All India Coverage</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display">
            State-wise Traffic Accident Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive data visualization across all major Indian states
          </p>
        </div>

        {/* Animated Bar Chart */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
          {/* Live day and time indicator */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-white">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-mono text-white">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Background map silhouette effect */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent" />
          </div>

          {/* Trend line */}
          <div className="absolute top-8 left-8 right-8 h-px">
            <svg className="w-full h-24 -mt-12" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M0 20 Q10 18, 20 15 T40 12 T60 8 T80 5 T100 2"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
                className="animate-pulse"
              />
              <circle cx="100" cy="2" r="1.5" fill="white" className="animate-pulse" />
            </svg>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-2 top-24 bottom-16 flex flex-col justify-between text-xs text-white/40">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Chart Container */}
          <div className={`relative ml-8 mt-16 transition-opacity duration-500 ${statesData.length === 0 ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-end justify-center gap-1 md:gap-2 h-[300px] md:h-[400px]">
              {statesData.length > 0 && statesData.map((state, index) => {
                const effectiveMax = maxAccidents > 10 ? maxAccidents : 100;
                const barHeight = (state.daily_total / effectiveMax) * 300;
                const color = getStateGradient(state.risk_level);

                return (
                  <div
                    key={`${state.state}-${index}`}
                    className="relative flex-1 max-w-12 group h-full flex items-end"
                  >
                    {/* Bar */}
                    <div
                      className={`relative w-full rounded-t-lg bg-gradient-to-t ${color} shadow-lg transition-all duration-500 ease-out cursor-pointer hover:opacity-90`}
                      style={{ height: `${barHeight}px` }}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-t-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Value tooltip with full state name */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                        <div className="text-sm font-bold text-slate-800">{state.state}</div>
                        <div className="text-lg font-extrabold text-primary">{Math.round(state.daily_total)} Predictions</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                      </div>

                      {/* Shimmer effect */}
                      <div
                        className="absolute inset-0 rounded-t-lg overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                          animation: `shimmer 2s infinite ${index * 0.1}s`,
                        }}
                      />
                    </div>

                    {/* State label */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 -rotate-45 origin-top-left">
                      <span className="text-[10px] md:text-xs text-white/60 whitespace-nowrap">
                        {state.state.slice(0, 3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-20">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-rose-500 to-pink-600" />
              <span className="text-sm text-white/60">High Risk States</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-400 to-yellow-500" />
              <span className="text-sm text-white/60">Medium Risk States</span>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-white/80">Live Data</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "States Covered", value: "16+", icon: MapPin },
            { label: "Data Points", value: "1M+", icon: Activity },
            { label: "Accuracy Rate", value: "94%", icon: TrendingUp },
            { label: "Daily Updates", value: "24/7", icon: Activity },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/10 text-center group hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer Credit */}
        <div className="text-center mt-12 py-8 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Final Year B.E. Project • Department of Computer Science & Engineering
          </p>
          <p className="text-white/60 text-sm mt-1 font-medium">
            Time-Series Forecasting for Peak Hour Traffic Accidents
          </p>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
