import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  return (
    <section id="sobre" className="py-24 md:py-32" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Photo placeholder */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-[3/4] bg-muted rounded-2xl flex items-center justify-center border border-border">
              <User className="w-20 h-20 text-muted-foreground/30" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
              {t("home.about.title")}
            </h2>
            <div className="space-y-4">
              {["p1", "p2", "p3"].map((k) => (
                <p key={k} className="font-body text-base text-muted-foreground leading-relaxed">
                  {t(`home.about.${k}`)}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
