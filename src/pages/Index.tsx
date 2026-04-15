import { useState, useEffect, useCallback } from "react";
import CinematicScene from "@/components/3d/CinematicScene";
import OverlayUI from "@/components/OverlayUI";
import BookingModal from "@/components/ui/BookingModal";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSlotClick = useCallback((id: string) => {
    setSelectedSlot(id);
    setShowModal(true);
  }, []);

  const handleBook = useCallback((slotId: string, duration: number) => {
    console.log(`Booked slot ${slotId} for ${duration} minutes`);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedSlot(null);
  }, []);

  return (
    <>
      {/* Scroll container - 6x viewport for 6 scenes */}
      <div style={{ height: "600vh" }} />

      <CinematicScene
        scrollProgress={scrollProgress}
        selectedSlot={selectedSlot}
        onSlotClick={handleSlotClick}
      />

      <OverlayUI
        scrollProgress={scrollProgress}
        selectedSlot={selectedSlot}
      />

      {showModal && selectedSlot && (
        <BookingModal
          slotId={selectedSlot}
          onClose={handleCloseModal}
          onBook={handleBook}
        />
      )}
    </>
  );
};

export default Index;
