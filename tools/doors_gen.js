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
const doors=[];
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
        const n=[-out[1],out[0]]; if(!inside(f,m[0]+n[0]*1.2,m[1]+n[1]*1.2)&&!inside(f,m[0]-n[0]*1.2,m[1]-n[1]*1.2)) continue;
        doors.push([f,+p[0].toFixed(2),+p[1].toFixed(2),+q[0].toFixed(2),+q[1].toFixed(2),Math.max(s.t,t.t)]); } } } });
}
fs.writeFileSync('doors.js','/* doorways: gaps between collinear wall segments on the traced plans [floor,x1,z1,x2,z2,thickness] */\nconst DOORS='+JSON.stringify(doors)+';\n');
const c={}; doors.forEach(d=>c[d[0]]=(c[d[0]]||0)+1); console.log('doors',doors.length,c);
const w=doors.map(d=>Math.hypot(d[3]-d[1],d[4]-d[2])).sort((a,b)=>a-b); console.log('width p10/50/90',w[w.length*.1|0].toFixed(2),w[w.length/2|0].toFixed(2),w[w.length*.9|0].toFixed(2));
