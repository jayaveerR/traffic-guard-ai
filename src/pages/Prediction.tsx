import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LocationSearch } from "@/components/LocationSearch";
import { Brain, CalendarIcon, Clock, AlertTriangle, Shield, TrendingUp, MapPin, Info, FileDown, Activity, Phone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LocationData } from "@/types";
import { usePrediction } from "@/context/PredictionContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const safetyMessages = {
  low: "Traffic conditions appear safe. Normal precautions recommended.",
  medium: "Moderate risk detected. Increased patrol and monitoring advised.",
  high: "High accident probability! Deploy additional resources and issue traffic advisories.",
};

export default function Prediction() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    predictedCount: number;
    riskLevel: "low" | "medium" | "high";
    confidence: number;
    location?: LocationData;
    factors: string[];
    weather?: string;
    aiInsight?: string;
    alertMessage?: string;
  } | null>(null);

  const { setLatestPrediction } = usePrediction();
  const { session, signOut } = useAuth();

  const handlePredict = async () => {
    if (!date || !time || !selectedLocation) return;

    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          date: format(date, "yyyy-MM-dd"),
          time: time,
          location: selectedLocation.name,
        }),
      });

      if (response.status === 401) {
        toast.error("Session expired. Please sign in again.");
        signOut();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to get prediction from server");
      }

      const result = await response.json();

      // Add location back to result for UI display
      const finalResult = {
        ...result,
        location: selectedLocation
      };

      setPrediction(finalResult);

      // Save to context for Dashboard
      setLatestPrediction({
        ...finalResult,
        date: format(date, "yyyy-MM-dd"),
        time,
      });
    } catch (error: any) {
      console.error("Prediction error:", error);
      alert(`Error: ${error.message || "Could not connect to the Prediction Server. Make sure the Flask backend is running."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!prediction || !date || !selectedLocation) return;

    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("Traffic Guard AI - Safety Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Safety Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Prediction Summary", 20, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: [
        ['Location', selectedLocation.name],
        ['Date', format(date, "PPP")],
        ['Time', time],
        ['Predicted Accidents', prediction.predictedCount.toString()],
        ['Risk Level', prediction.riskLevel.toUpperCase()],
        ['Confidence', `${prediction.confidence}%`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // AI Safety Advice
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(16);
    doc.text("Safety Recommendations", 20, finalY + 15);

    doc.setFontSize(12);
    const advice = safetyMessages[prediction.riskLevel as keyof typeof safetyMessages];
    const splitAdvice = doc.splitTextToSize(advice, 170);
    doc.text(splitAdvice, 20, finalY + 25);

    // Save PDF
    doc.save(`Traffic_Report_${selectedLocation.name.replace(/\s+/g, '_')}.pdf`);
    toast.success("Report downloaded successfully!");
  };

  // Generate trend data for the chart
  const trendData = prediction
    ? [
      { time: "-3h", accidents: Math.max(1, prediction.predictedCount - 8) },
      { time: "-2h", accidents: Math.max(1, prediction.predictedCount - 5) },
      { time: "-1h", accidents: Math.max(1, prediction.predictedCount - 2) },
      { time: "Now", accidents: prediction.predictedCount },
      { time: "+1h", accidents: Math.max(1, prediction.predictedCount - 3) },
      { time: "+2h", accidents: Math.max(1, prediction.predictedCount - 6) },
    ]
    : [];

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        {/* User Profile Section */}
        {session?.user && (
          <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {session.user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Welcome, {session.user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            Accident Risk Prediction
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Search for a location and select date/time to predict traffic accident risk.
          </p>
        </div>

        {/* Location Search Card */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Search Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSearch
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              onClear={() => setSelectedLocation(null)}
            />
          </CardContent>
        </Card>

        {/* Date & Time Card */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Select Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>
                <Select value={time || ""} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={!date || !time || !selectedLocation || isLoading}
              className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Predict Accident Risk
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end gap-3 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrediction(null)}
              >
                New Prediction
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadReport}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Download Report (PDF)
              </Button>
            </div>

            {/* Main Result Card */}
            <Card className="shadow-card overflow-hidden">
              <div
                className={cn("h-2", {
                  "bg-success": prediction.riskLevel === "low",
                  "bg-warning": prediction.riskLevel === "medium",
                  "bg-danger": prediction.riskLevel === "high",
                })}
              />
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Location */}
                  {prediction.location && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {prediction.location.name}
                      </p>
                      <RiskBadge level={prediction.location.baseRisk} className="mt-1" />
                    </div>
                  )}

                  {/* Predicted Count */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Predicted Accidents
                    </p>
                    <p className="text-4xl font-bold font-display text-foreground">
                      {prediction.predictedCount}
                    </p>
                  </div>

                  {/* Risk Level */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Risk Level
                    </p>
                    <RiskBadge level={prediction.riskLevel} />
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Model Confidence
                    </p>
                    <p className="text-4xl font-bold font-display text-accent">
                      {prediction.confidence}%
                    </p>
                  </div>
                </div>

                {/* Weather & AI Insight Section */}
                <div className="mt-8 pt-6 border-t border-border grid md:grid-cols-2 gap-8">
                  {prediction.weather && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Weather Context</h4>
                        <p className="text-sm text-muted-foreground capitalize">{prediction.weather} conditions detected.</p>
                      </div>
                    </div>
                  )}

                  {prediction.aiInsight && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Brain className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">AI Safety Advisor</h4>
                        <p className="text-sm text-foreground leading-relaxed italic">
                          "{prediction.aiInsight}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contributing Factors */}
            {prediction.factors.length > 0 && (
              <div className="space-y-4 animate-fade-in delay-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Info className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Contributing Factors</h3>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prediction.factors.map((factor, idx) => (
                    <Card
                      key={idx}
                      className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-accent overflow-hidden bg-background/50 backdrop-blur-sm"
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="mt-1 h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground leading-snug">
                            {factor}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            High impact risk factor
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Message */}
            <Card
              className={cn("shadow-card border-l-4", {
                "border-l-success bg-success/5": prediction.riskLevel === "low",
                "border-l-warning bg-warning/5": prediction.riskLevel === "medium",
                "border-l-danger bg-danger/5": prediction.riskLevel === "high",
              })}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {prediction.riskLevel === "high" ? (
                    <AlertTriangle className="h-6 w-6 text-danger shrink-0" />
                  ) : prediction.riskLevel === "medium" ? (
                    <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
                  ) : (
                    <Shield className="h-6 w-6 text-success shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">Safety Advisory</h3>
                    <p className="text-muted-foreground">
                      {safetyMessages[prediction.riskLevel]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Predicted Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accidents"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
