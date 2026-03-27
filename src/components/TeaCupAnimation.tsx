import { useRef, useEffect, useCallback, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

// ScrollBeat as a standalone component using scroll position
interface ScrollBeatProps {
  scrollProgress: number;
  start: number;
  end: number;
  align: "left" | "center" | "right";
  children: React.ReactNode;
}

const ScrollBeat = ({ scrollProgress, start, end, align, children }: ScrollBeatProps) => {
  const range = end - start;
  const fadeInEnd = start + range * 0.25;
  const fadeOutStart = end - range * 0.25;

  let opacity = 0;
  if (scrollProgress >= start && scrollProgress <= end) {
    if (scrollProgress < fadeInEnd) {
      opacity = (scrollProgress - start) / (fadeInEnd - start);
    } else if (scrollProgress > fadeOutStart) {
      opacity = 1 - (scrollProgress - fadeOutStart) / (end - fadeOutStart);
    } else {
      opacity = 1;
    }
  }

  let y = 20;
  if (scrollProgress >= start && scrollProgress <= end) {
    const mid = (start + end) / 2;
    if (scrollProgress < mid) {
      y = 20 * (1 - (scrollProgress - start) / (mid - start));
    } else {
      y = -20 * ((scrollProgress - mid) / (end - mid));
    }
  } else if (scrollProgress > end) {
    y = -20;
  }

  const alignmentClasses: Record<string, string> = {
    left: "items-start text-left pl-8 sm:pl-16 md:pl-24",
    center: "items-center text-center",
    right: "items-end text-right pr-8 sm:pr-16 md:pr-24",
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-center pointer-events-none ${alignmentClasses[align]}`}
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        transition: "none",
        willChange: "opacity, transform",
      }}
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
};

const FRAME_COUNT = 120;
const images: HTMLImageElement[] = [];

// Preload images
if (typeof window !== "undefined") {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `/sequence/${i}.jpg`;
    images.push(img);
  }
}

const TeaCupAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const [scrollVal, setScrollVal] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track scroll value for text overlays
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      progressRef.current = v;
      setScrollVal(v);
    });
    return unsubscribe;
  }, [smoothProgress]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const progress = progressRef.current;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Draw Image Sequence - start only after 20% scroll for a clean white start with "From Leaf to Cup" text
    const sequenceProgress = Math.max(0, (progress - 0.2) / 0.8);
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.floor(sequenceProgress * FRAME_COUNT)
    );
    const img = images[frameIndex];

    if (progress > 0.2 && img && img.complete) {
      const imgW = img.width;
      const imgH = img.height;
      const imgRatio = imgW / imgH;
      const canvasRatio = w / h;

      let drawW, drawH;
      if (canvasRatio > imgRatio) {
        drawW = w;
        drawH = w / imgRatio;
      } else {
        drawH = h;
        drawW = h * imgRatio;
      }

      // Optimize for mobile: Reduce scale on narrow screens to prevent the subject (tea cup) 
      // from being too zoomed in. Since image BG is white, it blends with canvas.
      const isMobile = w < 768;
      const mobileScale = 0.65; // Adjust this to control how "zoomed out" the cup looks on mobile
      const finalScale = isMobile ? mobileScale : 1.0;
      
      const scaledW = drawW * finalScale;
      const scaledH = drawH * finalScale;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
      ctx.restore();
    }

    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  const scrollIndicatorOpacity = scrollVal < 0.08 ? 1 - scrollVal / 0.08 : 0;

  return (
    <div ref={containerRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Initial White Window Fade-out */}
        <motion.div
          className="fixed inset-0 bg-white z-[60] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-sm font-light tracking-[0.3em] uppercase text-muted-foreground">
            Scroll to Explore
          </span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <ScrollBeat scrollProgress={scrollVal} start={0} end={0.2} align="center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-slate-900">
            From Leaf
            <br />
            <span className="text-tea-gold">to Cup</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-light tracking-wide max-w-md mx-auto">
            Experience tea at its freshest
          </p>
        </ScrollBeat>

        {/* Beat B: 25–45% */}
        <ScrollBeat scrollProgress={scrollVal} start={0.25} end={0.45} align="left">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-slate-900">
            Hand-Plucked
            <br />
            <span className="text-tea-gold">Freshness</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-light tracking-wide max-w-sm">
            Leaves harvested in Baddegama,
            <br />
            same-day processed
          </p>
        </ScrollBeat>

        {/* Beat C: 50–70% */}
        <ScrollBeat scrollProgress={scrollVal} start={0.5} end={0.7} align="right">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-slate-900">
            The Perfect
            <br />
            <span className="text-tea-gold">Pour</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-light tracking-wide max-w-sm ml-auto">
            Every cup delivered
            <br />
            within 72 hours
          </p>
        </ScrollBeat>

        {/* Beat D: 75–95% */}
        <ScrollBeat scrollProgress={scrollVal} start={0.75} end={0.95} align="center">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900">
            Your Turn
            <br />
            <span className="text-tea-gold">to Taste</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-light tracking-wide max-w-md mx-auto">
            Scan, sip, and share your review
          </p>
          <motion.button
            className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-medium tracking-wide rounded-full text-sm hover:brightness-110 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Collection
          </motion.button>
        </ScrollBeat>
      </div>
    </div>
  );
};

export default TeaCupAnimation;
