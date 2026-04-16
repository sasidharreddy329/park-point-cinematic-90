import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin, Navigation, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/map/ParkingMap";
import ParkingCard from "@/components/parking/ParkingCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineDistance, formatDistance } from "@/lib/distance";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  price_per_hour: number;
  total_slots: number;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  images: string[] | null;
}

interface SlotCount {
  location_id: string;
  available: number;
}

const POPULAR_SEARCHES = ["Mall", "Railway Station", "City Center", "Airport", "Hospital"];

const FindParking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { position } = useGeolocation();

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [slotCounts, setSlotCounts] = useState<SlotCount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100);
  const [maxDistance, setMaxDistance] = useState(50);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from("parking_locations")
        .select("id, name, address, city, price_per_hour, total_slots, lat, lng, image_url, images")
        .eq("is_active", true);
      setLocations((data as ParkingLocation[]) || []);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      const { data } = await supabase
        .from("parking_slots")
        .select("location_id, is_available");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(s => {
          if (s.is_available) counts[s.location_id] = (counts[s.location_id] || 0) + 1;
        });
        setSlotCounts(Object.entries(counts).map(([location_id, available]) => ({ location_id, available })));
      }
    };
    fetchSlots();
  }, []);

  const locationsWithDistance = useMemo(() => {
    return locations.map(loc => {
      let dist: number | null = null;
      if (position && loc.lat && loc.lng) {
        dist = haversineDistance(position.lat, position.lng, loc.lat, loc.lng);
      }
      const sc = slotCounts.find(s => s.location_id === loc.id);
      return { ...loc, distance: dist, available_slots: sc?.available ?? 0 };
    });
  }, [locations, position, slotCounts]);

  const filtered = useMemo(() => {
    let result = locationsWithDistance;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
      );
    }

    result = result.filter(l => l.price_per_hour <= maxPrice);

    if (position) {
      result = result.filter(l => l.distance === null || l.distance <= maxDistance);
    }

    if (onlyAvailable) {
      result = result.filter(l => l.available_slots > 0);
    }

    // Sort by distance if available
    result.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      return 0;
    });

    return result;
  }, [locationsWithDistance, search, maxPrice, maxDistance, onlyAvailable, position]);

  const mapLocations = filtered.map(l => ({
    id: l.id,
    name: l.name,
    address: l.address,
    lat: l.lat,
    lng: l.lng,
    price_per_hour: l.price_per_hour,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by city, area, or landmark..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-[46px] w-[46px] rounded-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Popular Searches */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-muted-foreground self-center mr-1">Popular:</span>
            {POPULAR_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => setSearch(s)}
                className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-3 gap-5"
          >
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Price: ${maxPrice}/hr</label>
              <input
                type="range"
                min={1}
                max={100}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            {position && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Distance: {maxDistance} km</label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={maxDistance}
                  onChange={e => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="avail"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="avail" className="text-xs text-muted-foreground">Available spots only</label>
            </div>
          </motion.div>
        )}

        {/* Location info */}
        {position && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Navigation className="w-3 h-3 text-primary" />
            <span>Using your location · Showing nearest first</span>
          </div>
        )}

        {/* Map */}
        <ParkingMap
          locations={mapLocations}
          selectedLocationId={selectedId}
          onLocationSelect={(loc) => setSelectedId(loc.id)}
          className="h-[350px] mb-8"
        />

        {/* Results */}
        <h2 className="text-lg font-bold text-foreground mb-4">
          {search ? `Results for "${search}"` : "Nearby Parking"} ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No parking locations found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(loc => (
              <ParkingCard
                key={loc.id}
                id={loc.id}
                name={loc.name}
                address={loc.address}
                price_per_hour={loc.price_per_hour}
                image_url={loc.image_url}
                images={loc.images || undefined}
                distance={loc.distance !== null ? formatDistance(loc.distance) : undefined}
                available_slots={loc.available_slots}
                total_slots={loc.total_slots}
                isSelected={selectedId === loc.id}
                onClick={() => navigate(`/parking/${loc.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FindParking;
