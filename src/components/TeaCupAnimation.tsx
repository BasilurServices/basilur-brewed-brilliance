import { useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Leaf {
  angle: number;
  radius: number;
  size: number;
  speed: number;
  wobble: number;
  phase: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "steam" | "gold";
}

const LEAF_COUNT = 12;
const PARTICLE_COUNT = 40;

const leafColors = [
  "rgba(76, 140, 60, 0.85)",
  "rgba(60, 120, 45, 0.8)",
  "rgba(90, 160, 70, 0.75)",
  "rgba(50, 100, 38, 0.8)",
  "rgba(80, 150, 55, 0.7)",
];

function createLeaves(): Leaf[] {
  return Array.from({ length: LEAF_COUNT }, (_, i) => ({
    angle: (i / LEAF_COUNT) * Math.PI * 2,
    radius: 100 + Math.random() * 80,
    size: 8 + Math.random() * 12,
    speed: 0.3 + Math.random() * 0.4,
    wobble: Math.random() * 20,
    phase: Math.random() * Math.PI * 2,
    color: leafColors[i % leafColors.length],
  }));
}

function createParticle(
  cx: number,
  cy: number,
  type: "steam" | "gold"
): Particle {
  if (type === "steam") {
    return {
      x: cx + (Math.random() - 0.5) * 40,
      y: cy - 60,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.5 - Math.random() * 1.5,
      life: 0,
      maxLife: 80 + Math.random() * 60,
      size: 2 + Math.random() * 3,
      color: "steam",
      type: "steam",
    };
  }
  return {
    x: cx + (Math.random() - 0.5) * 200,
    y: cy + (Math.random() - 0.5) * 200,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    life: 0,
    maxLife: 120 + Math.random() * 80,
    size: 1 + Math.random() * 2,
    color: "gold",
    type: "gold",
  };
}

function drawTeaCup(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  scale: number
) {
  const cupOpacity = Math.min(1, progress * 5);
  if (cupOpacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = cupOpacity;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Saucer
  ctx.beginPath();
  ctx.ellipse(0, 55, 75, 18, 0, 0, Math.PI * 2);
  const saucerGrad = ctx.createRadialGradient(0, 55, 10, 0, 55, 75);
  saucerGrad.addColorStop(0, "rgba(40, 60, 45, 0.9)");
  saucerGrad.addColorStop(0.7, "rgba(25, 42, 30, 0.85)");
  saucerGrad.addColorStop(1, "rgba(15, 28, 20, 0.6)");
  ctx.fillStyle = saucerGrad;
  ctx.fill();

  // Cup body
  ctx.beginPath();
  ctx.moveTo(-45, -30);
  ctx.bezierCurveTo(-50, 20, -35, 50, -25, 52);
  ctx.lineTo(25, 52);
  ctx.bezierCurveTo(35, 50, 50, 20, 45, -30);
  ctx.closePath();
  const cupGrad = ctx.createLinearGradient(-50, -30, 50, 52);
  cupGrad.addColorStop(0, "rgba(30, 55, 35, 0.95)");
  cupGrad.addColorStop(0.5, "rgba(22, 45, 28, 0.9)");
  cupGrad.addColorStop(1, "rgba(15, 35, 20, 0.85)");
  ctx.fillStyle = cupGrad;
  ctx.fill();

  // Cup rim highlight
  ctx.beginPath();
  ctx.ellipse(0, -30, 45, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(35, 65, 40, 0.9)";
  ctx.fill();

  // Tea liquid inside
  ctx.beginPath();
  ctx.ellipse(0, -28, 40, 10, 0, 0, Math.PI * 2);
  const teaLiquid = progress > 0.4 ? Math.min(1, (progress - 0.4) * 3.3) : 0;
  const teaGrad = ctx.createRadialGradient(0, -28, 5, 0, -28, 40);
  teaGrad.addColorStop(0, `rgba(180, 130, 50, ${teaLiquid * 0.9})`);
  teaGrad.addColorStop(0.6, `rgba(140, 95, 30, ${teaLiquid * 0.8})`);
  teaGrad.addColorStop(1, `rgba(100, 65, 15, ${teaLiquid * 0.6})`);
  ctx.fillStyle = teaGrad;
  ctx.fill();

  // Handle
  ctx.beginPath();
  ctx.strokeStyle = "rgba(30, 55, 35, 0.8)";
  ctx.lineWidth = 5;
  ctx.moveTo(45, -15);
  ctx.bezierCurveTo(70, -10, 70, 35, 45, 38);
  ctx.stroke();

  // Rim shine
  ctx.beginPath();
  ctx.strokeStyle = "rgba(120, 160, 100, 0.25)";
  ctx.lineWidth = 1;
  ctx.ellipse(0, -30, 44, 11, 0, -0.3, Math.PI + 0.3);
  ctx.stroke();

  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.6, -size * 0.6, size * 0.6, size * 0.6, 0, size);
  ctx.bezierCurveTo(
    -size * 0.6,
    size * 0.6,
    -size * 0.6,
    -size * 0.6,
    0,
    -size
  );
  ctx.fillStyle = color;
  ctx.fill();

  // Leaf vein
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.strokeStyle = `rgba(40, 80, 30, ${opacity * 0.5})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

const TeaCupAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const leavesRef = useRef<Leaf[]>(createLeaves());
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const scrollIndicatorOpacity = useTransform(
    smoothProgress,
    [0, 0.08],
    [1, 0]
  );

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
      ctx.scale(dpr, dpr);
    }

    const progress = progressRef.current;
    timeRef.current += 0.016;
    const time = timeRef.current;

    // Clear
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 20;
    const baseScale = Math.min(w / 800, h / 800) * 1.2;

    // Draw orbiting leaves
    const leafOpacity = Math.min(1, progress * 4);
    const leafSpread = 0.3 + progress * 0.7;
    leavesRef.current.forEach((leaf) => {
      const currentAngle = leaf.angle + time * leaf.speed * leafSpread;
      const wobbleOffset =
        Math.sin(time * 1.5 + leaf.phase) * leaf.wobble * leafSpread;
      const currentRadius = (leaf.radius + wobbleOffset) * baseScale;
      const verticalWobble =
        Math.sin(time * 0.8 + leaf.phase * 2) * 15 * baseScale;

      const lx = cx + Math.cos(currentAngle) * currentRadius;
      const ly = cy + Math.sin(currentAngle) * currentRadius * 0.4 + verticalWobble;

      drawLeaf(
        ctx,
        lx,
        ly,
        leaf.size * baseScale * 0.8,
        currentAngle + time * 0.5,
        leaf.color,
        leafOpacity * (0.5 + Math.sin(time + leaf.phase) * 0.3)
      );
    });

    // Draw cup
    drawTeaCup(ctx, cx, cy, progress, baseScale);

    // Front leaves (drawn after cup for depth)
    leavesRef.current.slice(0, 4).forEach((leaf) => {
      const currentAngle = leaf.angle + time * leaf.speed * leafSpread + Math.PI;
      const wobbleOffset =
        Math.sin(time * 1.5 + leaf.phase) * leaf.wobble * leafSpread;
      const currentRadius = (leaf.radius * 0.7 + wobbleOffset) * baseScale;
      const verticalWobble =
        Math.sin(time * 0.8 + leaf.phase * 2) * 10 * baseScale;

      const lx = cx + Math.cos(currentAngle) * currentRadius;
      const ly =
        cy + Math.sin(currentAngle) * currentRadius * 0.35 + verticalWobble + 20;

      drawLeaf(
        ctx,
        lx,
        ly,
        leaf.size * baseScale * 0.6,
        currentAngle + time * 0.3,
        leaf.color,
        leafOpacity * 0.4
      );
    });

    // Steam particles
    const steamIntensity = progress > 0.3 ? Math.min(1, (progress - 0.3) * 2.5) : 0;
    if (steamIntensity > 0) {
      if (Math.random() < steamIntensity * 0.3) {
        particlesRef.current.push(createParticle(cx, cy - 40 * baseScale, "steam"));
      }
    }

    // Gold particles
    if (progress > 0.2 && Math.random() < 0.15) {
      particlesRef.current.push(createParticle(cx, cy, "gold"));
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life > p.maxLife) return false;

      const lifeRatio = p.life / p.maxLife;
      const fadeIn = Math.min(1, lifeRatio * 5);
      const fadeOut = Math.max(0, 1 - (lifeRatio - 0.7) / 0.3);
      const alpha = fadeIn * fadeOut;

      if (p.type === "steam") {
        p.vy -= 0.01;
        p.vx += Math.sin(time * 3 + p.x * 0.01) * 0.02;
        const steamAlpha = alpha * steamIntensity * 0.3;
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size * (1 + lifeRatio * 3)
        );
        gradient.addColorStop(0, `rgba(200, 170, 100, ${steamAlpha})`);
        gradient.addColorStop(1, `rgba(200, 170, 100, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + lifeRatio * 3), 0, Math.PI * 2);
        ctx.fill();
      } else {
        const goldAlpha = alpha * 0.6;
        ctx.fillStyle = `rgba(220, 185, 100, ${goldAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size * 4
        );
        glow.addColorStop(0, `rgba(220, 185, 100, ${goldAlpha * 0.3})`);
        glow.addColorStop(1, `rgba(220, 185, 100, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      return true;
    });

    // Keep particle count reasonable
    if (particlesRef.current.length > PARTICLE_COUNT) {
      particlesRef.current = particlesRef.current.slice(-PARTICLE_COUNT);
    }

    // Ambient glow around cup
    const glowAlpha = 0.03 + progress * 0.05;
    const ambientGlow = ctx.createRadialGradient(
      cx, cy, 20 * baseScale,
      cx, cy, 200 * baseScale
    );
    ambientGlow.addColorStop(0, `rgba(180, 140, 50, ${glowAlpha})`);
    ambientGlow.addColorStop(0.5, `rgba(100, 80, 30, ${glowAlpha * 0.3})`);
    ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ambientGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 200 * baseScale, 0, Math.PI * 2);
    ctx.fill();

    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      progressRef.current = v;
    });

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      unsubscribe();
    };
  }, [render, smoothProgress]);

  return (
    <div ref={containerRef} data-tea-container className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Scroll indicator */}
        <motion.div
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
        </motion.div>

        {/* Beat A: 0-20% */}
        <ScrollBeat start={0} end={0.2} align="center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground">
            From Leaf
            <br />
            <span className="text-tea-gold">to Cup</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-light tracking-wide max-w-md mx-auto">
            Experience tea at its freshest
          </p>
        </ScrollBeat>

        {/* Beat B: 25-45% */}
        <ScrollBeat start={0.25} end={0.45} align="left">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-foreground">
            Hand-Plucked
            <br />
            <span className="text-tea-gold">Freshness</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-light tracking-wide max-w-sm">
            Leaves harvested in Baddegama,
            <br />
            same-day processed
          </p>
        </ScrollBeat>

        {/* Beat C: 50-70% */}
        <ScrollBeat start={0.5} end={0.7} align="right">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-foreground">
            The Perfect
            <br />
            <span className="text-tea-gold">Pour</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-light tracking-wide max-w-sm ml-auto">
            Every cup delivered
            <br />
            within 72 hours
          </p>
        </ScrollBeat>

        {/* Beat D: 75-95% */}
        <ScrollBeat start={0.75} end={0.95} align="center">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground">
            Your Turn
            <br />
            <span className="text-tea-gold">to Taste</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-light tracking-wide max-w-md mx-auto">
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

interface ScrollBeatProps {
  start: number;
  end: number;
  align: "left" | "center" | "right";
  children: React.ReactNode;
}

const ScrollBeat = ({ start, end, align, children }: ScrollBeatProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress: windowProgress } = useScroll();

  const smoothWindowProgress = useSpring(windowProgress, {
    stiffness: 100,
    damping: 30,
  });

  const beatOpacity = useTransform(smoothWindowProgress, (v) => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = v * docHeight;
    const containerEl = document.querySelector('[data-tea-container]');
    if (!containerEl) return 0;
    const containerRect = containerEl.getBoundingClientRect();
    const containerTop = currentScroll + containerRect.top;
    const containerHeight = containerEl.scrollHeight - window.innerHeight;
    const containerProgress = Math.max(0, Math.min(1, (currentScroll - containerTop) / containerHeight));
    
    const range = end - start;
    const fadeInEnd = start + range * 0.25;
    const fadeOutStart = end - range * 0.25;

    if (containerProgress < start) return 0;
    if (containerProgress > end) return 0;
    if (containerProgress < fadeInEnd) {
      return (containerProgress - start) / (fadeInEnd - start);
    }
    if (containerProgress > fadeOutStart) {
      return 1 - (containerProgress - fadeOutStart) / (end - fadeOutStart);
    }
    return 1;
  });

  const beatY = useTransform(smoothWindowProgress, (v) => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = v * docHeight;
    const containerEl = document.querySelector('[data-tea-container]');
    if (!containerEl) return 20;
    const containerRect = containerEl.getBoundingClientRect();
    const containerTop = currentScroll + containerRect.top;
    const containerHeight = containerEl.scrollHeight - window.innerHeight;
    const containerProgress = Math.max(0, Math.min(1, (currentScroll - containerTop) / containerHeight));
    
    if (containerProgress < start) return 20;
    if (containerProgress > end) return -20;
    const mid = (start + end) / 2;
    if (containerProgress < mid) {
      const t = (containerProgress - start) / (mid - start);
      return 20 * (1 - t);
    }
    const t = (containerProgress - mid) / (end - mid);
    return -20 * t;
  });

  const alignmentClasses = {
    left: "items-start text-left pl-8 sm:pl-16 md:pl-24",
    center: "items-center text-center",
    right: "items-end text-right pr-8 sm:pr-16 md:pr-24",
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 flex flex-col justify-center pointer-events-none ${alignmentClasses[align]}`}
      style={{ opacity: beatOpacity, y: beatY }}
    >
      <div className="pointer-events-auto">{children}</div>
    </motion.div>
  );
};

export default TeaCupAnimation;
