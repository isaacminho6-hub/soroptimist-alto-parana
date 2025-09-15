
// Header shadow
window.addEventListener('scroll', () => {
  const h = document.querySelector('header.brand');
  if (!h) return;
  h.style.boxShadow = window.scrollY > 10 ? '0 8px 22px rgba(0,0,0,.35)' : 'inset 0 -1px 0 rgba(255,255,255,.08)';
});
// Mobile nav
document.getElementById('menuBtn')?.addEventListener('click',()=>{
  document.getElementById('mobileNav')?.classList.toggle('hidden');
});

// Hero rotator (local images)
const heroImgs = ['assets/hero-1.jpg','assets/hero-2.jpg','assets/hero-3.jpg'];
let heroIndex = 0;
setInterval(()=>{
  const el = document.getElementById('heroImg');
  if(!el) return;
  heroIndex = (heroIndex+1)%heroImgs.length;
  el.src = heroImgs[heroIndex];
}, 4000);

// Data layer
async function loadData() {
  const res = await fetch('data.json');
  const base = await res.json();
  const local = JSON.parse(localStorage.getItem('si_ap_admin') || '{}');
  // merge
  return {
    year: base.year,
    kpis: local.kpis || base.kpis,
    revistas: [...(local.revistas||[]), ...(base.revistas||[])],
    eventos: [...(local.eventos||[]), ...(base.eventos||[])],
    metas: local.metas || base.metas,
    sponsors: local.sponsors || base.sponsors,
  }
}

// Renders
function renderKpis(k){ const s=id=>document.getElementById(id);
  s('kpi_socias')&&(s('kpi_socias').textContent=k.socias);
  s('kpi_eventos')&&(s('kpi_eventos').textContent=k.eventos);
  s('kpi_beneficiadas')&&(s('kpi_beneficiadas').textContent=k.beneficiadas);
}

function renderRevistas(list){
  const el=document.getElementById('revista-list'); if(!el)return;
  const q=document.getElementById('revistaSearch');
  function paint(items){
    el.innerHTML=''; items.forEach((r,i)=>{
      const card=document.createElement('a'); card.href=r.url; card.target='_blank';
      card.className='card rounded overflow-hidden hover:bg-white/10 block';
      card.innerHTML=`<div class="h-36 w-full overflow-hidden">
        <img class="w-full h-full object-cover" src="assets/tile-charla.jpg" alt="Portada revista"></div>
        <div class="p-4"><h4 class="font-semibold">${r.titulo}</h4>
        <p class="text-white/60 text-sm mt-1">Abrir PDF</p></div>`;
      el.appendChild(card);
    });
  }
  paint(list);
  q?.addEventListener('input',()=>{
    const k=q.value.toLowerCase();
    paint(list.filter(r=>r.titulo.toLowerCase().includes(k)));
  });
}

function icsForEvent(e){
  const dt=(e.fecha||'').replace(/-/g,'');
  const summary=e.titulo||'Evento';
  const loc=e.lugar||'CDE';
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//VC Estudios//SI AP Demo//ES',
    'BEGIN:VEVENT',
    'DTSTART:'+dt+'T200000Z',
    'DTEND:'+dt+'T220000Z',
    'SUMMARY:'+summary,
    'LOCATION:'+loc,
    'END:VEVENT','END:VCALENDAR'
  ].join('\\r\\n');
}

function renderEventos(list){
  const el=document.getElementById('eventos-list'); if(!el)return;
  const q=document.getElementById('eventSearch');
  function paint(items){
    el.innerHTML='';
    items.sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).forEach((e,i)=>{
      const row=document.createElement('div'); row.className='card p-4 rounded flex items-center gap-4';
      row.innerHTML=`<div class="w-28 h-20 overflow-hidden rounded"><img class="w-full h-full object-cover" src="assets/tile-evento.jpg" alt="Evento"></div>
      <div class="flex-1"><div class="text-white/90 font-medium">${e.titulo}</div><div class="text-white/60 text-sm">${e.lugar||'CDE'}</div></div>
      <div class="text-right text-sm"><div class="text-white/80">${e.fecha||''}</div>
      <button class="mt-1 btn btn-ghost text-xs" data-ics="${i}">Descargar .ics</button></div>`;
      el.appendChild(row);
    });
    // bind ics
    el.querySelectorAll('button[data-ics]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const ev = items[parseInt(btn.getAttribute('data-ics'))];
        const blob = new Blob([icsForEvent(ev)], {type:'text/calendar'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download='evento.ics'; a.click();
        URL.revokeObjectURL(url);
      })
    });
  }
  paint(list);
  q?.addEventListener('input',()=>{
    const k=q.value.toLowerCase();
    paint(list.filter(r=>r.titulo.toLowerCase().includes(k)));
  });
}

function renderMetas(list, year){
  const y=document.getElementById('metaYear'); if(y) y.textContent = year;
  const el=document.getElementById('metas-list'); if(!el)return; el.innerHTML='';
  list.forEach(m=>{
    const p=Math.max(0,Math.min(100,m.avance||0));
    const box=document.createElement('div'); box.className='card p-5 rounded';
    box.innerHTML=`<div class="flex items-center justify-between"><div class="font-medium text-white/90">⭐ ${m.titulo}</div><div class="text-sm text-white/70">${p}%</div></div>
    <div class="mt-3 h-2 rounded bg-white/10"><div class="h-2 rounded" style="background:linear-gradient(135deg,#FFC72C,#ffd95e);width:${p}%"></div></div>`;
    el.appendChild(box);
  });
}

function renderSponsors(list){
  const el=document.getElementById('sponsors-grid'); if(!el) return; el.innerHTML='';
  list.forEach(s=>{
    const a=document.createElement('a'); a.href=s.link||'#'; a.target=s.link?'_blank':'_self';
    a.className='card rounded p-6 text-center hover:bg-white/10';
    a.innerHTML=`<div class="mx-auto mb-2 w-10 h-10 rounded-full border border-yellow-300/70"></div>
      <div class="text-white/80 font-medium">${s.nombre}</div>
      <div class="text-white/50 text-xs mt-1">Sponsor</div>`;
    el.appendChild(a);
  });
}

// Lightbox (Galería)
window.addEventListener('DOMContentLoaded',()=>{
  const imgs=[...document.querySelectorAll('.gallery-img')];
  const lb=document.getElementById('lightbox'), lbi=document.getElementById('lightboxImg'), close=document.getElementById('lbClose');
  imgs.forEach(im=>im.addEventListener('click',()=>{ if(!lb||!lbi)return; lbi.src=im.src; lb.style.display='flex'; }));
  close?.addEventListener('click',()=>{ if(lb) lb.style.display='none'; });
  lb?.addEventListener('click',(e)=>{ if(e.target===lb) lb.style.display='none'; });
});

// Admin demo (localStorage)
function store(){ return JSON.parse(localStorage.getItem('si_ap_admin')||'{}'); }
function save(o){ localStorage.setItem('si_ap_admin', JSON.stringify(o)); }
window.demoAddRevista=function(){ const t=rev_title.value.trim(), u=rev_url.value.trim(); if(!t||!u) return alert('Completar');
  const s=store(); s.revistas=(s.revistas||[]); s.revistas.unshift({titulo:t,url:u}); save(s); location.href='revista.html'; }
window.demoAddEvento=function(){ const t=ev_title.value.trim(), d=ev_date.value, p=ev_place.value.trim()||'CDE'; if(!t||!d) return alert('Completar');
  const s=store(); s.eventos=(s.eventos||[]); s.eventos.push({titulo:t, fecha:d, lugar:p}); save(s); location.href='eventos.html'; }
window.demoAddMeta=function(){ const t=meta_title.value.trim(), v=parseInt(meta_pct.value,10); if(!t||isNaN(v)) return alert('Completar');
  const s=store(); s.metas=(s.metas||[]); s.metas.push({titulo:t, avance:Math.max(0,Math.min(100,v))}); save(s); location.href='metas.html'; }

// Boot
window.addEventListener('DOMContentLoaded', async()=>{
  const d = await loadData();
  renderKpis(d.kpis); renderRevistas(d.revistas||[]); renderEventos(d.eventos||[]); renderMetas(d.metas||[], d.year); renderSponsors(d.sponsors||[]);
});
