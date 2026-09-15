# Plano de rebuild — SuperPack novo, atualizado e gratuito

Proposta de como reconstruir o SuperPack a partir deste arquivo, com stack
**gratuita**, moderna e fácil de manter. Nada aqui é obrigatório — é um caminho
sugerido, pensado para quem quer sair do PHP + MySQL legado (que hoje vive
caindo: lembre do `fudeu db no1`).

---

## 1. O que vale a pena manter

- **O acervo de peulot** (pasta `acervo/`) — esse é o **tesouro**. Centenas de
  atividades com Tema, Objetivo, Desenvolvimento, Sichá, Parte Técnica e ano.
  É o conteúdo que dá valor ao site; o resto é "moldura".
- A ideia do **portal `novo`**: uma tela simples com poucos botões grandes
  (Calendário, Acervo/Armário, Machberet, Tutoriais).
- As **categorias** do acervo (am, ceh, doc, israel, judaismo, manhigut, mej,
  shoa, sionismo) como filtros.

## 2. O que dá para modernizar / cortar

- Trocar **PHP + MySQL** por algo sem servidor para manter (menos coisa para
  quebrar) — ver opções abaixo.
- Remover dependências frágeis: `feedroll.com` (RSS), `kathack.com` (Katamari),
  jQuery antigo. O Google Calendar embutido pode ficar (é grátis) ou virar um
  link.
- Layout responsivo (o atual usa posições absolutas em pixel; não funciona bem
  no celular).
- Login: hoje é um único usuário (`pail`) no banco. Se o objetivo é **gratuito e
  aberto**, dá para deixar o acervo público e proteger só a edição.

## 3. Duas rotas possíveis de stack (ambas grátis)

### Rota A — Site estático + dados em JSON (mais simples, 100% grátis)
Boa se o acervo muda pouco e você quer custo zero e nada para manter.

1. Converter o acervo para **um arquivo `peulas.json`** (script de migração —
   ver seção 4).
2. Front-end estático (HTML + JS puro, ou **Astro/Vite**) que lê o JSON, faz
   busca e filtro por categoria/ano no próprio navegador.
3. Hospedar em **GitHub Pages / Netlify / Cloudflare Pages** (grátis).
4. Edição do acervo = editar o JSON e dar `git push`.

**Prós:** nunca "cai o banco", rápido, sem custo, versionado no git.
**Contras:** adicionar peulá exige um pouco de técnica (ou um formulário simples
que gera JSON).

### Rota B — App com banco gerenciado grátis (se precisar cadastro no ar)
Boa se várias pessoas vão adicionar peulot pela web.

1. Banco **Supabase** ou **Neon** (Postgres com plano grátis) — este próprio
   repositório `diario-de-treino` já usa Neon, então há familiaridade.
2. Back-end leve: **Next.js** (rotas de API) ou **Supabase** direto do front.
3. Front em **React/Next**; hospedar na **Vercel** (grátis).
4. Autenticação real (Supabase Auth) em vez do usuário único `pail`.

**Prós:** cadastro/edição pela web, multiusuário.
**Contras:** um pouco mais de complexidade; ainda depende de um serviço externo.

> Recomendação: comece pela **Rota A** (o acervo já está em mãos e é o que
> importa). Migra-se para a Rota B depois, se surgir necessidade de cadastro
> online.

## 4. Migração do acervo (o passo concreto mais importante)

Os dados já estão baixados em `acervo/peulas/peula_<id>.html`. Cada arquivo tem
os campos fixos (Tema, Objetivo, Desenvolvimento, Sichá, Parte Técnica, shnat).
Um script simples percorre esses HTMLs e gera `peulas.json` assim:

```json
[
  {
    "id": 408,
    "tema": "a vida das crianças de Israel",
    "shnat": 2023,
    "objetivo": "que os chanichim conheçam ...",
    "desenvolvimento": "Quebra gelo: queimada ...",
    "sicha": "O que vocês viram de diferente ...",
    "parte_tecnica": "pistas, objetos/fantasias ...",
    "categorias": ["israel"]
  }
]
```

Como as categorias saem de `acervo/indice.json` (mapeia id → categoria), dá para
casar cada peulá com suas categorias na hora de montar o JSON. Esse `peulas.json`
vira a fonte única de dados do site novo.

## 5. Modelo de dados sugerido (se for Rota B)

Tabela `peulot`:
`id, tema, shnat (ano), objetivo, desenvolvimento, sicha, parte_tecnica,
categorias (array/relacional), criado_em, criado_por, arquivo_url (opcional)`.

Tabela `categorias`: `id, chave, nome_exibicao`.

## 6. Telas mínimas do site novo

1. **Home / Acervo** — barra de busca + filtros por categoria e ano + lista de
   cards de peulot. (substitui `armario/`)
2. **Peulá** — página de detalhe (substitui `peula.php?id=`).
3. **Nova peulá** — formulário (substitui `upload2.php`), só se Rota B.
4. **Calendário** — iframe do Google Calendar (opcional).
5. **Tutoriais** — página estática.

## 7. Ordem sugerida de trabalho

1. Rodar o script de migração → gerar `peulas.json` a partir de `acervo/`.
2. Revisar/limpar o JSON (encoding, textos cortados com "(...)" — ver nota).
3. Montar a tela de Acervo (busca + filtro) lendo o JSON.
4. Tela de detalhe da peulá.
5. Publicar no GitHub Pages/Netlify.
6. (Depois) formulário de cadastro + banco, se necessário.

> **Nota sobre textos cortados:** algumas listagens mostram o texto com "(...)"
> (resumo). As páginas `peula.php?id=N` em `acervo/peulas/` trazem o texto
> **completo** — use sempre elas como fonte, não as listagens.

---

Com o acervo em mãos (`acervo/`) e este plano, o passo seguinte natural é gerar o
`peulas.json` e montar a tela de busca. Posso fazer isso quando você quiser.
