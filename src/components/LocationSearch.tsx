import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { locations, LocationData } from "@/lib/dummy-data";

interface LocationSearchProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onClear: () => void;
}

export function LocationSearch({
  selectedLocation,
  onLocationSelect,
  onClear,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredLocations([]);
      return;
    }

    const filtered = locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLocations(filtered);
    setIsOpen(filtered.length > 0);
  }, [query]);

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

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type address or location name..."
          value={selectedLocation ? selectedLocation.name : query}
          onChange={(e) => {
            if (selectedLocation) {
              onClear();
            }
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (filteredLocations.length > 0) setIsOpen(true);
          }}
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
        {isOpen && filteredLocations.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[280px] overflow-y-auto"
          >
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

        {/* No Results */}
        {isOpen && query.trim() !== "" && filteredLocations.length === 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center"
          >
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No locations found for "{query}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for: Highway, Junction, Zone, etc.
            </p>
          </div>
        )}
      </div>

      {/* Map Preview */}
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 h-[200px]">
        {selectedLocation ? (
          <>
            {/* Simulated Map with Location */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
              {/* Grid pattern for map effect */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Roads */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted-foreground/20" />
              <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-muted-foreground/20" />
              <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-muted-foreground/20" />
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-muted-foreground/10" />
              <div className="absolute bottom-1/3 left-0 right-0 h-0.5 bg-muted-foreground/10" />
            </div>

            {/* Location Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="relative">
                <MapPin
                  className={cn("h-10 w-10 drop-shadow-lg", {
                    "text-danger": selectedLocation.baseRisk === "high",
                    "text-warning": selectedLocation.baseRisk === "medium",
                    "text-success": selectedLocation.baseRisk === "low",
                  })}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
                <div
                  className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full blur-sm",
                    {
                      "bg-danger/50": selectedLocation.baseRisk === "high",
                      "bg-warning/50": selectedLocation.baseRisk === "medium",
                      "bg-success/50": selectedLocation.baseRisk === "low",
                    }
                  )}
                />
              </div>
            </div>

            {/* Location Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    {
                      "bg-danger/10": selectedLocation.baseRisk === "high",
                      "bg-warning/10": selectedLocation.baseRisk === "medium",
                      "bg-success/10": selectedLocation.baseRisk === "low",
                    }
                  )}
                >
                  <Navigation
                    className={cn("h-5 w-5", {
                      "text-danger": selectedLocation.baseRisk === "high",
                      "text-warning": selectedLocation.baseRisk === "medium",
                      "text-success": selectedLocation.baseRisk === "low",
                    })}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {selectedLocation.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLocation.description} • {selectedLocation.historicalAccidents} historical accidents
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No location selected</p>
            <p className="text-xs">Search and select a location above</p>
          </div>
        )}
      </div>
    </div>
  );
}
