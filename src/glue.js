
/* ================= SHS Atlas shell: sheet, chips, search, ETA pill ================= */
{
const app=$('app'), sheet=$('sheet'), body=$('sheetBody'), grab=$('grab'), hint=$('hint'), qClear=$('qClear'), listTitle=$('listTitle');
const desk=window.matchMedia('(min-width:900px)');
const STATES=['peek','half','full'];
const setSheet=s=>{ sheet.dataset.state=s; grab.setAttribute('aria-label',s==='full'?'Collapse panel':'Expand panel'); if(s==='peek') body.scrollTop=0; };
const reveal=el=>{ if(!el) return; requestAnimationFrame(()=>{ const t=el.getBoundingClientRect().top-body.getBoundingClientRect().top+body.scrollTop-8; body.scrollTo({top:t,behavior:reduce?'auto':'smooth'}); }); };
// peek height: handle + chips + the directions heading and inputs
function measurePeek(){ if(desk.matches) return; const r=sheet.querySelector('.route'); const h=r.getBoundingClientRect().bottom-sheet.getBoundingClientRect().top+14; if(h>80&&h<400) app.style.setProperty('--peek',Math.round(h)+'px'); }
// drag the handle (or tap it to cycle)
let drag=null;
grab.addEventListener('pointerdown',e=>{ if(desk.matches) return; drag={y:e.clientY,t:performance.now(),base:sheet.getBoundingClientRect().top,moved:false}; grab.setPointerCapture(e.pointerId); sheet.classList.add('dragging'); });
grab.addEventListener('pointermove',e=>{ if(!drag) return; const dy=e.clientY-drag.y; if(Math.abs(dy)>4) drag.moved=true;
  const top=Math.max(0,drag.base+dy-sheet.offsetTop); sheet.style.transform=`translateY(${Math.min(top,sheet.offsetHeight-60)}px)`; });
const endDrag=e=>{ if(!drag) return; const d=drag; drag=null; sheet.classList.remove('dragging'); sheet.style.transform='';
  const cur=STATES.indexOf(sheet.dataset.state);
  if(!d.moved){ setSheet(STATES[(cur+1)%3]); return; }
  const dy=e.clientY-d.y, v=dy/Math.max(1,performance.now()-d.t);
  const H=sheet.offsetHeight, y=d.base-sheet.offsetTop+dy, pos=[H-parseFloat(getComputedStyle(app).getPropertyValue('--peek')||208),H*.48,0];
  let best=0; if(Math.abs(v)>.5) best=Math.max(0,Math.min(2,cur+(v<0?1:-1))); else { let bd=1e9; pos.forEach((p,i)=>{ if(Math.abs(p-y)<bd){ bd=Math.abs(p-y); best=i; } }); }
  setSheet(STATES[best]); };
grab.addEventListener('pointerup',endDrag); grab.addEventListener('pointercancel',endDrag);
grab.addEventListener('keydown',e=>{ const cur=STATES.indexOf(sheet.dataset.state);
  if(e.key==='ArrowUp'){ e.preventDefault(); setSheet(STATES[Math.min(2,cur+1)]); } if(e.key==='ArrowDown'){ e.preventDefault(); setSheet(STATES[Math.max(0,cur-1)]); } });
// card replaces the sheet on phones, like a place card
new MutationObserver(()=>app.classList.toggle('card-open',!card.hidden)).observe(card,{attributes:true,attributeFilter:['hidden']});
card.addEventListener('click',e=>{ const b=e.target.closest('#dirTo,#dirFrom'); if(!b) return;
  if(!$('dFrom').value||!$('dTo').value){ card.hidden=true; setSheet('half'); reveal(sheet.querySelector('.dir')); } });
// search pill
const syncQ=()=>{ qClear.hidden=!q.value; listTitle.textContent=q.value.trim()?'Results':(mode==='all'?'All rooms':'Rooms on level '+mode); };
q.addEventListener('input',()=>{ syncQ(); if(q.value.trim()&&!desk.matches&&sheet.dataset.state==='peek') setSheet('half'); reveal(listTitle.parentElement); });
q.addEventListener('focus',()=>{ if(!desk.matches){ card.hidden=true; setSheet('full'); } });
q.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const first=listEl.querySelector('.row'); if(first){ first.click(); q.blur(); } } });
qClear.onclick=()=>{ q.value=''; renderList(); syncQ(); q.focus(); };
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',syncQ));
document.addEventListener('keydown',e=>{ if(e.key==='/'&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'){ e.preventDefault(); q.focus(); } });
// quick chips: one match opens it, several show the list
$('chips').addEventListener('click',e=>{ const c=e.target.closest('.chipbtn'); if(!c) return;
  q.value=c.dataset.q; renderList(); syncQ(); const rows=listEl.querySelectorAll('.row:not(.est)');
  if(rows.length===1){ rows[0].click(); return; }
  if(!desk.matches) setSheet('half'); reveal(listTitle.parentElement); });
// tapping a result on a phone hands the screen back to the map
listEl.addEventListener('click',e=>{ if(e.target.closest('.row')&&!desk.matches){ q.blur(); setSheet('peek'); } });
// route summary pill on the map (the signature: distance and time at a glance)
const pill=document.createElement('div'); pill.className='ov eta'; pill.hidden=true; pill.setAttribute('aria-live','polite');
pill.innerHTML='<svg class="i" viewBox="0 0 24 24"><circle cx="13" cy="4" r="2"/><path d="m9 21 2-6 3 3v3M7 12l2-4 4-1 3 4 3 1M11 15l-1-4"/></svg><span></span><button class="iconbtn" aria-label="End route"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
app.appendChild(pill);
pill.querySelector('button').onclick=()=>$('dClear').click();
pill.addEventListener('click',e=>{ if(e.target.closest('button')) return; if(!desk.matches) setSheet('half'); reveal($('dOut')); });
new MutationObserver(()=>{ const s=$('dOut').querySelector('.dsum span'); pill.hidden=!s; if(s){ pill.querySelector('span').textContent=s.textContent.split(' · ').slice(0,2).reverse().join(' · ');
    card.hidden=true; if(!desk.matches) setSheet('peek'); reveal($('dOut')); } }).observe($('dOut'),{childList:true,subtree:true});
// hint fades after the first gesture
const hideHint=()=>hint.classList.add('gone'); renderer.domElement.addEventListener('pointerdown',hideHint,{once:true}); setTimeout(hideHint,9000);
// dark/light browser chrome
const meta=document.querySelector('meta[name="theme-color"]'); const syncMeta=()=>{ if(meta) meta.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#f3f4f1'; };
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncMeta); syncMeta();
desk.addEventListener('change',()=>{ setSheet('peek'); measurePeek(); });
// keep what you're looking at centred in the part of the map you can see
function viewOffset(){ const w=stage.clientWidth,h=stage.clientHeight; let ox=0,oy=0;
  if(desk.matches) ox=-(sheet.getBoundingClientRect().right)/2;
  else { const top=card.hidden?sheet.getBoundingClientRect().top:card.getBoundingClientRect().top; oy=Math.min(h*.42,Math.max(0,h-top))/2; }
  camera.setViewOffset(w,h,ox,oy,w,h); camera.updateProjectionMatrix(); }
new ResizeObserver(viewOffset).observe(stage); new ResizeObserver(viewOffset).observe(card);
sheet.addEventListener('transitionend',viewOffset); new MutationObserver(viewOffset).observe(card,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(viewOffset).observe(sheet,{attributes:true,attributeFilter:['data-state']});
// frame the whole campus in the part of the map you can see
{ const k=desk.matches?1.3:1.55; HOME_P.sub(HOME_T).multiplyScalar(k).add(HOME_T); camera.position.copy(HOME_P); controls.target.copy(HOME_T); controls.update(); }
// Clear only appears once there is something to clear
const syncClear=()=>{ $('dClear').hidden=!$('dOut').childElementCount&&!$('dFrom').value&&!$('dTo').value; };
new MutationObserver(syncClear).observe($('dOut'),{childList:true}); ['dFrom','dTo'].forEach(id=>$(id).addEventListener('input',syncClear)); $('dClear').addEventListener('click',()=>setTimeout(syncClear));
// map info panel (key, room numbers, about)
const info=$('info'), openInfo=v=>{ info.hidden=!v; if(v){ card.hidden=true; info.scrollTop=0; $('infoClose').focus(); } };
$('infoBtn').onclick=()=>openInfo(info.hidden); $('infoClose').onclick=()=>openInfo(false);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!info.hidden) openInfo(false); });
new MutationObserver(()=>{ if(!card.hidden) info.hidden=true; }).observe(card,{attributes:true,attributeFilter:['hidden']});
// ---- dev console: hidden; opens after typing "atlasdev" (keyboard) or tapping the SHS Atlas logo 5 times fast.
// On the website the console code is only sent after the dev password (checked on Cloudflare's servers).
window.__atlas={THREE,scene,camera,controls,renderer,rooms,NAV,setMode,select,disp,inval,findRoom,getMode:()=>mode,
  layers:()=>({walls:()=>wallMeshes, doors:()=>doorMeshes, 'room blocks':()=>rooms.filter(r=>r.kind==='room'&&r.mesh&&!r.staff).map(r=>r.mesh),
    'staff rooms':()=>rooms.filter(r=>r.staff&&r.mesh).map(r=>r.mesh), hallways:()=>rooms.filter(r=>r.kind==='hall'&&r.mesh).map(r=>r.mesh),
    'room labels':()=>rooms.filter(r=>r.label).map(r=>r.label), 'hall labels':()=>hallSprites, site:()=>siteMeshes.map(s=>s.mesh), stairs:()=>stairMeshes})};
{ let buf='', taps=[];
  const openDev=async()=>{ if(document.getElementById('atlasDev')) return;
    if(typeof __ATLAS_DEV_INLINE==='function'){ __ATLAS_DEV_INLINE(); return; }
    const load=()=>new Promise((ok,no)=>{ const s=document.createElement('script'); s.src='/_dev/console.js?'+Date.now(); s.onload=ok; s.onerror=no; document.head.appendChild(s); });
    let r=await fetch('/_dev/console.js',{method:'HEAD',credentials:'same-origin'}).catch(()=>null);
    if(!r||!r.ok){ const code=prompt('Dev code'); if(!code) return;
      const fd=new FormData(); fd.set('code',code); r=await fetch('/__dev',{method:'POST',body:fd,credentials:'same-origin'}).catch(()=>null);
      if(!r||!r.ok){ alert('Nope.'); return; } }
    load().catch(()=>alert('Dev console failed to load.')); };
  document.addEventListener('keydown',e=>{ const t=document.activeElement&&document.activeElement.tagName; if(t==='INPUT'||t==='TEXTAREA') return;
    buf=(buf+e.key.toLowerCase()).slice(-8); if(buf==='atlasdev'){ buf=''; openDev(); } });
  const brand=document.querySelector('.brand'); if(brand){ brand.style.pointerEvents='auto';
    brand.addEventListener('click',()=>{ const n=performance.now(); taps=taps.filter(t=>n-t<2500); taps.push(n); if(taps.length>=5){ taps=[]; openDev(); } }); } }
syncClear(); syncQ(); measurePeek(); viewOffset(); new ResizeObserver(measurePeek).observe(sheet);
}
