import { useState } from "react";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Smart Parking Solution v2.0 Live
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Find & Book{" "}
            <span className="text-primary">Parking Slots</span>{" "}
            Easily
          </h1>

          <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-lg">
            Save time and money by booking your parking spot in advance. Access thousands of secure parking locations across the city with real-time availability.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card border border-border rounded-2xl p-2 shadow-lg max-w-xl">
            <div className="flex items-center gap-2 px-3 flex-1">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Where are you going"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-sm outline-none w-full py-2 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2 px-3 border-l border-border">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Now</span>
            </div>
            <Button
              onClick={() => navigate("/find-parking")}
              className="bg-primary text-primary-foreground rounded-xl px-6 gap-2"
            >
              Search <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
                +2k
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">4.9/5</strong> rating from happy drivers
            </span>
          </div>
        </div>

        {/* Right - Parking Card */}
        <div className="relative hidden lg:block">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm ml-auto">
            {/* Price Tags */}
            <div className="relative h-48 bg-muted rounded-xl mb-4 overflow-hidden">
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                $4.50/h
              </div>
              <div className="absolute top-16 right-4 bg-card text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border shadow">
                $5.20/h
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            {/* Garage Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Central Plaza Garage</p>
                  <p className="text-xs text-muted-foreground">0.2 miles away • 15 spots left</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground rounded-lg text-xs px-4">
                Book
              </Button>
            </div>
          </div>

          {/* Floating Available Badge */}
          <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 bg-parking-available rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-xs font-medium text-parking-available uppercase">Available</span>
            </div>
            <p className="text-3xl font-bold text-foreground">248</p>
            <p className="text-xs text-muted-foreground">Spots nearby right now</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
