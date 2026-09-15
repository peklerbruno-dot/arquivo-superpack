#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Baixa as peulot de machané (peulamachane.php?id=) que estavam nas listagens."""
import re, os
import concurrent.futures as cf
import requests
B="http://www.chazit.org.br/superpack/armario/"
ROOT="/home/user/arquivo-superpack/acervo"
OUT=ROOT+"/peulas_machane"; os.makedirs(OUT,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
ids=set()
for fn in os.listdir(ROOT+"/listagens"):
    t=open(ROOT+"/listagens/"+fn,encoding="iso-8859-1",errors="replace").read()
    ids|={int(x) for x in re.findall(r"peulamachane\.php\?id=(\d+)",t)}
ids=sorted(ids)
todo=[i for i in ids if not (os.path.exists(f"{OUT}/pm_{i}.html") and os.path.getsize(f"{OUT}/pm_{i}.html")>0)]
print("ids machane:",len(ids),"| faltam:",len(todo),flush=True)
def get(pid):
    for _ in range(3):
        try:
            r=requests.get(B+f"peulamachane.php?id={pid}",headers={"User-Agent":UA,"Referer":B},timeout=20,allow_redirects=False)
            if r.content:
                open(f"{OUT}/pm_{pid}.html","wb").write(r.content); return 1
        except Exception: pass
    return 0
done=0
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for i,r in enumerate(ex.map(get,todo),1):
        done+=r
        if i%100==0: print("prog",i,"/",len(todo),flush=True)
print("FIM machane. baixadas:",done,"| total em disco:",len([f for f in os.listdir(OUT) if f.endswith('.html')]),flush=True)
