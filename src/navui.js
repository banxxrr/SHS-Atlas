
/* ================= directions UI ================= */
const $=id=>document.getElementById(id);
const dl=$('roomList'); { const seen=new Set(), frag=document.createDocumentFragment();
  for(const r of pick.slice().sort((a,b)=>sortKey(a).localeCompare(sortKey(b),undefined,{numeric:true}))){ if(!r.conf||r.ground) continue; const d=disp(r); const v=d.num?`${d.num} · ${d.name}`:d.name; if(seen.has(v)||(!d.num&&d.name==='Room')) continue; seen.add(v); const o=document.createElement('option'); o.value=v; frag.appendChild(o); }
  dl.appendChild(frag); }
function findRoom(str){ const s=(str||'').trim(); if(!s) return null; const m=s.match(/^(\d{4}[A-Za-z]?(?:-\d)?)\b/);
  const cand=pick.filter(r=>!r.ground);
  if(m){ const n=m[1].toUpperCase(); const hit=cand.filter(r=>disp(r).num.toUpperCase()===n); if(hit.length) return hit.sort((a,b)=>(b.conf-a.conf))[0];
    const e3=cand.find(r=>r.range==='≈'+n); if(e3) return e3; const e=estimate(n); return e||null; }
  const q=s.replace(/^.*·\s*/,'').toLowerCase(); const named=cand.filter(r=>disp(r).name.toLowerCase()===q); if(named.length) return named[0];
  const part=cand.filter(r=>r.conf&&(disp(r).name+' '+disp(r).num).toLowerCase().includes(q)); return part.sort((a,b)=>(b.major||0)-(a.major||0))[0]||null; }
const fmtM=m=>`${Math.round(m/5)*5} m`, fmtT=m=>{ const s=m/1.25; return s<60?'under a minute':`about ${Math.round(s/60)} min`; };
const roomTag=r=>{ const d=disp(r); return d.num?`${d.num} ${d.name}`:d.name; };
function describe(R){ const out=[]; if(R.through&&isPool(R.from)) out.push({floor:R.through.floor,text:`Leave the pool through ${roomTag(R.through)}.`}); R.legs.forEach((L,i)=>{
    if(i>0){ const prev=R.legs[i-1], via=prev.exit||L.enter; out.push({floor:L.floor,text:`Take the ${via?via.name:'stairs'} ${L.floor>prev.floor?'up':'down'} to level ${L.floor}.`}); }
    out.push({floor:L.floor,text:`Level ${L.floor}: walk ${fmtM(L.len)}${L.via.length?' via '+L.via.join(' → '):''}${i===R.legs.length-1?(R.through&&isPool(R.to)?`, then through ${roomTag(R.through)} onto the pool deck`:` to ${roomTag(R.to)}`):''}.`}); });
  return out; }
function showRoute(R,label){
  const out=$('dOut'); if(!R){ clearRoute(); out.innerHTML='<div class="dmsg">No walking route found between those rooms.</div>'; return; }
  ROUTE=R; drawRoute(R); const steps=describe(R);
  out.innerHTML=`<div class="dsum"><b></b><span></span></div><ol class="dsteps"></ol>`;
  out.querySelector('b').textContent=label||`${roomTag(R.from)} → ${roomTag(R.to)}`;
  out.querySelector('span').textContent=`${fmtM(R.len)} · ${fmtT(R.len)}${R.legs.length>1?` · ${R.legs.length-1} floor change${R.legs.length>2?'s':''}`:''}`;
  const ol=out.querySelector('ol'); for(const s of steps){ const li=document.createElement('li'); const b=document.createElement('button'); b.className='dstep'; b.textContent=s.text; b.onclick=()=>{ setMode(String(s.floor)); fitRoute(R,s.floor); }; li.appendChild(b); ol.appendChild(li); }
  setMode(String(R.legs[0].floor)); fitRoute(R); }
/* Route view: straight down over the start of the leg, turned so the way you're heading points up the screen,
   framing the first stretch of the walk (the whole leg when it's short). */
function fitRoute(R,f){ const L=R.legs.find(l=>!f||l.floor===f)||R.legs[0], P=L.pts, s=P[0], e=P[P.length-1];
  let dx=e[0]-s[0], dz=e[1]-s[1], n=Math.hypot(dx,dz); if(n<1){ const q=P[Math.min(P.length-1,3)]; dx=q[0]-s[0]; dz=q[1]-s[1]; n=Math.hypot(dx,dz)||1; if(n<.5){dx=0;dz=-1;n=1;} }
  dx/=n; dz/=n; const px=-dz, pz=dx, ahead=Math.min(140,Math.max(25,n+10));
  let a0=-12,a1=ahead,p0=-12,p1=12;
  for(const [x,z] of P){ const a=(x-s[0])*dx+(z-s[1])*dz, b=(x-s[0])*px+(z-s[1])*pz; if(a>ahead) continue; a1=Math.max(a1,Math.min(ahead,a+10)); p0=Math.min(p0,b-10); p1=Math.max(p1,b+10); }
  const am=(a0+a1)/2, pm=(p0+p1)/2, cx=s[0]+dx*am+px*pm, cz=s[1]+dz*am+pz*pm, y=(L.floor-1)*FH;
  // how much of the canvas is actually uncovered (bottom sheet on phones, side panel on desktop)
  const st=stage.getBoundingClientRect(), sh=document.getElementById('sheet').getBoundingClientRect(), desk=window.matchMedia('(min-width:900px)').matches;
  const fy=desk?1:Math.max(.45,Math.min(1,(sh.top-st.top)/st.height)), fx=desk?Math.max(.4,(st.width-sh.right)/st.width):1;
  const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)), H=Math.max(45,(a1-a0)/(2*t*fy),(p1-p0)/(2*t*camera.aspect*fx))*1.12;
  const tilt=.06, c=new THREE.Vector3(cx,y,cz), pos=new THREE.Vector3(cx-dx*H*Math.sin(tilt),y+H*Math.cos(tilt),cz-dz*H*Math.sin(tilt));
  startAnim(c,pos); }
function setHash(h){ try{ history.replaceState(null,'',h?'#'+h:location.pathname+location.search); }catch(e){} }
/* Pool: during the school day you enter through your locker room; after 3:30 PM the deck entrance is open */
const LOCKKEY='shs-map-locker';
const isPool=r=>!!r&&(disp(r).num==='5000'||/aquatic|natatorium|pool deck/i.test(disp(r).name));
const LOCKERS={g:{num:'5008',label:"Through the girls' locker room"},b:{num:'5020',label:"Through the boys' locker room"}};
const afterHours=()=>{ const d=new Date(); return d.getHours()*60+d.getMinutes()>=15*60+30; };
let lockerPref=null; try{ lockerPref=localStorage.getItem(LOCKKEY); }catch(e){}
function joinRoutes(R1,R2,a,b,via){ if(!R1||!R2) return null; const legs=R1.legs.map(l=>Object.assign({},l,{pts:l.pts.slice(),via:l.via.slice()}));
  for(const L of R2.legs){ const last=legs[legs.length-1];
    if(last.floor===L.floor){ last.pts=last.pts.concat(L.pts); last.len+=L.len; last.via=[...new Set(last.via.concat(L.via))].slice(0,6); last.exit=L.exit; }
    else legs.push(Object.assign({},L)); }
  return {from:a,to:b,legs,len:R1.len+R2.len,through:via}; }
function poolOptions(a,b,opts){ const pool=isPool(b)?b:a, other=pool===b?a:b, out=[];
  for(const k of ['g','b']){ const L=findRoom(LOCKERS[k].num); if(!L) continue;
    const R= pool===b ? joinRoutes(NAV.route(a,L,opts),NAV.route(L,b,opts),a,b,L) : joinRoutes(NAV.route(a,L,opts),NAV.route(L,b,opts),a,b,L);
    if(R) out.push({key:k,label:LOCKERS[k].label,R}); }
  const D=NAV.route(a,b,opts); if(D) out.push({key:'d',label:'Deck entrance (after 3:30 PM)',R:D,late:1});
  return out; }
function showPool(opts,label){ const late=afterHours(); let pick= late ? 'd' : (lockerPref&&opts.find(o=>o.key===lockerPref)?lockerPref:null);
  const render=k=>{ const o=opts.find(x=>x.key===k); if(!o) return;
    showRoute(o.R,label); const out=$('dOut'), box=document.createElement('div'); box.className='popt';
    const h=document.createElement('div'); h.className='dmsg'; h.textContent=late?'After 3:30 PM the deck entrance is open. During the school day, go through your locker room.':'During the school day the pool is entered through the locker rooms. The deck entrance opens after 3:30 PM.'; box.appendChild(h);
    for(const x of opts){ const b=document.createElement('button'); b.className='ghostbtn'+(x.key===k?' on':''); b.textContent=`${x.label} · ${fmtM(x.R.len)}`; if(x.late&&!late) b.title='Only after 3:30 PM';
      b.onclick=()=>{ if(x.key!=='d'){ lockerPref=x.key; try{ localStorage.setItem(LOCKKEY,x.key); }catch(e){} } render(x.key); }; box.appendChild(b); }
    out.insertBefore(box,out.querySelector('ol')); };
  if(!pick){ // ask which locker room, show girls' route for now without saving
    render(opts[0].key); const n=$('dOut').querySelector('.popt .dmsg'); if(n) n.textContent+=' Pick your locker room:'; }
  else render(pick); }
function go(){ const a=findRoom($('dFrom').value), b=findRoom($('dTo').value), out=$('dOut');
  if(!a||!b){ out.innerHTML=`<div class="dmsg">${!a?'Couldn’t find the start room.':'Couldn’t find the destination.'} Try a room number like 1428.</div>`; return; }
  out.innerHTML='<div class="dmsg">Finding a route…</div>';
  setTimeout(()=>{ const o={noStairs:$('dElev').checked};
    if(isPool(a)!==isPool(b)){ const P=poolOptions(a,b,o); if(P.length){ showPool(P); setHash(`from=${encodeURIComponent(disp(a).num||disp(a).name)}&to=${encodeURIComponent(disp(b).num||disp(b).name)}`); return; } }
    const R=NAV.route(a,b,o); showRoute(R); if(R) setHash(`from=${encodeURIComponent(disp(a).num||disp(a).name)}&to=${encodeURIComponent(disp(b).num||disp(b).name)}`); },20); }
$('dGo').onclick=go; [$('dFrom'),$('dTo')].forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); }));
$('dSwap').onclick=()=>{ const a=$('dFrom').value; $('dFrom').value=$('dTo').value; $('dTo').value=a; if(ROUTE) go(); };
$('dClear').onclick=()=>{ clearRoute(); $('dOut').innerHTML=''; $('dFrom').value=''; $('dTo').value=''; setHash(''); };
// plan my day
const DAYKEY='shs-map-day-v1'; let day=[]; try{ day=JSON.parse(localStorage.getItem(DAYKEY)||'[]')||[]; }catch(e){ day=[]; }
{ const box=$('dayList'); for(let i=0;i<8;i++){ const l=document.createElement('label'); l.className='per'; l.innerHTML=`<span>P${i+1}</span>`; const inp=document.createElement('input'); inp.className='search'; inp.setAttribute('list','roomList'); inp.placeholder='Room'; inp.value=day[i]||'';
    inp.addEventListener('change',()=>{ day[i]=inp.value; try{ localStorage.setItem(DAYKEY,JSON.stringify(day)); }catch(e){} }); l.appendChild(inp); box.appendChild(l); } }
$('dayGo').onclick=()=>{ const ins=[...document.querySelectorAll('#dayList input')], stops=ins.map(i=>i.value.trim()).map((v,i)=>({v,i})).filter(o=>o.v);
  const out=$('dOut'); if(stops.length<2){ out.innerHTML='<div class="dmsg">Enter at least two periods.</div>'; return; }
  out.innerHTML='<div class="dmsg">Routing your day…</div>';
  setTimeout(()=>{ const legs=[], rows=[]; let total=0;
    for(let k=1;k<stops.length;k++){ const a=findRoom(stops[k-1].v), b=findRoom(stops[k].v); if(!a||!b){ rows.push({t:`P${stops[k-1].i+1} → P${stops[k].i+1}: room not found`}); continue; }
      if(a===b){ rows.push({t:`P${stops[k-1].i+1} → P${stops[k].i+1}: same room`}); continue; }
      let R; const o={noStairs:$('dElev').checked};
      if(isPool(a)!==isPool(b)){ const P=poolOptions(a,b,o), pk=P.find(x=>x.key===(lockerPref||'g'))||P[0]; R=pk&&pk.R; }
      else R=NAV.route(a,b,o);
      if(!R){ rows.push({t:`P${stops[k-1].i+1} → P${stops[k].i+1}: no route`}); continue; }
      legs.push(...R.legs); total+=R.len; rows.push({t:`P${stops[k-1].i+1} → P${stops[k].i+1}: ${roomTag(a)} → ${roomTag(b)} · ${fmtM(R.len)} · ${fmtT(R.len)}`,R}); }
    if(!legs.length){ out.innerHTML='<div class="dmsg">No routes found.</div>'; return; }
    ROUTE={legs,len:total}; drawRoute(ROUTE);
    out.innerHTML=`<div class="dsum"><b>Your day</b><span>${fmtM(total)} of walking</span></div><ol class="dsteps"></ol>`;
    const ol=out.querySelector('ol'); for(const r of rows){ const li=document.createElement('li'); const b=document.createElement('button'); b.className='dstep'; b.textContent=r.t; if(r.R) b.onclick=()=>showRoute(r.R); li.appendChild(b); ol.appendChild(li); }
    setMode(String(legs[0].floor)); fitRoute(ROUTE); },20); };
