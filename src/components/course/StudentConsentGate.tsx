import { FormEvent, ReactNode, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { CourseShell } from '@/components/course/CourseShell';
import { useStudentConsent } from '@/hooks/useStudentConsent';
import { formatCEP, formatCPF, normalizeName, validateCPF } from '@/lib/consent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type Form = {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

/**
 * Sem isto o campo fica ilegível: o Input padrão traz o fundo claro do site
 * (bg-background) e herda a cor de texto do CourseShell, que é clara porque
 * foi feita para fundo escuro — dá branco sobre branco, e a pessoa digita
 * sem ver o que escreveu. É o mesmo trio que o resto do projeto já aplica
 * campo a campo.
 */
const CAMPO = 'border-course-border bg-course-background text-course-foreground';

const emptyForm: Form = {
  fullName: '',
  cpf: '',
  birthDate: '',
  phone: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

/**
 * Bloqueia o conteúdo autenticado do curso até o aluno registrar o aceite.
 * Falha fechado: se a consulta der erro, mostra estado de erro em vez de liberar.
 */
export const StudentConsentGate = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { loading, authLoading, error, consent, termText, term, user, reload } = useStudentConsent();

  const [form, setForm] = useState<Form>(emptyForm);
  const [nameTyped, setNameTyped] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const [cepEstado, setCepEstado] = useState<'ocioso' | 'buscando' | 'ok' | 'naoEncontrado'>('ocioso');

  const cpfValid = validateCPF(form.cpf);
  const nameMatches =
    form.fullName.trim().length > 2 && normalizeName(nameTyped) === normalizeName(form.fullName);
  const canSubmit = useMemo(
    () => scrolledToEnd && accepted && cpfValid && nameMatches && !submitting,
    [scrolledToEnd, accepted, cpfValid, nameMatches, submitting],
  );

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setScrolledToEnd(true);
  };

  const lookupCep = async (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepEstado('ocioso');
      return;
    }
    setCepEstado('buscando');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) {
        setCepEstado('naoEncontrado');
        return;
      }
      setForm((f) => ({
        ...f,
        street: data.logradouro || f.street,
        neighborhood: data.bairro || f.neighborhood,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
      setCepEstado('ok');
      // Preenchido o resto do endereço, o número é a única coisa que falta —
      // levar o cursor até lá poupa uma rolagem e um toque no celular.
      requestAnimationFrame(() => numberRef.current?.focus());
    } catch {
      // busca de CEP é conveniência; falha não bloqueia o aceite
      setCepEstado('ocioso');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('save-student-consent', {
        body: {
          fullName: form.fullName.trim(),
          cpf: form.cpf,
          birthDate: form.birthDate || null,
          phone: form.phone || null,
          email: form.email || user?.email || null,
          cep: form.cep || null,
          street: form.street || null,
          number: form.number || null,
          complement: form.complement || null,
          neighborhood: form.neighborhood || null,
          city: form.city || null,
          state: form.state || null,
          nameTyped: nameTyped.trim(),
          accepted: true,
        },
      });
      if (fnError) throw fnError;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success(t('consent.saved'));
      await reload();
    } catch (err) {
      console.error('[StudentConsentGate] submit', err);
      toast.error(t('consent.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <CourseShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-course-muted-foreground" />
        </div>
      </CourseShell>
    );
  }

  // Sem sessão: as próprias páginas cuidam do login / conteúdo público.
  if (!user) return <>{children}</>;

  if (error) {
    return (
      <CourseShell>
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="font-body text-sm text-course-muted-foreground">{t('consent.loadError')}</p>
          <Button variant="outline" onClick={reload}>
            {t('consent.retry')}
          </Button>
        </div>
      </CourseShell>
    );
  }

  if (consent) return <>{children}</>;

  return (
    <CourseShell>
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-course-primary/15 text-course-primary">
          <ShieldCheck size={18} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-course-foreground">{t('consent.title')}</h1>
          <p className="font-body text-sm text-course-muted-foreground">{t('consent.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <section className="rounded-2xl border border-course-border/60 bg-course-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-course-foreground">{t('consent.formTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName" className="text-course-foreground">{t('consent.fullName')}</Label>
              <Input
                className={CAMPO}
                id="fullName"
                name="name"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div>
              <Label htmlFor="cpf" className="text-course-foreground">{t('consent.cpf')}</Label>
              <Input
                className={CAMPO}
                id="cpf"
                name="cpf"
                /* sem token padrão de autofill; desligado de propósito para o
                   navegador não oferecer telefone ou CEP num campo numérico */
                autoComplete="off"
                value={form.cpf}
                onChange={(e) => set('cpf', formatCPF(e.target.value))}
                inputMode="numeric"
                maxLength={14}
                required
              />
              {form.cpf.length >= 14 && !cpfValid && (
                <p className="mt-1 font-body text-xs text-destructive">{t('consent.cpfInvalid')}</p>
              )}
            </div>
            <div>
              <Label htmlFor="birthDate" className="text-course-foreground">{t('consent.birthDate')}</Label>
              <Input
                className={CAMPO}
                id="birthDate"
                name="bday"
                type="date"
                autoComplete="bday"
                value={form.birthDate}
                onChange={(e) => set('birthDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-course-foreground">{t('consent.phone')}</Label>
              <Input
                className={CAMPO}
                id="phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                maxLength={30}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-course-foreground">{t('consent.email')}</Label>
              <Input
                className={CAMPO}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={form.email || user.email || ''}
                onChange={(e) => set('email', e.target.value)}
                maxLength={255}
              />
            </div>
            <div>
              <Label htmlFor="cep" className="text-course-foreground">{t('consent.cep')}</Label>
              <Input
                className={CAMPO}
                id="cep"
                name="postal-code"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={9}
                value={form.cep}
                onChange={(e) => {
                  const v = formatCEP(e.target.value);
                  set('cep', v);
                  lookupCep(v);
                }}
              />
              {cepEstado === 'buscando' && (
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-course-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t('consent.cepBuscando')}
                </p>
              )}
              {cepEstado === 'ok' && (
                <p className="mt-1 font-body text-xs text-course-primary">{t('consent.cepOk')}</p>
              )}
              {cepEstado === 'naoEncontrado' && (
                <p className="mt-1 font-body text-xs text-course-muted-foreground">
                  {t('consent.cepNaoEncontrado')}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="street" className="text-course-foreground">{t('consent.street')}</Label>
              <Input
                className={CAMPO}
                id="street"
                name="address-line1"
                autoComplete="address-line1"
                autoCapitalize="words"
                value={form.street}
                onChange={(e) => set('street', e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-course-foreground">{t('consent.number')}</Label>
              <Input
                className={CAMPO}
                ref={numberRef}
                id="number"
                name="address-line2"
                autoComplete="address-line2"
                inputMode="numeric"
                value={form.number}
                onChange={(e) => set('number', e.target.value)}
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="complement" className="text-course-foreground">{t('consent.complement')}</Label>
              <Input
                className={CAMPO}
                id="complement"
                name="address-line3"
                autoComplete="address-line3"
                autoCapitalize="words"
                value={form.complement}
                onChange={(e) => set('complement', e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood" className="text-course-foreground">{t('consent.neighborhood')}</Label>
              <Input
                className={CAMPO}
                id="neighborhood"
                name="address-level3"
                autoComplete="address-level3"
                autoCapitalize="words"
                value={form.neighborhood}
                onChange={(e) => set('neighborhood', e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-course-foreground">{t('consent.city')}</Label>
              <Input
                className={CAMPO}
                id="city"
                name="address-level2"
                autoComplete="address-level2"
                autoCapitalize="words"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-course-foreground">{t('consent.state')}</Label>
              <Input
                className={CAMPO}
                id="state"
                name="address-level1"
                autoComplete="address-level1"
                autoCapitalize="characters"
                value={form.state}
                onChange={(e) => set('state', e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-course-border/60 bg-course-card p-5">
          <h2 className="mb-1 font-display text-lg font-semibold text-course-foreground">{t('consent.termTitle')}</h2>
          <p className="mb-3 font-body text-xs text-course-muted-foreground">
            {t('consent.termVersion', { version: term?.version ?? '1.0' })} · {t('consent.scrollHint')}
          </p>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-course-border/60 bg-course-background p-4 font-body text-sm leading-relaxed text-course-foreground"
          >
            {termText}
          </div>
          {!scrolledToEnd && (
            <p className="mt-2 font-body text-xs text-course-muted-foreground">{t('consent.mustScroll')}</p>
          )}

          <div className="mt-5 flex items-start gap-3">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              disabled={!scrolledToEnd}
            />
            <Label htmlFor="accept" className="font-body text-sm leading-snug text-course-foreground">
              {t('consent.checkbox')}
            </Label>
          </div>

          <div className="mt-4">
            <Label htmlFor="nameTyped" className="text-course-foreground">{t('consent.typeName')}</Label>
            <Input
                className={CAMPO}
              id="nameTyped"
              /* autofill DESLIGADO de propósito: redigitar o nome é o ato de
                 assinar. Se o navegador preenchesse, o gesto deliberado
                 viraria um clique automático e perderia o sentido. */
              autoComplete="off"
              autoCapitalize="words"
              value={nameTyped}
              onChange={(e) => setNameTyped(e.target.value)}
              maxLength={150}
              placeholder={form.fullName || t('consent.fullName')}
            />
            {nameTyped.length > 2 && !nameMatches && (
              <p className="mt-1 font-body text-xs text-destructive">{t('consent.nameMismatch')}</p>
            )}
          </div>

          <p className="mt-4 font-body text-xs text-course-muted-foreground">{t('consent.proofNote')}</p>

          <Button type="submit" disabled={!canSubmit} className="mt-5 w-full sm:w-auto">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('consent.submit')}
          </Button>
        </section>
      </form>
    </div>
    </CourseShell>
  );
};
