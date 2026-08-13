"""Gera o Manual do Painel do Criador (português). Mesma voz e mesmo visual
do Manual do Servidor. Depois de rodar, passar o linkar-indice-manuais.py
para o índice virar clicável."""
import subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                Table, TableStyle, ListFlowable, ListItem)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def reg(name, query):
    p = subprocess.check_output(["fc-match", "-f", "%{file}", query], text=True).strip()
    pdfmetrics.registerFont(TTFont(name, p))


reg("DJ", "DejaVu Sans")
reg("DJB", "DejaVu Sans:bold")
reg("DJI", "DejaVu Sans:italic")
pdfmetrics.registerFontFamily("DJ", normal="DJ", bold="DJB", italic="DJI", boldItalic="DJB")
reg("MONO", "DejaVu Sans Mono")

VERDE = colors.HexColor("#4b6b57")
ESCURO = colors.HexColor("#23302a")
SUAVE = colors.HexColor("#6b7a70")
CREME = colors.HexColor("#f3f0e8")

ss = getSampleStyleSheet()
P = ParagraphStyle("P", parent=ss["Normal"], fontName="DJ", fontSize=10.5, leading=16,
                   spaceAfter=8, textColor=ESCURO)
H1 = ParagraphStyle("H1", parent=P, fontName="DJB", fontSize=19, leading=24,
                    spaceBefore=6, spaceAfter=10, textColor=VERDE)
H2 = ParagraphStyle("H2", parent=P, fontName="DJB", fontSize=13, leading=18,
                    spaceBefore=12, spaceAfter=6, textColor=ESCURO)
CAP = ParagraphStyle("CAP", parent=P, fontName="DJB", fontSize=8.5, leading=12,
                     textColor=SUAVE, spaceAfter=2)
LI = ParagraphStyle("LI", parent=P, spaceAfter=4)
CODE = ParagraphStyle("CODE", parent=P, fontName="MONO", fontSize=9, leading=14,
                      backColor=CREME, borderPadding=8, spaceBefore=4, spaceAfter=10,
                      textColor=ESCURO)
NOTA = ParagraphStyle("NOTA", parent=P, fontSize=10, leading=15, backColor=CREME,
                      borderPadding=9, spaceBefore=6, spaceAfter=12)
TIT = ParagraphStyle("TIT", parent=P, fontName="DJB", fontSize=30, leading=36,
                     textColor=VERDE, spaceAfter=6)
SUB = ParagraphStyle("SUB", parent=P, fontSize=12.5, leading=19, textColor=SUAVE)


def b(t):
    return Paragraph(t, P)


def caminho(t):
    return Paragraph(t.replace(" ", "&nbsp;"), CODE)


def bullets(itens):
    return ListFlowable([ListItem(Paragraph(i, LI), leftIndent=14) for i in itens],
                        bulletType="bullet", bulletFontName="DJ", bulletFontSize=8,
                        leftIndent=14, bulletColor=VERDE, spaceAfter=8)


def passos(itens):
    return ListFlowable([ListItem(Paragraph(i, LI), leftIndent=16) for i in itens],
                        bulletType="1", bulletFormat="%s.", bulletFontName="DJB",
                        bulletFontSize=10, leftIndent=16, bulletColor=VERDE, spaceAfter=8)


def tabela(linhas, larguras=(52*mm, 102*mm)):
    dados = [[Paragraph(f"<b>{a}</b>", P), Paragraph(d, P)] for a, d in linhas]
    tb = Table(dados, colWidths=list(larguras))
    tb.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                            ("TOPPADDING", (0, 0), (-1, -1), 6),
                            ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.HexColor("#e2ded2"))]))
    return tb


F = []


def capitulo(n, titulo):
    F.append(PageBreak())
    F.append(Paragraph(f"CAPÍTULO {n}", CAP))
    F.append(Paragraph(titulo, H1))


# ---------- capa ----------
F += [Spacer(1, 55*mm),
      Paragraph("Manual do painel do criador", TIT),
      Paragraph("Como montar o curso, trocar o vídeo, escolher a capa e publicar — "
                "sem depender de ninguém.", SUB),
      Spacer(1, 14*mm),
      Paragraph("Flor de Plasma · área de cursos<br/>versão 1 — agosto de 2026", CAP)]

# ---------- sumário ----------
F.append(PageBreak())
F.append(Paragraph("O que tem aqui dentro", H1))
sumario = [
    ("1", "O que é o painel do criador"),
    ("2", "Como entrar (e o que só o administrador vê)"),
    ("3", "O mapa: curso, módulo e aula"),
    ("4", "O modo edição e o atalho dos três pontinhos"),
    ("5", "Criar um curso do zero"),
    ("6", "Criar módulo e aula"),
    ("7", "Trocar o vídeo da aula"),
    ("8", "Miniatura: a imagem do card"),
    ("9", "O bloco em destaque da vitrine"),
    ("10", "Aula gratuita, aula exclusiva"),
    ("11", "As outras abas da aula: conteúdo, materiais, legendas, tutor, acesso"),
    ("12", "Publicar e conferir com olhos de aluno"),
    ("13", "Quando alguma coisa não aparece"),
    ("14", "Palavras que você vai encontrar"),
]
linhas = [[Paragraph(f"<font color='#4b6b57'><b>{n}</b></font>", P), Paragraph(t, P)]
          for n, t in sumario]
tb = Table(linhas, colWidths=[14*mm, 140*mm])
tb.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.HexColor("#e2ded2"))]))
F.append(tb)

# ---------- 1 ----------
capitulo(1, "O que é o painel do criador")
F += [b("A área de cursos tem <b>duas caras</b>. A do aluno, que é a vitrine: capas, "
        "descrições, o vídeo que toca. E a sua, que é o painel — o mesmo lugar visto "
        "por dentro, com as gavetas abertas."),
      b("O painel não é um outro site. É a <b>mesma tela</b>, com botões a mais que só "
        "aparecem quando o banco reconhece a sua conta como administradora. Isso é bom "
        "por dois motivos: você edita olhando o resultado, e não existe risco de um aluno "
        "esbarrar num botão de edição — para ele os botões simplesmente não existem."),
      Paragraph("Regra de ouro: tudo que você muda no painel vale na hora. Não existe "
                "'salvar o site inteiro'. Cada campo salva sozinho quando você clica em "
                "Salvar ou sai do campo.", NOTA)]

# ---------- 2 ----------
capitulo(2, "Como entrar (e o que só o administrador vê)")
F.append(passos([
    "Abra a área de cursos: <b>Curso</b> no menu do site, ou o endereço <b>/curso</b>.",
    "Entre com a sua conta (a mesma de sempre, <b>flordeplasma@gmail.com</b>).",
    "Se o banco reconhecer a conta como administradora, aparece na parte de baixo da tela "
    "uma barrinha flutuante escrita <b>Modo edição · Ver como aluno · Abrir painel</b>.",
]))
F.append(Paragraph("A barrinha é o seu chaveiro", H2))
F.append(tabela([
    ("Modo edição", "A chavinha que liga e desliga os botões de edição na vitrine. "
                    "Desligada, você vê a tela exatamente como o aluno vê."),
    ("Ver como aluno", "Desliga tudo por um instante, para conferir o resultado."),
    ("Abrir painel", "Leva ao painel completo, com a lista de cursos, alunos, "
                     "biblioteca de vídeos e manuais."),
]))
F.append(b("Se a barrinha não aparecer, você não está logado ou a sessão caiu. "
           "Entre de novo e volte para <b>/curso</b>."))

# ---------- 3 ----------
capitulo(3, "O mapa: curso, módulo e aula")
F.append(b("Três níveis, sempre nesta ordem. Entender isso resolve metade das dúvidas:"))
F.append(tabela([
    ("Curso", "A obra inteira. Ex.: <i>Ateliê Tecnológico da Saúde</i>. Tem título, "
              "descrição, capa e um vídeo de apresentação (o trailer)."),
    ("Módulo", "A parte de dentro do curso. Ex.: <i>Fundamentos</i>. Serve só para "
               "agrupar aulas — não tem vídeo próprio."),
    ("Aula", "A unidade que o aluno assiste. Tem um vídeo, textos, materiais, "
             "legenda e a regra de acesso (gratuita ou exclusiva)."),
    ("Vídeo", "O arquivo em si, guardado na biblioteca. O mesmo vídeo pode ser usado "
              "como aula e como trailer — por isso ele vive numa lista separada."),
]))
F.append(Paragraph("Uma aula sem módulo não aparece para ninguém. Se criou a aula e ela "
                   "sumiu, quase sempre é isso: falta o módulo.", NOTA))

# ---------- 4 ----------
capitulo(4, "O modo edição e o atalho dos três pontinhos")
F.append(b("Com o <b>modo edição</b> ligado, cada card da vitrine ganha uma moldura "
           "pontilhada e, no canto de cima à direita, um botãozinho de <b>três "
           "pontinhos</b>. Ele é o atalho para tudo."))
F.append(b("Clique nos três pontinhos — ou clique com o <b>botão direito</b> em cima "
           "do card, dá no mesmo — e abre um menu curto:"))
F.append(bullets([
    "<b>Trocar vídeo</b> — vai direto para a aba Vídeo daquela aula.",
    "<b>Trocar miniatura</b> — abre a janelinha da imagem sem sair da vitrine.",
    "<b>Editar textos</b> — título e descrição.",
    "<b>Tornar gratuita / Tornar exclusiva</b> — muda o acesso na hora.",
    "<b>Mover para a esquerda / direita</b> — muda a ordem da fileira.",
    "<b>Abrir no painel</b> — a tela completa daquele item.",
]))
F.append(b("O bloco grande em destaque, no alto da vitrine, tem os mesmos três "
           "pontinhos no canto do vídeo."))
F.append(Paragraph("O caminho longo continua existindo e às vezes é melhor: "
                   "Abrir painel → Editar o curso → clicar na aula. Use os três "
                   "pontinhos quando já estiver olhando para o card que quer mexer.", NOTA))

# ---------- 5 ----------
capitulo(5, "Criar um curso do zero")
F.append(passos([
    "Na vitrine, com o modo edição ligado, clique em <b>Novo curso</b> — ou entre no "
    "painel e use o mesmo botão.",
    "Dê um <b>título em português</b>. O endereço do curso (o <i>slug</i>) nasce daí: "
    "<i>Ateliê Tecnológico da Saúde</i> vira <b>atelie-tecnologico-da-saude</b>.",
    "Escreva a <b>descrição curta</b> — é o texto que aparece embaixo do título no card.",
    "Preencha também os campos em <b>inglês</b>. O site é bilíngue: o que ficar vazio "
    "em inglês aparece em português para quem estiver com a bandeira EN.",
    "Escolha a <b>capa</b> (capítulo 8) e, se quiser, o <b>trailer</b> (capítulo 9).",
    "Deixe o curso como <b>rascunho</b> enquanto estiver montando. Só marque "
    "<b>publicado</b> quando estiver pronto (capítulo 12).",
]))
F.append(Paragraph("Rascunho é invisível para o aluno, mas continua visível para você "
                   "no painel, com a etiqueta cinza. Use sem medo.", NOTA))

# ---------- 6 ----------
capitulo(6, "Criar módulo e aula")
F.append(passos([
    "Abra o curso no painel: <b>Abrir painel → Editar</b> no card do curso.",
    "Clique em <b>Novo módulo</b> e dê um nome (ex.: <i>Fundamentos</i>).",
    "Dentro do módulo, clique em <b>Nova aula</b> e dê o título.",
    "Arraste as aulas pela alcinha à esquerda para mudar a ordem. A ordem que você vê "
    "no painel é a ordem que o aluno vê.",
    "Clique na aula para abrir o editor dela — é lá que mora o vídeo.",
]))
F.append(b("O editor da aula tem seis abas: <b>Vídeo · Conteúdo · Materiais · Legendas · "
           "Tutor · Acesso</b>. Cada uma cuida de uma coisa só, e nenhuma depende da outra "
           "para funcionar. Pode preencher fora de ordem."))

# ---------- 7 ----------
capitulo(7, "Trocar o vídeo da aula")
F.append(b("Esta é a tarefa mais comum de todas. São dois caminhos, e para o aluno "
           "o resultado é idêntico."))
F.append(Paragraph("Caminho 1 — link do YouTube ou do Vimeo (o mais usado)", H2))
F.append(passos([
    "Suba o vídeo no YouTube ou no Vimeo, como você já faz.",
    "Copie o endereço do vídeo (ou só o código dele).",
    "No editor da aula, aba <b>Vídeo</b>, escolha a <b>Fonte</b>: YouTube ou Vimeo.",
    "Cole no campo <b>ID ou link do vídeo</b>. Pode colar o endereço inteiro — "
    "o site separa o código sozinho.",
    "Confira a <b>duração em segundos</b> (é o que aparece escrito no card, ex.: 9 min).",
    "Clique em <b>Salvar</b> e role para baixo: a pré-visualização tem que tocar.",
]))
F.append(Paragraph("Caminho 2 — arquivo do seu computador", H2))
F.append(passos([
    "Na mesma aba, arraste o arquivo para a área <b>Enviar do meu computador</b> "
    "(MP4, MOV ou WebM, até 500 MB).",
    "Espere a barra terminar. A fonte muda sozinha para <b>Arquivo</b>.",
]))
F.append(Paragraph("Esse caminho é para rascunho e vídeo curto. Vídeo grande e definitivo "
                   "vai para o Vimeo ou fica no servidor do HD — veja o Manual do servidor.",
                   NOTA))
F.append(Paragraph("Dois campos que salvam a sua pele depois", H2))
F.append(tabela([
    ("Arquivo original", "O caminho da pasta no seu computador, ex.: "
                         "D:\\Videos\\Burnstore\\aula01.mp4. Não muda nada no site — "
                         "serve para você reencontrar o original daqui a um ano."),
    ("Status de produção", "Onde o vídeo está na esteira: ideia → gravado → editado → "
                           "legendado → publicado. É o seu quadro de controle na "
                           "biblioteca de vídeos."),
]))

# ---------- 8 ----------
capitulo(8, "Miniatura: a imagem do card")
F.append(b("Sem miniatura, o card aparece cinza com um ícone de play. Funciona, mas "
           "não convida ninguém. Vale muito o minuto de trabalho."))
F.append(passos([
    "Três pontinhos no card → <b>Trocar miniatura</b>. (Ou o botão da imagem, na aba "
    "Vídeo da aula, e na biblioteca de vídeos.)",
    "Escolha uma imagem do computador <b>ou</b> cole o link de uma imagem que já esteja "
    "na internet.",
    "Proporção <b>16:9</b> (a mesma do vídeo) e até <b>5 MB</b>.",
    "Salve. O card muda na hora.",
]))
F.append(tabela([
    ("Capa do curso", "A imagem do curso inteiro. Aparece no card do curso e no bloco "
                      "em destaque quando não há trailer."),
    ("Miniatura do vídeo", "A imagem daquela aula. Como ela mora no vídeo, se o mesmo "
                           "vídeo for usado em dois lugares, os dois mudam juntos."),
]))

# ---------- 9 ----------
capitulo(9, "O bloco em destaque da vitrine")
F.append(b("É o bloco grande do topo: título enorme, descrição e, do lado direito, "
           "um vídeo tocando (ou a capa, se não houver vídeo)."))
F.append(passos([
    "Três pontinhos no canto do bloco → <b>Editar destaque</b>.",
    "Escolha qual <b>curso</b> ocupa o destaque.",
    "Ajuste o <b>título</b> e a <b>descrição curta</b> se quiser um texto diferente "
    "do que está no card.",
    "Escolha o <b>vídeo do destaque</b> na biblioteca — é o trailer. Se deixar "
    "<i>sem vídeo</i>, aparece a capa do curso.",
    "Salve e confira: o quadro da direita tem que sair do cinza.",
]))
F.append(Paragraph("Está escrito 'Sem vídeo nem capa'? Então o curso em destaque não "
                   "tem trailer nem imagem de capa. Resolva pelo mesmo menu.", NOTA))

# ---------- 10 ----------
capitulo(10, "Aula gratuita, aula exclusiva")
F.append(b("Quem manda no acesso é a aba <b>Acesso</b> da aula — não o lugar onde o "
           "vídeo está hospedado. Um vídeo no YouTube pode ser aula exclusiva, e um "
           "vídeo do servidor pode ser gratuito."))
F.append(tabela([
    ("Gratuita", "Qualquer pessoa assiste, mesmo sem conta. É a sua vitrine: a fileira "
                 "<i>Aulas gratuitas</i> na página inicial mostra exatamente essas."),
    ("Exclusiva", "Só quem tem matrícula no curso assiste. Quem não tem vê o card, "
                  "a descrição e o convite para entrar."),
]))
F.append(b("Atalho: três pontinhos no card → <b>Tornar gratuita</b> / <b>Tornar "
           "exclusiva</b>. Muda na hora, e a fileira de aulas gratuitas se refaz sozinha."))

# ---------- 11 ----------
capitulo(11, "As outras abas da aula")
F.append(tabela([
    ("Conteúdo", "O texto da aula — a apostila. Pode escrever à mão ou gerar um "
                 "rascunho a partir da legenda, quando ela já existir."),
    ("Materiais", "Arquivos para o aluno baixar: PDF, planilha, esquema. Arraste o "
                  "arquivo e pronto."),
    ("Legendas", "A legenda em português vem pronta do servidor do HD, com o tempo de "
                 "cada palavra. Aqui você puxa, confere e manda traduzir para o inglês."),
    ("Tutor", "O contexto que a inteligência artificial usa para responder as perguntas "
              "daquele módulo. Quanto melhor o contexto, melhor a resposta."),
    ("Acesso", "Gratuita ou exclusiva, e se a aula está publicada."),
]))
F.append(Paragraph("A legenda nunca é transcrita aqui pelo site. Quem escuta o áudio e "
                   "escreve é o servidor do seu HD. O site só busca o arquivo pronto.", NOTA))

# ---------- 12 ----------
capitulo(12, "Publicar e conferir com olhos de aluno")
F.append(passos([
    "Marque a aula como <b>publicada</b> (aba Acesso) e o curso como <b>publicado</b> "
    "(editor do curso).",
    "Volte para <b>/curso</b> e clique em <b>Ver como aluno</b> na barrinha de baixo.",
    "Percorra a tela: o card tem imagem? A duração está certa? O vídeo abre?",
    "Troque para <b>EN</b> no canto de cima e repita. Todo texto que ficou vazio em "
    "inglês aparece em português — se algo importante ficar assim, volte e preencha.",
    "Se puder, abra também no celular. A vitrine é a primeira impressão.",
]))

# ---------- 13 ----------
capitulo(13, "Quando alguma coisa não aparece")
F.append(tabela([
    ("A barrinha de edição sumiu", "Sessão caiu. Entre de novo com a sua conta e volte "
                                   "para /curso."),
    ("O curso não aparece para o aluno", "Ele ainda está como rascunho. Marque "
                                         "publicado no editor do curso."),
    ("A aula sumiu da lista", "Aula sem módulo, ou não publicada. Confira as duas coisas."),
    ("O card está cinza", "Falta miniatura (capítulo 8). O vídeo pode estar certo "
                          "mesmo assim."),
    ("O vídeo não toca", "Confira a Fonte e o ID: YouTube com código de Vimeo não "
                         "funciona. Cole o link inteiro e salve de novo."),
    ("A biblioteca de vídeos deu erro de permissão",
     "É a sessão de administrador que caiu. A tela avisa e oferece o botão de entrar "
     "de novo — depois disso ela carrega normalmente."),
    ("Mudei e não mudou nada", "Recarregue a página. Se persistir, veja se clicou em "
                               "Salvar — alguns campos só salvam ao sair do campo."),
]))

# ---------- 14 ----------
capitulo(14, "Palavras que você vai encontrar")
F.append(tabela([
    ("Slug", "O pedacinho do endereço, sem acento e sem espaço. Nasce do título."),
    ("Rascunho", "Existe no painel, mas o aluno não vê."),
    ("Trailer", "O vídeo de apresentação do curso, que toca no bloco em destaque."),
    ("Miniatura", "A imagem do card. Também chamada de <i>thumb</i>."),
    ("Matrícula", "O registro que dá a um aluno acesso a um curso exclusivo."),
    ("Biblioteca de vídeos", "A lista de todos os vídeos, com status de produção e o "
                             "caminho do arquivo original no seu computador."),
    ("Modo edição", "A chavinha que faz aparecer os três pontinhos na vitrine."),
]))
F.append(Spacer(1, 8*mm))
F.append(Paragraph("Empacou em algo que este manual não resolveu? Anote em que passo "
                   "parou e o que apareceu na tela — com essas duas informações o "
                   "conserto costuma levar minutos.", NOTA))


def rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont("DJ", 8)
    canvas.setFillColor(SUAVE)
    if doc.page > 1:
        canvas.drawString(28*mm, 14*mm, "Manual do painel do criador · Flor de Plasma")
        canvas.drawRightString(182*mm, 14*mm, str(doc.page))
    canvas.restoreState()


doc = SimpleDocTemplate("/tmp/manual-do-painel.pdf", pagesize=A4,
                        leftMargin=28*mm, rightMargin=28*mm,
                        topMargin=24*mm, bottomMargin=22*mm,
                        title="Manual do painel do criador", author="Flor de Plasma")
doc.build(F, onFirstPage=rodape, onLaterPages=rodape)
print("ok")
