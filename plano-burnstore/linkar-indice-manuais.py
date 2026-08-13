"""Adiciona indice clicavel + marcadores laterais nos manuais do servidor."""
import re, sys
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import Fit
from pypdf.annotations import Link
from pypdf.generic import (ArrayObject, DictionaryObject, NameObject,
                           NumberObject, FloatObject, TextStringObject)

def processar(caminho, saida, palavra_capitulo, rotulo_indice):
    caps = {}          # numero -> pagina (0-based)
    titulos = {}
    toc_page = None
    toc_items = []     # (num, x0, x1, top, bottom)

    with pdfplumber.open(caminho) as pdf:
        alturas = [p.height for p in pdf.pages]
        larguras = [p.width for p in pdf.pages]
        for i, page in enumerate(pdf.pages):
            txt = page.extract_text() or ""
            m = re.search(rf"^{palavra_capitulo}\s+(\d+)\s*\n(.+)$", txt, re.M)
            if m:
                n = int(m.group(1))
                if n not in caps:
                    caps[n] = i
                    titulos[n] = m.group(2).strip()
            if toc_page is None and rotulo_indice.lower() in txt.lower()[:120]:
                toc_page = i
        # posicoes das linhas do sumario
        if toc_page is not None:
            words = pdf.pages[toc_page].extract_words()
            largura = pdf.pages[toc_page].width
            for w in words:
                if re.fullmatch(r"\d{1,2}", w["text"]) and w["x0"] < 100:
                    n = int(w["text"])
                    if n in caps:
                        toc_items.append((n, w["x0"] - 6, largura - 40,
                                          w["top"] - 4, w["bottom"] + 4))

    reader = PdfReader(caminho)
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)

    # marcadores laterais
    writer.add_outline_item("Capa", 0)
    if toc_page is not None:
        writer.add_outline_item(rotulo_indice, toc_page)
    for n in sorted(caps):
        writer.add_outline_item(f"{n}. {titulos[n]}", caps[n])

    # links clicaveis no sumario
    for n, x0, x1, top, bottom in toc_items:
        alt = alturas[toc_page]
        link = Link(rect=(x0, alt - bottom, x1, alt - top),
                    target_page_index=caps[n], border=[0, 0, 0],
                    fit=Fit.fit())
        annot = writer.add_annotation(page_number=toc_page, annotation=link)
        annot.get_object()[NameObject("/Dest")] = ArrayObject([
            writer.pages[caps[n]].indirect_reference, NameObject("/Fit")])

    writer.page_mode = "/UseOutlines"
    with open(saida, "wb") as f:
        writer.write(f)
    print(caminho, "->", saida, "| capitulos:", sorted(caps),
          "| sumario pag:", toc_page, "| links:", len(toc_items))

processar("public/manuais/manual-do-servidor.pdf", "/tmp/pt.pdf", "CAPÍTULO", "O que tem aqui dentro")
processar("public/manuais/manual-do-servidor-en.pdf", "/tmp/en.pdf", "CHAPTER", "What is inside")
