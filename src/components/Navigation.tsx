import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = [
  { labelKey: "nav.home", href: "#inicio" },
  { labelKey: "nav.about", href: "#sobre" },
  { labelKey: "nav.services", href: "#servicos" },
  { labelKey: "nav.testimonials", href: "#depoimentos" },
  { labelKey: "nav.blog", href: "#blog" },
  { labelKey: "nav.contact", href: "#contato" },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/terapeuta";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <a href="/terapeuta#inicio" className="font-display text-2xl font-semibold text-foreground tracking-wide">
          Terapeuta
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {isHome && navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-body text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {t(item.labelKey)}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/"
              className="font-body text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {t("nav.course")}
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <ul className="flex flex-col items-center gap-6 py-8">
              {isHome && navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.course")}
                </Link>
              </li>
              <li>
                <LanguageSwitcher />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
