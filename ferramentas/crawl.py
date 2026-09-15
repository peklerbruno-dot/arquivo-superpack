#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, re, sys, time
from urllib.parse import urljoin, urlsplit, unquote
import requests

BASE = "http://www.chazit.org.br/"
ROOT_PREFIX = "/superpack/"          # so baixamos o que estiver dentro daqui
OUTDIR = os.path.abspath("mirror")   # espelho preservando caminhos
HOST = "www.chazit.org.br"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

s = requests.Session()
s.headers["User-Agent"] = UA
# aquece a sessao e tenta logar (mesmo que falhe, mantem cookie)
try:
    s.get(BASE+"superpack/", timeout=30)
    for _ in range(2):
        s.post(BASE+"superpack/login.php",
               data={"login":"pail","senha":"pail","Submit":"entrar"},
               headers={"Referer":BASE+"superpack/"},
               allow_redirects=False, timeout=30)
except Exception as e:
    print("warn login:", e)

PAGE_EXT = (".php",".html",".htm","/")   # tratamos como pagina (parse)
SKIP = ("logout.php",)                    # nao deslogar
seen_pages = set()
seen_assets = set()
queue = []
saved, failed = [], []

def in_scope(url):
    u = urlsplit(url)
    if u.netloc and u.netloc != HOST: return False
    return u.path.startswith(ROOT_PREFIX)

def is_page(url):
    p = urlsplit(url).path.lower()
    if p.endswith("/"): return True
    return p.endswith((".php",".html",".htm"))

def local_path(url):
    u = urlsplit(url)
    path = unquote(u.path)
    if path.endswith("/"):
        path += "index.html"
    rel = path[len(ROOT_PREFIX):] if path.startswith(ROOT_PREFIX) else path.lstrip("/")
    # querystring -> nome de arquivo unico
    if u.query:
        q = re.sub(r'[^A-Za-z0-9._=-]','_', u.query)
        base, ext = os.path.splitext(rel)
        if not ext:
            rel = rel.rstrip("/") + "/index.html"
            base, ext = os.path.splitext(rel)
        rel = f"{base}__{q}{ext}"
    return os.path.join(OUTDIR, rel)

def save(url, content):
    fp = local_path(url)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, "wb") as f:
        f.write(content)
    return fp

def fetch(url):
    # nao segue redirect -> captura o corpo do 302 (que contem a pagina real)
    r = s.get(url, allow_redirects=False, timeout=45)
    return r

# --- extracao de links ---
ATTR_RE = re.compile(r'(?:href|src|action|data-src|background)\s*=\s*["\']([^"\']+)["\']', re.I)
CSSURL_RE = re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)', re.I)
JSSTR_RE = re.compile(r'["\']([^"\'<>\s]+?\.(?:php|html|htm|css|js|png|jpg|jpeg|gif|swf|mp3|mp4|ico|pdf|json|xml|woff2?|ttf)(?:\?[^"\']*)?)["\']', re.I)

def extract(url, text):
    links = set()
    for rx in (ATTR_RE, CSSURL_RE, JSSTR_RE):
        for m in rx.finditer(text):
            links.add(m.group(1))
    out = set()
    for l in links:
        l = l.strip()
        if not l or l.startswith(("#","mailto:","javascript:","data:","tel:")):
            continue
        out.add(urljoin(url, l))
    return out

# seeds
for seed in ["superpack/","superpack/novo/","superpack/machberet/","superpack/armario/",
             "superpack/tutorial.php","superpack/index2.php","superpack/login.php",
             "superpack/machberet/menu.php","superpack/machberet/tutomach.php",
             "superpack/armario/acervom.php","superpack/armario/buscaavancada.php",
             "superpack/armario/suaUrl.php"]:
    queue.append(BASE+seed)

MAX_PAGES = 400
while queue and len(seen_pages) < MAX_PAGES:
    url = queue.pop(0)
    key = url.split("#")[0]
    if key in seen_pages: continue
    if any(sk in key for sk in SKIP): 
        continue
    if not in_scope(key):
        continue
    seen_pages.add(key)
    try:
        r = fetch(key)
    except Exception as e:
        failed.append((key, str(e))); print("FAIL", key, e); continue
    ct = r.headers.get("content-type","")
    body = r.content
    fp = save(key, body)
    saved.append((key, r.status_code, len(body), fp))
    print(f"PAGE {r.status_code} {len(body):>7} {key}")
    # so parseia se textual
    if "text" in ct or "html" in ct or "javascript" in ct or "css" in ct or key.lower().endswith((".php","/",".html",".htm",".js",".css")):
        try:
            text = body.decode("iso-8859-1", "replace")
        except Exception:
            text = body.decode("utf-8","replace")
        for link in extract(key, text):
            lk = link.split("#")[0]
            if not in_scope(lk): 
                continue
            if is_page(lk):
                if lk not in seen_pages:
                    queue.append(lk)
            else:
                seen_assets.add(lk)
    time.sleep(0.15)

print("\n=== baixando assets:", len(seen_assets))
for a in sorted(seen_assets):
    if any(sk in a for sk in SKIP): continue
    try:
        r = fetch(a)
        if r.status_code in (301,302,303,307,308):
            # asset protegido? salva corpo msm assim
            pass
        save(a, r.content)
        saved.append((a, r.status_code, len(r.content), ""))
        print(f"ASSET {r.status_code} {len(r.content):>7} {a}")
    except Exception as e:
        failed.append((a, str(e))); print("FAIL", a, e)
    time.sleep(0.1)

print("\n=== RESUMO ===")
print("paginas:", len(seen_pages), "assets:", len(seen_assets), "falhas:", len(failed))
with open("crawl_report.txt","w") as f:
    f.write("SALVOS\n")
    for u,st,sz,fp in saved: f.write(f"{st}\t{sz}\t{u}\n")
    f.write("\nFALHAS\n")
    for u,e in failed: f.write(f"{u}\t{e}\n")
