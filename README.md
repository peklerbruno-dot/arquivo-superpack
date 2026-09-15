# SuperPack Chazit SP — arquivo + versão nova

Este repositório tem **duas coisas**:

1. **O arquivo** do site antigo `http://www.chazit.org.br/superpack/novo/` (espelho
   + as 1287 peulot recuperadas) — a matéria-prima.
2. **A versão nova, gratuita** do SuperPack, em **`app/`** — com login dos
   madrichim, acervo pesquisável, cadastro de novas peulot, materiais de apoio e
   a **Machberet Kvutzá** (caderno por kvutzá, por ano).

## 🚀 Colocar a versão nova no ar

Siga o **[`SETUP.md`](SETUP.md)** — passo a passo, sem precisar programar
(criar projeto no Supabase, colar o `schema.sql`, importar o acervo, publicar).

```
app/                → o site novo (login + acervo + machberet + materiais)
  index.html        → app (página única)
  config.js         → suas chaves do Supabase (preencher)
  css/ , js/        → estilo e lógica (supabase-js já incluído em js/vendor/)
supabase/
  schema.sql        → cria banco, regras de segurança e storage (colar no Supabase)
  importar_acervo.py→ carrega as 1287 peulot no banco
SETUP.md            → guia de instalação
```

---

## O arquivo do site antigo (referência)

Cópia (espelho) completa do site **http://www.chazit.org.br/superpack/novo/** e
das seções relacionadas do `chazit.org.br`, baixada para servir de base a uma
**nova versão, atualizada e gratuita**.

> Login informado pelo dono: usuário `pail`, senha `pail` (às vezes é preciso
> logar duas vezes). Veja em [Sobre o login](#sobre-o-login) por que isso acontece.

---

## O que tem aqui

```
superpack-arquivo/
├── README.md              → este guia
├── MAPA-DO-SITE.md        → inventário de cada página/rota e o que ela faz
├── PLANO-REBUILD.md       → proposta de como refazer o site (moderno e grátis)
├── site/
│   ├── superpack/         → espelho fiel de /superpack/ (o site pedido)
│   └── relacionados/      → seções irmãs do chazit.org.br ligadas ao pack
├── acervo/                → 1287 peulot reais do Armário da Tik (o tesouro)
└── ferramentas/
    ├── crawl.py           → script que baixou /superpack/
    ├── crawl2.py          → script que baixou as seções irmãs
    ├── crawl_report.txt   → log do que foi salvo (status HTTP + tamanho)
    └── crawl2_report.txt  → idem para as seções irmãs
```

Os caminhos dentro de `site/superpack/` reproduzem exatamente a estrutura do
servidor. Ex.: `site/superpack/novo/index.html` é a página
`http://www.chazit.org.br/superpack/novo/`.

Arquivos vindos de URLs com parâmetros foram salvos com o parâmetro no nome,
ex.: `machberet/index__definirano=2020.php` = `machberet/index.php?definirano=2020`.

---

## O site em uma olhada

O **SuperPack** é a intranet da Chazit Hanoar (movimento juvenil). O endereço
`/superpack/novo/` é o **portal novo**: uma tela com o logo, um menu lateral e um
painel de "Cultura Inútil". Os botões do menu levam a:

| Botão no portal `novo` | Para onde vai |
|---|---|
| **Calendário** | Google Calendar embutido (iframe) |
| **Machberet Kvutzá** | app `/superpack/machberet/` (caderno de kvutzá por ano) |
| **Armário da Tik** | app `/superpack/armario/` (acervo de conteúdos/peulot) |
| **Tutoriais** | `/superpack/tutorial.php` |
| **Katamari** | brincadeira (injeta o script kathack.com) |

Existe também uma **versão antiga** (`/superpack/index2.php` → `principal.php`),
que é um hub com muito mais links: perfis, acervo mágico, upload de peulot,
documentos, atas, chat amizade, etc. Boa parte desses links hoje está fora do ar
(ver `MAPA-DO-SITE.md`).

---

## Sobre o login

A autenticação é feita em `/superpack/login.php` (formulário com `login`, `senha`,
`Submit=entrar`) e é validada **no banco de dados** do servidor.

Durante o download, **o banco de dados do site estava fora do ar**. A prova está
em `site/superpack/machberet/menu.php`, cujo conteúdo é literalmente:

```
fudeu db no1
```

("deu ruim no banco"). Por isso:

- `login.php` rejeita `pail/pail` (não consegue conferir no banco) e redireciona
  para `?erro=1`;
- as rotas que dependem de dados (ex.: `machberet/entrar.php?shnat=ANO`) voltam
  **vazias** (0 bytes);
- o "precisa logar duas vezes" que o dono relata é justamente essa instabilidade
  do banco: quando ele responde, o login passa.

**Como o conteúdo foi baixado mesmo sem login:** os scripts PHP mandam o cabeçalho
de redirecionamento para a tela de login, **mas mesmo assim imprimem a página
inteira** no corpo da resposta. O navegador segue o redirect e você "não vê" a
página; o crawler simplesmente **ignora o redirect e guarda o corpo**. Ou seja,
todo o HTML/CSS/JS/imagens do front-end foi capturado. O que **não** dá para
recuperar (porque depende do banco, que está caído) são os **dados dinâmicos**:
cadernos preenchidos da machberet, itens do acervo do armário, mensagens novas,
usuários. Esses dados só sairão do próprio banco/servidor.

---

## O que foi capturado x o que falta

**Capturado (front-end completo + dados do acervo):**
- **1287 peulot reais** do Armário da Tik (pasta `acervo/`) — o banco desta app
  estava no ar e todo o acervo foi baixado (Tema, Objetivo, Desenvolvimento,
  Sichá, Parte Técnica, ano). Esse é o conteúdo mais valioso do arquivo.
- Portal novo (`novo/`) e todos os seus assets (logo, fontes, plugins de scroll,
  Menu.js, imagens).
- App **Machberet** (`machberet/`): a casca do app, CSS/JS (jQuery UI), imagens e
  as rotas de cada ano.
- App **Armário da Tik** (`armario/`): a casca, os botões de categoria (imagens),
  os endpoints de busca/nota/remoção e o CSS da tabela de resultados.
- Versão antiga (`index2.php`, `principal.php`, `tutorial.php`, `feedback.php`,
  `inscreveemail.php`).
- Chat Amizade (`relacionados/chatamizade/`) e Perfil (`relacionados/perfil/`).

**Não capturado (depende do banco, que está fora do ar / ou rota removida):**
- Dados internos da machberet e do armário (conteúdo preenchido).
- Seções `/documentos`, `/atas`, `/acervomagico`, `/acervofla` → responderam
  **404** (não existem mais no servidor).
- Código PHP do lado do servidor (nunca é enviado ao navegador; só se tem a saída
  HTML). Para o rebuild isso não é problema — a lógica será reescrita.

---

## Como abrir o que foi baixado

É um site estático agora. Para ver localmente:

```bash
cd superpack-arquivo/site/superpack
python3 -m http.server 8000
# abra http://localhost:8000/novo/index.html
```

Observações ao abrir offline:
- alguns recursos apontam para CDNs externos (jQuery do `code.jquery.com`,
  Google Calendar, `feedroll.com`, `kathack.com`). Sem internet eles não carregam,
  mas isso não afeta o material de referência.
- páginas dinâmicas mostram só a casca (sem dados do banco).

---

## Próximo passo

Leia **`MAPA-DO-SITE.md`** para o inventário rota a rota e
**`PLANO-REBUILD.md`** para a proposta de como reconstruir o SuperPack como um
app moderno, gratuito e sem o banco legado.
