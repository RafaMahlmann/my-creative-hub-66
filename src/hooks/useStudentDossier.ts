import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StudentConsent } from '@/lib/consent';

export type CursoProgresso = {
  courseId: string;
  slug: string;
  titulo_pt: string;
  titulo_en: string | null;
  totalAulas: number;
  concluidas: number;
  segundosEstudados: number;
  /** matrícula ativa concedida (não a inscrição gratuita automática) */
  temAcesso: boolean;
  /** quando entrou neste curso */
  matriculadoEm: string | null;
  /** quando concluiu a última aula que faltava; null se ainda não terminou */
  concluidoEm: string | null;
};

export type Dossie = {
  userId: string;
  displayName: string | null;
  contaCriadaEm: string | null;
  consent: StudentConsent | null;
  cursos: CursoProgresso[];
};

/**
 * Reúne, para UM aluno, tudo que está espalhado em quatro tabelas: cadastro,
 * aceite, matrículas e progresso. Existe porque atender um pedido de órgão
 * ou responder "quanto ele já fez?" exigia abrir quatro telas e cruzar na
 * mão — e é justamente na hora do pedido formal que ninguém quer estar
 * cruzando dado na mão.
 */
export function useStudentDossier(userId?: string) {
  return useQuery({
    queryKey: ['admin', 'dossie', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Dossie> => {
      const [perfil, aceite, matriculas, progresso] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, created_at').eq('user_id', userId!).maybeSingle(),
        supabase.from('student_consents').select('*').eq('student_id', userId!).maybeSingle(),
        supabase.from('enrollments').select('course_id, source, is_active, created_at').eq('user_id', userId!),
        supabase.from('lesson_progress').select('lesson_id, seconds_watched, is_completed, last_seen_at').eq('user_id', userId!),
      ]);

      if (perfil.error) throw perfil.error;
      if (aceite.error) throw aceite.error;
      if (matriculas.error) throw matriculas.error;
      if (progresso.error) throw progresso.error;

      const progressoPorAula = new Map(
        (progresso.data ?? []).map((p) => [p.lesson_id as string, p]),
      );

      // Estrutura publicada do catálogo, para saber a que curso cada aula
      // pertence e qual o total — sem isso não dá para calcular porcentagem.
      const { data: cursos, error: cErr } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en, modules(id, lessons(id, is_published), is_published)')
        .eq('is_published', true);
      if (cErr) throw cErr;

      const lista: CursoProgresso[] = (cursos ?? []).map((c) => {
        const aulas = ((c as { modules?: { is_published: boolean; lessons?: { id: string; is_published: boolean }[] }[] }).modules ?? [])
          .filter((m) => m.is_published)
          .flatMap((m) => (m.lessons ?? []).filter((l) => l.is_published));

        const doAluno = aulas.map((a) => progressoPorAula.get(a.id)).filter(Boolean) as NonNullable<
          ReturnType<typeof progressoPorAula.get>
        >[];
        const concluidas = doAluno.filter((p) => p.is_completed);
        const matricula = (matriculas.data ?? []).find((m) => m.course_id === c.id);

        // Só faz sentido falar em "concluído" quando existe aula e todas foram
        // concluídas; a data é a da última que faltava.
        const terminou = aulas.length > 0 && concluidas.length === aulas.length;
        const concluidoEm = terminou
          ? concluidas.map((p) => p.last_seen_at as string).sort().slice(-1)[0] ?? null
          : null;

        return {
          courseId: c.id,
          slug: c.slug,
          titulo_pt: c.title_pt,
          titulo_en: c.title_en,
          totalAulas: aulas.length,
          concluidas: concluidas.length,
          segundosEstudados: doAluno.reduce((acc, p) => acc + (p.seconds_watched ?? 0), 0),
          temAcesso: !!matricula?.is_active && matricula.source !== 'free',
          matriculadoEm: matricula?.created_at ?? null,
          concluidoEm,
        };
      });

      return {
        userId: userId!,
        displayName: perfil.data?.display_name ?? null,
        contaCriadaEm: perfil.data?.created_at ?? null,
        consent: (aceite.data as StudentConsent) ?? null,
        cursos: lista,
      };
    },
  });
}

export type AlunoResumo = {
  userId: string;
  nome: string;
  email: string | null;
  contaCriadaEm: string | null;
  /** null = ainda não registrou aceite */
  aceiteEm: string | null;
  versaoAceita: string | null;
  concluidas: number;
  totalAulas: number;
  segundosEstudados: number;
  temAcesso: boolean;
  matriculadoEm: string | null;
};

/**
 * Visão geral de TODOS os alunos num curso, com aceite e progresso.
 *
 * Quatro consultas fixas, independentemente de haver 3 ou 300 alunos: buscar
 * o progresso de cada um separadamente faria a tela degradar justamente
 * quando o negócio desse certo.
 */
export function useAdminStudentsOverview(courseId?: string) {
  return useQuery({
    queryKey: ['admin', 'alunos-resumo', courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<AlunoResumo[]> => {
      const [perfis, aceites, matriculas, curso] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, created_at').order('created_at', { ascending: false }),
        supabase.from('student_consents').select('student_id, full_name, email, accepted_at, term_version'),
        supabase.from('enrollments').select('user_id, source, is_active, created_at').eq('course_id', courseId!),
        supabase
          .from('courses')
          .select('id, modules(id, is_published, lessons(id, is_published))')
          .eq('id', courseId!)
          .maybeSingle(),
      ]);

      if (perfis.error) throw perfis.error;
      if (aceites.error) throw aceites.error;
      if (matriculas.error) throw matriculas.error;
      if (curso.error) throw curso.error;

      const idsDasAulas = ((curso.data as { modules?: { is_published: boolean; lessons?: { id: string; is_published: boolean }[] }[] } | null)?.modules ?? [])
        .filter((m) => m.is_published)
        .flatMap((m) => (m.lessons ?? []).filter((l) => l.is_published).map((l) => l.id));

      // Uma consulta só de progresso, restrita às aulas deste curso.
      let progresso: { user_id: string; lesson_id: string; is_completed: boolean; seconds_watched: number }[] = [];
      if (idsDasAulas.length) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('user_id, lesson_id, is_completed, seconds_watched')
          .in('lesson_id', idsDasAulas);
        if (error) throw error;
        progresso = (data ?? []) as typeof progresso;
      }

      const porAluno = new Map<string, { concluidas: number; segundos: number }>();
      progresso.forEach((p) => {
        const atual = porAluno.get(p.user_id) ?? { concluidas: 0, segundos: 0 };
        if (p.is_completed) atual.concluidas += 1;
        atual.segundos += p.seconds_watched ?? 0;
        porAluno.set(p.user_id, atual);
      });

      const aceitePor = new Map((aceites.data ?? []).map((a) => [a.student_id as string, a]));
      const matriculaPor = new Map((matriculas.data ?? []).map((m) => [m.user_id as string, m]));

      return (perfis.data ?? []).map((p) => {
        const aceite = aceitePor.get(p.user_id);
        const matricula = matriculaPor.get(p.user_id);
        const prog = porAluno.get(p.user_id);
        return {
          userId: p.user_id,
          // o nome do aceite é o oficial; display_name é o apelido do cadastro
          nome: aceite?.full_name || p.display_name || '',
          email: aceite?.email ?? null,
          contaCriadaEm: p.created_at ?? null,
          aceiteEm: aceite?.accepted_at ?? null,
          versaoAceita: aceite?.term_version ?? null,
          concluidas: prog?.concluidas ?? 0,
          totalAulas: idsDasAulas.length,
          segundosEstudados: prog?.segundos ?? 0,
          temAcesso: !!matricula?.is_active && matricula.source !== 'free',
          matriculadoEm: matricula?.created_at ?? null,
        };
      });
    },
  });
}

/**
 * Confere um hash de comprovante sem expor nenhum dado pessoal.
 *
 * Vai por RPC, não por consulta direta: a política da tabela é "TO
 * authenticated" e só libera o próprio aceite — de propósito. A função
 * verificar_comprovante (SECURITY DEFINER) devolve apenas data e versão,
 * que é o suficiente para confirmar integridade sem entregar dado de aluno
 * a quem tiver o hash em mãos. Ver plano-burnstore/verificar-comprovante.sql.
 */
export function useVerificarHash(hash: string) {
  const limpo = hash.trim().toLowerCase();
  const pareceHash = /^[a-f0-9]{64}$/.test(limpo);

  return useQuery({
    queryKey: ['verificar-hash', limpo],
    enabled: pareceHash,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('verificar_comprovante', { p_hash: limpo });
      if (error) throw error;
      const linha = (data as { accepted_at: string; term_version: string }[] | null)?.[0];
      return linha ? { encontrado: true as const, ...linha } : { encontrado: false as const };
    },
  });
}
