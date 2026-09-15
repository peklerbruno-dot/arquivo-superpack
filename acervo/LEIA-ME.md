# Acervo do Armário da Tik — dados recuperados

Este é o conteúdo real do acervo de **peulot** (atividades educativas) do app
`/superpack/armario/`, extraído enquanto o banco de dados dele estava no ar.

## Números

- **1287 peulot** recuperadas (uma por arquivo em `peulas/`)
- Todas com conteúdo real (Tema, Objetivo, Desenvolvimento, Sichá, Parte Técnica
  e o ano/shnat)
- Nenhuma vazia

## Estrutura

```
acervo/
├── LEIA-ME.md            → este arquivo
├── indice.json           → índice: total + ids por categoria
├── peulas/
│   └── peula_<id>.html   → 1287 arquivos, o detalhe completo de cada peulá
└── listagens/
    └── <categoria>_ini<n>.html → páginas de listagem cruas (paginadas)
```

## Cada `peula_<id>.html` contém

Os campos fixos, nesta ordem:

- **Tema**
- **peulá dada para o shnat** (ano)
- **Objetivo**
- **Desenvolvimento**
- **Sichá**
- **Parte Técnica**

> Use sempre os arquivos de `peulas/` como fonte: o texto vem **completo**.
> As `listagens/` mostram os mesmos itens, mas com o texto resumido ("(...)").

## Categorias (campo `chave` do `acervom.php`)

Do `indice.json` (a contagem é aproximada porque as listagens se sobrepõem):

| chave | significado provável | itens |
|---|---|---|
| `am` | acervo geral | ~751 |
| `0` | listagem padrão (tudo) | ~810 |
| `israel` | Israel | ~174 |
| `doc` | documentos/textos | ~89 |
| `judaismo` | Judaísmo | ~45 |
| `sionismo` | Sionismo | ~45 |
| `shoa` | Shoá | ~16 |
| `manhigut` | Manhigut (liderança) | ~12 |
| `mej` | MEJ | ~10 |

## Como virar a base do site novo

Ver `../PLANO-REBUILD.md`, seção 4: um script simples percorre `peulas/*.html`,
extrai esses 6 campos + a categoria do `indice.json`, e gera um `peulas.json`
que vira a fonte de dados única do site reconstruído.
