import { useEffect, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { PoemSection, usePoem } from "@/context/PoemContext";

interface PoemSectionViewProps {
  id: PoemSection;
  title?: string;
  lines: string[];
}

export const PoemSectionView = ({ id, title, lines }: PoemSectionViewProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { setActive } = usePoem();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(id);
        });
      },
      { threshold: 0.55 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, setActive]);

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-6 max-w-2xl mx-auto"
    >
      {title && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] text-primary/80 mb-6"
        >
          {title}
        </motion.p>
      )}
      <Stanza lines={lines} />
    </section>
  );
};

const Stanza = ({ lines }: { lines: string[] }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.4 }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
    }}
    className="space-y-3 text-center"
  >
    {lines.map((line, i) => (
      <motion.p
        key={i}
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
          show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } },
        }}
        className="font-serif text-2xl md:text-3xl leading-relaxed text-foreground/90"
      >
        {line}
      </motion.p>
    ))}
  </motion.div>
);
