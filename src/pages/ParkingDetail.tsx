import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Car, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/map/ParkingMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ParkingSlot {
  id: string;
  slot_label: string;
  slot_type: string;
  is_available: boolean;
}

const ParkingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [location, setLocation] = useState<any>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(2);
  const [booking, setBooking] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("parking_locations")
        .select("*")
        .eq("id", id)
        .single();
      setLocation(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  useEffect(() => {
    if (!location) return;
    const fetchSlots = async () => {
      const { data } = await supabase.from("parking_slots").select("*").eq("location_id", location.id);
      setSlots(data || []);
    };
    fetchSlots();
  }, [location]);

  const images: string[] = location?.images?.length > 0
    ? location.images
    : location?.image_url
    ? [location.image_url]
    : ["/placeholder.svg"];

  const availableCount = slots.filter(s => s.is_available).length;
  const selected = slots.find(s => s.id === selectedSlot);
  const total = location ? (location.price_per_hour * duration + 1).toFixed(2) : "0.00";

  const handleBook = async () => {
    if (!user) { toast.error("Please log in"); navigate("/login"); return; }
    if (!selectedSlot || !location) return;
    setBooking(true);

    const now = new Date();
    const end = new Date(now.getTime() + duration * 3600000);

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      slot_id: selectedSlot,
      location_id: location.id,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      total_price: parseFloat(total),
    });

    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      await supabase.from("parking_slots").update({ is_available: false }).eq("id", selectedSlot);
      toast.success("Booking confirmed!");
      navigate("/dashboard");
    }
    setBooking(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 text-center text-muted-foreground">Loading...</div>
    </div>
  );

  if (!location) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 text-center text-muted-foreground">Location not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Gallery + Map */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIndex}
                  src={images[imgIndex]}
                  alt={location.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIndex((imgIndex + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-primary w-5" : "bg-background/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === imgIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{location.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location.address}, {location.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <DollarSign className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">${location.price_per_hour}</p>
                <p className="text-xs text-muted-foreground">per hour</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Car className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{availableCount}/{slots.length}</p>
                <p className="text-xs text-muted-foreground">available</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">open</p>
              </div>
            </div>

            {/* Map */}
            <ParkingMap
              locations={[location]}
              selectedLocationId={location.id}
              className="h-[250px]"
            />

            {/* Slot Selection */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Select a Spot</h2>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => slot.is_available && setSelectedSlot(slot.id)}
                    disabled={!slot.is_available}
                    className={`aspect-square rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center ${
                      selectedSlot === slot.id
                        ? "border-primary bg-primary/10 text-primary"
                        : slot.is_available
                        ? "border-border hover:border-primary/40 text-foreground"
                        : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {slot.slot_label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Book This Spot</h2>

              {selected ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spot</span>
                    <span className="font-medium text-foreground">{selected.slot_label}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-7 h-7 rounded-lg border border-border text-foreground text-sm">-</button>
                      <span className="font-medium text-foreground">{duration}h</span>
                      <button onClick={() => setDuration(Math.min(24, duration + 1))} className="w-7 h-7 rounded-lg border border-border text-foreground text-sm">+</button>
                    </div>
                  </div>
                  <div className="border-t border-border my-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span>${location.price_per_hour}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>$1.00</span>
                  </div>
                  <div className="border-t border-border my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${total}</span>
                  </div>
                  <Button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full rounded-xl py-3 h-auto font-semibold text-base mt-4"
                  >
                    {booking ? "Booking..." : user ? "Confirm & Pay →" : "Log In to Book →"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a spot above to book</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ParkingDetail;
