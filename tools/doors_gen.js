// Find doorways: gaps between two collinear wall segments, 0.7–3.2 m wide, with nothing else filling the gap.
const fs=require('fs');
const o=new Function(fs.readFileSync('plan.js','utf8')+';return {PLAN_S,PLAN_H,PLAN_R}')();
const unpack=f=>{const p=[];for(let i=0;i<f.length;i+=2)p.push([f[i],f[i+1]]);return p;};
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,zi]=P[i],[xj,zj]=P[j]; if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
const areas={}; // floor -> polygons (rooms + halls)
for(const r of o.PLAN_R){ const f=r[0]; (areas[f]=areas[f]||[]).push(unpack(r[5])); }
for(const h of o.PLAN_H){ const f=h[0]; (areas[f]=areas[f]||[]).push(unpack(h[2])); }
const inside=(f,x,z)=>(areas[f]||[]).some(P=>inPoly(x,z,P));
const segs=o.PLAN_S.filter(s=>!s[1]).map(s=>({f:s[0],a:[s[2],s[3]],b:[s[4],s[5]],t:s[6]}));
const doors=[], fills=[];
const STAFF=/storage|closet|\bmech|electrical|elec\b|custodial|janitor|maintenance|boiler|chiller|panel ?boards|\bidf\b|\bmdf\b|receiving|grounds|cooler|pantry|food prep|wash station|drying area|pool (filter|equipment)|cogen|fire pump|\bserver\b|trash|recycl|loading|^equipment$|^kitchen$|fire panel|dimmer|sprinkler|riser|telecom|shaft|chase/i;
const staffP={}; for(const r of o.PLAN_R){ if(STAFF.test(r[3]||'')) (staffP[r[0]]=staffP[r[0]]||[]).push(unpack(r[5])); }
const inStaff=(f,x,z)=>(staffP[f]||[]).some(P=>inPoly(x,z,P));
const roomsP={}, hallsP={}; for(const r of o.PLAN_R){ (roomsP[r[0]]=roomsP[r[0]]||[]).push(unpack(r[5])); } for(const h of o.PLAN_H){ (hallsP[h[0]]=hallsP[h[0]]||[]).push(unpack(h[2])); }
const sideOf=(f,x,z)=>(roomsP[f]||[]).some(P=>inPoly(x,z,P))?'room':(hallsP[f]||[]).some(P=>inPoly(x,z,P))?'hall':'none';
const dist2seg=(p,s)=>{const [ax,az]=s.a,[bx,bz]=s.b,dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz||1;let u=((p[0]-ax)*dx+(p[1]-az)*dz)/L;u=Math.max(0,Math.min(1,u));return Math.hypot(ax+u*dx-p[0],az+u*dz-p[1]);};
for(const f of [1,2,3]){ const S=segs.filter(s=>s.f===f);
  // bucket endpoints
  const G=new Map(), key=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
  S.forEach((s,i)=>{ for(const [e,p] of [[0,s.a],[1,s.b]]){ const k=key(...p); if(!G.has(k))G.set(k,[]); G.get(k).push([i,e]); } });
  const seen=new Set();
  S.forEach((s,i)=>{ const dir=[s.b[0]-s.a[0],s.b[1]-s.a[1]], L=Math.hypot(...dir); if(L<.3) return; const u=[dir[0]/L,dir[1]/L];
    for(const [e,p] of [[0,s.a],[1,s.b]]){ const out=e===1?u:[-u[0],-u[1]]; // pointing away from this segment
      const cx=Math.floor(p[0]/4), cz=Math.floor(p[1]/4);
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){ for(const [j,e2] of (G.get((cx+dx)+','+(cz+dz))||[])){ if(j===i) continue; const t=S[j], q=e2?t.b:t.a;
        const v=[q[0]-p[0],q[1]-p[1]], along=v[0]*out[0]+v[1]*out[1], perp=Math.abs(v[0]*out[1]-v[1]*out[0]);
        if(along<.7||along>3.2||perp>.35) continue;
        // other segment must be roughly parallel and continue away from the gap
        const d2=[t.b[0]-t.a[0],t.b[1]-t.a[1]], L2=Math.hypot(...d2); if(L2<.3) continue; if(Math.abs((d2[0]*u[0]+d2[1]*u[1])/L2)<.97) continue;
        const far=e2?t.a:t.b; if(((far[0]-q[0])*out[0]+(far[1]-q[1])*out[1])<0) continue;
        const k=[Math.min(i,j),Math.max(i,j)].join('-'); if(seen.has(k)) continue; seen.add(k);
        const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
        // gap must be open: no other wall crossing it
        if(S.some((w,wi)=>wi!==i&&wi!==j&&dist2seg(m,w)<.3)) continue;
        // it must open onto a room or hallway on at least one side
        const n=[-out[1],out[0]], A=sideOf(f,m[0]+n[0]*1.2,m[1]+n[1]*1.2), B=sideOf(f,m[0]-n[0]*1.2,m[1]-n[1]*1.2);
        // hall on both sides: an opening in the corridor, leave it open, no door
        if(A==='hall'&&B==='hall') continue;
        // outside (or nothing traced) on a side: it's a window in an outer wall, so close it with wall
        if(A==='none'||B==='none'){ fills.push([f,+p[0].toFixed(2),+p[1].toFixed(2),+q[0].toFixed(2),+q[1].toFixed(2),Math.max(s.t,t.t)]); continue; }
        // doorways into closets, storage and mechanical rooms are left off the map: close them like wall
        if(inStaff(f,m[0]+n[0]*1.2,m[1]+n[1]*1.2)||inStaff(f,m[0]-n[0]*1.2,m[1]-n[1]*1.2)){ fills.push([f,+p[0].toFixed(2),+p[1].toFixed(2),+q[0].toFixed(2),+q[1].toFixed(2),Math.max(s.t,t.t)]); continue; }
        doors.push([f,+p[0].toFixed(2),+p[1].toFixed(2),+q[0].toFixed(2),+q[1].toFixed(2),Math.max(s.t,t.t)]); } } } });
}
// merge doors that sit on top of each other (the same doorway found from several wall pieces)
{ const keep=[]; for(const d of doors.sort((a,b)=>Math.hypot(b[3]-b[1],b[4]-b[2])-Math.hypot(a[3]-a[1],a[4]-a[2]))){ const m=[(d[1]+d[3])/2,(d[2]+d[4])/2];
    if(keep.some(k=>k[0]===d[0]&&Math.hypot((k[1]+k[3])/2-m[0],(k[2]+k[4])/2-m[1])<1.6)) continue; keep.push(d); }
  doors.length=0; doors.push(...keep); }
fs.writeFileSync('doors.js','/* doorways: gaps between collinear wall segments on the traced plans [floor,x1,z1,x2,z2,thickness] */\nconst DOORS='+JSON.stringify(doors)+';\n');
const c={}; doors.forEach(d=>c[d[0]]=(c[d[0]]||0)+1); console.log('doors',doors.length,c);
const w=doors.map(d=>Math.hypot(d[3]-d[1],d[4]-d[2])).sort((a,b)=>a-b); console.log('width p10/50/90',w[w.length*.1|0].toFixed(2),w[w.length/2|0].toFixed(2),w[w.length*.9|0].toFixed(2));

// ---- rooms with no doorway found: the plan drew their door inside a solid wall line.
// Put a door on the longest stretch of the room's edge that faces a hallway, and cut the wall there.
const halls={}; for(const h of o.PLAN_H){ (halls[h[0]]=halls[h[0]]||[]).push(unpack(h[2])); }
const inHall=(f,x,z)=>(halls[f]||[]).some(P=>inPoly(x,z,P));
const segD=(p,a,b)=>dist2seg(p,{a,b});
const added=[], cuts=[];
for(const r of o.PLAN_R){ const f=r[0]; if(f>3||STAFF.test(r[3]||'')||/hydration/i.test(r[3]||'')) continue; const P=unpack(r[5]); if(P.length<3) continue;
  let A=0; for(let i=0,j=P.length-1;i<P.length;j=i++) A+=(P[j][0]*P[i][1]-P[i][0]*P[j][1]); A=Math.abs(A)/2; if(A<5) continue;
  const near=doors.concat(added).some(d=>d[0]===f&&P.some((p,i)=>segD([(d[1]+d[3])/2,(d[2]+d[4])/2],p,P[(i+1)%P.length])<1.0));
  if(near) continue;
  let best=null;
  for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length], L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<1.4) continue;
    const u=[(b[0]-a[0])/L,(b[1]-a[1])/L]; let n=[-u[1],u[0]]; const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(inPoly(mid[0]+n[0]*.4,mid[1]+n[1]*.4,P)) n=[-n[0],-n[1]];
    let run=0,start=0;
    for(let s=.5;s<=L-.5;s+=.25){ const p=[a[0]+u[0]*s,a[1]+u[1]*s]; const ok=inHall(f,p[0]+n[0]*.9,p[1]+n[1]*.9);
      if(ok){ if(!run) start=s; run=s-start+.25; if(!best||run>best.run) best={run,a,u,s0:start,s1:s,n}; } else run=0; } }
  if(!best||best.run<1.2) continue;
  const w=A>350?1.8:1.0, c=(best.s0+best.s1)/2, x1=best.a[0]+best.u[0]*(c-w/2), z1=best.a[1]+best.u[1]*(c-w/2), x2=best.a[0]+best.u[0]*(c+w/2), z2=best.a[1]+best.u[1]*(c+w/2);
  added.push([f,+x1.toFixed(2),+z1.toFixed(2),+x2.toFixed(2),+z2.toFixed(2),.22]);
  // cut every parallel wall segment that runs through the new doorway
  o.PLAN_S.forEach((s,si)=>{ if(s[0]!==f||s[1]) return; const sa=[s[2],s[3]], sb=[s[4],s[5]], sl=Math.hypot(sb[0]-sa[0],sb[1]-sa[1]); if(sl<.2) return;
    const su=[(sb[0]-sa[0])/sl,(sb[1]-sa[1])/sl]; if(Math.abs(su[0]*best.u[0]+su[1]*best.u[1])<.95) return;
    const m=[(x1+x2)/2,(z1+z2)/2]; const perp=Math.abs((m[0]-sa[0])*su[1]-(m[1]-sa[1])*su[0]); if(perp>.6) return;
    const t1=((x1-sa[0])*su[0]+(z1-sa[1])*su[1])/sl, t2=((x2-sa[0])*su[0]+(z2-sa[1])*su[1])/sl; const lo=Math.max(0,Math.min(t1,t2)), hi=Math.min(1,Math.max(t1,t2));
    if(hi-lo>.0001&&hi>0&&lo<1) cuts.push([si,+lo.toFixed(4),+hi.toFixed(4)]); }); }
fs.writeFileSync('doors.js','/* doorways [floor,x1,z1,x2,z2,thickness,added]: gaps found between collinear wall segments, plus doors added on the hallway side of rooms whose door the plan drew as solid wall */\nconst DOORS='+JSON.stringify(doors.map(d=>d.concat(0)).concat(added.map(d=>d.concat(1))))+';\n/* wall pieces removed for the added doors [PLAN_S index, from, to] (0–1 along the segment) */\nconst DOOR_CUTS='+JSON.stringify(cuts)+';\n/* windows in outside walls, closed with wall [floor,x1,z1,x2,z2,thickness] */\nconst WALL_FILL='+JSON.stringify(fills)+';\n');
console.log('added',added.length,'cuts',cuts.length,'window fills',fills.length);
