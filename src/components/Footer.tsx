import { Instagram, Youtube, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-6">
          <h3 className="font-display text-2xl text-foreground">
            Terapeuta
          </h3>
          <p className="font-body text-sm text-muted-foreground max-w-md">
            Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-5">
            {[
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Youtube, href: "#", label: "YouTube" },
              { icon: Facebook, href: "#", label: "Facebook" },
              { icon: Mail, href: "mailto:email@exemplo.com", label: "E-mail" },
              { icon: Phone, href: "https://wa.me/5500000000000", label: "WhatsApp" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <p className="font-body text-xs text-muted-foreground/60 mt-4">
            © 2026 — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
