import { MapPin, Car } from "lucide-react";
import { motion } from "framer-motion";

interface ParkingCardProps {
  id: string;
  name: string;
  address: string;
  price_per_hour: number;
  image_url?: string | null;
  images?: string[];
  distance?: string;
  available_slots?: number;
  total_slots?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const ParkingCard = ({
  name, address, price_per_hour, image_url, images, distance,
  available_slots, total_slots, isSelected, onClick
}: ParkingCardProps) => {
  const thumbnail = images?.[0] || image_url || "/placeholder.svg";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${
        isSelected
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/30"
      }`}
    >
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={thumbnail} alt={name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{address}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-sm">${price_per_hour}/hr</span>
          {distance && <span className="text-xs text-muted-foreground">{distance}</span>}
        </div>
        {typeof available_slots === "number" && typeof total_slots === "number" && (
          <div className="flex items-center gap-2 text-xs">
            <Car className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              <span className={available_slots > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                {available_slots}
              </span>
              /{total_slots} available
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default ParkingCard;
