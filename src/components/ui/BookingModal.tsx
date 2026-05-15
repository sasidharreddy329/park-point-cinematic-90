import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Loader2, CheckCircle2, AlertCircle, X, MapPin } from "lucide-react";
import DateTimePicker from "@/components/booking/DateTimePicker";
import { buildDateTime, formatTimeRange, today } from "@/lib/booking";

interface BookingModalProps {
  slotId: string;
  /** Optional location label to show in the header */
  locationLabel?: string;
  /** Hourly rate in dollars; defaults to $4/hr */
  hourlyRate?: number;
  onClose: () => void;
  /** Can be sync or async. Throw / reject to surface an error state. */
  onBook: (
    slotId: string,
    duration: number,
    meta?: { date: string; startHour: number; start: Date; end: Date; total: number }
  ) => void | Promise<void>;
}

type Status = "idle" | "loading" | "success" | "error";

const BookingModal = ({
  slotId,
  locationLabel,
  hourlyRate = 4,
  onClose,
  onBook,
}: BookingModalProps) => {
  const now = new Date();
  const [date, setDate] = useState<string>(today());
  const [startHour, setStartHour] = useState<number>(Math.min(23, now.getHours() + 1));
  const [duration, setDuration] = useState<number>(2); // hours
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isToday = date === today();
  const minHour = isToday ? Math.min(23, now.getHours() + 1) : 0;

  const { start, end, total, rangeLabel } = useMemo(() => {
    const s = buildDateTime(date, startHour);
    const e = new Date(s.getTime() + duration * 60 * 60 * 1000);
    return {
      start: s,
      end: e,
      total: hourlyRate * duration,
      rangeLabel: formatTimeRange(s, e),
    };
  }, [date, startHour, duration, hourlyRate]);

  const handleBook = async () => {
    setStatus("loading");
    setErrorMsg(null);
    try {
      await Promise.resolve(
        onBook(slotId, duration * 60, { date, startHour, start, end, total })
      );
      setStatus("success");
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const disabled = status === "loading" || status === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={status === "loading" ? undefined : onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="glass-panel relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8 border border-border bg-card"
          onClick={(e) => e.stopPropagation()}
          style={{ boxShadow: "var(--shadow-cinematic)" }}
        >
          {/* Close button */}
          {status !== "loading" && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3
                id="booking-modal-title"
                className="text-2xl font-display font-semibold text-foreground mb-1"
              >
                Booking confirmed
              </h3>
              <p className="text-sm text-muted-foreground">
                Slot <span className="text-foreground font-medium">{slotId}</span> · {rangeLabel}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total charged: <span className="text-foreground font-medium">${total.toFixed(2)}</span>
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 pr-8">
                <p className="text-[11px] font-medium text-primary uppercase tracking-[0.18em] mb-1.5">
                  Park Point
                </p>
                <h3
                  id="booking-modal-title"
                  className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight"
                >
                  Reserve Slot {slotId}
                </h3>
                {locationLabel && (
                  <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {locationLabel}
                  </p>
                )}
              </div>

              {/* Time / duration */}
              <DateTimePicker
                date={date}
                startHour={startHour}
                duration={duration}
                onDateChange={(d) => {
                  setDate(d);
                  if (d === today() && startHour < minHour) setStartHour(minHour);
                }}
                onStartHourChange={setStartHour}
                onDurationChange={setDuration}
                minHour={minHour}
              />

              {/* Summary */}
              <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{rangeLabel}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {duration}h × ${hourlyRate.toFixed(2)}/hr
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div>
                    <div className="text-2xl font-display font-bold text-foreground leading-none">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {status === "error" && errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={disabled}
                  className="flex-1 rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={disabled}
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reserving…
                    </>
                  ) : status === "error" ? (
                    "Try again"
                  ) : (
                    `Confirm · $${total.toFixed(2)}`
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
