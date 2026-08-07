import { supabase } from '@/integrations/supabase/client';

export type OperatorSettings = {
  nome: string;
  documento: string;
  documento_tipo: string;
  email_dpo: string;
  dpo_nome: string;
  cidade: string;
  sistema_nome: string;
  sistema_versao: string;
};

export type ConsentTerm = {
  version: string;
  text_content: string;
};

export type StudentConsent = {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  cpf_typed: string;
  birth_date: string | null;
  phone: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  ip: string | null;
  accepted_at: string;
  term_version: string;
  term_text_hash: string;
};

/** Valida CPF por dígito verificador (validação definitiva é feita no servidor). */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(digits[10])) return false;

  return true;
}

export function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function maskCPF(value: string): string {
  const d = value.replace(/\D/g, '');
  if (d.length !== 11) return '***';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

export function formatCEP(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  return d.replace(/(\d{5})(\d)/, '$1-$2');
}

/** Normaliza nome para comparar o que foi digitado com o nome do cadastro. */
export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Substitui os marcadores do termo pelos dados do operador (exibição). */
export function fillTermText(template: string, operator: OperatorSettings): string {
  return template
    .replace(/\{\{OPERADOR\}\}/g, operator.nome)
    .replace(/\{\{DOC_TIPO\}\}/g, operator.documento_tipo)
    .replace(/\{\{DOC\}\}/g, operator.documento)
    .replace(/\{\{CNPJ\}\}/g, operator.documento)
    .replace(/\{\{DPO_NOME\}\}/g, operator.dpo_nome)
    .replace(/\{\{DPO_EMAIL\}\}/g, operator.email_dpo)
    .replace(/\{\{CIDADE\}\}/g, operator.cidade);
}

export async function fetchOperatorSettings(): Promise<OperatorSettings> {
  const { data, error } = await supabase
    .from('operator_settings')
    .select('nome, documento, documento_tipo, email_dpo, dpo_nome, cidade, sistema_nome, sistema_versao')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('operator_settings vazio');
  return data as OperatorSettings;
}

export async function fetchActiveTerm(kind: 'student' | 'purchase'): Promise<ConsentTerm> {
  const { data, error } = await supabase
    .from('consent_terms')
    .select('version, text_content')
    .eq('term_kind', kind)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Nenhuma versão ativa do termo');
  return data as ConsentTerm;
}
