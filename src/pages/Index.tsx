import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

const Index = () => {
  const handleSecretAccess = () => {
    // For now, just show a toast — will connect to login page later
    toast.info("Acesso admin detectado — login será implementado com o backend.");
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
    </div>
  );
};

export default Index;
