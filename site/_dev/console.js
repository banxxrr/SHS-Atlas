/* SHS Atlas dev console. Loaded only after the secret trigger (and, on the website, the dev password). */
(function(){
  const A=window.__atlas; if(!A||document.getElementById('atlasDev')) return;
  const {THREE,scene,camera,controls,renderer,rooms,NAV,setMode,select,disp,inval,layers,getMode}=A;
  const css=`#atlasDev{position:fixed;z-index:50;top:10px;left:50%;transform:translateX(-50%);width:min(560px,calc(100vw - 20px));max-height:calc(100vh - 20px);overflow:auto;
    background:#0c0f12f2;color:#d7e3ec;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border:1px solid #2b3540;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
  #atlasDev header{position:sticky;top:0;display:flex;align-items:center;gap:8px;padding:8px 10px;background:#11161b;border-bottom:1px solid #2b3540;cursor:move;user-select:none}
  #atlasDev header b{color:#4ade80;letter-spacing:.04em}#atlasDev header span{color:#7b8a97;flex:1}
  #atlasDev button{font:inherit;color:#d7e3ec;background:#1a222a;border:1px solid #33404c;border-radius:6px;padding:4px 8px;cursor:pointer}
  #atlasDev button:hover{border-color:#4ade80}#atlasDev button.on{background:#14532d;border-color:#4ade80}
  #atlasDev section{padding:8px 10px;border-bottom:1px solid #1d252d}#atlasDev h4{margin:0 0 6px;color:#e8c703;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
  #atlasDev .g{display:grid;grid-template-columns:repeat(4,1fr);gap:2px 10px}#atlasDev .g div span{color:#7b8a97}
  #atlasDev .dvrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  #atlasDev input{font:inherit;color:#d7e3ec;background:#0c0f12;border:1px solid #33404c;border-radius:6px;padding:4px 6px;width:90px}
  #atlasDev pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;color:#b5c7d6;max-height:180px;overflow:auto}
  #atlasDev.min section{display:none}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const el=document.createElement('div'); el.id='atlasDev';
  el.innerHTML=`<header><b>ATLAS DEV</b><span id="dvBuild"></span><button id="dvMin" title="Collapse">_</button><button id="dvClose" title="Close (Ctrl+\`)">✕</button></header>
  <div id="dvBody">
  <section><h4>Performance</h4><div class="g" id="dvPerf"></div></section>
  <section><h4>Camera</h4><div class="g" id="dvCam"></div><div class="dvrow" style="margin-top:6px"><button id="dvCopyCam">Copy camera</button><button id="dvTop">Top-down</button><button id="dvHome">Home</button></div></section>
  <section><h4>Layers</h4><div class="dvrow" id="dvLayers"></div></section>
  <section><h4>Inspect</h4><div class="dvrow"><button id="dvInspect">Click map to inspect</button><span id="dvXY" style="color:#7b8a97"></span></div><pre id="dvOut">Turn on inspect, then click anywhere on the map.</pre></section>
  <section><h4>Route test</h4><div class="dvrow"><input id="dvA" placeholder="from"><input id="dvB" placeholder="to"><label><input type="checkbox" id="dvE" style="width:auto"> elevators</label><button id="dvGo">Run</button><button id="dvBatch">Batch 25</button></div><pre id="dvRoute"></pre></section>
  <section><h4>Data</h4><div class="dvrow"><button id="dvCount">Counts</button><button id="dvFind">Find unlabeled</button><button id="dvDump">Copy room JSON</button></div><pre id="dvData"></pre></section>
  <section><h4>Tools</h4><div class="dvrow"><button id="dvTheme">Toggle theme</button><button id="dvClear">Clear saved data</button><button id="dvLock">Re-lock beta</button><button id="dvReload">Reload</button></div></section>
  </div>`;
  document.body.appendChild(el);
  window.__atlasDevOpen=true; if(A.renderCard) A.renderCard(); // cards show sources and dev buttons while the console is open
  const $=id=>document.getElementById(id), out=(id,t)=>{ $(id).textContent=t; };
  $('dvBuild').textContent=(document.title||'')+' · '+rooms.length+' objects';
  $('dvClose').onclick=()=>{ el.remove(); st.remove(); stop=true; window.__atlasDevOpen=false; if(A.renderCard) A.renderCard(); };
  $('dvMin').onclick=()=>el.classList.toggle('min');
  // drag by header
  { let d=null; el.querySelector('header').addEventListener('pointerdown',e=>{ if(e.target.tagName==='BUTTON') return; const b=el.getBoundingClientRect(); d={x:e.clientX-b.left,y:e.clientY-b.top}; e.target.setPointerCapture(e.pointerId); });
    el.querySelector('header').addEventListener('pointermove',e=>{ if(!d) return; el.style.left=(e.clientX-d.x)+'px'; el.style.top=(e.clientY-d.y)+'px'; el.style.transform='none'; });
    el.querySelector('header').addEventListener('pointerup',()=>d=null); }

  // ---- performance + camera (sampled every 500 ms)
  let frames=0, last=performance.now(), fps=0, stop=false;
  (function tick(){ if(stop) return; frames++; const n=performance.now(); if(n-last>=500){ fps=frames*1000/(n-last); frames=0; last=n; paint(); } requestAnimationFrame(tick); })();
  function paint(){ const i=renderer.info, mem=performance.memory;
    $('dvPerf').innerHTML=[['fps',fps.toFixed(0)],['calls',i.render.calls],['tris',(i.render.triangles/1000).toFixed(1)+'k'],['geom',i.memory.geometries],['tex',i.memory.textures],['dpr',renderer.getPixelRatio()],['heap',mem?(mem.usedJSHeapSize/1e6).toFixed(0)+' MB':'n/a'],['mode',getMode()]].map(([k,v])=>`<div><span>${k}</span> ${v}</div>`).join('');
    const t=controls.target, p=camera.position;
    $('dvCam').innerHTML=[['tx',t.x.toFixed(1)],['tz',t.z.toFixed(1)],['dist',p.distanceTo(t).toFixed(0)],['near',camera.near.toFixed(1)],['azim',(controls.getAzimuthalAngle()*180/Math.PI).toFixed(0)+'°'],['polar',(controls.getPolarAngle()*180/Math.PI).toFixed(0)+'°'],['fov',camera.fov],['y',t.y.toFixed(1)]].map(([k,v])=>`<div><span>${k}</span> ${v}</div>`).join(''); }
  $('dvCopyCam').onclick=()=>{ const t=controls.target,p=camera.position; navigator.clipboard&&navigator.clipboard.writeText(`${t.x.toFixed(1)},${t.y.toFixed(1)},${t.z.toFixed(1)}:${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)}`); };
  $('dvTop').onclick=()=>{ const t=controls.target; camera.position.set(t.x+.01,t.y+120,t.z+.01); controls.update(); inval(); };
  $('dvHome').onclick=()=>document.getElementById('resetView').click();

  // ---- layer toggles
  const L=layers();
  for(const [name,objs] of Object.entries(L)){ const b=document.createElement('button'); b.textContent=name; b.className='on'; let on=true;
    b.onclick=()=>{ on=!on; b.className=on?'on':''; for(const o of L[name]()) o.userData.__devHidden=!on; setMode(getMode()); inval(); };
    $('dvLayers').appendChild(b); }
  // hidden layers stay hidden even after the app re-applies visibility
  scene.onBeforeRender=()=>{ scene.traverse(o=>{ if(o.userData&&o.userData.__devHidden) o.visible=false; }); };
  // walkable-grid overlay
  { const b=document.createElement('button'); b.textContent='nav grid'; let mesh=null;
    b.onclick=()=>{ if(mesh){ scene.remove(mesh); mesh.geometry.dispose(); mesh.material.map.dispose(); mesh=null; b.className=''; inval(); return; }
      if(!NAV.ready) NAV.build(); const D=NAV._dbg(), f=getMode()==='all'?1:+getMode(), c=D.cost[f]; if(!c) return;
      const data=new Uint8Array(D.GW*D.GH*4); for(let i=0;i<c.length;i++){ const v=c[i], o=i*4; if(v===1){data[o]=40;data[o+1]=220;data[o+2]=90;data[o+3]=140;} else if(v===2){data[o]=60;data[o+1]=120;data[o+2]=255;data[o+3]=90;} else if(v>2){data[o]=255;data[o+1]=60;data[o+2]=60;data[o+3]=160;} }
      const tex=new THREE.DataTexture(data,D.GW,D.GH,THREE.RGBAFormat); tex.needsUpdate=true; tex.magFilter=THREE.NearestFilter;
      const g=new THREE.PlaneGeometry(D.GW*D.RES,D.GH*D.RES); g.rotateX(Math.PI/2);
      mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,side:THREE.DoubleSide})); mesh.renderOrder=20;
      mesh.position.set(D.X0+D.GW*D.RES/2,(f-1)*4.4+.6,D.Z0+D.GH*D.RES/2); scene.add(mesh); b.className='on'; inval(); };
    $('dvLayers').appendChild(b); }

  // ---- inspect
  let inspecting=false; const ray=new THREE.Raycaster(), v2=new THREE.Vector2(), plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  $('dvInspect').onclick=()=>{ inspecting=!inspecting; $('dvInspect').className=inspecting?'on':''; };
  renderer.domElement.addEventListener('click',e=>{ if(!inspecting) return; const b=renderer.domElement.getBoundingClientRect();
    v2.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1); ray.setFromCamera(v2,camera);
    plane.constant=-controls.target.y; const p=new THREE.Vector3(); ray.ray.intersectPlane(plane,p);
    const f=getMode()==='all'?1:+getMode();
    const here=rooms.filter(r=>r.floor===f&&p.x>=r.x0&&p.x<=r.x1&&p.z>=r.z0&&p.z<=r.z1).map(r=>({id:r.id,kind:r.kind,num:disp(r).num,name:disp(r).name,type:r.type,src:r.src,staff:!!r.staff,suite:r.mergeInto?disp(r.mergeInto).num:undefined,bbox:[r.x0,r.z0,r.x1,r.z1].map(v=>+v.toFixed(1))}));
    out('dvXY',`x ${p.x.toFixed(2)}  z ${p.z.toFixed(2)}  floor ${f}`);
    out('dvOut',JSON.stringify(here,null,1)||'nothing here'); },true);

  // ---- route tests
  const find=s=>A.findRoom(s);
  $('dvGo').onclick=()=>{ const a=find($('dvA').value), b=find($('dvB').value); if(!a||!b){ out('dvRoute','room not found'); return; }
    const t0=performance.now(), R=NAV.route(a,b,{noStairs:$('dvE').checked}), ms=performance.now()-t0;
    out('dvRoute',R?`${ms.toFixed(0)} ms · ${R.len.toFixed(0)} m · ${R.legs.length} legs\n`+R.legs.map(l=>`L${l.floor}: ${l.len.toFixed(0)} m, ${l.pts.length} pts, past ${l.via.join(', ')||'-'}${l.exit?' → '+l.exit.name:''}`).join('\n'):`${ms.toFixed(0)} ms · NO ROUTE`); };
  $('dvBatch').onclick=()=>{ const pool=rooms.filter(r=>r.kind==='room'&&r.conf&&!r.staff&&!r.mergeInto&&r.floor<=3); let ok=0,fail=[],tot=0;
    for(let i=0;i<25;i++){ const a=pool[Math.random()*pool.length|0], b=pool[Math.random()*pool.length|0]; const t0=performance.now(), R=NAV.route(a,b,{}); tot+=performance.now()-t0; if(R) ok++; else fail.push(disp(a).num+'→'+disp(b).num); }
    out('dvRoute',`${ok}/25 routed · avg ${(tot/25).toFixed(0)} ms${fail.length?'\nfailed: '+fail.join(', '):''}`); };

  // ---- data
  $('dvCount').onclick=()=>{ const c={}; for(const r of rooms){ const k=r.kind+(r.staff?':staff':'')+(r.mergeInto?':merged':''); c[k]=(c[k]||0)+1; } out('dvData',JSON.stringify(c,null,1)); };
  $('dvFind').onclick=()=>{ const u=rooms.filter(r=>r.kind==='room'&&!disp(r).num&&!r.staff&&!r.mergeInto).map(r=>`L${r.floor} ${disp(r).name||'(no name)'} @ ${((r.x0+r.x1)/2).toFixed(0)},${((r.z0+r.z1)/2).toFixed(0)}`); out('dvData',u.length+' unnumbered rooms\n'+u.join('\n')); };
  $('dvDump').onclick=()=>{ const j=JSON.stringify(rooms.filter(r=>r.kind==='room').map(r=>({floor:r.floor,num:disp(r).num,name:disp(r).name,type:r.type,staff:!!r.staff}))); navigator.clipboard&&navigator.clipboard.writeText(j); out('dvData','copied '+j.length+' chars'); };

  // ---- tools
  $('dvTheme').onclick=()=>{ const h=document.documentElement, cur=h.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); h.setAttribute('data-theme',cur==='dark'?'light':'dark'); };
  $('dvClear').onclick=()=>{ if(!confirm('Clear saved edits, Plan my day and locker choice on this device?')) return; ['shs-map-edits-v3','shs-map-day-v1','shs-map-locker'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} }); location.reload(); };
  $('dvLock').onclick=()=>{ location.href='/__lock'; };
  $('dvReload').onclick=()=>location.reload();
  paint();
})();
