import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

const ReviewSystem = () => {
  const [searchParams] = useSearchParams();
  const batch_id = searchParams.get("batch_id") || "BDG-2026-03-001";
  
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [recommended, setRecommended] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Always visible in Hero section
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async () => {
    if (rating === null || recommended === null) return;

    // Instant success state (as per UX rules)
    setIsSubmitted(true);

    // Behind the scenes submission
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          batch_id,
          rating,
          recommended,
          timestamp: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Error submitting review:", error);
      }
    } catch (e) {
      console.error("Submission failed:", e);
    }
  };

  const isButtonEnabled = rating !== null && recommended !== null;

  return (
    <section 
      id="review-section"
      className="relative py-20 px-4 overflow-hidden flex flex-col items-center justify-center min-h-[90vh] sm:min-h-[85vh]"
      style={{ backgroundColor: "transparent" }}
    >
      <AnimatePresence>
        {isVisible && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl flex flex-col items-center space-y-12"
          >
            {/* Title */}
            <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-slate-900 text-center leading-tight">
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
                        : "text-slate-200"
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
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none">
              <button
                onClick={() => setRecommended(true)}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full border transition-all duration-300 ${
                  recommended === true
                    ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
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
                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
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
              className={`mt-4 sm:mt-10 px-12 py-4 sm:px-16 sm:py-5 rounded-full font-bold uppercase tracking-widest transition-all duration-500 w-full sm:w-auto ${
                isButtonEnabled
                  ? "bg-slate-900 text-white shadow-lg opacity-100 cursor-pointer hover:bg-slate-800"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
              }`}
            >
              Submit Feedback
            </motion.button>

            {/* Scroll indicator (inside main content flow) */}
            {!isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="pt-12 sm:pt-20 flex flex-col items-center gap-4"
              >
                <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xs font-light tracking-[0.3em] uppercase text-slate-400"
                >
                  Scroll to Explore
                </motion.span>
                
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-px h-12 bg-gradient-to-b from-tea-gold/80 via-tea-gold/40 to-transparent" />
                  <ChevronDown className="w-4 h-4 text-tea-gold/60" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
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
