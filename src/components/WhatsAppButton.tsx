import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const { t } = useTranslation();

  return (
    <a
      href="https://wa.me/5541987049785"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("home.whatsapp.aria")}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[hsl(142,70%,45%)] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl animate-pulse-soft transition-shadow duration-300"
    >
      <MessageCircle size={26} />
    </a>
  );
};

export default WhatsAppButton;
