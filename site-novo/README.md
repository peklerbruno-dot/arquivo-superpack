# Site novo — Acervo de Peulot

Versão nova, moderna e **gratuita** do acervo do Armário da Tik. Site estático
(HTML + JS puro, sem dependências), pronto para o GitHub Pages.

## Arquivos
- `index.html` — o site (busca, filtro por categoria e ano, cards e detalhe)
- `peulas.json` — as 1287 peulot (fonte de dados)
- `gerar_peulas_json.py` — regenera o `peulas.json` a partir de `../acervo/peulas/`

## Rodar localmente
```bash
cd site-novo
python3 -m http.server 8000
# abra http://localhost:8000
```
(É preciso servir via http; abrir o arquivo direto no navegador não carrega o JSON.)

## Publicar grátis no GitHub Pages
1. No repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/root`
   (ou mova a pasta `site-novo/` para a raiz de um repositório só do site).
3. O endereço público sai em alguns minutos.

## Regenerar os dados
Se baixar mais peulot para `../acervo/peulas/`, rode:
```bash
python3 site-novo/gerar_peulas_json.py
```
