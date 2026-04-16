import { useState, useEffect } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={() => setLoaded(true)}
      >
        <source src="/parking.mp4" type="video/mp4" />
      </video>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-5 py-2 rounded-full mb-8 border border-white/20"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Smart Parking Solution v2.0 Live
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-white max-w-4xl tracking-tight">
          Find & Book{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Parking Slots
          </span>{" "}
          Instantly
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl"
        >
          Save time and money by booking your parking spot in advance. Access thousands of secure locations with real-time availability.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl w-full max-w-xl"
        >
          <div className="flex items-center gap-2 px-3 flex-1">
            <MapPin className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm outline-none w-full py-2.5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 border-l border-white/20">
            <Calendar className="w-4 h-4 text-white/50" />
            <span className="text-sm text-white/50">Now</span>
          </div>
          <Button
            onClick={() =>
              navigate(`/drive?lot=${encodeURIComponent(location || "Central Plaza")}`)
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 gap-2 shadow-lg shadow-primary/30"
          >
            Search <Search className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-xs font-medium text-white"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center text-xs font-medium text-primary-foreground">
              +2k
            </div>
          </div>
          <span className="text-sm text-white/60">
            <strong className="text-white">4.9/5</strong> rating from happy drivers
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
