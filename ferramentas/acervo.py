#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, os, time, json
import requests
B="http://www.chazit.org.br/superpack/armario/"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
OUT=os.path.abspath("acervo"); os.makedirs(OUT+"/listagens",exist_ok=True); os.makedirs(OUT+"/peulas",exist_ok=True)
s=requests.Session(); s.headers["User-Agent"]=UA; s.headers["Referer"]=B
CATS=['am','ceh','doc','israel','judaismo','manhigut','mej','shoa','sionismo','0']
idrx=re.compile(r"peula\.php\?id=(\d+)")
allids=set(); catmap={}
for cat in CATS:
    ids_cat=set(); ini=0; empty=0
    while True:
        try:
            r=s.post(B+"acervom.php", data={"chave":cat,"ini":ini,"fim":ini+30}, timeout=40, allow_redirects=False)
        except Exception as e:
            print("err",cat,ini,e); break
        t=r.text; ids=idrx.findall(t)
        if not ids:
            empty+=1
            if empty>=2: break
        else:
            empty=0
            open(f"{OUT}/listagens/{cat}_ini{ini}.html","w",encoding="iso-8859-1",errors="replace").write(t)
            for i in ids: ids_cat.add(int(i))
        ini+=30
        if ini>4000: break
        time.sleep(0.05)
    catmap[cat]=sorted(ids_cat); allids|=ids_cat
    print(f"cat {cat}: {len(ids_cat)} ids")
print("TOTAL ids unicos:", len(allids))
# baixa cada peula
downloads=set()
urlrx=re.compile(r"(https?://[^\s\"'<>]+|downloads/[^\s\"'<>]+|arquivos/[^\s\"'<>]+)", re.I)
for pid in sorted(allids):
    fp=f"{OUT}/peulas/peula_{pid}.html"
    if os.path.exists(fp) and os.path.getsize(fp)>0: 
        t=open(fp,encoding="iso-8859-1",errors="replace").read()
    else:
        try:
            r=s.get(B+f"peula.php?id={pid}", timeout=30, allow_redirects=False); t=r.text
            open(fp,"w",encoding="iso-8859-1",errors="replace").write(t)
        except Exception as e:
            print("err peula",pid,e); continue
        time.sleep(0.04)
    for m in urlrx.findall(t):
        if not m.lower().endswith((".css",".js")) and "jquery" not in m and "google" not in m:
            downloads.add(m)
json.dump({"total":len(allids),"por_categoria":{k:len(v) for k,v in catmap.items()},
           "ids_por_categoria":catmap,"links_encontrados":sorted(downloads)},
          open(f"{OUT}/indice.json","w"), ensure_ascii=False, indent=2)
print("peulas salvas:", len(os.listdir(OUT+'/peulas')))
print("links externos/arquivos encontrados:", len(downloads))
for d in sorted(downloads)[:40]: print("  ",d)
