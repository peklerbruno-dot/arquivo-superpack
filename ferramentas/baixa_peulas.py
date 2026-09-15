#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, os, json
import concurrent.futures as cf
import requests

B = "http://www.chazit.org.br/superpack/armario/"
OUT = "/tmp/claude-0/-home-user-diario-de-treino/246c8492-1fc4-555b-8108-d18fb51717e7/scratchpad/acervo"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
os.makedirs(OUT + "/peulas", exist_ok=True)

# junta ids de todas as listagens + do indice, se houver
ids = set()
for fn in os.listdir(OUT + "/listagens"):
    t = open(OUT + "/listagens/" + fn, encoding="iso-8859-1", errors="replace").read()
    ids |= {int(x) for x in re.findall(r"peula\.php\?id=(\d+)", t)}
ids = sorted(ids)
todo = [i for i in ids if not (os.path.exists(f"{OUT}/peulas/peula_{i}.html")
                               and os.path.getsize(f"{OUT}/peulas/peula_{i}.html") > 0)]
print("total ids:", len(ids), "| ja baixadas:", len(ids) - len(todo), "| faltam:", len(todo), flush=True)

def get(pid):
    for _ in range(3):
        try:
            r = requests.get(B + f"peula.php?id={pid}",
                             headers={"User-Agent": UA, "Referer": B},
                             timeout=20, allow_redirects=False)
            if r.content:
                open(f"{OUT}/peulas/peula_{pid}.html", "wb").write(r.content)
                return 1
        except Exception:
            pass
    return 0

done = 0
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for i, r in enumerate(ex.map(get, todo), 1):
        done += r
        if i % 50 == 0:
            print("progresso", i, "/", len(todo), "| ok nesta rodada:", done, flush=True)

total_final = len([f for f in os.listdir(OUT + "/peulas") if f.endswith(".html")])
print("FIM. baixadas nesta rodada:", done, "| total peulas em disco:", total_final, flush=True)

# regenera indice categoria->ids
idrx = re.compile(r"peula\.php\?id=(\d+)")
catmap = {}
for fn in os.listdir(OUT + "/listagens"):
    cat = fn.split("_ini")[0]
    t = open(OUT + "/listagens/" + fn, encoding="iso-8859-1", errors="replace").read()
    catmap.setdefault(cat, set()).update(int(x) for x in idrx.findall(t))
catmap = {k: sorted(v) for k, v in catmap.items()}
json.dump({"total_peulas": total_final,
           "total_ids_no_indice": len(ids),
           "por_categoria": {k: len(v) for k, v in catmap.items()},
           "ids_por_categoria": catmap},
          open(f"{OUT}/indice.json", "w"), ensure_ascii=False, indent=2)
print("indice.json regravado", flush=True)
