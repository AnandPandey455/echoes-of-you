import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { AnkiEyes } from "@/components/AnkiEyes";
import { PoemProvider, usePoem } from "@/context/PoemContext";
import { PoemSectionView } from "@/components/PoemSectionView";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const POEM = [
  {
    id: "verse1" as const,
    title: "Verse I",
    lines: [
      "Where have you been, my heart?",
      "I searched for you in every part.",
      "My eyes grew numb, my soul grew weary,",
      "Heavy with silence, the days grew dreary.",
    ],
  },
  {
    id: "chorus" as const,
    title: "Chorus",
    lines: [
      "I said good morning, wished you light,",
      "Hoping you'd make my world feel bright.",
      "But you took it light, with words of your own,",
      "And I listened closely, though my voice was unknown.",
    ],
  },
  {
    id: "verse2" as const,
    title: "Verse II",
    lines: [
      "Hardly you asked how my skies unfold,",
      "If my day was warm, or if it turned cold.",
      "I carried the weight, I held it inside,",
      "Waiting for your care to turn the tide.",
    ],
  },
  {
    id: "bridge" as const,
    title: "Bridge",
    lines: [
      "My heart beats steady, my voice stays true,",
      "Even when you don't ask what I've been through.",
    ],
  },
  {
    id: "outro" as const,
    title: "Outro",
    lines: [
      "So here I stand, with hope unspoken,",
      "A song for you, though left unbroken.",
      "Where have you been, my heart so true?",
      "I searched the world, and found it's only you.",
    ],
  },
];

const FixedReadingEyes = () => {
  const { active } = usePoem();
  const { scrollYProgress } = useScroll();

  // When the eyes are "looking left" (verse2 / bridge), the whole island
  // drifts to the bottom-left corner of the screen for a contemplative feel.
  const isLookingLeft = active === "verse2" || active === "bridge";

  return (
    <AnimatePresence>
      {active !== "intro" && (
        <motion.div
          key="fixed-eyes"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: isLookingLeft ? "auto" : "1rem",
            bottom: isLookingLeft ? "1.5rem" : "auto",
            left: isLookingLeft ? "1.5rem" : "50%",
            x: isLookingLeft ? 0 : "-50%",
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.6 },
            top: { duration: 0.8, ease: "easeInOut" },
            bottom: { duration: 0.8, ease: "easeInOut" },
            left: { type: "spring", stiffness: 70, damping: 20 },
            x: { type: "spring", stiffness: 70, damping: 20 },
          }}
          className="fixed z-40 pointer-events-none"
          style={{ top: "1rem", left: "50%" }}
        >
          <div className="bg-card/40 backdrop-blur-md rounded-full px-4 py-2 border border-border/50">
            <AnkiEyes size={90} section={active} scrollProgress={scrollYProgress} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InnerPage = () => {
  const [phase, setPhase] = useState<"hero" | "title">("hero");

  useEffect(() => {
    const t = setTimeout(() => setPhase("title"), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <FixedReadingEyes />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <AnimatePresence>
          {phase === "hero" && (
            <motion.div
              key="hero-eyes"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ y: "-150vh", opacity: 0 }}
              transition={{
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                y: { type: "spring", stiffness: 60, damping: 18 },
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <AnkiEyes size={320} section="intro" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "title" && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center"
            >
              <motion.h1
                className="font-serif italic text-5xl md:text-7xl text-gradient leading-tight"
                initial={{ letterSpacing: "0.1em", opacity: 0 }}
                animate={{ letterSpacing: "0em", opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              >
                Where have you been?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 text-sm md:text-base uppercase tracking-[0.5em] text-muted-foreground"
              >
                scroll to read
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                  opacity: { delay: 1.6, duration: 0.6 },
                  y: { delay: 1.6, duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                }}
                className="mt-10 mx-auto w-px h-16 bg-gradient-to-b from-primary/80 to-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* POEM */}
      <div className="relative">
        {POEM.map((s) => (
          <PoemSectionView key={s.id} id={s.id} title={s.title} lines={s.lines} />
        ))}
      </div>

      {/* OUTRO SIGNATURE */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="pb-20 pt-10 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground"
      >
        — for you —
      </motion.footer>

      <MusicUploader />
    </main>
  );
};

const Index = () => (
  <PoemProvider>
    <InnerPage />
  </PoemProvider>
);

export default Index;
