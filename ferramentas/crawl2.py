#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, re, time
from urllib.parse import urljoin, urlsplit, unquote
import requests
BASE="http://www.chazit.org.br/"; HOST="www.chazit.org.br"
OUT=os.path.abspath("mirror-relacionados")
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
ALLOW=("/chatamizade/","/acervomagico/","/perfil/","/documentos/","/atas/","/acervofla/","/secretgame/")
ROOTFILES=("/upload2.php",)
s=requests.Session(); s.headers["User-Agent"]=UA
try: s.get(BASE, timeout=30)
except: pass
def scope(u):
    x=urlsplit(u)
    if x.netloc and x.netloc!=HOST: return False
    return x.path.startswith(ALLOW) or x.path in ROOTFILES
def is_page(u):
    p=urlsplit(u).path.lower()
    return p.endswith("/") or p.endswith((".php",".html",".htm",".asp"))
def lpath(u):
    x=urlsplit(u); path=unquote(x.path)
    if path.endswith("/"): path+="index.html"
    rel=path.lstrip("/")
    if x.query:
        q=re.sub(r'[^A-Za-z0-9._=-]','_',x.query); b,e=os.path.splitext(rel)
        if not e: rel=rel.rstrip("/")+"/index.html"; b,e=os.path.splitext(rel)
        rel=f"{b}__{q}{e}"
    return os.path.join(OUT,rel)
def save(u,c):
    fp=lpath(u); 
    if os.path.isdir(fp): fp=os.path.join(fp,"index.html")
    os.makedirs(os.path.dirname(fp),exist_ok=True)
    open(fp,"wb").write(c); return fp
ATTR=re.compile(r'(?:href|src|action|background)\s*=\s*["\']([^"\']+)["\']',re.I)
CSS=re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)',re.I)
seen=set(); assets=set(); q=[]; saved=[]; fails=[]
for a in ("chatamizade/","chatamizade/mensagens.php","acervomagico/","acervomagico/index2.php",
          "perfil/","perfil/atencao.php","documentos/","atas/","acervofla/","secretgame/","upload2.php"):
    q.append(BASE+a)
MAX=250
while q and len(seen)<MAX:
    u=q.pop(0).split("#")[0]
    if u in seen or not scope(u) or "logout" in u: continue
    seen.add(u)
    try: r=s.get(u,allow_redirects=False,timeout=40)
    except Exception as e: fails.append((u,str(e))); continue
    save(u,r.content); saved.append((u,r.status_code,len(r.content)))
    print(f"{r.status_code} {len(r.content):>7} {u}")
    ct=r.headers.get("content-type","")
    if "text" in ct or "html" in ct or "css" in ct or "javascript" in ct or u.lower().endswith((".php","/",".html",".htm",".css",".js")):
        t=r.content.decode("iso-8859-1","replace")
        for rx in (ATTR,CSS):
            for m in rx.finditer(t):
                l=m.group(1).strip()
                if not l or l.startswith(("#","mailto:","javascript:","data:","tel:")): continue
                full=urljoin(u,l).split("#")[0]
                if not scope(full): continue
                if is_page(full): 
                    if full not in seen: q.append(full)
                else: assets.add(full)
    time.sleep(0.12)
for a in sorted(assets):
    if "logout" in a: continue
    try:
        r=s.get(a,allow_redirects=False,timeout=40); save(a,r.content)
        saved.append((a,r.status_code,len(r.content))); print(f"A {r.status_code} {len(r.content):>7} {a}")
    except Exception as e: fails.append((a,str(e)))
    time.sleep(0.08)
print("\nRESUMO relacionados: paginas",len(seen),"assets",len(assets),"falhas",len(fails))
open("crawl2_report.txt","w").write("\n".join(f"{st}\t{sz}\t{u}" for u,st,sz in saved)+"\n\nFALHAS\n"+"\n".join(f"{u}\t{e}" for u,e in fails))
