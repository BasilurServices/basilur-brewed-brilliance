import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

const ReviewSystem = () => {
  const [searchParams] = useSearchParams();
  const batch_id = searchParams.get("batch_id") || "BDG-2026-03-001";
  const qr_id = searchParams.get("qr") || "1"; // Default to 1 if not provided
  
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [recommended, setRecommended] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [location, setLocation] = useState<{city?: string, region?: string, country_name?: string, ip?: string} | null>(null);

  // Always visible in Hero section
  useEffect(() => {
    setIsVisible(true);
    console.log("ReviewSystem v3: Component initialized. Batch ID:", batch_id);

    // Fetch approximate location (IP-based)
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
          console.log("ReviewSystem: Location detected:", data.city, data.country_name);
        }
      } catch (err) {
        console.error("Failed to detect location:", err);
      }
    };
    fetchLocation();
  }, [batch_id]);

  const handleSubmit = async () => {
    if (rating === null || recommended === null) return;

    console.log("ReviewSystem v3: Submitting review...", { batch_id, qr_id, rating, recommended });
    // Instant success state (as per UX rules)
    setIsSubmitted(true);

    // Behind the scenes submission
    try {
      const { error } = await supabase.from("reviews").insert([
          {
            batch_id,
            qr_id,
            rating,
            recommended,
            ip_address: location?.ip,
            location_city: location?.city,
            location_region: location?.region,
            location_country: location?.country_name,
          },
        ]);
      if (error) {
        console.error("Error submitting review:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }
    } catch (e) {
      console.error("Submission failed:", e);
    }
  };

  const isButtonEnabled = rating !== null && recommended !== null;

  return (
    <section 
      id="review-section"
      className="relative px-4 overflow-hidden flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "transparent" }}
    >
      <AnimatePresence>
        {isVisible && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl flex flex-col items-center space-y-6 sm:space-y-10 pb-32 sm:pb-40"
          >
            {/* Title */}
            <h1 className="text-3xl sm:text-7xl font-bold tracking-tight text-slate-900 text-center leading-tight">
              Your cup. <br />
              <span className="text-tea-gold">Your opinion.</span>
            </h1>

            {/* Star Rating */}
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={rating === star ? { scale: [1, 1.1, 1] } : {}}
                  transition={rating === star ? { duration: 0.3 } : {}}
                  className="focus:outline-none relative group"
                >
                  <Star
                    className={`w-10 h-10 sm:w-14 sm:h-14 transition-colors duration-200 ${
                      (hoverRating || rating || 0) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300 hover:text-slate-400"
                    }`}
                  />
                  {(hoverRating || rating || 0) >= star && (
                    <motion.div
                      layoutId="star-glow"
                      className="absolute inset-0 blur-xl bg-yellow-400/20 -z-10"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Recommendation Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full">
              <button
                onClick={() => setRecommended(true)}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full border transition-all duration-300 ${
                  recommended === true
                    ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Recommend</span>
              </button>
              <button
                onClick={() => setRecommended(false)}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full border transition-all duration-300 ${
                  recommended === false
                    ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Not for me</span>
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              disabled={!isButtonEnabled}
              onClick={handleSubmit}
              whileHover={isButtonEnabled ? { scale: 1.05 } : {}}
              whileTap={isButtonEnabled ? { scale: 0.95 } : {}}
              className={`mt-4 sm:mt-6 px-12 py-4 sm:px-16 sm:py-5 rounded-full font-bold uppercase tracking-widest transition-all duration-500 w-full sm:w-auto ${
                isButtonEnabled
                  ? "bg-slate-900 text-white shadow-lg opacity-100 cursor-pointer hover:bg-slate-800"
                  : "bg-slate-100 text-slate-500 cursor-not-allowed opacity-50 border border-slate-200"
              }`}
            >
              Submit Feedback
            </motion.button>

          </motion.div>
        )}

        {/* Unified Scroll Indicator - outside the flex flow to stay at bottom */}
        {isVisible && (
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: isSubmitted ? 0.5 : 0.8 }}
              className="flex flex-col items-center gap-2 sm:gap-4"
            >
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-[9px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-slate-500 whitespace-nowrap"
            >
              Scroll to Explore
            </motion.span>
            
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-px h-6 sm:h-12 bg-gradient-to-b from-tea-gold/80 via-tea-gold/40 to-transparent" />
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-tea-gold/60" />
            </motion.div>
          </motion.div>
          </div>
        )}

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
              >
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              Thank you for your feedback
            </h3>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReviewSystem;
