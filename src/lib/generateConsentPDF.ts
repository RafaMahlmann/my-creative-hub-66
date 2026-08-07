import { jsPDF } from 'jspdf';
import { maskCPF, type OperatorSettings, type StudentConsent } from './consent';

type Options = {
  consent: StudentConsent;
  termText: string;
  operator: OperatorSettings;
};

const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const LINE_W = PAGE_W - MARGIN * 2;

export function generateConsentPDF({ consent, termText, operator }: Options) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > PAGE_H - 20) {
      doc.addPage();
      y = MARGIN;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('COMPROVANTE DE ACEITE ELETRONICO', MARGIN, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${operator.sistema_nome} — ${operator.nome}`, MARGIN, y);
  y += 8;

  doc.setDrawColor(180);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 7;

  const rows: [string, string][] = [
    ['Nome do aluno', consent.full_name],
    ['CPF', maskCPF(consent.cpf_typed)],
    ['E-mail', consent.email ?? '—'],
    ['Data e hora (servidor)', new Date(consent.accepted_at).toLocaleString('pt-BR')],
    ['Endereço IP de origem', consent.ip ?? '—'],
    ['Versão do termo', consent.term_version],
    ['Hash SHA-256 do texto', consent.term_text_hash],
    ['Encarregado (DPO)', `${operator.dpo_nome} — ${operator.email_dpo}`],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    newPageIfNeeded(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value), LINE_W - 52) as string[];
    doc.text(lines, MARGIN + 52, y);
    y += lines.length * 4.6 + 2;
  });

  y += 4;
  newPageIfNeeded(20);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const declaration = doc.splitTextToSize(
    'Declaracao de assinatura eletronica: o titular acima identificado manifestou aceite livre, informado e inequivoco ao texto integral reproduzido a seguir. A integridade do texto e comprovada pelo hash SHA-256 registrado no momento do aceite.',
    LINE_W,
  ) as string[];
  doc.text(declaration, MARGIN, y);
  y += declaration.length * 4 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  newPageIfNeeded(10);
  doc.text('TEXTO INTEGRAL DO TERMO ACEITO', MARGIN, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  termText.split('\n').forEach((paragraph) => {
    if (!paragraph.trim()) {
      y += 3;
      return;
    }
    const lines = doc.splitTextToSize(paragraph, LINE_W) as string[];
    lines.forEach((line) => {
      newPageIfNeeded(6);
      doc.text(line, MARGIN, y);
      y += 4.4;
    });
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `${operator.sistema_nome} v${operator.sistema_versao} · termo v${consent.term_version} · hash ${consent.term_text_hash.slice(0, 16)}…`,
      MARGIN,
      PAGE_H - 10,
    );
    doc.text(`Pagina ${i} de ${total}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
    doc.setTextColor(0);
  }

  const safeName = consent.full_name.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase();
  doc.save(`aceite-${safeName}-${consent.term_version}.pdf`);
}
