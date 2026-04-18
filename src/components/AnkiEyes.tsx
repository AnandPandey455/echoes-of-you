import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useEffect, useMemo } from "react";
import { PoemSection } from "@/context/PoemContext";

interface AnkiEyesProps {
  size?: number;
  section?: PoemSection;
  /** Optional scroll progress (0-1) used for "reading" eye movement. */
  scrollProgress?: MotionValue<number>;
  className?: string;
}

/**
 * Anki-Vector style eyes with idle float, blink, and emotional states.
 */
export const AnkiEyes = ({ size = 280, section = "intro", scrollProgress, className = "" }: AnkiEyesProps) => {
  // Per-section visual config
  const config = useMemo(() => {
    switch (section) {
      case "verse1":
        return { eyeScaleY: 0.85, eyeRadius: 28, pupilX: 0, pupilY: -2, blinkInterval: 4, glowHue: 199 };
      case "chorus":
        return { eyeScaleY: 1.15, eyeRadius: 22, pupilX: 0, pupilY: 6, blinkInterval: 6, glowHue: 210, droopy: true };
      case "verse2":
        return { eyeScaleY: 1, eyeRadius: 22, pupilX: -14, pupilY: 0, blinkInterval: 5, glowHue: 199 };
      case "bridge":
        return { eyeScaleY: 1, eyeRadius: 22, pupilX: -16, pupilY: 1, blinkInterval: 5, glowHue: 199 };
      case "outro":
        return { eyeScaleY: 1, eyeRadius: 22, pupilX: 0, pupilY: 2, blinkInterval: 5, glowHue: 199, crying: true };
      default:
        return { eyeScaleY: 1, eyeRadius: 22, pupilX: 0, pupilY: 0, blinkInterval: 4, glowHue: 199 };
    }
  }, [section]);

  // Scroll-driven pupil tracking (simulates reading left→right→left)
  const fallback = useMotionValue(0);
  const scroll = scrollProgress ?? fallback;
  const readingX = useTransform(scroll, [0, 0.25, 0.5, 0.75, 1], [-10, 10, -10, 10, -8]);
  const readingY = useTransform(scroll, [0, 1], [-2, 4]);
  const smoothX = useSpring(readingX, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(readingY, { stiffness: 80, damping: 18 });

  // When emotional state forces a gaze, override scroll-following.
  const overrideGaze = section === "verse2" || section === "bridge" || section === "verse1";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.55 }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center gap-[10%]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Eye config={config} smoothX={smoothX} smoothY={smoothY} overrideGaze={overrideGaze} side="left" />
        <Eye config={config} smoothX={smoothX} smoothY={smoothY} overrideGaze={overrideGaze} side="right" />
      </motion.div>

      {/* Heart particles for verse1 */}
      <AnimatePresence>
        {section === "verse1" && <HeartBurst key="hearts" />}
      </AnimatePresence>

      {/* Tears for outro */}
      <AnimatePresence>
        {section === "outro" && <Tears key="tears" />}
      </AnimatePresence>
    </div>
  );
};

interface EyeProps {
  config: {
    eyeScaleY: number;
    eyeRadius: number;
    pupilX: number;
    pupilY: number;
    blinkInterval: number;
    droopy?: boolean;
    crying?: boolean;
  };
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  overrideGaze: boolean;
  side: "left" | "right";
}

const Eye = ({ config, smoothX, smoothY, overrideGaze, side }: EyeProps) => {
  const blinkControls = useBlink(config.blinkInterval, config.droopy ? 0.18 : 0.08);

  // Combine override (emotional gaze) and scroll-driven gaze.
  const x = useTransform(smoothX, (v) => (overrideGaze ? config.pupilX : v + config.pupilX * 0.2));
  const y = useTransform(smoothY, (v) => (overrideGaze ? config.pupilY : v + config.pupilY * 0.4));

  return (
    <motion.div
      className="relative"
      style={{ width: "40%", aspectRatio: "1 / 1.1" }}
      animate={{ scaleY: config.eyeScaleY, scaleX: config.droopy ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
    >
      {/* Eye body */}
      <motion.div
        className="absolute inset-0 glow-eye"
        style={{
          background: "var(--gradient-eye)",
          borderRadius: `${config.eyeRadius}%`,
        }}
        animate={blinkControls}
      >
        {/* Pupil / highlight */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[22%] h-[22%] rounded-full bg-background/80"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        />
        <motion.div
          className="absolute top-[22%] left-[22%] w-[18%] h-[18%] rounded-full bg-foreground/90 blur-[1px]"
        />
        {/* Sad droop overlay */}
        {config.droopy && (
          <div
            className="absolute -bottom-[2%] left-0 right-0 h-[35%] bg-background/70"
            style={{
              borderTopLeftRadius: side === "left" ? "0%" : "60%",
              borderTopRightRadius: side === "left" ? "60%" : "0%",
            }}
          />
        )}
        {/* Glassy crying overlay */}
        {config.crying && (
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-eye-tear/30 via-transparent to-eye-tear/20" />
        )}
      </motion.div>
    </motion.div>
  );
};

/** Returns animate prop that blinks every `interval` seconds with `closed` scaleY. */
const useBlink = (interval: number, closed: number) => {
  // Build a keyframe that closes briefly within the interval.
  const closedAt = 0.96;
  return {
    scaleY: [1, 1, closed, 1],
    transition: {
      duration: interval,
      times: [0, closedAt - 0.02, closedAt, 1],
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
