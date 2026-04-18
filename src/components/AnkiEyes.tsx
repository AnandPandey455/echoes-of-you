import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useMemo } from "react";
import { PoemSection } from "@/context/PoemContext";

interface AnkiEyesProps {
  size?: number;
  section?: PoemSection;
  /** Optional scroll progress (0-1) used for "reading" eye movement. */
  scrollProgress?: MotionValue<number>;
  className?: string;
}

interface EyeConfig {
  eyeScaleY: number;
  eyeScaleX: number;
  eyeRadius: number;
  skewY: number;
  translateY: number;
  blinkInterval: number;
  happy?: boolean;
  droopy?: boolean;
  crying?: boolean;
  gazeX?: number;
}

/**
 * Anki-Vector style eyes: solid glowing rounded shapes (no pupils).
 * Expressions come from scaling/skewing the eye shape itself.
 */
export const AnkiEyes = ({ size = 280, section = "intro", scrollProgress, className = "" }: AnkiEyesProps) => {
  const config: EyeConfig = useMemo(() => {
    switch (section) {
      case "verse1":
        // Happy: squinted arches
        return { eyeScaleY: 0.55, eyeScaleX: 1.05, eyeRadius: 50, skewY: 0, translateY: 2, blinkInterval: 4, happy: true };
      case "chorus":
        // Sad: heavier eyes, droopy outer corners
        return { eyeScaleY: 1.1, eyeScaleX: 1, eyeRadius: 38, skewY: 6, translateY: 4, blinkInterval: 6, droopy: true };
      case "verse2":
        return { eyeScaleY: 0.95, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 5, gazeX: -8 };
      case "bridge":
        return { eyeScaleY: 0.95, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 5, gazeX: -10 };
      case "outro":
        return { eyeScaleY: 1, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 2, blinkInterval: 5, crying: true };
      default:
        return { eyeScaleY: 1, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 4 };
    }
  }, [section]);

  // Scroll-driven gaze (subtle horizontal drift while reading)
  const fallback = useMotionValue(0);
  const scroll = scrollProgress ?? fallback;
  const readingX = useTransform(scroll, [0, 0.25, 0.5, 0.75, 1], [-6, 6, -6, 6, -4]);
  const smoothX = useSpring(readingX, { stiffness: 80, damping: 18 });

  const overrideGaze = config.gazeX !== undefined;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.6 }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center gap-[12%]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Eye config={config} smoothX={smoothX} overrideGaze={overrideGaze} side="left" />
        <Eye config={config} smoothX={smoothX} overrideGaze={overrideGaze} side="right" />
      </motion.div>

      <AnimatePresence>
        {section === "verse1" && <HeartBurst key="hearts" />}
      </AnimatePresence>

      <AnimatePresence>
        {section === "outro" && <Tears key="tears" />}
      </AnimatePresence>
    </div>
  );
};

interface EyeProps {
  config: EyeConfig;
  smoothX: MotionValue<number>;
  overrideGaze: boolean;
  side: "left" | "right";
}

const Eye = ({ config, smoothX, overrideGaze, side }: EyeProps) => {
  const blinkControls = useBlink(config.blinkInterval);

  // Combine scroll + emotional gaze on the whole eye container
  const x = useTransform(smoothX, (v) => (overrideGaze ? (config.gazeX ?? 0) : v));

  // Mirror skew on right eye for symmetric droop
  const skewY = side === "left" ? config.skewY : -config.skewY;

  return (
    <motion.div
      className="relative"
      style={{ width: "38%", aspectRatio: "1 / 1.15", x, y: config.translateY }}
      animate={{
        scaleY: config.eyeScaleY,
        scaleX: config.eyeScaleX,
        skewY,
      }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
    >
      {/* Solid glowing eye body — no pupil */}
      <motion.div
        className="absolute inset-0 glow-eye overflow-hidden"
        style={{
          background: "var(--gradient-eye)",
          borderRadius: `${config.eyeRadius}%`,
        }}
        animate={blinkControls}
      >
        {/* Inner brightness core */}
        <div
          className="absolute inset-[8%] rounded-[inherit] opacity-70"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, hsl(195 100% 92% / 0.9) 0%, hsl(195 100% 80% / 0.3) 35%, transparent 70%)",
          }}
        />
        {/* Top specular highlight */}
        <div
          className="absolute top-[12%] left-[18%] w-[35%] h-[25%] rounded-full blur-[2px]"
          style={{
            background:
              "radial-gradient(ellipse, hsl(0 0% 100% / 0.85) 0%, hsl(0 0% 100% / 0.2) 60%, transparent 100%)",
          }}
        />
        {/* Small secondary highlight */}
        <div
          className="absolute bottom-[18%] right-[20%] w-[14%] h-[14%] rounded-full opacity-60 blur-[1px]"
          style={{
            background:
              "radial-gradient(circle, hsl(0 0% 100% / 0.9) 0%, transparent 70%)",
          }}
        />

        {/* Sad lid — covers top portion, angled outward */}
        {config.droopy && (
          <div
            className="absolute -top-[8%] left-0 right-0 h-[45%]"
            style={{
              background: "hsl(var(--background))",
              transform: side === "left" ? "rotate(-12deg) translateY(-10%)" : "rotate(12deg) translateY(-10%)",
              transformOrigin: side === "left" ? "right center" : "left center",
              borderRadius: "0 0 30% 30%",
            }}
          />
        )}

        {/* Crying glassy sheen */}
        {config.crying && (
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-eye-tear/40 via-transparent to-eye-tear/30" />
        )}
      </motion.div>
    </motion.div>
  );
};

/** Blink keyframe — eyes squish shut briefly. */
const useBlink = (interval: number) => {
  return {
    scaleY: [1, 1, 0.05, 1],
    transition: {
      duration: interval,
      times: [0, 0.94, 0.97, 1],
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };
};

const HeartBurst = () => {
  const hearts = Array.from({ length: 8 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {hearts.map((_, i) => {
        const left = 20 + Math.random() * 60;
        const delay = i * 0.12;
        const drift = (Math.random() - 0.5) * 60;
        return (
          <motion.div
            key={i}
            className="absolute text-heart"
            style={{ left: `${left}%`, top: "40%", fontSize: 22 }}
            initial={{ opacity: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], y: -120, x: drift, scale: [0.4, 1.1, 0.8] }}
            transition={{ duration: 2.4, delay, ease: "easeOut" }}
          >
            ♥
          </motion.div>
        );
      })}
    </div>
  );
};

const Tears = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-3 rounded-full bg-eye-tear"
          style={{
            left: i === 0 ? "32%" : "63%",
            top: "55%",
            boxShadow: "0 0 12px hsl(var(--eye-tear) / 0.6)",
          }}
          initial={{ opacity: 0, y: 0, scaleY: 0.6 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 30, 70, 110], scaleY: [0.6, 1.2, 1.4, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.6, ease: "easeIn" }}
        />
      ))}
    </div>
  );
};
