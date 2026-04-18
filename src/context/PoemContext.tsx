import { createContext, useContext, useState, ReactNode } from "react";

export type PoemSection = "intro" | "verse1" | "chorus" | "verse2" | "bridge" | "outro";

interface PoemContextValue {
  active: PoemSection;
  setActive: (s: PoemSection) => void;
}

const PoemContext = createContext<PoemContextValue | undefined>(undefined);

export const PoemProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<PoemSection>("intro");
  return <PoemContext.Provider value={{ active, setActive }}>{children}</PoemContext.Provider>;
};

export const usePoem = () => {
  const ctx = useContext(PoemContext);
  if (!ctx) throw new Error("usePoem must be used inside PoemProvider");
  return ctx;
};
