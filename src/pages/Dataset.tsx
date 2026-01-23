import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Database, MapPin } from "lucide-react";
import { accidentDataset, AccidentRecord, locations } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

// Get unique locations from dataset
const datasetLocations = [...new Set(accidentDataset.map((r) => r.location))];

export default function Dataset() {
  const [searchQuery, setSearchQuery] = useState("");
  const [peakFilter, setPeakFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return accidentDataset.filter((record) => {
      const matchesSearch =
        record.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.date.includes(searchQuery);
      const matchesPeak = peakFilter === "all" || record.peakHour === peakFilter;
      const matchesLocation = locationFilter === "all" || record.location === locationFilter;
      return matchesSearch && matchesPeak && matchesLocation;
    });
  }, [searchQuery, peakFilter, locationFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get location risk info
  const getLocationRisk = (locationName: string) => {
    const loc = locations.find((l) => l.name === locationName);
    return loc?.baseRisk || "medium";
  };

  const getSeverityVariant = (severity: AccidentRecord["severity"]) => {
    switch (severity) {
      case "Minor":
        return "default";
      case "Moderate":
        return "secondary";
      case "Severe":
        return "destructive";
    }
  };

  const getPeakHourVariant = (peakHour: AccidentRecord["peakHour"]) => {
    switch (peakHour) {
      case "Morning":
        return "outline";
      case "Evening":
        return "secondary";
      case "Off-Peak":
        return "default";
    }
  };

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
              <h1 className="text-3xl font-bold font-display">Accident Dataset</h1>
              <p className="text-muted-foreground">
                Historical traffic accident records for analysis
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 shadow-card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location or date..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={peakFilter}
              onValueChange={(value) => {
                setPeakFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Peak Hour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hours</SelectItem>
                <SelectItem value="Morning">Morning Peak</SelectItem>
                <SelectItem value="Evening">Evening Peak</SelectItem>
                <SelectItem value="Off-Peak">Off-Peak</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={locationFilter}
              onValueChange={(value) => {
                setLocationFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {datasetLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("h-2 w-2 rounded-full", {
                          "bg-danger": getLocationRisk(loc) === "high",
                          "bg-warning": getLocationRisk(loc) === "medium",
                          "bg-success": getLocationRisk(loc) === "low",
                        })}
                      />
                      <span className="truncate max-w-[150px]">{loc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Risk</TableHead>
                <TableHead className="font-semibold text-center">Accidents</TableHead>
                <TableHead className="font-semibold">Peak Hour</TableHead>
                <TableHead className="font-semibold">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((record) => {
                  const locationRisk = getLocationRisk(record.location);
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{record.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                            {
                              "bg-danger/10 text-danger": locationRisk === "high",
                              "bg-warning/10 text-warning": locationRisk === "medium",
                              "bg-success/10 text-success": locationRisk === "low",
                            }
                          )}
                        >
                          <span
                            className={cn("h-1.5 w-1.5 rounded-full", {
                              "bg-danger": locationRisk === "high",
                              "bg-warning": locationRisk === "medium",
                              "bg-success": locationRisk === "low",
                            })}
                          />
                          {locationRisk.charAt(0).toUpperCase() + locationRisk.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {record.accidentCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPeakHourVariant(record.peakHour)}>
                          {record.peakHour}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(record.severity)}>
                          {record.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No records found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
              {filteredData.length} records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
