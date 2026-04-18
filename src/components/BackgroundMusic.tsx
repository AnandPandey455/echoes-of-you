import { useEffect, useRef } from "react";

/**
 * Background music auto-player.
 *
 * To set the song, edit the <audio id="bg-music"> tag in index.html and
 * change its `src` to point to your audio file (relative paths supported,
 * e.g. "/music/song.mp3" if you place it in the public/ folder).
 *
 * The audio will auto-play when the page loads.
 */
export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("bg-music") as HTMLAudioElement | null;
    audioRef.current = el;
    if (el && el.getAttribute("src")) {
      el.loop = true;
      el.volume = 0.5;
      
      // Attempt to auto-play
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play failed, will require user interaction
          console.log("Auto-play failed. Audio will start on first user interaction.");
          // Listen for user interaction to play
          const playOnInteraction = () => {
            el.play().catch(() => {});
            document.removeEventListener("click", playOnInteraction);
            document.removeEventListener("keydown", playOnInteraction);
          };
          document.addEventListener("click", playOnInteraction);
          document.addEventListener("keydown", playOnInteraction);
        });
      }
    }
  }, []);

  // This component doesn't render anything, just controls the audio
  return null;
};
