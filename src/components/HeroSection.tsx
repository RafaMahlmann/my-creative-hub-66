import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

interface HeroSectionProps {
  onSecretAccess: () => void;
}

const HeroSection = ({ onSecretAccess }: HeroSectionProps) => {
  const [photoClicked, setPhotoClicked] = useState(false);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const rapidClicks = useRef(0);
  const rapidTimer = useRef<ReturnType<typeof setTimeout>>();

  // Desktop: click + Ctrl+L within 5s
  const handleProfileClick = () => {
    // Mobile/tablet: rapid-click sequence
    if (firstClickDone) {
      rapidClicks.current += 1;
      clearTimeout(rapidTimer.current);
      rapidTimer.current = setTimeout(() => {
        rapidClicks.current = 0;
        setFirstClickDone(false);
      }, 2000); // 2s window to complete 5 rapid clicks

      if (rapidClicks.current >= 5) {
        rapidClicks.current = 0;
        setFirstClickDone(false);
        onSecretAccess();
      }
      return;
    }

    // First click — start desktop flow + wait for pause before enabling rapid clicks
    setPhotoClicked(true);
    setTimeout(() => setPhotoClicked(false), 5000);

    // After 4s pause, enable rapid-click mode (mobile)
    setTimeout(() => {
      setFirstClickDone(true);
      // Auto-reset after 10s if no rapid clicks
      setTimeout(() => {
        setFirstClickDone(false);
        rapidClicks.current = 0;
      }, 10000);
    }, 4000);
  };

  // Desktop: Ctrl+L
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (photoClicked && e.ctrlKey && e.key === "l") {
        e.preventDefault();
        setPhotoClicked(false);
        setFirstClickDone(false);
        onSecretAccess();
      }
    },
    [photoClicked, onSecretAccess]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-light/40 via-background to-background" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Profile photo — click + Ctrl+L within 5s for admin */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-8"
        >
          <button
            onClick={handleProfileClick}
            className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center mx-auto overflow-hidden hover:border-primary/40 transition-colors duration-500 cursor-default"
            aria-label="Foto de perfil"
          >
            <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/50" />
          </button>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-light text-foreground tracking-wide mb-4"
        >
          Nome do Terapeuta
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-body text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
        >
          Blá blá blá blá blá — uma frase de impacto que transmite acolhimento e confiança
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href="#servicos"
            className="inline-block font-body text-sm tracking-widest uppercase px-8 py-3 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all duration-500"
          >
            Conheça meu trabalho
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
