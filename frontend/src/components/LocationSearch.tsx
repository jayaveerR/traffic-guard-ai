import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationData } from "@/types";
import { usePrediction } from "@/context/PredictionContext";
import { LeafletMap } from "./LeafletMap";

interface LocationSearchProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onClear: () => void;
}

// City coordinates for custom locations
const cityCoordinates: Record<string, [number, number]> = {
  vijayawada: [16.5062, 80.6480],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
};

// Generate a dynamic location based on user input
async function generateLocationFromQuery(query: string): Promise<LocationData> {
  const queryLower = query.toLowerCase();

  // Simulate risk base on common keywords
  let riskMultiplier = 1.0;
  let baseRisk: "low" | "medium" | "high" = "medium";
  let historicalAccidents = Math.floor(Math.random() * 30) + 15;

  let coordinates: [number, number] | undefined;

  // Fetch real coordinates safely using Open-Meteo Geocoding (No CORS/User-Agent restrictions)
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (data && data.results && data.results.length > 0) {
      coordinates = [data.results[0].latitude, data.results[0].longitude];
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
  }

  // Find coordinates based on city name in query (Fallback)
  if (!coordinates) {
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (queryLower.includes(city)) {
        coordinates = coords;
        break;
      }
    }
  }

  // Default to Vijayawada if no city found at all
  if (!coordinates) {
    coordinates = [16.5062, 80.6480];
  }

  // High risk areas
  if (queryLower.includes("highway") || queryLower.includes("junction") || queryLower.includes("crossing") || queryLower.includes("main road")) {
    riskMultiplier = 1.4;
    baseRisk = "high";
    historicalAccidents = Math.floor(Math.random() * 20) + 35;
  }
  // Medium risk areas  
  else if (queryLower.includes("market") || queryLower.includes("bus") || queryLower.includes("station") || queryLower.includes("center") || queryLower.includes("central")) {
    riskMultiplier = 1.2;
    baseRisk = "medium";
    historicalAccidents = Math.floor(Math.random() * 15) + 20;
  }
  // Low risk areas
  else if (queryLower.includes("residential") || queryLower.includes("park") || queryLower.includes("colony") || queryLower.includes("nagar")) {
    riskMultiplier = 0.7;
    baseRisk = "low";
    historicalAccidents = Math.floor(Math.random() * 10) + 5;
  }

  return {
    id: `custom-${query.toLowerCase().replace(/\s+/g, "-")}`,
    name: query,
    riskMultiplier,
    baseRisk,
    historicalAccidents,
    description: `City area - ${query}`,
    coordinates,
  };
}

export function LocationSearch({
  selectedLocation,
  onLocationSelect,
  onClear,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { predictionHistory } = usePrediction();

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredLocations([]);
      setIsOpen(false);
      return;
    }

    // Extract unique locations from prediction history
    const historyLocations: LocationData[] = [];
    const seen = new Set<string>();

    predictionHistory.forEach((p) => {
      const name = p.location?.name;
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        historyLocations.push({
          id: `hist-${name}`,
          name: name,
          riskMultiplier: 1.0,
          baseRisk: p.riskLevel,
          historicalAccidents: p.predictedCount || 0,
          description: "Previously searched location",
          coordinates: p.location?.coordinates || [16.5062, 80.6480]
        });
      }
    });

    const filtered = historyLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLocations(filtered);
    setIsOpen(true);
  }, [query, predictionHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (location: LocationData) => {
    onLocationSelect(location);
    setQuery("");
    setIsOpen(false);
  };

  const handleUseCustomLocation = async () => {
    if (query.trim()) {
      setIsSearching(true);
      const customLocation = await generateLocationFromQuery(query.trim());
      onLocationSelect(customLocation);
      setQuery("");
      setIsOpen(false);
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim() && !isSearching) {
      e.preventDefault();
      handleUseCustomLocation();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter city, area or address (e.g., Vijayawada, MG Road...)"
          value={selectedLocation ? selectedLocation.name : query}
          onChange={(e) => {
            if (selectedLocation) {
              onClear();
            }
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {(query || selectedLocation) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onClear();
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown Suggestions */}
        {isOpen && query.trim() !== "" && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[320px] overflow-y-auto"
          >
            {/* Custom Location Option */}
            <button
              type="button"
              onClick={handleUseCustomLocation}
              className="w-full flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 transition-colors text-left border-b border-border"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary">
                  Use "{query}" as location
                </p>
                <p className="text-xs text-muted-foreground">
                  Get prediction for this city/area
                </p>
              </div>
            </button>

            {/* Matching Locations */}
            {filteredLocations.length > 0 && (
              <div className="border-b border-border py-1 px-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Matching Zones
                </p>
              </div>
            )}

            {filteredLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0"
              >
                <MapPin
                  className={cn("h-5 w-5 shrink-0 mt-0.5", {
                    "text-danger": location.baseRisk === "high",
                    "text-warning": location.baseRisk === "medium",
                    "text-success": location.baseRisk === "low",
                  })}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {location.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        {
                          "bg-danger/10 text-danger": location.baseRisk === "high",
                          "bg-warning/10 text-warning": location.baseRisk === "medium",
                          "bg-success/10 text-success": location.baseRisk === "low",
                        }
                      )}
                    >
                      {location.baseRisk.charAt(0).toUpperCase() + location.baseRisk.slice(1)} Risk
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {location.historicalAccidents} accidents
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Preview */}
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 h-[280px]">
        {selectedLocation ? (
          <>
            <div className="absolute inset-0 z-0">
              <LeafletMap
                center={selectedLocation.coordinates || [16.5062, 80.6480]}
                markerPosition={selectedLocation.coordinates || [16.5062, 80.6480]}
                markerColor={selectedLocation.baseRisk}
                locationName={selectedLocation.name}
                zoom={14}
              />
            </div>
            {/* Location Info Overlay - Always visible on top */}
            <div className="absolute bottom-0 left-0 right-0 z-[9999] bg-gradient-to-t from-background via-background/95 to-transparent p-4" style={{ pointerEvents: 'none' }}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    {
                      "bg-danger/10": selectedLocation.baseRisk === "high",
                      "bg-warning/10": selectedLocation.baseRisk === "medium",
                      "bg-success/10": selectedLocation.baseRisk === "low",
                    }
                  )}
                >
                  <Navigation
                    className={cn("h-6 w-6", {
                      "text-danger": selectedLocation.baseRisk === "high",
                      "text-warning": selectedLocation.baseRisk === "medium",
                      "text-success": selectedLocation.baseRisk === "low",
                    })}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {selectedLocation.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        {
                          "bg-danger/10 text-danger": selectedLocation.baseRisk === "high",
                          "bg-warning/10 text-warning": selectedLocation.baseRisk === "medium",
                          "bg-success/10 text-success": selectedLocation.baseRisk === "low",
                        }
                      )}
                    >
                      {selectedLocation.baseRisk.charAt(0).toUpperCase() + selectedLocation.baseRisk.slice(1)} Risk Zone
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~{selectedLocation.historicalAccidents} historical accidents
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 z-0">
            <LeafletMap
              center={[16.5062, 80.6480]}
              zoom={11}
            />
          </div>
        )}
      </div>
    </div>
  );
}
