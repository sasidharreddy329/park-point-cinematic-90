import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Car, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

type Slot = {
  id: string;
  label: string;
  status: "available" | "occupied";
};

const slotsA: Slot[] = [
  { id: "A1", label: "A1", status: "available" },
  { id: "A2", label: "A2", status: "occupied" },
  { id: "A3", label: "A3", status: "available" },
  { id: "A4", label: "A4", status: "available" },
];

const slotsB: Slot[] = [
  { id: "B1", label: "B1", status: "occupied" },
  { id: "B2", label: "B2", status: "available" },
  { id: "B3", label: "B3", status: "occupied" },
  { id: "B4", label: "B4", status: "available" },
];

const FindParking = () => {
  const [searchParams] = useSearchParams();
  const lotName = searchParams.get("lot") || "Downtown Plaza Garage";
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const allSlots = [...slotsA, ...slotsB];
  const selected = allSlots.find((s) => s.id === selectedSlot);

  const handleBook = () => {
    if (selectedSlot) {
      setBooked(true);
      setTimeout(() => setBooked(false), 3000);
    }
  };

  const SlotCard = ({ slot, index }: { slot: Slot; index: number }) => {
    const isOccupied = slot.status === "occupied";
    const isSelected = selectedSlot === slot.id;

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
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
          <motion.div
            className="absolute top-2 right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </motion.div>
        )}
        <span className="text-sm font-semibold text-foreground">{slot.label}</span>
        {isOccupied && <Car className="w-8 h-8 text-muted-foreground" />}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">Select Your Parking Spot</h1>
          <p className="text-muted-foreground text-sm mb-8">{lotName}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Parking Grid */}
          <div className="lg:col-span-2">
            {/* Row A */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {slotsA.map((slot, i) => (
                <SlotCard key={slot.id} slot={slot} index={i} />
              ))}
            </div>

            {/* Driveway */}
            <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
              <span className="text-xs tracking-[0.3em] uppercase font-medium">D R I V E W A Y</span>
              <span>→</span>
            </div>

            {/* Row B */}
            <div className="grid grid-cols-4 gap-4">
              {slotsB.map((slot, i) => (
                <SlotCard key={slot.id} slot={slot} index={i + 4} />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border bg-card" />
                Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border bg-muted" />
                Occupied
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary bg-primary/5" />
                Selected
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6">Booking Summary</h2>

              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{lotName}</p>
                      <p className="text-xs text-muted-foreground">123 Market St, San Francisco</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spot</span>
                      <span className="font-medium text-foreground">{selected.label} (Level 2)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">Today, {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">2 Hours (14:00 - 16:00)</span>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="text-foreground">$4.50 / hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground">$1.00</span>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">$10.00</span>
                  </div>

                  <Button
                    onClick={handleBook}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 h-auto font-semibold text-base"
                  >
                    {booked ? "✓ Booked!" : "Confirm & Pay →"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Secure payment powered by Stripe
                  </p>
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
