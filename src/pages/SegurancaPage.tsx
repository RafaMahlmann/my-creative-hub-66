import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { useStudentConsent } from '@/hooks/useStudentConsent';
import { generateConsentPDF } from '@/lib/generateConsentPDF';
import { maskCPF } from '@/lib/consent';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SegurancaPage = () => {
  const { t } = useTranslation();
  const { loading, consent, operator, termText, user } = useStudentConsent();

  return (
    <CourseShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-course-primary/15 text-course-primary">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{t('security.title')}</h1>
            <p className="font-body text-sm text-course-muted-foreground">{t('security.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="how">
          <TabsList>
            <TabsTrigger value="how">{t('security.tabHow')}</TabsTrigger>
            <TabsTrigger value="docs">{t('security.tabDocs')}</TabsTrigger>
            <TabsTrigger value="challenge">{t('security.tabChallenge')}</TabsTrigger>
            <TabsTrigger value="faq">{t('security.tabFaq')}</TabsTrigger>
          </TabsList>

          <TabsContent value="how" className="mt-5 space-y-3 font-body text-sm leading-relaxed">
            <p>{t('security.howIntro')}</p>
            <ul className="list-disc space-y-1 pl-5 text-course-muted-foreground">
              {(t('security.howItems', { returnObjects: true }) as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="docs" className="mt-5">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-course-muted-foreground" />
            ) : !user ? (
              <p className="font-body text-sm text-course-muted-foreground">
                <Link to="/curso/entrar" className="underline">
                  {t('auth.signIn')}
                </Link>
              </p>
            ) : !consent ? (
              <p className="font-body text-sm text-course-muted-foreground">{t('security.noDocs')}</p>
            ) : (
              <div className="rounded-2xl border border-course-border/60 bg-course-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-course-primary" />
                  <span className="font-display text-base font-semibold">{t('security.studentTerm')}</span>
                </div>
                <dl className="grid gap-2 font-body text-sm sm:grid-cols-2">
                  <Row label={t('consent.fullName')} value={consent.full_name} />
                  <Row label={t('consent.cpf')} value={maskCPF(consent.cpf_typed)} />
                  <Row
                    label={t('security.acceptedAt')}
                    value={new Date(consent.accepted_at).toLocaleString('pt-BR')}
                  />
                  <Row label={t('security.ip')} value={consent.ip ?? '—'} />
                  <Row label={t('security.version')} value={consent.term_version} />
                  <div className="sm:col-span-2">
                    <dt className="text-course-muted-foreground">{t('security.hash')}</dt>
                    <dd className="break-all font-mono text-xs">{consent.term_text_hash}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-5"
                  variant="outline"
                  onClick={() => operator && generateConsentPDF({ consent, termText, operator })}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('security.download')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenge" className="mt-5 space-y-3 font-body text-sm leading-relaxed">
            <p>{t('security.challengeIntro')}</p>
            <ol className="list-decimal space-y-1 pl-5 text-course-muted-foreground">
              {(t('security.challengeItems', { returnObjects: true }) as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="mt-5 space-y-4 font-body text-sm leading-relaxed">
            {(t('security.faq', { returnObjects: true }) as { q: string; a: string }[]).map((item) => (
              <div key={item.q}>
                <p className="font-semibold">{item.q}</p>
                <p className="text-course-muted-foreground">{item.a}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </CourseShell>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-course-muted-foreground">{label}</dt>
    <dd>{value}</dd>
  </div>
);

export default SegurancaPage;
