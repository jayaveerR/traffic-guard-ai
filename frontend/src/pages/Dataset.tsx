import { useEffect } from "react";
import { Database, MapPin, AlertTriangle, Clock, Calendar, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrediction } from "@/context/PredictionContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { RiskBadge } from "@/components/ui/risk-badge";
import { cn } from "@/lib/utils";

export default function Dataset() {
  const { latestPrediction, predictionHistory, fetchHistory } = usePrediction();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      fetchHistory(session.access_token);
    }
  }, [session, fetchHistory]);

  const displayHistory = predictionHistory || [];

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Accident Dataset & History</h1>
              <p className="text-muted-foreground">
                Your recent accident risk predictions.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Prediction Card */}
        {latestPrediction && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-5 mb-8 shadow-card animate-fade-in relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <BrainCircuit className="w-40 h-40 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Latest Prediction Result</h2>
                <Badge variant="outline" className="ml-auto bg-background/50 backdrop-blur-sm border-primary/30 text-primary uppercase text-[10px] tracking-wider font-bold">New</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Location</p>
                  <p className="font-medium text-sm truncate">{latestPrediction.location?.name || "Custom Location"}</p>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Date & Time</p>
                  <p className="font-medium text-sm">{latestPrediction.date} at {latestPrediction.time}</p>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Predicted Accidents</p>
                  <p className="font-bold text-lg text-primary">{latestPrediction.predictedCount}</p>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Risk Level</p>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                    {
                      "bg-danger/10 text-danger": latestPrediction.riskLevel === "high",
                      "bg-warning/10 text-warning": latestPrediction.riskLevel === "medium",
                      "bg-success/10 text-success": latestPrediction.riskLevel === "low",
                    }
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", {
                      "bg-danger": latestPrediction.riskLevel === "high",
                      "bg-warning": latestPrediction.riskLevel === "medium",
                      "bg-success": latestPrediction.riskLevel === "low",
                    })} />
                    {latestPrediction.riskLevel}
                  </span>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Peak Hour</p>
                  <Badge variant="secondary" className="flex w-fit items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {latestPrediction.time.split(':')[0]} hr slot
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Cards Grid */}
        <div className="mt-4">
          <h3 className="text-xl font-bold font-display mb-4">Overall Prediction History</h3>

          {displayHistory.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border/50">
              <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No records found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayHistory.map((record, idx) => (
                <div
                  key={idx}
                  className="bg-card hover:bg-muted/10 transition-colors rounded-xl border border-border shadow-card overflow-hidden flex flex-col group cursor-default"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-border/50 flex justify-between items-start bg-muted/20">
                    <div className="flex items-center gap-2 max-w-[75%]">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110",
                        {
                          "bg-danger/10": record.riskLevel === "high",
                          "bg-warning/10": record.riskLevel === "medium",
                          "bg-success/10": record.riskLevel === "low",
                        }
                      )}>
                        <MapPin className={cn(
                          "h-5 w-5",
                          {
                            "text-danger": record.riskLevel === "high",
                            "text-warning": record.riskLevel === "medium",
                            "text-success": record.riskLevel === "low",
                          }
                        )} />
                      </div>
                      <h4 className="font-semibold text-sm truncate" title={record.location?.name}>
                        {record.location?.name || "Custom Location"}
                      </h4>
                    </div>
                    <RiskBadge level={record.riskLevel || 'low'} />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-y-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3" /> Date
                        </p>
                        <p className="text-sm font-medium">{record.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" /> Time (Hour)
                        </p>
                        <p className="text-sm font-medium">{record.time}</p>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-3 border border-border/50 flex justify-between items-center mt-auto">
                      <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Predicted</p>
                      {record.predictedCount !== undefined && record.predictedCount !== null ? (
                        <span className="text-lg font-bold text-foreground">{record.predictedCount} <span className="text-xs font-normal text-muted-foreground">accidents</span></span>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
