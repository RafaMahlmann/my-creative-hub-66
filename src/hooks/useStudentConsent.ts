import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import {
  fetchActiveTerm,
  fetchOperatorSettings,
  fillTermText,
  type ConsentTerm,
  type OperatorSettings,
  type StudentConsent,
} from '@/lib/consent';

type State = {
  loading: boolean;
  error: string | null;
  consent: StudentConsent | null;
  operator: OperatorSettings | null;
  term: ConsentTerm | null;
  /** Termo com os dados do operador já preenchidos (o que o aluno lê). */
  termText: string;
};

export function useStudentConsent() {
  const { user, loading: authLoading } = useStudentAuth();
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    consent: null,
    operator: null,
    term: null,
    termText: '',
  });

  const load = useCallback(async () => {
    if (authLoading) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [operator, term] = await Promise.all([fetchOperatorSettings(), fetchActiveTerm('student')]);

      let consent: StudentConsent | null = null;
      if (user) {
        const { data, error } = await supabase
          .from('student_consents')
          .select('*')
          .eq('student_id', user.id)
          .maybeSingle();
        if (error) throw error;
        consent = (data as StudentConsent) ?? null;
      }

      setState({
        loading: false,
        error: null,
        consent,
        operator,
        term,
        termText: fillTermText(term.text_content, operator),
      });
    } catch (err) {
      console.error('[useStudentConsent]', err);
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'erro desconhecido',
      }));
    }
  }, [authLoading, user]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, authLoading, user, reload: load };
}
