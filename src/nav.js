/* ================= DIRECTIONS: walk-able grid from the traced hallways, rooms and walls (door gaps come from the plans) ================= */
const NAV=(()=>{
  const RES=.4, X0=-205, X1=190, Z0=-235, Z1=235, GW=Math.ceil((X1-X0)/RES), GH=Math.ceil((Z1-Z0)/RES), N=GW*GH, FLOORS=[1,2,3,4];
  const cost={}; // floor -> Uint8Array (0 blocked, 1 hall, 2 room, 40 through a traced wall)
  const toG=(x,z)=>[Math.round((x-X0)/RES),Math.round((z-Z0)/RES)];
  const toW=(gx,gz)=>[X0+gx*RES,Z0+gz*RES];
  let built=false;
  function raster(f){
    const c=document.createElement('canvas'); c.width=GW; c.height=GH; const g=c.getContext('2d');
    g.setTransform(1/RES,0,0,1/RES,-X0/RES,-Z0/RES);
    const path=(pts,holes)=>{ g.beginPath(); for(const ring of [pts].concat(holes||[])){ ring.forEach(([x,z],i)=> i?g.lineTo(x,z):g.moveTo(x,z)); g.closePath(); } };
    g.fillStyle='#000'; g.fillRect(X0,Z0,X1-X0,Z1-Z0);
    const sel=rooms.filter(r=>r.floor===f&&!r.ground&&(r.kind==='room'||r.kind==='hall'));
    const draw=r=>{ if(r.shape) path(r.shape,r.holes); else { g.beginPath(); g.rect(r.x0,r.z0,r.x1-r.x0,r.z1-r.z0); } };
    // base: everything within ~1.3 m of a room or hallway is floor (fills the wall gaps between traced shapes)
    g.fillStyle=g.strokeStyle='rgb(128,128,0)'; g.lineWidth=2.6; g.lineJoin='round';
    for(const r of sel){ draw(r); g.fill('evenodd'); g.stroke(); }
    // rooms (red) and halls (green)
    for(const r of sel){ g.fillStyle=r.kind==='hall'?'rgb(0,255,0)':'rgb(255,0,0)'; draw(r); g.fill('evenodd'); }
    // walls (blue channel), glass included: you can't walk through a window
    g.strokeStyle='rgb(0,0,255)'; g.lineCap='square';
    const segs=(WALLSEG[f]||[]).concat(WALLSEG[f+'g']||[]);
    for(const [x1,z1,x2,z2,t] of segs){ g.lineWidth=Math.max(t,.3); g.beginPath(); g.moveTo(x1,z1); g.lineTo(x2,z2); g.stroke(); }
    const d=g.getImageData(0,0,GW,GH).data, a=new Uint8Array(N);
    for(let i=0;i<N;i++){ const R=d[i*4],G=d[i*4+1],B=d[i*4+2];
      a[i]= B>90 ? 40 : (G>180&&R<90) ? 1 : (R>180&&G<90) ? 2 : (R>60&&G>60) ? 3 : 0; }
    return a; }
  function build(){ if(built) return; for(const f of FLOORS) cost[f]=raster(f); built=true;
    // vertical links snapped to the nearest open cell on each floor
    LINKS.length=0;
    for(const [k,name,x,z,fl] of VLINKS){ const L={kind:k,name,cells:{}}; for(const f of fl){ const c=nearest(f,x,z,12); if(c>=0) L.cells[f]=c; } if(Object.keys(L.cells).length>1) LINKS.push(L); } }
  const LINKS=[];
  function nearest(f,x,z,rad=20,want){ const [gx,gz]=toG(x,z), a=cost[f], R=Math.round(rad/RES); let best=-1,bd=1e9;
    for(let dz=-R;dz<=R;dz++) for(let dx=-R;dx<=R;dx++){ const X=gx+dx,Z=gz+dz; if(X<0||Z<0||X>=GW||Z>=GH) continue; const i=Z*GW+X, v=a[i];
      if(!v||v===40) continue; if(want&&!want(i)) continue; const dd=dx*dx+dz*dz; if(dd<bd){ bd=dd; best=i; } }
    return best; }
  function cellIn(r){ // an open cell inside the room, near its middle
    const f=r.floor, [cx,cz]=[(r.x0+r.x1)/2,(r.z0+r.z1)/2];
    const inside=i=>{ const [x,z]=toW(i%GW,Math.floor(i/GW)); if(!r.shape) return x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1; let c=false,p=r.shape;
      for(let a=0,b=p.length-1;a<p.length;b=a++){ const [xa,za]=p[a],[xb,zb]=p[b]; if(((za>z)!=(zb>z))&&(x<(xb-xa)*(z-za)/(zb-za)+xa)) c=!c; } return c; };
    let i=nearest(f,cx,cz,Math.max(6,(r.x1-r.x0+r.z1-r.z0)/2),inside); if(i<0) i=nearest(f,cx,cz,25); return i; }
  // binary heap A* over (floor, cell)
  function route(from,to,opts={}){
    build(); const s=cellIn(from), t=cellIn(to); if(s<0||t<0) return null;
    const sf=from.floor, tf=to.floor, key=(f,i)=>(f-1)*N+i, M=4*N;
    const gs=new Float32Array(M).fill(Infinity), prev=new Int32Array(M).fill(-1), closed=new Uint8Array(M);
    const [tx,tz]=[t%GW,Math.floor(t/GW)];
    const h=(f,i)=>{ const x=i%GW,z=(i/GW)|0; return Math.hypot(x-tx,z-tz)+Math.abs(f-tf)*20; };
    const linkAt=new Map(); for(const L of LINKS){ if(opts.noStairs&&L.kind==='s') continue; for(const f in L.cells) linkAt.set(key(+f,L.cells[f]),L); }
    let heap=[], hk=[]; const push=(k,p)=>{ heap.push(p); hk.push(k); let n=heap.length-1; while(n){ const q=(n-1)>>1; if(heap[q]<=heap[n]) break; [heap[q],heap[n]]=[heap[n],heap[q]]; [hk[q],hk[n]]=[hk[n],hk[q]]; n=q; } };
    const pop=()=>{ const k=hk[0], lp=heap.pop(), lk=hk.pop(); if(heap.length){ heap[0]=lp; hk[0]=lk; let n=0; for(;;){ const l=2*n+1,r=l+1; let m=n; if(l<heap.length&&heap[l]<heap[m]) m=l; if(r<heap.length&&heap[r]<heap[m]) m=r; if(m===n) break; [heap[m],heap[n]]=[heap[n],heap[m]]; [hk[m],hk[n]]=[hk[n],hk[m]]; n=m; } } return k; };
    const s0=key(sf,s), goal=key(tf,t); gs[s0]=0; push(s0,h(sf,s));
    const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
    let it=0;
    while(heap.length){ const k=pop(); if(closed[k]) continue; closed[k]=1; if(k===goal) break; if(++it>4e6) break;
      const f=Math.floor(k/N)+1, i=k-(f-1)*N, x=i%GW, z=(i/GW)|0, a=cost[f], g0=gs[k];
      for(const [dx,dz,w] of D){ const X=x+dx,Z=z+dz; if(X<0||Z<0||X>=GW||Z>=GH) continue; const j=Z*GW+X, v=a[j]; if(!v) continue;
        if(dx&&dz&&(!a[z*GW+X]||!a[Z*GW+x])) continue;
        const nk=key(f,j), ng=g0+w*(v===1?1:v===2?1.6:v===3?1.8:v); if(ng<gs[nk]){ gs[nk]=ng; prev[nk]=k; push(nk,ng+h(f,j)); } }
      const L=linkAt.get(k); if(L) for(const ff in L.cells){ const F=+ff; if(F===f) continue; const nk=key(F,L.cells[ff]), ng=g0+(L.kind==='e'?30:18)*Math.abs(F-f); if(ng<gs[nk]){ gs[nk]=ng; prev[nk]=k; push(nk,ng+h(F,L.cells[ff])); } }
    }
    if(!closed[goal]) return null;
    const seq=[]; for(let k=goal;k>=0;k=prev[k]) seq.push(k); seq.reverse();
    // split into per-floor legs, smooth, measure
    const legs=[]; let cur=null, lastLink=null;
    for(let n=0;n<seq.length;n++){ const k=seq[n], f=Math.floor(k/N)+1, i=k-(f-1)*N;
      if(!cur||cur.floor!==f){ if(cur){ lastLink=linkAt.get(seq[n-1]); cur.exit=lastLink; } cur={floor:f,cells:[],enter:lastLink}; legs.push(cur); }
      cur.cells.push(i); }
    for(const L of legs){ L.pts=smooth(L.floor,L.cells).map(i=>toW(i%GW,Math.floor(i/GW))); L.len=0; for(let n=1;n<L.pts.length;n++) L.len+=Math.hypot(L.pts[n][0]-L.pts[n-1][0],L.pts[n][1]-L.pts[n-1][1]);
      L.via=viaNames(L); }
    const keep=legs.filter((L,k)=>k===0||k===legs.length-1||L.len>=2); for(let k=1;k<keep.length;k++) if(!keep[k].enter) keep[k].enter=keep[k-1].exit; legs.length=0; legs.push(...keep);
    return {from,to,legs,len:legs.reduce((s,l)=>s+l.len,0)}; }
  function clear(f,a,b){ const A=cost[f]; let [x0,z0]=[a%GW,(a/GW)|0],[x1,z1]=[b%GW,(b/GW)|0]; const n=Math.max(Math.abs(x1-x0),Math.abs(z1-z0));
    for(let s=0;s<=n;s++){ const x=Math.round(x0+(x1-x0)*s/n), z=Math.round(z0+(z1-z0)*s/n); const v=A[z*GW+x]; if(!v||v===40) return false;
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const w=A[(z+dz)*GW+x+dx]; if(!w) return false; } } return true; }
  function smooth(f,cells){ if(cells.length<3) return cells; const out=[cells[0]]; let a=0;
    while(a<cells.length-1){ let c=a+1; for(let k=Math.min(cells.length-1,a+300);k>a+1;k--){ if(clear(f,cells[a],cells[k])){ c=k; break; } } out.push(cells[c]); a=c; }
    return out; }
  // describe a leg by the landmarks you walk past (commons, library, gym…), not facilities hallway codes
  const LANDMARK=/commons|learning center|ilc|library|main office|student services|nurse|field house|sports center|fitness|aquatic|natatorium|caf[eé]|servery|snack|auditorium|theat|recital|performing|forum|atrium|lobby|book ?store|attendance|testing|college & career|wellness|little patriots/i;
  const LMK={};
  function viaNames(L){ const C=LMK[L.floor]||(LMK[L.floor]=rooms.filter(r=>r.floor===L.floor&&r.kind==='room'&&r.conf&&!r.mergeInto&&LANDMARK.test(disp(r).name)));
    const names=[];
    for(let n=0;n<L.pts.length-1;n++){ const [ax,az]=L.pts[n],[bx,bz]=L.pts[n+1], len=Math.hypot(bx-ax,bz-az);
      for(let s=0;s<=len;s+=3){ const x=ax+(bx-ax)*s/Math.max(len,1e-6), z=az+(bz-az)*s/Math.max(len,1e-6); let best=null,bd=4;
        for(const r of C){ const dx=Math.max(r.x0-x,0,x-r.x1), dz=Math.max(r.z0-z,0,z-r.z1), d=Math.hypot(dx,dz); if(d<bd){ bd=d; best=disp(r).name; } }
        if(best&&!names.includes(best)) names.push(best); } }
    if(names.length) return names.length<=3? names : [names[0],names[names.length>>1],names[names.length-1]];
    // nothing notable nearby: fall back to plain hallway names (codes stripped)
    const h=[]; for(let n=0;n<L.pts.length;n+=Math.max(1,L.pts.length>>3)){ const [x,z]=L.pts[n]; let best=null,bd=7;
      for(const [f,t,lx,lz] of HALL_LABELS){ if(f!==L.floor) continue; const d=Math.hypot(lx-x,lz-z); if(d<bd){ bd=d; best=hallName(t); } }
      if(best&&!h.includes(best)) h.push(best); }
    return h.slice(0,2).map(x=>'the '+x); }
  return {route,build,get ready(){return built;},_dbg:()=>({cost,LINKS,GW,GH,RES,X0,Z0})};
})();

/* route drawing */
let ROUTE=null, routeObjs=[];
const routeMat=new THREE.MeshBasicMaterial({color:0x1668e3,depthTest:false,transparent:true,opacity:.95}), routeGhost=new THREE.MeshBasicMaterial({color:0x1668e3,transparent:true,opacity:.22,depthWrite:false}), routeCase=new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,transparent:true,opacity:.95});
function dropRoute(){ for(const o of routeObjs){ if(o.isSprite) disposeSprite(o); else { scene.remove(o); o.geometry.dispose(); } } routeObjs=[]; }
function clearRoute(){ dropRoute(); ROUTE=null; inval(); }
function drawRoute(R){ inval();
  dropRoute(); routeMat.color.set(C.route); routeGhost.color.set(C.route); routeCase.color.set(getComputedStyle(document.documentElement).getPropertyValue('--route-case').trim()||'#ffffff');
  for(const L of R.legs){ const y=(L.floor-1)*FH+PLATE+.5;
    for(let n=1;n<L.pts.length;n++){ const [ax,az]=L.pts[n-1],[bx,bz]=L.pts[n], len=Math.hypot(bx-ax,bz-az); if(len<.05) continue;
      const m=new THREE.Mesh(new THREE.BoxGeometry(len+1.6,.2,1.6),routeMat); m.position.set((ax+bx)/2,y,(az+bz)/2); m.rotation.y=-Math.atan2(bz-az,bx-ax); m.userData.floor=L.floor; m.renderOrder=12; scene.add(m); routeObjs.push(m);
      const cs=new THREE.Mesh(new THREE.BoxGeometry(len+2.6,.1,2.6),routeCase); cs.position.copy(m.position); cs.position.y-=.15; cs.rotation.y=m.rotation.y; cs.userData.floor=L.floor; cs.userData.casing=1; cs.renderOrder=11; scene.add(cs); routeObjs.push(cs); }
    for(const [p,big] of [[L.pts[0],L===R.legs[0]],[L.pts[L.pts.length-1],L===R.legs[R.legs.length-1]]]){ const m=new THREE.Mesh(new THREE.CylinderGeometry(big?1.8:1.2,big?1.8:1.2,.3,24),routeMat); m.position.set(p[0],y,p[1]); m.userData.floor=L.floor; m.renderOrder=12; scene.add(m); routeObjs.push(m); } }
  const gold=getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()||'#f2b705';
  const tag=(t,L,p,end)=>{ const sp=makeSprite([{text:t,font:`700 22px ${C.body}`,size:22,color:'#ffffff'}],{fill:C.route}); const k=.09; sp.scale.set(sp.userData.px.w*k,sp.userData.px.h*k,1); sp.position.set(p[0],(L.floor-1)*FH+PLATE+3.2,p[1]); sp.userData.floor=L.floor; sp.renderOrder=13; scene.add(sp); routeObjs.push(sp); };
  const L0=R.legs[0], Ln=R.legs[R.legs.length-1];
  if(R.from) tag('Start · '+(disp(R.from).num||disp(R.from).name),L0,L0.pts[0]); if(R.to) tag('End · '+(disp(R.to).num||disp(R.to).name),Ln,Ln.pts[Ln.pts.length-1],1);
  R.legs.forEach((L,i)=>{ if(i&&L.enter) tag((L.floor>R.legs[i-1].floor?'Up: ':'Down: ')+L.enter.name,R.legs[i-1],R.legs[i-1].pts[R.legs[i-1].pts.length-1]); });
  paintRoute(); }
function paintRoute(){ inval(); for(const o of routeObjs){ const f=o.userData.floor, cur=mode==='all'||f===+mode; if(o.isSprite){ o.visible=cur; continue; } if(o.userData.casing){ o.visible=cur; continue; } o.visible=mode==='all'||f<=+mode; o.material= cur? routeMat : routeGhost; } }
