import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageCropDialog from "@/components/ImageCropDialog";

interface HeroSectionProps {
  onSecretAccess: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  profilePhotoUrl?: string;
  backgroundUrl?: string;
  onPhotoUploaded?: (url: string) => void;
  onBackgroundUploaded?: (url: string) => void;
}

const HeroSection = ({
  onSecretAccess,
  isEditing = false,
  isLoading = false,
  profilePhotoUrl,
  backgroundUrl,
  onPhotoUploaded,
  onBackgroundUploaded,
}: HeroSectionProps) => {
  const [photoClicked, setPhotoClicked] = useState(false);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropShape, setCropShape] = useState<"circle" | "rect">("circle");
  const rapidClicks = useRef(0);
  const rapidTimer = useRef<ReturnType<typeof setTimeout>>();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleProfileClick = () => {
    // If editing, open file picker instead
    if (isEditing) {
      profileInputRef.current?.click();
      return;
    }

    // Mobile/tablet: rapid-click sequence
    if (firstClickDone) {
      rapidClicks.current += 1;
      clearTimeout(rapidTimer.current);
      rapidTimer.current = setTimeout(() => {
        rapidClicks.current = 0;
        setFirstClickDone(false);
      }, 2000);

      if (rapidClicks.current >= 5) {
        rapidClicks.current = 0;
        setFirstClickDone(false);
        onSecretAccess();
      }
      return;
    }

    setPhotoClicked(true);
    setTimeout(() => setPhotoClicked(false), 5000);

    setTimeout(() => {
      setFirstClickDone(true);
      setTimeout(() => {
        setFirstClickDone(false);
        rapidClicks.current = 0;
      }, 10000);
    }, 4000);
  };

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

  const uploadFile = async (file: File, path: string) => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}.${ext}`;
    const { error } = await supabase.storage
      .from("hero-assets")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar imagem");
      return null;
    }
    const { data: urlData } = supabase.storage
      .from("hero-assets")
      .getPublicUrl(filePath);
    return urlData.publicUrl + "?t=" + Date.now();
  };

  const openCropFromFile = (e: React.ChangeEvent<HTMLInputElement>, shape: "circle" | "rect") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropShape(shape);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    openCropFromFile(e, "circle");
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    openCropFromFile(e, "rect");
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropDialogOpen(false);
    setCropImageSrc(null);

    if (cropShape === "circle") {
      toast.loading("Enviando foto...");
      const file = new File([blob], "profile-photo.webp", { type: "image/webp" });
      const url = await uploadFile(file, "profile-photo");
      toast.dismiss();
      if (url) {
        onPhotoUploaded?.(url);
        toast.success("Foto atualizada!");
      }
    } else {
      toast.loading("Enviando fundo...");
      const file = new File([blob], "hero-background.webp", { type: "image/webp" });
      const url = await uploadFile(file, "hero-background");
      toast.dismiss();
      if (url) {
        onBackgroundUploaded?.(url);
        toast.success("Fundo atualizado!");
      }
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center overflow-hidden pt-[calc(33vh-3rem)] md:pt-[calc(33vh-4rem)]"
    >
      {/* Banner background image — Golden Ratio: 61.8% da tela */}
      {backgroundUrl ? (
        <div className="absolute top-0 left-0 right-0 h-[55vh] md:h-[61.8vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
          <div className="absolute inset-x-0 top-[38.2%] bottom-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
      ) : (
        <div className="absolute top-0 left-0 right-0 h-[55vh] md:h-[61.8vh] bg-gradient-to-b from-sage-light/40 to-background" />
      )}

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />

      {/* Edit background button (admin only) */}
      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            bgInputRef.current?.click();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            bgInputRef.current?.click();
          }}
          className="absolute top-4 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/90 text-primary-foreground font-body text-sm shadow-lg hover:bg-primary transition-colors"
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        >
          <ImagePlus size={18} />
          Alterar fundo
        </button>
      )}

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Profile photo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-8"
        >
          <button
            onClick={handleProfileClick}
            className="relative w-40 h-40 md:w-52 md:h-52 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center mx-auto overflow-hidden hover:border-primary/40 transition-colors duration-500 cursor-default group"
            aria-label="Foto de perfil"
          >
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : isLoading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-full" />
            ) : (
              <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/50" />
            )}

            {/* Camera overlay in edit mode */}
            {isEditing && (
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </button>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-light text-foreground tracking-wide mb-4"
        >
          Rafa Mahlmann
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

      {/* Hidden file inputs */}
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileFileChange}
      />
      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBgFileChange}
      />

      {/* Crop dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        imageSrc={cropImageSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => { setCropDialogOpen(false); setCropImageSrc(null); }}
        shape={cropShape}
        title={cropShape === "circle" ? "Ajustar foto" : "Ajustar fundo"}
      />
    </section>
  );
};

export default HeroSection;
