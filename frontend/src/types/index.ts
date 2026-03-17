export interface LocationData {
    id: string;
    name: string;
    riskMultiplier: number;
    baseRisk: "low" | "medium" | "high";
    historicalAccidents: number;
    description: string;
    coordinates?: [number, number]; // [latitude, longitude]
}
