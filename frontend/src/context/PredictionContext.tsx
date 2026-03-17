import { createContext, useContext, useState, ReactNode } from "react";
import { LocationData } from "@/types";

export interface PredictionData {
  predictedCount: number;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  location?: LocationData;
  factors: string[];
  date: string;
  time: string;
  weather?: string;
  aiInsight?: string;
}

interface PredictionContextType {
  latestPrediction: PredictionData | null;
  predictionHistory: PredictionData[];
  setLatestPrediction: (prediction: PredictionData) => void;
  fetchHistory: (token: string) => Promise<number>;
  clearPredictions: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [latestPrediction, setLatestPredictionState] = useState<PredictionData | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionData[]>([]);

  const setLatestPrediction = (prediction: PredictionData) => {
    setLatestPredictionState(prediction);

    setPredictionHistory((prev) => {
      const key = `${prediction.date}_${prediction.time}_${prediction.location?.name}`;
      const filtered = prev.filter(
        (p) => `${p.date}_${p.time}_${p.location?.name}` !== key
      );
      return [prediction, ...filtered].slice(0, 50);
    });
  };

  const fetchHistory = async (token: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        return 401;
      }

      if (response.ok) {
        const data = await response.json();

        const formattedHistory = data.map((item: any) => ({
          predictedCount: Number(item.predicted_count) || 0,
          riskLevel: (item.risk_level?.toLowerCase() || "low") as
            | "low"
            | "medium"
            | "high",
          confidence: Number(item.confidence) || 0,
          location: { name: item.location || "Unknown" },
          date: item.search_date || "",
          time: item.search_time || "00:00",
          factors: [],
        }));

        setPredictionHistory((prev) => {
          const dbKeys = new Set(
            formattedHistory.map(
              (p: PredictionData) =>
                `${p.date}_${p.time}_${p.location?.name}`
            )
          );

          const localOnly = prev.filter(
            (p) =>
              !dbKeys.has(`${p.date}_${p.time}_${p.location?.name}`)
          );

          return [...localOnly, ...formattedHistory].slice(0, 50);
        });

        return 200;
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }

    return 500;
  };

  const clearPredictions = () => {
    setLatestPredictionState(null);
    setPredictionHistory([]);
  };

  return (
    <PredictionContext.Provider
      value={{
        latestPrediction,
        predictionHistory,
        setLatestPrediction,
        fetchHistory,
        clearPredictions,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
}

export function usePrediction() {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error("usePrediction must be used within a PredictionProvider");
  }
  return context;
}