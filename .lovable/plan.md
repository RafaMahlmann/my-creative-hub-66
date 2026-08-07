# Sistema de Consentimento Jurídico — My Digital Space (alunos PICS)

## O que entendi do handoff

O objetivo é produzir **prova jurídica de aceite eletrônico**: se alguém questionar na Justiça, deve ser possível reconstituir exatamente qual texto a pessoa leu, quando, de onde e quem era. São 7 elementos obrigatórios: CPF validado no servidor, texto integral na tela, rolagem obrigatória até o fim, aceite ativo (checkbox + nome digitado), timestamp do servidor, IP da requisição e hash SHA-256 do texto + versão.

O ponto central do desenho: **o texto jurídico é duplicado dentro da edge function** e o hash é calculado lá. O frontend nunca assina nada por conta própria. Registros de aceite são **imutáveis** (sem policy de UPDATE nem DELETE). Nada de "cura", "tratamento" ou "diagnóstico" em qualquer texto — enquadramento PICS / Portaria MS 971/2006.

## O que já existe aqui (verificado)

- Auth do aluno com `useStudentAuth()`, rota `/curso/entrar`.
- `profiles`, `user_roles` + `has_role` já prontos.
- Rotas do aluno e do admin já montadas em `src/App.tsx`.
- Edge functions e i18n já configurados. `zod` instalado; **jsPDF não** — será adicionado.
- Ajuste necessário: aqui a tabela `profiles` liga pelo campo `user_id` (não `id`), então a trigger do handoff será corrigida para `WHERE user_id = NEW.student_id`.

## Fase 1 — Termo do Aluno (o que vou construir agora)

### Banco
- `consent_terms` (versionamento dos termos, leitura pública, escrita só admin).
- `operator_settings` (nome, CNPJ, e-mail do DPO, cidade — alimentam os campos `{{...}}` do termo).
- `student_consents` — imutável, um registro por aluno, com CPF, dados cadastrais, IP, `accepted_at`, versão e hash.
- `purchase_consents` — criada agora, UI só na fase 2 (ainda não há loja).
- Coluna `profiles.has_accepted_terms` + trigger que a marca como verdadeira no insert do aceite.
- GRANTs e RLS em todas as tabelas conforme o handoff.

### Edge function `save-student-consent`
Texto canônico duplicado no arquivo Deno; `validateCPF` e `sha256` copiados sem alteração; `student_id` derivado do JWT (nunca do corpo); IP do `x-forwarded-for`; validação com Zod; insert via service role; CORS.

### Frontend
- `src/components/course/StudentConsentGate.tsx`: tela cheia com formulário cadastral (nome, CPF, nascimento, telefone, e-mail, endereço via ViaCEP), termo integral em área rolável, checkbox e campo "digite seu nome completo". Botão só habilita com scroll no fim + checkbox + CPF válido + nome conferindo. **Falha fechado**: erro de consulta bloqueia em vez de liberar.
- Gate aplicado a `/curso/minhas-aulas`, `/curso/:courseSlug` e `/curso/:courseSlug/:lessonSlug`. **Não** aplicado a `/curso` (vitrine) nem `/curso/entrar`.
- Página `/curso/seguranca`: o aluno vê o próprio aceite, com abas explicativas (como funciona / seus documentos / se for questionado / FAQ) e download do PDF.
- Listagem geral dos aceites em `/curso/admin/alunos`, restrita a admin.
- Geração de PDF A4 com metadados de prova (nome, CPF mascarado, data/hora, IP, versão, hash, declaração de assinatura eletrônica) + texto integral, usando os tokens visuais `course-*`.

### Textos
Termo do Aluno versão 1.0 exatamente como redigido no handoff (natureza da formação, limites da prática, encaminhamento, plantas medicinais, LGPD, uso do material, aceite eletrônico, foro). Texto jurídico **não vai** para os arquivos de i18n — só os rótulos de interface são traduzidos.

## Fase 2 (depois, quando houver checkout)
`PurchaseConsentBlock` + edge function `save-purchase-consent`, com o Termo de Compra 1.0 já redigido no handoff.

## Verificação antes de entregar
Aceite de teste ponta a ponta, conferência dos campos gravados, trigger no perfil, hash do PDF igual ao da versão ativa, UPDATE/DELETE negados e `student_id` do corpo ignorado.

## Dados do operador (confirmados)

Vão para `operator_settings` e substituem os campos `{{...}}` do termo no servidor, antes do cálculo do hash:

- **Operador:** Rafael Reis Malhmann
- **Documento:** CPF 025.689.409-48 — como o operador é pessoa física, o rótulo do termo passa de "CNPJ" para "CPF". Se depois houver CNPJ, isso exige **nova versão** do termo.
- **Encarregado (DPO):** Rafael Reis Malhmann — flordeplasmaprojetos@gmail.com. A LGPD permite que o próprio controlador pessoa física acumule a função de encarregado; o termo indica o nome e esse e-mail como canal do titular.
- **Cidade / Foro:** Comarca de São José dos Pinhais — Paraná (TJPR). É comarca própria, então o foro eleito é o da própria cidade, sem remeter a Curitiba.
- **Sistema:** My Digital Space — versão 1.0.

Esses valores ficam editáveis em `operator_settings`, mas alterar o **texto** do termo exige nova versão; nunca editar uma versão já assinada.

Aviso: os textos são bem construídos, mas devem passar por conferência de advogado antes de produção.

