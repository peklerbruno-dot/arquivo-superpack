#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Importa as 1287 peulot do acervo (site-novo/peulas.json) para o banco Supabase.
Rode UMA vez, depois de aplicar o schema.sql.

Uso:
  export SUPABASE_URL="https://xxxx.supabase.co"
  export SUPABASE_SERVICE_KEY="a service_role key (NUNCA use no site!)"
  python3 supabase/importar_acervo.py

A service_role key fica em: Supabase → Project Settings → API → service_role.
Ela ignora as regras de segurança, por isso só é usada aqui no seu computador,
nunca dentro do site.
"""
import os, sys, json, urllib.request

URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
if not URL or not KEY:
    sys.exit("Defina SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente.")

AQUI = os.path.dirname(os.path.abspath(__file__))
JSON = os.path.join(os.path.dirname(AQUI), "site-novo", "peulas.json")
peulas = json.load(open(JSON, encoding="utf-8"))
print("peulot a importar:", len(peulas))

def linha(p):
    return {
        "tema": p.get("tema") or "(sem tema)",
        "shnat": p.get("shnat"),
        "objetivo": p.get("objetivo") or None,
        "desenvolvimento": p.get("desenvolvimento") or None,
        "sicha": p.get("sicha") or None,
        "parte_tecnica": p.get("parte_tecnica") or None,
        "categorias": p.get("categorias") or [],
        "origem": "acervo",
        "legacy_id": p.get("id"),
    }

def post(rows):
    data = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(
        f"{URL}/rest/v1/peulot",
        data=data, method="POST",
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        })
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status

LOTE = 200
total = 0
for i in range(0, len(peulas), LOTE):
    lote = [linha(p) for p in peulas[i:i+LOTE]]
    try:
        st = post(lote)
        total += len(lote)
        print(f"  enviadas {total}/{len(peulas)} (HTTP {st})")
    except urllib.error.HTTPError as e:
        print("ERRO HTTP", e.code, e.read().decode("utf-8","replace")[:300])
        sys.exit(1)
print("Concluído. Importadas", total, "peulot.")
