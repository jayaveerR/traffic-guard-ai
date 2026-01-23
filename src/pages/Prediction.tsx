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
import { Brain, CalendarIcon, Clock, AlertTriangle, Shield, TrendingUp, MapPin, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { simulatePrediction, LocationData } from "@/lib/dummy-data";
import { usePrediction } from "@/context/PredictionContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [time, setTime] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    predictedCount: number;
    riskLevel: "low" | "medium" | "high";
    confidence: number;
    location?: LocationData;
    factors: string[];
  } | null>(null);

  const { setLatestPrediction } = usePrediction();

  const handlePredict = async () => {
    if (!date || !time || !selectedLocation) return;

    setIsLoading(true);
    setPrediction(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = simulatePrediction(format(date, "yyyy-MM-dd"), time, selectedLocation.id);
    setPrediction(result);
    
    // Save to context for Dashboard
    setLatestPrediction({
      ...result,
      date: format(date, "yyyy-MM-dd"),
      time,
    });
    
    setIsLoading(false);
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
                <Select value={time} onValueChange={setTime}>
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
              </CardContent>
            </Card>

            {/* Contributing Factors */}
            {prediction.factors.length > 0 && (
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Contributing Factors</h3>
                      <ul className="space-y-1">
                        {prediction.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
