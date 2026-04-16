import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Car, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ParkingMap from "@/components/map/ParkingMap";

interface ParkingSlot {
  id: string;
  slot_label: string;
  slot_type: string;
  is_available: boolean;
}

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  price_per_hour: number;
  lat: number | null;
  lng: number | null;
}

const FindParking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lotName = searchParams.get("lot") || "";

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [duration, setDuration] = useState(2);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("parking_locations").select("id, name, address, price_per_hour, lat, lng").eq("is_active", true);
      if (data && data.length > 0) {
        setLocations(data);
        const match = lotName ? data.find(l => l.name === lotName) : data[0];
        if (match) setSelectedLocation(match);
      }
    };
    fetchLocations();
  }, [lotName]);

  useEffect(() => {
    if (!selectedLocation) return;
    const fetchSlots = async () => {
      const { data } = await supabase.from("parking_slots").select("*").eq("location_id", selectedLocation.id);
      setSlots(data || []);
    };
    fetchSlots();
  }, [selectedLocation]);

  const selected = slots.find(s => s.id === selectedSlot);
  const total = selectedLocation ? (selectedLocation.price_per_hour * duration + 1).toFixed(2) : "0.00";

  const handleBook = async () => {
    if (!user) {
      toast.error("Please log in to book a parking slot");
      navigate("/login");
      return;
    }
    if (!selectedSlot || !selectedLocation) return;

    setBooking(true);
    const now = new Date();
    const end = new Date(now.getTime() + duration * 60 * 60 * 1000);

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      slot_id: selectedSlot,
      location_id: selectedLocation.id,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      total_price: parseFloat(total),
      vehicle_number: null,
    });

    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      // Mark slot as unavailable
      await supabase.from("parking_slots").update({ is_available: false }).eq("id", selectedSlot);
      toast.success("Booking confirmed!");
      setSelectedSlot(null);
      // Refresh slots
      const { data } = await supabase.from("parking_slots").select("*").eq("location_id", selectedLocation.id);
      setSlots(data || []);
    }
    setBooking(false);
  };

  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No Parking Locations Available</h1>
          <p className="text-muted-foreground">Check back soon — parking owners are adding new locations!</p>
        </div>
        <Footer />
      </div>
    );
  }

  const SlotCard = ({ slot, index }: { slot: ParkingSlot; index: number }) => {
    const isOccupied = !slot.is_available;
    const isSelected = selectedSlot === slot.id;

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        onClick={() => !isOccupied && setSelectedSlot(slot.id)}
        disabled={isOccupied}
        className={`relative w-full aspect-[3/4] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
          isSelected
            ? "border-primary bg-primary/5 shadow-lg"
            : isOccupied
            ? "border-border bg-muted cursor-not-allowed opacity-60"
            : "border-border bg-card hover:border-primary/40 hover:shadow-md"
        }`}
      >
        {isSelected && (
          <motion.div className="absolute top-2 right-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </motion.div>
        )}
        <span className="text-sm font-semibold text-foreground">{slot.slot_label}</span>
        {isOccupied && <Car className="w-8 h-8 text-muted-foreground" />}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Select Your Parking Spot</h1>
          {/* Location selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => { setSelectedLocation(loc); setSelectedSlot(null); }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedLocation?.id === loc.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {slots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {slots.map((slot, i) => (
                  <SlotCard key={slot.id} slot={slot} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>No slots configured for this location yet.</p>
              </div>
            )}

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border bg-card" />Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border bg-muted" />Occupied
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary bg-primary/5" />Selected
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6">Booking Summary</h2>

              {selected && selectedLocation ? (
                <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedLocation.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedLocation.address}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spot</span>
                      <span className="font-medium text-foreground">{selected.slot_label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Duration</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-7 h-7 rounded-lg border border-border text-foreground text-sm">-</button>
                        <span className="font-medium text-foreground">{duration}h</span>
                        <button onClick={() => setDuration(Math.min(24, duration + 1))} className="w-7 h-7 rounded-lg border border-border text-foreground text-sm">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="text-foreground">${selectedLocation.price_per_hour}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground">$1.00</span>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${total}</span>
                  </div>

                  {!user && (
                    <p className="text-xs text-amber-600 mb-3 text-center">⚠️ You need to log in to book</p>
                  )}

                  <Button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 h-auto font-semibold text-base"
                  >
                    {booking ? "Booking..." : user ? "Confirm & Pay →" : "Log In to Book →"}
                  </Button>
                </motion.div>
              ) : (
                <div className="text-center py-10">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Select a parking spot to see booking details</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FindParking;
