# Mapa do site — SuperPack Chazit SP

Inventário de tudo que foi encontrado, rota a rota. Legenda de estado:

- ✅ **OK** — baixado com conteúdo real
- 🟡 **casca** — baixou o HTML/layout, mas os dados dependem do banco (indisponível)
- 🔴 **404 / vazio** — rota removida do servidor ou sem conteúdo
- 🔒 **precisa banco/login** — respondeu vazio por falta de banco/sessão

Host: `www.chazit.org.br` · endereço base do pack: `/superpack/`

---

## 1. Raiz do pack — `/superpack/`

| Rota | Arquivo salvo | Estado | O que é |
|---|---|---|---|
| `/superpack/` | `site/superpack/index.html` | ✅ | Tela de **login antiga** (form → `login.php`) |
| `/superpack/login.php` | `site/superpack/login.php` | 🔒 | Valida usuário no banco; sem banco → `?erro=1` |
| `/superpack/logout.php` | *(não baixado de propósito)* | — | Encerra sessão (evitado para não quebrar cookies) |
| `/superpack/index2.php` | `site/superpack/index2.php` | ✅ | "Versão antiga" — home com menu de tudo |
| `/superpack/principal.php` | `site/superpack/principal.php` | ✅ | Painel principal da versão antiga (hub de links) |
| `/superpack/tutorial.php` | `site/superpack/tutorial.php` | ✅ | Página de tutoriais/vídeos |
| `/superpack/feedback.php` | `site/superpack/feedback.php` | ✅ | Form de feedback do "Chat Amizade" |
| `/superpack/inscreveemail.php` | `site/superpack/inscreveemail.php` | ✅ | Inscrição de e-mail |
| `/superpack/tara.php` | `site/superpack/tara.php` | 🔴 | 404 (rota morta, "Cantinho do Tara") |

## 2. Portal NOVO — `/superpack/novo/` (o endereço pedido)

| Item | Arquivo | Estado | Observação |
|---|---|---|---|
| Página do portal | `site/superpack/novo/index.html` | ✅ | Menu lateral + "Cultura Inútil" |
| Menu (motor dos botões) | `site/superpack/novo/script/Menu.js` | ✅ | Cria os botões do portal |
| Scroll custom | `site/superpack/novo/scrollbarplugin/…` | ✅ | Plugin mCustomScrollbar |
| Tema jQuery UI | `site/superpack/novo/css/superpack-theme/…` | ✅ | CSS do tema |
| Fonte | `site/superpack/novo/font/cartoon.ttf` | ✅ | Fonte "cartoon" (títulos) |
| Imagens | `site/superpack/novo/img/*` | ✅ | logo, bg, herzl, rss, troca, status |

**Botões do portal e destino** (definidos no `index.html`):
`Calendário` (Google Calendar), `Machberet Kvutzá` (→ `../machberet`),
`Armário da Tik` (→ `../armario`), `Tutoriais` (→ `../tutorial.php`),
`Katamari` (gag, injeta `kathack.com`).

## 3. App MACHBERET — `/superpack/machberet/`

Caderno de kvutzá organizado por ano (shnat/definirano).

| Rota | Arquivo | Estado | Observação |
|---|---|---|---|
| Home | `site/superpack/machberet/index.html` | ✅ | Casca do app + seletor de ano |
| `index.php?definirano=ANO` | `machberet/index__definirano=ANO.php` (2012–2026) | 🟡 | Layout do ano; dados vêm do banco |
| `entrar.php?shnat=ANO` | `machberet/entrar__shnat=ANO.php` (2013–2038) | 🔒 | **Vazios (0 bytes)** — dependem do banco |
| `menu.php` | `site/superpack/machberet/menu.php` | 🔴 | Retorna `fudeu db no1` → **banco desta app está fora do ar** |
| `tutomach.php` | `site/superpack/tutomach.php` | ✅ | Tutorial da machberet |
| CSS/JS/imagens | `machberet/css`, `machberet/js`, `logo.png`… | ✅ | jQuery 1.7.1 + jQuery UI 1.8.17 |

> ⚠️ O banco da **machberet** estava caído no momento do download, então os
> cadernos preenchidos por ano **não** puderam ser recuperados. Só a estrutura.

## 4. App ARMÁRIO DA TIK — `/superpack/armario/` ✅ (com dados!)

Acervo de **peulot** (atividades educativas) pesquisável. **O banco desta app
estava funcionando**, então os dados foram recuperados (ver seção "Acervo").

| Rota | Arquivo | Estado | Observação |
|---|---|---|---|
| Home | `site/superpack/armario/index.html` | ✅ | Casca com botões de categoria |
| `acervom.php` (POST) | `site/superpack/armario/acervom.php` | ✅ | Lista peulot. Params: `chave`(categoria), `ini`, `fim` |
| `buscaavancada.php` (POST) | `site/superpack/armario/buscaavancada.php` | ✅ | Busca avançada (formulário grande) |
| `peula.php?id=N` | *(baixadas em `acervo/peulas/`)* | ✅ | Detalhe completo de cada peulá |
| `suaUrl.php` | `site/superpack/armario/suaUrl.php` | 🔴 | 404 |
| `nota.php` | `site/superpack/armario/nota.php` | ✅ | Grava nota/avaliação (deu erro SQL sem params → banco vivo) |
| `removerconteudo.php` | `site/superpack/armario/removerconteudo.php` | ✅ | Remove item (precisa params/permissão) |
| Botões de categoria | `site/superpack/armario/bot/*.png` | ✅ | am, ceh, doc, israel, judaismo, manhigut, mej, shoa, sionismo |
| Imagens/CSS | `armariofechado.png`, `backimg.*`, `load2.gif`, `star*.png` | ✅ | |

### Acervo recuperado

**1287 peulot** foram extraídas e salvas em **`acervo/`** (ver `acervo/LEIA-ME.md`
e `acervo/indice.json`):

- `acervo/listagens/` — as páginas de listagem por categoria/paginação
- `acervo/peulas/peula_<id>.html` — **cada peulá individual** com Tema, Objetivo,
  Desenvolvimento, Sichá, Parte Técnica e o ano (shnat)
- `acervo/indice.json` — índice: total, ids por categoria, links encontrados

As categorias (`chave`) do acervo são:
`am`, `ceh`, `doc`, `israel`, `judaismo`, `manhigut`, `mej`, `shoa`, `sionismo`.

## 5. Seções irmãs do chazit.org.br — `site/relacionados/`

Encontradas nos links da versão antiga (`principal.php`). Não fazem parte do
`/superpack/` em si, mas completam o ecossistema.

| Seção | Arquivo | Estado | Observação |
|---|---|---|---|
| Chat Amizade | `relacionados/chatamizade/` | ✅ | `mensagens.php` (~20KB, mural) + `escreve.php` (envio) |
| Perfil | `relacionados/perfil/` | ✅ | `index`, `pail.php`, `atencao.php` |
| Secret game | `relacionados/secretgame/` | 🟡 | Página mínima |
| Upload de peulot | `relacionados/upload2.php` | 🟡 | Casca do upload |
| `/acervomagico/`, `/documentos/`, `/atas/`, `/acervofla/` | — | 🔴 | **404** — não existem mais |

---

## Dependências externas (não baixadas — CDNs/terceiros)

Para o rebuild, saiba que o site atual depende de:

- **jQuery / jQuery UI** via `code.jquery.com` e `ajax.googleapis.com`
- **Google Calendar** embutido (3 agendas: eventos, etc.)
- **feedroll.com** (widgets de RSS de notícias — Ynet, Folha, NYT, Haaretz, JPost…)
- **kathack.com** (o "Katamari", brincadeira)

Tudo isso é substituível por soluções modernas e gratuitas no rebuild
(ver `PLANO-REBUILD.md`).
