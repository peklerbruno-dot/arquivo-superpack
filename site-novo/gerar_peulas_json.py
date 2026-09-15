#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lê os 1287 arquivos de acervo/peulas/peula_<id>.html, extrai os campos
(tema, shnat, objetivo, desenvolvimento, sicha, parte_tecnica) e as categorias
do indice.json, e gera site-novo/peulas.json — a fonte de dados do site novo.
"""
import os, re, json, html

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # raiz do repo
PEULAS_DIR = os.path.join(BASE, "acervo", "peulas")
INDICE = os.path.join(BASE, "acervo", "indice.json")
SAIDA = os.path.join(BASE, "site-novo", "peulas.json")

# categorias "reais" (temáticas). 'am' e '0' são listagens gerais, não tags.
NOMES_CATEGORIA = {
    "israel": "Israel",
    "doc": "Documentos/Textos",
    "judaismo": "Judaísmo",
    "sionismo": "Sionismo",
    "shoa": "Shoá",
    "manhigut": "Manhigut",
    "mej": "MEJ",
    "ceh": "CEH",
}

# id -> lista de categorias temáticas
id2cats = {}
if os.path.exists(INDICE):
    idx = json.load(open(INDICE, encoding="utf-8"))
    for chave, ids in idx.get("ids_por_categoria", {}).items():
        if chave in NOMES_CATEGORIA:
            for i in ids:
                id2cats.setdefault(int(i), set()).add(chave)

CAMPOS = [
    ("Tema:", "tema"),
    ("peulá dada para o shnat:", "shnat_raw"),
    ("Objetivo:", "objetivo"),
    ("Desenvolvimento:", "desenvolvimento"),
    ("Sichá:", "sicha"),
    ("Parte Técnica:", "parte_tecnica"),
]

def limpa(frag):
    # <br> vira quebra de linha; remove demais tags; desescapa entidades
    frag = re.sub(r"(?i)<br\s*/?>", "\n", frag)
    frag = re.sub(r"<[^>]+>", "", frag)
    frag = html.unescape(frag)
    # normaliza espaços/linhas
    linhas = [l.strip() for l in frag.splitlines()]
    frag = "\n".join(linhas)
    return frag.strip()

def extrai_campo(txt, label, prox_labels):
    # pega o conteúdo entre "<b>label</b></h3>...<div...>CONTEUDO" até o próximo <h3> ou </body>
    m = re.search(re.escape(label) + r"\s*</b>\s*</h3>\s*<div[^>]*>(.*?)(?=<h3>|</body>)",
                  txt, re.S | re.I)
    if not m:
        return ""
    frag = m.group(1)
    # remove um </div> final solto
    frag = re.sub(r"</div>\s*$", "", frag, flags=re.I)
    return limpa(frag)

peulas = []
faltando_campo = 0
arquivos = sorted(os.listdir(PEULAS_DIR),
                  key=lambda f: int(re.search(r"(\d+)", f).group(1)) if re.search(r"(\d+)", f) else 0)
for fn in arquivos:
    m = re.search(r"peula_(\d+)\.html", fn)
    if not m:
        continue
    pid = int(m.group(1))
    raw = open(os.path.join(PEULAS_DIR, fn), "rb").read()
    try:
        txt = raw.decode("utf-8")
    except UnicodeDecodeError:
        txt = raw.decode("latin-1")
    reg = {"id": pid}
    for label, chave in CAMPOS:
        reg[chave] = extrai_campo(txt, label, None)
    # shnat como inteiro quando possível
    m2 = re.search(r"(\d{4})", reg.pop("shnat_raw", ""))
    reg["shnat"] = int(m2.group(1)) if m2 else None
    reg["categorias"] = sorted(id2cats.get(pid, []))
    if not reg["tema"]:
        faltando_campo += 1
    peulas.append(reg)

# ordena por id
peulas.sort(key=lambda p: p["id"])

os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
json.dump(peulas, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

anos = sorted({p["shnat"] for p in peulas if p["shnat"]})
cats = {}
for p in peulas:
    for c in p["categorias"]:
        cats[c] = cats.get(c, 0) + 1
print("peulas geradas:", len(peulas))
print("sem tema:", faltando_campo)
print("anos:", anos[0] if anos else "-", "->", anos[-1] if anos else "-")
print("categorias:", cats)
print("arquivo:", SAIDA, os.path.getsize(SAIDA), "bytes")
