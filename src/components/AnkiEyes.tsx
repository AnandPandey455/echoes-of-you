import { motion, AnimatePresence, MotionValue } from "framer-motion";
import { useMemo } from "react";
import { PoemSection } from "@/context/PoemContext";

interface AnkiEyesProps {
  size?: number;
  section?: PoemSection;
  /** Optional scroll progress (kept for API compatibility, no longer used for gaze). */
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
  /** Additional vertical pupil/iris bias to simulate looking down while reading. */
  lookDown?: boolean;
}

/**
 * Anki-Vector style eyes: solid glowing rounded shapes (no pupils).
 * Expressions come from scaling/skewing the eye shape itself.
 */
export const AnkiEyes = ({ size = 280, section = "intro", className = "" }: AnkiEyesProps) => {
  const config: EyeConfig = useMemo(() => {
    switch (section) {
      case "verse1":
        return { eyeScaleY: 0.55, eyeScaleX: 1.05, eyeRadius: 50, skewY: 0, translateY: 2, blinkInterval: 4, happy: true };
      case "chorus":
        return { eyeScaleY: 1.1, eyeScaleX: 1, eyeRadius: 38, skewY: 6, translateY: 4, blinkInterval: 6, droopy: true, lookDown: true };
      case "verse2":
        return { eyeScaleY: 0.95, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 5, gazeX: -10 };
      case "bridge":
        return { eyeScaleY: 0.95, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 5, gazeX: -12 };
      case "outro":
        return { eyeScaleY: 1, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 2, blinkInterval: 5, crying: true, lookDown: true };
      default:
        // intro: neutral, no reading sweep
        return { eyeScaleY: 1, eyeScaleX: 1, eyeRadius: 38, skewY: 0, translateY: 0, blinkInterval: 4 };
    }
  }, [section]);

  const overrideGaze = config.gazeX !== undefined;
  // Crying outro stays steady so tears align with the eyes; intro is also still.
  const isReading = section !== "intro" && section !== "outro" && !overrideGaze;

  // Reading sweep: smoothly pan left→right→left, like scanning a line of text.
  const sweepX = isReading ? [-14, 14, -14] : overrideGaze ? config.gazeX ?? 0 : 0;
  const sweepTransition = isReading
    ? { x: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const } }
    : { x: { type: "spring" as const, stiffness: 80, damping: 18 } };

  // When gazing sideways, asymmetrically scale eyes (near eye bigger, far eye smaller)
  // to simulate perspective foreshortening of a head turn.
  const gazingLeft = overrideGaze && (config.gazeX ?? 0) < 0;
  const gazingRight = overrideGaze && (config.gazeX ?? 0) > 0;
  const leftEyeBias = gazingLeft ? 1.18 : gazingRight ? 0.85 : 1;
  const rightEyeBias = gazingLeft ? 0.85 : gazingRight ? 1.18 : 1;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.6 }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center gap-[12%]"
        animate={{ y: [0, -6, 0], x: sweepX }}
        transition={{
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          ...sweepTransition,
        }}
      >
        <Eye config={config} side="left" sizeBias={leftEyeBias} />
        <Eye config={config} side="right" sizeBias={rightEyeBias} />
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
  side: "left" | "right";
}

const Eye = ({ config, side }: EyeProps) => {
  const blinkControls = useBlink(config.blinkInterval);
  const skewY = side === "left" ? config.skewY : -config.skewY;

  // Looking down: nudge the inner highlight core lower so the "gaze" reads as downward.
  const coreOffsetY = config.lookDown ? "12%" : "0%";

  return (
    <motion.div
      className="relative"
      style={{ width: "38%", aspectRatio: "1 / 1.15", y: config.translateY }}
      animate={{
        scaleY: config.eyeScaleY,
        scaleX: config.eyeScaleX,
        skewY,
      }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
    >
      <motion.div
        className="absolute inset-0 glow-eye overflow-hidden"
        style={{
          background: "var(--gradient-eye)",
          borderRadius: `${config.eyeRadius}%`,
        }}
        animate={blinkControls}
      >
        {/* Inner brightness core — shifts down for "looking down" gaze */}
        <div
          className="absolute inset-[8%] rounded-[inherit] opacity-70 transition-transform duration-700"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, hsl(195 100% 92% / 0.9) 0%, hsl(195 100% 80% / 0.3) 35%, transparent 70%)",
            transform: `translateY(${coreOffsetY})`,
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

        {config.crying && (
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-eye-tear/40 via-transparent to-eye-tear/30" />
        )}
      </motion.div>
    </motion.div>
  );
};

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

/**
 * Hearts pop from AROUND the eyes (a ring/halo at distance), not from inside them.
 * We expand outside the parent bounds using negative insets and overflow-visible.
 */
const HeartBurst = () => {
  const hearts = Array.from({ length: 10 });
  return (
    <div className="pointer-events-none absolute -inset-[60%] overflow-visible">
      {hearts.map((_, i) => {
        // Distribute around a ring at distance from the eyes
        const angle = (i / hearts.length) * Math.PI * 2 + Math.random() * 0.4;
        const radius = 38 + Math.random() * 14; // % of container
        const startX = 50 + Math.cos(angle) * radius;
        const startY = 50 + Math.sin(angle) * radius;
        const drift = Math.cos(angle) * 30;
        const delay = i * 0.18 + Math.random() * 0.3;
        const fontSize = 18 + Math.random() * 14;
        return (
          <motion.div
            key={i}
            className="absolute text-heart"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              fontSize,
              filter: "drop-shadow(0 0 8px hsl(var(--heart) / 0.6))",
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, -40, -90],
              x: [0, drift * 0.5, drift],
              scale: [0.3, 1.1, 0.9],
            }}
            transition={{ duration: 2.8, delay, ease: "easeOut", repeat: Infinity, repeatDelay: 1.2 }}
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
