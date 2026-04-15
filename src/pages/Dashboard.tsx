import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, Car, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  vehicle_number: string | null;
  parking_locations: { name: string; address: string } | null;
  parking_slots: { slot_label: string } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, parking_locations(name, address), parking_slots(slot_label)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings((data as unknown as Booking[]) || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const cancelBooking = async (id: string, slotId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (!error) {
      await supabase.from("parking_slots").update({ is_available: true }).eq("id", slotId);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    }
  };

  const activeBookings = bookings.filter(b => b.status === "active");
  const pastBookings = bookings.filter(b => b.status !== "active");
  const totalSpent = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.total_price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your bookings</p>
          </div>
          {role === "owner" && (
            <Link to="/owner">
              <Button variant="outline" size="sm">Owner Dashboard →</Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <CalendarCheck className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Active Bookings</p>
            <p className="text-2xl font-bold text-foreground">{activeBookings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <Car className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <CreditCard className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* Active Bookings */}
        <h2 className="text-lg font-bold text-foreground mb-4">Active Bookings</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : activeBookings.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
            <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No active bookings</p>
            <Link to="/find-parking">
              <Button size="sm" className="mt-4">Find Parking</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {activeBookings.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{b.parking_locations?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    Slot {b.parking_slots?.slot_label} · {new Date(b.start_time).toLocaleString()} — {new Date(b.end_time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">${b.total_price.toFixed(2)}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => cancelBooking(b.id, (b as any).slot_id)}>
                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-foreground mb-4">Booking History</h2>
            <div className="space-y-3">
              {pastBookings.map(b => (
                <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between opacity-70">
                  <div>
                    <p className="font-semibold text-foreground">{b.parking_locations?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      Slot {b.parking_slots?.slot_label} · {new Date(b.start_time).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    b.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
