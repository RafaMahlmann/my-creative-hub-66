import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AdminLogin from "@/components/AdminLogin";
import { toast } from "sonner";
import { useEditMode } from "@/hooks/useEditMode";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isEditing } = useEditMode();
  const { settings, isLoading, updateSetting } = useSiteSettings();

  const handleSecretAccess = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    toast.success("Modo de edição ativado!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection
        onSecretAccess={handleSecretAccess}
        isEditing={isEditing}
        isLoading={isLoading}
        profilePhotoUrl={settings["profile_photo_url"]}
        backgroundUrl={settings["hero_background_url"]}
        onPhotoUploaded={(url) => updateSetting("profile_photo_url", url)}
        onBackgroundUploaded={(url) => updateSetting("hero_background_url", url)}
      />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
      <WhatsAppButton />

      {showLogin && (
        <AdminLogin
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default Index;
