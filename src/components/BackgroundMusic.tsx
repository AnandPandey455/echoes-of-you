import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";

/**
 * Background music controller.
 *
 * To set the song, edit the <audio id="bg-music"> tag in index.html and
 * change its `src` to point to your audio file (relative paths supported,
 * e.g. "/music/song.mp3" if you place it in the public/ folder).
 *
 * Browser autoplay policy: playback only starts after the user clicks Play.
 */
export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const el = document.getElementById("bg-music") as HTMLAudioElement | null;
    audioRef.current = el;
    if (el && el.getAttribute("src")) {
      setAvailable(true);
      el.loop = true;
      el.volume = 0.5;
    }
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  if (!available) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4.5, duration: 0.8 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggle}
      className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-card/70 backdrop-blur-md border border-border flex items-center justify-center text-primary glow-soft"
      aria-label={playing ? "Pause music" : "Play music"}
    >
      {playing ? <Pause size={18} /> : <Music size={18} />}
    </motion.button>
  );
};
