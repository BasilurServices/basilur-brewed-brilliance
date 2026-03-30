import TeaCupAnimation, { ScrollBeat } from "@/components/TeaCupAnimation";
import ReviewSystem from "@/components/ReviewSystem";
import { useScroll, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const Index = () => {
  const teaRef = useRef<HTMLDivElement>(null);
  const [teaScrollVal, setTeaScrollVal] = useState(0);
  const { scrollYProgress } = useScroll({
    target: teaRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => setTeaScrollVal(v));
  }, [scrollYProgress]);

  return (
    <main className="bg-white min-h-screen min-h-[100dvh] relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 pt-8 pb-6">
        <img 
          src="/logo.png" 
          alt="Basilur Logo" 
          className="h-8 sm:h-11 w-auto object-contain" 
        />
        <div className="hidden sm:flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase text-slate-600 font-medium">
          <a 
            href="https://www.basilurtea.com/collections/leaf-of-ceylon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Collection
          </a>
          <button 
            onClick={() => {
              const element = document.querySelector('[data-tea-container]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-slate-900 transition-colors cursor-pointer uppercase tracking-[0.2em] text-[11px]"
          >
            Story
          </button>
        </div>
      </nav>

      {/* Hero Section: Review System (Loads First) */}
      <div className="relative z-10">
        <ReviewSystem />
      </div>

      {/* Scrollytelling Canvas: Cup Animation (Triggers on Scroll) */}
      <div ref={teaRef} data-tea-container className="-mt-[50vh] sm:mt-0">
        <TeaCupAnimation />
      </div>

      {/* Global Fixed Last Beat for Perfect Locking */}
      <ScrollBeat scrollProgress={teaScrollVal} start={0.75} end={0.95} align="center" isLast>
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[0.9]">
          Your Turn
          <br />
          <span className="text-tea-gold">to Taste</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 font-light tracking-wide max-w-[280px] sm:max-w-md mx-auto">
          Scan, sip, and share your review
        </p>
        <a 
          href="https://www.basilurtea.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8"
        >
          <motion.button
            className="px-8 py-3 bg-primary text-primary-foreground font-medium tracking-wide rounded-full text-sm hover:brightness-110 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Collection
          </motion.button>
        </a>
      </ScrollBeat>

      {/* Footer */}
      <footer className="bg-white pt-6 pb-10 sm:py-12 px-6 sm:px-12 border-t border-slate-100/50">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-6">
          <div className="text-slate-900 font-bold text-sm sm:text-lg tracking-[0.15em] uppercase">
            Basilur
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 tracking-wide whitespace-nowrap">
            Premium Fresh Tea · Sri Lanka
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600/50 whitespace-nowrap">
            © 2026 Basilur Tea
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
