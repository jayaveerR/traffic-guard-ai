import { createContext, useContext, useState, ReactNode } from "react";
import { LocationData } from "@/lib/dummy-data";

export interface PredictionData {
  predictedCount: number;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  location?: LocationData;
  factors: string[];
  date: string;
  time: string;
}

interface PredictionContextType {
  latestPrediction: PredictionData | null;
  predictionHistory: PredictionData[];
  setLatestPrediction: (prediction: PredictionData) => void;
  clearPredictions: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [latestPrediction, setLatestPredictionState] = useState<PredictionData | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionData[]>([]);

  const setLatestPrediction = (prediction: PredictionData) => {
    setLatestPredictionState(prediction);
    setPredictionHistory((prev) => [prediction, ...prev].slice(0, 10)); // Keep last 10
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
