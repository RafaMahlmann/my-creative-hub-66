import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAskTutor, useTutorThread } from '@/hooks/useTutor';
import { useStudentAuth } from '@/hooks/useStudentAuth';

type Props = { moduleId?: string | null; signInHref: string };

export const TutorPanel = ({ moduleId, signInHref }: Props) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useStudentAuth();
  const { data } = useTutorThread(moduleId, isAuthenticated);
  const ask = useAskTutor(moduleId);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = data?.messages ?? [];

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [moduleId]);

  if (!moduleId) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || ask.isPending) return;
    setInput('');
    setPending(text);
    try {
      await ask.mutateAsync({ message: text, language: i18n.language === 'en' ? 'en' : 'pt' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('tutor.error'));
      setInput(text);
    } finally {
      setPending(null);
      inputRef.current?.focus();
    }
  };

  return (
    <section className="rounded-xl border border-course-border bg-course-card p-5">
      <header className="mb-3 flex items-center gap-2">
        <Bot size={18} className="text-course-primary" />
        <h2 className="font-display text-xl font-semibold">{t('tutor.title')}</h2>
      </header>
      <p className="mb-4 font-body text-xs text-course-muted-foreground">{t('tutor.scope')}</p>

      {!isAuthenticated ? (
        <Link to={signInHref}>
          <Button className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
            {t('tutor.signInToAsk')}
          </Button>
        </Link>
      ) : (
        <div className="space-y-3">
          <div ref={boxRef} className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && !pending && (
              <p className="font-body text-sm text-course-muted-foreground">{t('tutor.empty')}</p>
            )}
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-line rounded-lg bg-course-primary px-3 py-2 font-body text-sm text-course-primary-foreground">
                    {m.content}
                  </p>
                </div>
              ) : (
                <p
                  key={m.id}
                  className="whitespace-pre-line font-body text-sm leading-relaxed text-course-foreground"
                >
                  {m.content}
                </p>
              ),
            )}
            {pending && (
              <>
                <div className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-line rounded-lg bg-course-primary px-3 py-2 font-body text-sm text-course-primary-foreground">
                    {pending}
                  </p>
                </div>
                <p className="flex items-center gap-2 font-body text-sm text-course-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('tutor.thinking')}
                </p>
              </>
            )}
          </div>

          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              rows={2}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={t('tutor.placeholder')}
              className="resize-none border-course-border bg-course-background text-course-foreground"
            />
            <Button
              onClick={() => void send()}
              disabled={ask.isPending || !input.trim()}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
              aria-label={t('tutor.send')}
            >
              {ask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="font-body text-[11px] text-course-muted-foreground">
            {t('tutor.disclaimer')}
          </p>
        </div>
      )}
    </section>
  );
};
