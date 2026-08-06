import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Leaf, Video, Compass, GraduationCap, Gem, X } from "lucide-react";

const services = [
  { icon: Leaf, key: "presential" },
  { icon: Video, key: "remote" },
  { icon: Compass, key: "constellation" },
  { icon: GraduationCap, key: "course" },
  { icon: Gem, key: "jewels" },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeService, setActiveService] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <section id="servicos" className="py-24 md:py-32 bg-secondary/30" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            {t("home.services.title")}
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            {t("home.services.subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.button
              key={service.key}
              initial={{ y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => setActiveService(i)}
              className="group text-left bg-card p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              <service.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-xl font-medium text-foreground mb-2">
                {t(`home.services.${service.key}.title`)}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {t(`home.services.${service.key}.description`)}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Service detail modal */}
      {activeService !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveService(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveService(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const Icon = services[activeService].icon;
                return <Icon className="w-8 h-8 text-primary" />;
              })()}
              <h3 className="font-display text-2xl text-foreground">
                {t(`home.services.${services[activeService].key}.title`)}
              </h3>
            </div>
            {/* Video placeholder */}
            <div className="aspect-video bg-muted rounded-xl mb-6 flex items-center justify-center border border-border">
              <Video className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <p className="font-body text-muted-foreground leading-relaxed">
              {t(`home.services.${services[activeService].key}.description`)}{" "}
              {t("home.services.modalExtra")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default ServicesSection;
