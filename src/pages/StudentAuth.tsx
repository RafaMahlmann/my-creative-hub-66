import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { CourseShell } from '@/components/course/CourseShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useStudentAuth } from '@/hooks/useStudentAuth';

const StudentAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, loading } = useStudentAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const next = params.get('next') && params.get('next')!.startsWith('/') ? params.get('next')! : '/curso';

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(next, { replace: true });
  }, [loading, isAuthenticated, navigate, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/curso',
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success(t('auth.checkEmail'));
          return;
        }
        navigate(next, { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(next, { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message ?? t('auth.genericError'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/curso/entrar',
    });
    if (result.error) {
      toast.error(t('auth.genericError'));
      return;
    }
    if (result.redirected) return;
    navigate(next, { replace: true });
  };

  return (
    <CourseShell>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-course-border bg-course-card p-8">
          <h1 className="font-display text-3xl font-semibold">
            {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
          </h1>
          <p className="mt-2 font-body text-sm text-course-muted-foreground">
            {t('auth.subtitle')}
          </p>

          {sent ? (
            <p className="mt-8 font-body text-sm text-course-foreground">{t('auth.checkEmail')}</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-body text-xs uppercase tracking-widest">
                      {t('auth.name')}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-course-border bg-course-background"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-body text-xs uppercase tracking-widest">
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-course-border bg-course-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-body text-xs uppercase tracking-widest">
                    {t('auth.password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-course-border bg-course-background"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
                >
                  {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-course-border" />
                <span className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
                  {t('auth.or')}
                </span>
                <span className="h-px flex-1 bg-course-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                className="w-full border-course-border bg-course-background text-course-foreground hover:bg-course-secondary"
              >
                {t('auth.google')}
              </Button>

              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="mt-6 w-full font-body text-sm text-course-muted-foreground underline-offset-4 hover:text-course-foreground hover:underline"
              >
                {mode === 'signin' ? t('auth.toSignUp') : t('auth.toSignIn')}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/curso"
            className="font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            {t('course.backToCatalog')}
          </Link>
        </div>
      </div>
    </CourseShell>
  );
};

export default StudentAuth;
