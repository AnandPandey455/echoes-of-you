import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Pause, X } from "lucide-react";

export const MusicUploader = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    audioRef.current.src = url;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    setFileName(file.name);
  };

  const toggle = () => {
    if (!audioRef.current?.src) {
      inputRef.current?.click();
      return;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4.5, duration: 0.8 }}
      className="fixed bottom-5 right-5 z-50 flex items-end gap-2"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-4 shadow-2xl glow-soft max-w-[260px]"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Background music</p>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-foreground/70 mb-3 truncate">
              {fileName ? `♪ ${fileName}` : "Choose a song to play softly"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {fileName ? "Change" : "Upload"}
              </button>
              {fileName && (
                <button
                  onClick={toggle}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              onChange={handleFile}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-card/70 backdrop-blur-md border border-border flex items-center justify-center text-primary glow-soft"
        aria-label="Music settings"
      >
        <Music size={18} />
      </motion.button>
    </motion.div>
  );
};
