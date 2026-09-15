#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parseia as peulot de machané baixadas (acervo/peulas_machane/pm_*.html) e importa
no Supabase (tabela peulot, origem='machane'). Também gera peulas_machane.json.

Uso:
  export SUPABASE_URL="https://xxxx.supabase.co"
  export SUPABASE_SERVICE_KEY="sb_secret_..."
  python3 supabase/importar_machane.py
"""
import os, re, sys, json, html, urllib.request

ROOT="/home/user/arquivo-superpack/acervo"
SRC=ROOT+"/peulas_machane"
URL=os.environ.get("SUPABASE_URL","").rstrip("/")
KEY=os.environ.get("SUPABASE_SERVICE_KEY","")

CAMPOS=[("Tema:","tema"),("peulá dada para o shnat:","shnat_raw"),
        ("Objetivo:","objetivo"),("Desenvolvimento:","desenvolvimento"),
        ("Sichá:","sicha"),("Parte Técnica:","parte_tecnica")]

def limpa(frag):
    frag=re.sub(r"(?i)<br\s*/?>","\n",frag)
    frag=re.sub(r"<[^>]+>","",frag)
    frag=html.unescape(frag)
    return "\n".join(l.strip() for l in frag.splitlines()).strip()

def campo(txt,label):
    m=re.search(re.escape(label)+r"\s*</b>\s*</h3>\s*<div[^>]*>(.*?)(?=<h3>|</body>)",txt,re.S|re.I)
    if not m: return ""
    return limpa(re.sub(r"</div>\s*$","",m.group(1),flags=re.I))

def parse(fp,pid):
    raw=open(fp,"rb").read()
    try: txt=raw.decode("utf-8")
    except UnicodeDecodeError: txt=raw.decode("latin-1")
    reg={"legacy_id":pid,"origem":"machane","categorias":[]}
    for label,chave in CAMPOS: reg[chave]=campo(txt,label)
    m=re.search(r"(\d{4})",reg.pop("shnat_raw",""))
    reg["shnat"]=int(m.group(1)) if m else None
    for k in ("objetivo","desenvolvimento","sicha","parte_tecnica"):
        reg[k]=reg[k] or None
    if not reg["tema"]: reg["tema"]="(sem tema)"
    return reg

arqs=sorted(os.listdir(SRC),key=lambda f:int(re.search(r"(\d+)",f).group(1)) if re.search(r"(\d+)",f) else 0)
regs=[]
for fn in arqs:
    m=re.search(r"pm_(\d+)\.html",fn)
    if m: regs.append(parse(os.path.join(SRC,fn),int(m.group(1))))
print("peulot de machané parseadas:",len(regs))
json.dump(regs,open("/home/user/arquivo-superpack/site-novo/peulas_machane.json","w"),ensure_ascii=False,indent=1)

if not URL or not KEY:
    print("Sem SUPABASE_URL/SERVICE_KEY — só gerei o JSON, não importei.")
    sys.exit(0)

def post(rows):
    req=urllib.request.Request(f"{URL}/rest/v1/peulot",
        data=json.dumps(rows).encode("utf-8"),method="POST",
        headers={"apikey":KEY,"Authorization":f"Bearer {KEY}","Content-Type":"application/json","Prefer":"return=minimal"})
    with urllib.request.urlopen(req,timeout=60) as r: return r.status

LOTE=200; total=0
for i in range(0,len(regs),LOTE):
    lote=regs[i:i+LOTE]
    try:
        post(lote); total+=len(lote); print(f"  importadas {total}/{len(regs)}")
    except urllib.error.HTTPError as e:
        print("ERRO HTTP",e.code,e.read().decode("utf-8","replace")[:300]); sys.exit(1)
print("Concluído. Importadas",total,"peulot de machané.")
