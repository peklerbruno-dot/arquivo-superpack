/* ============================================================================
   SuperPack novo — app (Supabase). Vanilla JS, sem build.
   ============================================================================ */
"use strict";

const NOMES = {israel:"Israel", doc:"Documentos/Textos", judaismo:"Judaísmo",
  sionismo:"Sionismo", shoa:"Shoá", manhigut:"Manhigut", mej:"MEJ", ceh:"CEH"};
const CATS = Object.keys(NOMES);
const PAGE = 48;

const $ = s => document.querySelector(s);
const cE = (t,c,h)=>{const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e;};
const esc = s => (s==null?"":String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nl2br = s => esc(s).replace(/\n/g,"<br>");

let sb=null, ME=null, PERFIL=null;
const state = {view:"acervo", acervo:{q:"",ano:"",cats:new Set(),rows:[],from:0,count:0},
  kvutza:null, ano:null, membroKvutza:false};

/* ---------- boot ---------- */
function boot(){
  if(!window.CONFIG || CONFIG.SUPABASE_URL.startsWith("COLE_")){
    document.body.innerHTML='<div style="padding:40px;font-family:sans-serif;max-width:640px;margin:0 auto">'+
      '<h2>Falta configurar o Supabase</h2><p>Abra <code>app/config.js</code> e preencha '+
      '<b>SUPABASE_URL</b> e <b>SUPABASE_ANON_KEY</b> com os dados do seu projeto '+
      '(Supabase → Project Settings → API). Veja o <b>SETUP.md</b>.</p></div>';
    return;
  }
  sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  wireAuth();
  sb.auth.onAuthStateChange((_e,session)=>{ handleSession(session); });
  sb.auth.getSession().then(({data})=>handleSession(data.session));
}

async function handleSession(session){
  ME = session ? session.user : null;
  if(ME){
    const {data} = await sb.from("perfis").select("*").eq("id",ME.id).maybeSingle();
    PERFIL = data || {id:ME.id, nome:ME.email};
    $("#auth").classList.add("hidden");
    $("#app").classList.remove("hidden");
    $("#who").textContent = PERFIL.nome || ME.email;
    navTo(state.view);
  }else{
    PERFIL=null;
    $("#app").classList.add("hidden");
    $("#auth").classList.remove("hidden");
  }
}

/* ---------- auth ---------- */
let authMode="login";
function wireAuth(){
  $("#tab-login").onclick=()=>setAuthMode("login");
  $("#tab-signup").onclick=()=>setAuthMode("signup");
  $("#a-submit").onclick=submitAuth;
  $("#a-senha").addEventListener("keydown",e=>{if(e.key==="Enter")submitAuth();});
}
function setAuthMode(m){
  authMode=m;
  $("#tab-login").classList.toggle("active",m==="login");
  $("#tab-signup").classList.toggle("active",m==="signup");
  $("#nome-row").style.display = m==="signup"?"flex":"none";
  $("#a-submit").textContent = m==="signup"?"Criar conta":"Entrar";
  $("#a-senha").autocomplete = m==="signup"?"new-password":"current-password";
  $("#a-msg").innerHTML="";
}
function amsg(t,cls){ $("#a-msg").innerHTML=`<div class="msg ${cls}">${esc(t)}</div>`; }
async function submitAuth(){
  const email=$("#a-email").value.trim(), senha=$("#a-senha").value;
  if(!email||!senha){ amsg("Preencha e-mail e senha.","err"); return; }
  $("#a-submit").disabled=true;
  try{
    if(authMode==="signup"){
      const nome=$("#a-nome").value.trim();
      const {data,error}=await sb.auth.signUp({email,password:senha,options:{data:{nome}}});
      if(error) throw error;
      if(!data.session){ amsg("Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.","ok"); setAuthMode("login"); }
    }else{
      const {error}=await sb.auth.signInWithPassword({email,password:senha});
      if(error) throw error;
    }
  }catch(e){ amsg(traduzErro(e.message),"err"); }
  finally{ $("#a-submit").disabled=false; }
}
function traduzErro(m){
  m=m||"";
  if(/Invalid login/i.test(m)) return "E-mail ou senha incorretos.";
  if(/already registered/i.test(m)) return "Este e-mail já tem conta. Faça login.";
  if(/at least 6/i.test(m)) return "A senha precisa de pelo menos 6 caracteres.";
  if(/Email not confirmed/i.test(m)) return "Confirme seu e-mail antes de entrar.";
  return m;
}
$("#logout")?.addEventListener("click",()=>sb.auth.signOut());
document.getElementById("logout").onclick=()=>sb.auth.signOut();

/* ---------- nav ---------- */
document.getElementById("nav").addEventListener("click",e=>{
  const b=e.target.closest("button[data-view]"); if(!b)return; navTo(b.dataset.view);
});
function navTo(v){
  state.view=v;
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
  if(v==="acervo") viewAcervo();
  else if(v==="nova") viewNova();
  else if(v==="materiais") viewMateriais();
  else if(v==="machberet") viewMachberet();
}

/* ============================ ACERVO ==================================== */
function viewAcervo(){
  const a=state.acervo;
  const chips = CATS.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${a.cats.has(c)}">${NOMES[c]}</button>`).join("");
  $("#main").innerHTML = `
    <h2 class="sec">Acervo de peulot</h2>
    <div class="searchrow">
      <label class="search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="ac-q" type="search" placeholder="Buscar tema, objetivo, conteúdo…" value="${esc(a.q)}">
      </label>
      <select id="ac-ano"><option value="">Todos os anos</option></select>
    </div>
    <div class="chips" id="ac-chips">${chips}</div>
    <div class="count" id="ac-count"></div>
    <div class="grid" id="ac-grid"></div>
    <button class="more hidden" id="ac-more">Mostrar mais</button>
    <div class="empty hidden" id="ac-empty">Nenhuma peulá encontrada.</div>`;
  // anos
  (async()=>{
    const anos=[]; for(let y=2036;y>=2010;y--) anos.push(y);
    $("#ac-ano").insertAdjacentHTML("beforeend",anos.map(y=>`<option value="${y}" ${String(y)===a.ano?"selected":""}>shnat ${y}</option>`).join(""));
  })();
  let deb;
  $("#ac-q").addEventListener("input",e=>{clearTimeout(deb);deb=setTimeout(()=>{a.q=e.target.value;acervoBuscar(true);},200);});
  $("#ac-ano").addEventListener("change",e=>{a.ano=e.target.value;acervoBuscar(true);});
  $("#ac-chips").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;
    const c=b.dataset.cat; if(a.cats.has(c))a.cats.delete(c); else a.cats.add(c);
    b.setAttribute("aria-pressed",a.cats.has(c)); acervoBuscar(true);});
  $("#ac-more").addEventListener("click",()=>acervoBuscar(false));
  acervoBuscar(true);
}
async function acervoBuscar(reset){
  const a=state.acervo;
  if(reset){ a.from=0; $("#ac-grid").innerHTML=""; }
  let query=sb.from("peulot").select("*",{count:"exact"});
  if(a.ano) query=query.eq("shnat",Number(a.ano));
  if(a.cats.size) query=query.overlaps("categorias",[...a.cats]);
  const s=a.q.replace(/[%,()]/g," ").trim();
  if(s) query=query.or(`tema.ilike.%${s}%,objetivo.ilike.%${s}%,desenvolvimento.ilike.%${s}%,sicha.ilike.%${s}%,parte_tecnica.ilike.%${s}%`);
  query=query.order("shnat",{ascending:false,nullsFirst:false}).order("id",{ascending:false})
             .range(a.from,a.from+PAGE-1);
  const {data,count,error}=await query;
  if(error){ $("#ac-count").textContent="Erro: "+error.message; return; }
  a.count=count||0;
  $("#ac-count").textContent = a.count+(a.count===1?" peulá":" peulot");
  const frag=document.createDocumentFragment();
  (data||[]).forEach(p=>frag.appendChild(peulaCard(p)));
  $("#ac-grid").appendChild(frag);
  a.from += (data||[]).length;
  $("#ac-more").classList.toggle("hidden", a.from>=a.count);
  $("#ac-empty").classList.toggle("hidden", a.count>0);
}
function peulaCard(p){
  const el=cE("div","card pcard");
  const tags=(p.categorias||[]).map(c=>`<span class="tag">${esc(NOMES[c]||c)}</span>`).join("");
  const snip=p.objetivo||p.desenvolvimento||"";
  el.innerHTML=`<div class="tema">${esc(p.tema)}</div>
    <div class="snippet">${esc(snip.slice(0,240))}</div>
    <div class="meta">${tags}<span class="year">${p.shnat?("shnat "+p.shnat):""}</span></div>`;
  el.onclick=()=>abrirPeula(p);
  return el;
}
async function abrirPeula(p){
  const campos=[["Objetivo","objetivo"],["Desenvolvimento","desenvolvimento"],["Sichá","sicha"],["Parte Técnica","parte_tecnica"]];
  const {data:mats}=await sb.from("materiais").select("*").eq("peula_id",p.id).order("created_at");
  let matsHtml="";
  if(mats&&mats.length){
    matsHtml=`<div class="f"><h3>Materiais de apoio</h3>`+
      mats.map(m=>materialLinha(m)).join("")+`</div>`;
  }
  const tags=(p.categorias||[]).map(c=>`<span class="tag">${esc(NOMES[c]||c)}</span>`).join("");
  openModal(p.tema, tags+(p.shnat?`<span class="year">shnat ${p.shnat}</span>`:""),
    campos.map(([n,k])=>`<div class="f"><h3>${n}</h3><div class="val${p[k]?"":" empty-val"}">${p[k]?nl2br(p[k]):"— não informado —"}</div></div>`).join("")+matsHtml);
  wireDownloads();
}
function materialLinha(m){
  if(m.url) return `<div class="attach">📎 <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.titulo||m.url)}</a></div>`;
  return `<div class="attach">📎 <a href="#" data-dl="${esc(m.arquivo_path)}">${esc(m.titulo||m.arquivo_nome||"arquivo")}</a></div>`;
}
function wireDownloads(){
  $("#m-body").querySelectorAll("[data-dl]").forEach(a=>a.onclick=async e=>{
    e.preventDefault();
    const {data,error}=await sb.storage.from("materiais").createSignedUrl(a.dataset.dl,3600);
    if(error){alert("Erro ao gerar link: "+error.message);return;}
    window.open(data.signedUrl,"_blank");
  });
}

/* ============================ NOVA PEULÁ ================================ */
function viewNova(){
  const catBoxes=CATS.map(c=>`<label class="rowflex" style="font-size:14px"><input type="checkbox" value="${c}"> ${NOMES[c]}</label>`).join("");
  $("#main").innerHTML=`
    <h2 class="sec">Nova peulá</h2>
    <div class="card" style="max-width:760px">
      <div class="field-row"><label class="lbl">Tema *</label><input id="n-tema" type="text" placeholder="Tema da peulá"></div>
      <div class="row2">
        <div class="field-row"><label class="lbl">Ano (shnat)</label><input id="n-shnat" type="number" placeholder="ex.: 2027"></div>
        <div class="field-row"><label class="lbl">Categorias</label><div class="rowflex" id="n-cats" style="gap:12px;padding-top:6px">${catBoxes}</div></div>
      </div>
      <div class="field-row"><label class="lbl">Objetivo</label><textarea id="n-obj"></textarea></div>
      <div class="field-row"><label class="lbl">Desenvolvimento</label><textarea id="n-des"></textarea></div>
      <div class="field-row"><label class="lbl">Sichá</label><textarea id="n-sic"></textarea></div>
      <div class="field-row"><label class="lbl">Parte Técnica</label><textarea id="n-tec"></textarea></div>
      <div class="field-row"><label class="lbl">Materiais de apoio (opcional — pode escolher vários)</label>
        <input id="n-files" type="file" multiple></div>
      <div id="n-msg"></div>
      <button class="btn" id="n-save">Salvar peulá</button>
    </div>`;
  $("#n-save").onclick=salvarNova;
}
async function salvarNova(){
  const tema=$("#n-tema").value.trim();
  if(!tema){ $("#n-msg").innerHTML='<div class="msg err">Informe o tema.</div>'; return; }
  const cats=[...document.querySelectorAll("#n-cats input:checked")].map(i=>i.value);
  const shnat=parseInt($("#n-shnat").value,10);
  $("#n-save").disabled=true; $("#n-msg").innerHTML='<div class="msg">Salvando…</div>';
  try{
    const {data,error}=await sb.from("peulot").insert({
      tema, shnat:Number.isNaN(shnat)?null:shnat,
      objetivo:$("#n-obj").value.trim()||null, desenvolvimento:$("#n-des").value.trim()||null,
      sicha:$("#n-sic").value.trim()||null, parte_tecnica:$("#n-tec").value.trim()||null,
      categorias:cats, origem:"nova", autor_id:ME.id
    }).select().single();
    if(error) throw error;
    const files=$("#n-files").files;
    for(const f of files){ await uploadMaterial(f,{peula_id:data.id,titulo:f.name}); }
    $("#n-msg").innerHTML='<div class="msg ok">Peulá salva! id '+data.id+'.</div>';
    setTimeout(()=>navTo("acervo"),900);
  }catch(e){ $("#n-msg").innerHTML='<div class="msg err">Erro: '+esc(e.message)+'</div>'; }
  finally{ $("#n-save").disabled=false; }
}
async function uploadMaterial(file,extra){
  const safe=file.name.replace(/[^A-Za-z0-9._-]/g,"_");
  const path=`${(extra.peula_id?("peula_"+extra.peula_id):"apoio")}/${Date.now()}_${safe}`;
  const up=await sb.storage.from("materiais").upload(path,file,{upsert:false});
  if(up.error) throw up.error;
  const row=Object.assign({arquivo_path:path, arquivo_nome:file.name, autor_id:ME.id,
    categorias:extra.categorias||[], descricao:extra.descricao||null, url:extra.url||null,
    peula_id:extra.peula_id||null, titulo:extra.titulo||file.name}, {});
  const {error}=await sb.from("materiais").insert(row);
  if(error) throw error;
}

/* ============================ MATERIAIS ================================= */
function viewMateriais(){
  $("#main").innerHTML=`
    <h2 class="sec">Materiais de apoio</h2>
    <div class="card" style="max-width:760px;margin-bottom:18px">
      <div class="field-row"><label class="lbl">Título *</label><input id="mt-tit" type="text"></div>
      <div class="field-row"><label class="lbl">Descrição</label><textarea id="mt-desc" style="min-height:70px"></textarea></div>
      <div class="row2">
        <div class="field-row"><label class="lbl">Arquivo</label><input id="mt-file" type="file"></div>
        <div class="field-row"><label class="lbl">…ou link (URL)</label><input id="mt-url" type="text" placeholder="https://…"></div>
      </div>
      <div id="mt-msg"></div>
      <button class="btn" id="mt-save">Enviar material</button>
    </div>
    <div class="searchrow"><label class="search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input id="mt-q" type="search" placeholder="Buscar materiais…"></label></div>
    <div id="mt-list"></div>`;
  $("#mt-save").onclick=salvarMaterial;
  let deb; $("#mt-q").addEventListener("input",e=>{clearTimeout(deb);deb=setTimeout(()=>listarMateriais(e.target.value),200);});
  listarMateriais("");
}
async function salvarMaterial(){
  const tit=$("#mt-tit").value.trim(); const url=$("#mt-url").value.trim(); const file=$("#mt-file").files[0];
  if(!tit){ $("#mt-msg").innerHTML='<div class="msg err">Informe o título.</div>'; return; }
  if(!file && !url){ $("#mt-msg").innerHTML='<div class="msg err">Anexe um arquivo ou informe um link.</div>'; return; }
  $("#mt-save").disabled=true; $("#mt-msg").innerHTML='<div class="msg">Enviando…</div>';
  try{
    if(file) await uploadMaterial(file,{titulo:tit,descricao:$("#mt-desc").value.trim()});
    else{ const {error}=await sb.from("materiais").insert({titulo:tit,descricao:$("#mt-desc").value.trim()||null,url,autor_id:ME.id}); if(error) throw error; }
    $("#mt-msg").innerHTML='<div class="msg ok">Material enviado!</div>';
    $("#mt-tit").value="";$("#mt-desc").value="";$("#mt-url").value="";$("#mt-file").value="";
    listarMateriais($("#mt-q").value);
  }catch(e){ $("#mt-msg").innerHTML='<div class="msg err">Erro: '+esc(e.message)+'</div>'; }
  finally{ $("#mt-save").disabled=false; }
}
async function listarMateriais(q){
  let query=sb.from("materiais").select("*").order("created_at",{ascending:false}).limit(200);
  const s=(q||"").replace(/[%,()]/g," ").trim();
  if(s) query=query.or(`titulo.ilike.%${s}%,descricao.ilike.%${s}%`);
  const {data,error}=await query;
  const box=$("#mt-list");
  if(error){ box.innerHTML='<div class="msg err">'+esc(error.message)+'</div>'; return; }
  if(!data.length){ box.innerHTML='<div class="empty">Nenhum material ainda.</div>'; return; }
  box.innerHTML=data.map(m=>`<div class="listitem"><div class="grow">
      <div class="t">${esc(m.titulo)}</div>
      <div class="s">${esc(m.descricao||"")}</div></div>
      ${m.peula_id?'<span class="badge">de uma peulá</span>':''}
      ${m.url?`<a class="btn sm" href="${esc(m.url)}" target="_blank" rel="noopener">Abrir link</a>`
             :`<button class="btn sm" data-dl="${esc(m.arquivo_path)}">Baixar</button>`}
    </div>`).join("");
  box.querySelectorAll("[data-dl]").forEach(b=>b.onclick=async()=>{
    const {data,error}=await sb.storage.from("materiais").createSignedUrl(b.dataset.dl,3600);
    if(error){alert("Erro: "+error.message);return;} window.open(data.signedUrl,"_blank");
  });
}

/* ============================ MACHBERET ================================= */
async function viewMachberet(){
  state.kvutza=null; state.ano=null;
  $("#main").innerHTML=`<h2 class="sec">Machberet Kvutzá</h2>
    <p class="muted">Cada kvutzá tem um caderno por ano (shnat). Os madrichim registram as peulot dadas e o acompanhamento do grupo. A cada ano, abre-se um novo caderno e o anterior fica no histórico.</p>
    <div class="rowflex" style="margin:12px 0"><button class="btn sm" id="kv-nova">+ Nova kvutzá</button></div>
    <div id="kv-list"><div class="muted">Carregando…</div></div>`;
  $("#kv-nova").onclick=novaKvutza;
  const {data,error}=await sb.from("kvutzot").select("*, kvutza_madrichim(count), machberet_anos(shnat)").order("nome");
  const box=$("#kv-list");
  if(error){ box.innerHTML='<div class="msg err">'+esc(error.message)+'</div>'; return; }
  if(!data.length){ box.innerHTML='<div class="empty">Nenhuma kvutzá ainda. Crie a primeira!</div>'; return; }
  box.innerHTML=data.map(k=>{
    const nm=(k.kvutza_madrichim&&k.kvutza_madrichim[0]?k.kvutza_madrichim[0].count:0);
    const anos=(k.machberet_anos||[]).map(a=>a.shnat).sort((a,b)=>b-a);
    return `<div class="listitem"><div class="grow"><div class="t">${esc(k.nome)}</div>
      <div class="s">${esc(k.descricao||"")} ${anos.length?("· anos: "+anos.join(", ")):"· sem cadernos ainda"} · ${nm} madrich(im)</div></div>
      <button class="btn sm" data-open="${k.id}">Abrir</button></div>`;
  }).join("");
  box.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>abrirKvutza(Number(b.dataset.open)));
}
async function novaKvutza(){
  const nome=prompt("Nome da nova kvutzá:"); if(!nome) return;
  const desc=prompt("Descrição (opcional):")||null;
  const {error}=await sb.from("kvutzot").insert({nome:nome.trim(),descricao:desc});
  if(error){ alert("Erro: "+error.message); return; }
  viewMachberet();
}
async function abrirKvutza(id){
  const {data:k}=await sb.from("kvutzot").select("*").eq("id",id).single();
  state.kvutza=k; state.ano=null;
  // membros
  const {data:mem}=await sb.from("kvutza_madrichim").select("perfil_id, perfis(nome)").eq("kvutza_id",id);
  state.membroKvutza=(mem||[]).some(m=>m.perfil_id===ME.id);
  const membros=(mem||[]).map(m=>esc((m.perfis&&m.perfis.nome)||"—")).join(", ")||"nenhum ainda";
  const {data:anos}=await sb.from("machberet_anos").select("*").eq("kvutza_id",id).order("shnat",{ascending:false});
  const pills=(anos||[]).map(a=>`<button data-ano="${a.id}" data-shnat="${a.shnat}">shnat ${a.shnat}</button>`).join("")||'<span class="muted">nenhum ano ainda</span>';
  $("#main").innerHTML=`
    <div class="crumbs"><a id="cb-volta">← Machberet</a> / <b>${esc(k.nome)}</b></div>
    <h2 class="sec">${esc(k.nome)}</h2>
    <div class="card" style="margin-bottom:14px">
      <div class="s muted" style="font-size:14px"><b>Madrichim:</b> ${membros}</div>
      <div class="rowflex" style="margin-top:10px">
        ${state.membroKvutza?'<span class="badge">Você é madrich desta kvutzá</span>'
          :'<button class="btn sm" id="kv-entrar">Entrar como madrich</button>'}
      </div>
    </div>
    <div class="rowflex"><b>Cadernos por ano:</b></div>
    <div class="yearpills" id="anos">${pills}</div>
    ${state.membroKvutza?'<button class="btn sm" id="novo-ano">+ Abrir novo ano</button>':''}
    <div id="ano-conteudo" style="margin-top:16px"></div>`;
  $("#cb-volta").onclick=viewMachberet;
  $("#kv-entrar")&&($("#kv-entrar").onclick=async()=>{
    const {error}=await sb.from("kvutza_madrichim").insert({kvutza_id:id,perfil_id:ME.id});
    if(error){alert("Erro: "+error.message);return;} abrirKvutza(id);
  });
  $("#novo-ano")&&($("#novo-ano").onclick=()=>abrirNovoAno(id));
  $("#anos").querySelectorAll("[data-ano]").forEach(b=>b.onclick=()=>abrirAno(Number(b.dataset.ano),Number(b.dataset.shnat)));
}
async function abrirNovoAno(kvId){
  const def=new Date().getFullYear();
  const y=prompt("Ano (shnat) do novo caderno:",def); if(!y) return;
  const shnat=parseInt(y,10); if(Number.isNaN(shnat)){alert("Ano inválido.");return;}
  const {data,error}=await sb.from("machberet_anos").insert({kvutza_id:kvId,shnat}).select().single();
  if(error){ alert(/duplicate|unique/i.test(error.message)?"Já existe caderno desse ano.":"Erro: "+error.message); return; }
  abrirKvutza(kvId);
}
async function abrirAno(anoId,shnat){
  state.ano={id:anoId,shnat};
  const {data:ma}=await sb.from("machberet_anos").select("*").eq("id",anoId).single();
  const {data:peulas}=await sb.from("machberet_peulot").select("*, peulot(tema,shnat)").eq("machberet_ano_id",anoId).order("data",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false});
  const {data:acomp}=await sb.from("acompanhamento").select("*, perfis(nome)").eq("machberet_ano_id",anoId).order("data",{ascending:false});
  const podeEditar=state.membroKvutza;
  const box=$("#ano-conteudo");
  box.innerHTML=`
    <div class="card" style="margin-bottom:16px">
      <div class="field-row"><label class="lbl">Tema do ano</label>
        <input id="ma-tema" type="text" value="${esc(ma.tema_ano||"")}" ${podeEditar?"":"disabled"}></div>
      <div class="field-row"><label class="lbl">Observações gerais do grupo</label>
        <textarea id="ma-obs" ${podeEditar?"":"disabled"}>${esc(ma.observacoes||"")}</textarea></div>
      ${podeEditar?'<button class="btn sm" id="ma-salvar">Salvar</button>':'<span class="muted">Só madrichim desta kvutzá editam.</span>'}
    </div>

    <h2 class="sec">Peulot dadas em ${shnat}</h2>
    ${podeEditar?'<div class="rowflex" style="margin-bottom:10px"><button class="btn sm" id="add-peula-acervo">+ Do acervo</button><button class="btn sm sec" id="add-peula-nova">+ Escrever</button></div>':''}
    <div id="mp-list"></div>

    <h2 class="sec" style="margin-top:26px">Acompanhamento do grupo</h2>
    ${podeEditar?`<div class="card" style="margin-bottom:12px">
      <div class="row2"><div class="field-row"><label class="lbl">Data</label><input id="ac-data" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div></div></div>
      <div class="field-row"><label class="lbl">Registro</label><textarea id="ac-texto" placeholder="Como foi, presença, destaques, próximos passos…"></textarea></div>
      <button class="btn sm" id="ac-add">Adicionar registro</button></div>`:''}
    <div id="ac-list"></div>`;

  if(podeEditar) $("#ma-salvar").onclick=async()=>{
    const {error}=await sb.from("machberet_anos").update({tema_ano:$("#ma-tema").value.trim()||null,observacoes:$("#ma-obs").value.trim()||null}).eq("id",anoId);
    alert(error?("Erro: "+error.message):"Salvo!");
  };
  // peulot do ano
  const mp=$("#mp-list");
  mp.innerHTML=(peulas&&peulas.length)?peulas.map(p=>{
    const tit=p.titulo||(p.peulot&&p.peulot.tema)||"(sem título)";
    return `<div class="listitem"><div class="grow"><div class="t">${esc(tit)}</div>
      <div class="s">${p.data?esc(p.data):""} ${p.peula_id?'· <span class="badge">acervo</span>':''} ${p.notas?("· "+esc(p.notas.slice(0,80))):""}</div></div>
      ${(p.autor_id===ME.id||podeEditar)?`<button class="btn sm sec" data-delmp="${p.id}">Remover</button>`:''}</div>`;
  }).join(""):'<div class="empty">Nenhuma peulá registrada neste ano.</div>';
  mp.querySelectorAll("[data-delmp]").forEach(b=>b.onclick=async()=>{
    if(!confirm("Remover esta peulá do caderno?"))return;
    const {error}=await sb.from("machberet_peulot").delete().eq("id",Number(b.dataset.delmp));
    if(error){alert("Erro: "+error.message);return;} abrirAno(anoId,shnat);
  });
  if(podeEditar){
    $("#add-peula-nova").onclick=()=>addPeulaMachberet(anoId,shnat,false);
    $("#add-peula-acervo").onclick=()=>addPeulaMachberet(anoId,shnat,true);
  }
  // acompanhamento
  const acl=$("#ac-list");
  acl.innerHTML=(acomp&&acomp.length)?acomp.map(a=>`<div class="entry">
      <div class="when">${esc(a.data)} · ${esc((a.perfis&&a.perfis.nome)||"")}</div>
      <div>${nl2br(a.texto)}</div>
      ${(a.autor_id===ME.id||podeEditar)?`<button class="btn sm sec" data-delac="${a.id}" style="margin-top:6px">Excluir</button>`:''}
    </div>`).join(""):'<div class="empty">Sem registros ainda.</div>';
  acl.querySelectorAll("[data-delac]").forEach(b=>b.onclick=async()=>{
    if(!confirm("Excluir este registro?"))return;
    const {error}=await sb.from("acompanhamento").delete().eq("id",Number(b.dataset.delac));
    if(error){alert("Erro: "+error.message);return;} abrirAno(anoId,shnat);
  });
  if(podeEditar) $("#ac-add").onclick=async()=>{
    const texto=$("#ac-texto").value.trim(); if(!texto){alert("Escreva o registro.");return;}
    const {error}=await sb.from("acompanhamento").insert({machberet_ano_id:anoId,data:$("#ac-data").value||null,texto,autor_id:ME.id});
    if(error){alert("Erro: "+error.message);return;} abrirAno(anoId,shnat);
  };
}
function addPeulaMachberet(anoId,shnat,doAcervo){
  if(doAcervo){
    openModal("Adicionar do acervo","",`
      <div class="field-row"><input id="bp-q" type="text" placeholder="Buscar peulá no acervo…"></div>
      <div id="bp-res" class="muted">Digite para buscar.</div>`);
    let deb;
    $("#bp-q").addEventListener("input",e=>{clearTimeout(deb);deb=setTimeout(async()=>{
      const s=e.target.value.replace(/[%,()]/g," ").trim(); if(s.length<2){$("#bp-res").innerHTML="";return;}
      const {data}=await sb.from("peulot").select("id,tema,shnat").or(`tema.ilike.%${s}%,objetivo.ilike.%${s}%`).limit(20);
      $("#bp-res").innerHTML=(data&&data.length)?data.map(p=>`<div class="listitem"><div class="grow"><div class="t">${esc(p.tema)}</div><div class="s">${p.shnat?("shnat "+p.shnat):""}</div></div><button class="btn sm" data-pick="${p.id}" data-tema="${esc(p.tema)}">Adicionar</button></div>`).join(""):'<div class="muted">Nada encontrado.</div>';
      $("#bp-res").querySelectorAll("[data-pick]").forEach(b=>b.onclick=async()=>{
        const {error}=await sb.from("machberet_peulot").insert({machberet_ano_id:anoId,peula_id:Number(b.dataset.pick),titulo:b.dataset.tema,data:new Date().toISOString().slice(0,10),autor_id:ME.id});
        if(error){alert("Erro: "+error.message);return;} closeModal(); abrirAno(anoId,shnat);
      });
    },220);});
  }else{
    openModal("Escrever peulá do caderno","",`
      <div class="field-row"><label class="lbl">Título *</label><input id="bp-tit" type="text"></div>
      <div class="field-row"><label class="lbl">Data</label><input id="bp-data" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="field-row"><label class="lbl">Notas / como foi</label><textarea id="bp-notas"></textarea></div>
      <button class="btn" id="bp-salvar">Adicionar ao caderno</button>`);
    $("#bp-salvar").onclick=async()=>{
      const tit=$("#bp-tit").value.trim(); if(!tit){alert("Informe o título.");return;}
      const {error}=await sb.from("machberet_peulot").insert({machberet_ano_id:anoId,titulo:tit,data:$("#bp-data").value||null,notas:$("#bp-notas").value.trim()||null,autor_id:ME.id});
      if(error){alert("Erro: "+error.message);return;} closeModal(); abrirAno(anoId,shnat);
    };
  }
}

/* ---------- modal ---------- */
function openModal(title,meta,bodyHtml){
  $("#m-title").textContent=title; $("#m-meta").innerHTML=meta||""; $("#m-body").innerHTML=bodyHtml;
  $("#overlay").classList.add("open"); document.body.style.overflow="hidden";
}
function closeModal(){ $("#overlay").classList.remove("open"); document.body.style.overflow=""; }
document.getElementById("m-close").onclick=closeModal;
document.getElementById("overlay").addEventListener("click",e=>{if(e.target.id==="overlay")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

boot();
