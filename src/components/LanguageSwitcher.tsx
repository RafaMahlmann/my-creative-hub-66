import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const setLang = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-1">
      <Button
        variant={i18n.language === 'pt' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLang('pt')}
        className="h-6 rounded-full px-2 text-xs"
      >
        {t('language.pt')}
      </Button>
      <Button
        variant={i18n.language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLang('en')}
        className="h-6 rounded-full px-2 text-xs"
      >
        {t('language.en')}
      </Button>
    </div>
  );
};
