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

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleSecretAccess = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    toast.success("Modo de edição ativado! (Painel admin em breve)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection onSecretAccess={handleSecretAccess} />
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
