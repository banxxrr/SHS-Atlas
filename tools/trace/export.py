import sys,json,re; sys.path.insert(0,'.')
import numpy as np, cv2
from seg2 import masks
from fit import inv
fits=json.load(open('fits.json'))
FLOOR={'PW1':1,'PW2':2,'W1':1,'W2':2,'L':1,'E1':1,'E2':2,'E1z':1,'E3':3}
Mz=np.load('E1z_to_E1.npy')
def w(p,pt): x,z=inv(p,pt[0],pt[1]); return [round(float(x),2),round(float(z),2)]
from fit import P as FP
from shapely.geometry import Polygon as SP, Point
from shapely.ops import unary_union
FOOT=unary_union([SP(FP[k]).buffer(1.0) for k in ['W_OUT','E_OUT','ADD_OUT','LINK']])
def rgb(m):
    from PIL import Image
    return np.asarray(Image.open(m+'.png').convert('RGB')).astype(int)
def roommask(m,shape):
    rm=np.zeros(shape,np.uint8)
    for r in json.load(open(m+'_rooms.json')):
        if r.get('poly'): cv2.fillPoly(rm,[np.array(r['poly'],np.int32)],1)
    return rm
def polys(mask,eps,minarea):
    cs,hier=cv2.findContours(mask,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    if hier is None: return out
    hier=hier[0]
    for i,cn in enumerate(cs):
        if hier[i][3]!=-1 or cv2.contourArea(cn)<minarea: continue
        outer=cv2.approxPolyDP(cn,eps,True)[:,0,:].tolist()
        holes=[]; j=hier[i][2]
        while j!=-1:
            if cv2.contourArea(cs[j])>max(30,minarea/4): holes.append(cv2.approxPolyDP(cs[j],eps,True)[:,0,:].tolist())
            j=hier[j][0]
        if len(outer)>=3: out.append((outer,holes))
    return out
def corridors(m):
    a,wall,corr,white,obst,black=masks(m+'.png'); A=rgb(m); H,W=corr.shape
    r_,g_,b_=A[...,0],A[...,1],A[...,2]
    route=(r_-np.maximum(g_,b_)>35)&(A.mean(2)<200)          # maroon route line from the demo
    redtxt=(r_>170)&(g_<170)&(r_-g_>50)                        # red hallway names
    c=(corr|route|redtxt).astype(np.uint8)
    c=cv2.morphologyEx(c,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    rm=roommask(m,(H,W)); wl=cv2.dilate(wall.astype(np.uint8),np.ones((2,2),np.uint8))
    c[(rm>0)]=0; c[wl>0]=0; c[black]=0
    c=cv2.morphologyEx(c,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    # fill small holes (text, specks)
    inv_=(1-c).astype(np.uint8); n,lab,st,_=cv2.connectedComponentsWithStats(inv_)
    for i in range(1,n):
        if st[i,4]<500 and not (rm[lab==i].any() or wl[lab==i].sum()>st[i,4]*0.3): c[lab==i]=1
    n,lab,st,_=cv2.connectedComponentsWithStats(c)
    keep=np.zeros_like(c)
    for i in range(1,n):
        if st[i,4]>=600: keep[lab==i]=1
    return polys(keep,1.5,600)
GLASS={'E1':[(645,92,725,332)]}
def walls(m,glass=False):
    A=rgb(m); r_,g_,b_=A[...,0],A[...,1],A[...,2]
    wm=((b_-np.maximum(r_,g_)>28)&(A.mean(2)<225)).astype(np.uint8)
    wm=cv2.morphologyEx(wm,cv2.MORPH_CLOSE,np.ones((2,2),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(wm)
    keep=np.zeros_like(wm)
    for i in range(1,n):
        x,y,w_,h_,ar=st[i]
        if ar<35: continue
        if max(w_,h_)<30 and ar>0.45*w_*h_ and ar<400: continue   # solid blobs = blue zone letters
        if ar>1200 and ar>0.35*w_*h_: continue   # solid blue fills (pool water)
        keep[lab==i]=1
    from skimage.morphology import skeletonize
    sk=skeletonize(keep>0).astype(np.uint8)
    keep=cv2.dilate(sk,np.ones((3,3),np.uint8))
    gm=np.zeros_like(keep)
    for x0,y0,x1,y1 in GLASS.get(m,[]): gm[y0:y1,x0:x1]=1
    keep=keep&gm if glass else keep&(1-gm)
    return polys(keep,0.9,12)
def inside(pts): 
    xs=[p[0] for p in pts]; zs=[p[1] for p in pts]
    return FOOT.contains(Point(sum(xs)/len(xs),sum(zs)/len(zs)))
from vec import wallmask, vectorize
SEGS={}
def getsegs(m):
    if m not in SEGS: SEGS[m]=vectorize(m,wallmask(m))
    return SEGS[m]
KEEP_WHOLE={'6064','2412','2414','1514','2514','6042','1312','2300','2115','1103','1210','1212','1214','4400','5026','5000','1100','5206','4000','7026','7080','2206','2206A','2400','2434','3046','6080','4100','4200','1123','1410','7002','2700','6036A','1204','1208','5116'}
WM={}
def cutroom(m,r):
    import importlib
    if r['num'] in KEEP_WHOLE or not r.get('poly'): return r['poly']
    if m not in WM:
        k=wallmask(m); WM[m]=cv2.dilate(k,np.ones((2,2),np.uint8))
    wm=WM[m]; H,W=wm.shape
    mk=np.zeros((H,W),np.uint8); cv2.fillPoly(mk,[np.array(r['poly'],np.int32)],1)
    A0=mk.sum()
    if A0<60: return r['poly']
    cut=(mk&(1-wm)).astype(np.uint8)
    n,lab,st,cen=cv2.connectedComponentsWithStats(cut,connectivity=4)
    if n<=2: return r['poly']
    ax,ay=(r['seed'] if r.get('seed') else [sum(p[0] for p in r['poly'])/len(r['poly']),sum(p[1] for p in r['poly'])/len(r['poly'])])
    ax,ay=int(min(W-1,max(0,ax))),int(min(H-1,max(0,ay)))
    l=lab[ay,ax]
    if l==0:
        best=None
        for i in range(1,n):
            d=(cen[i][0]-ax)**2+(cen[i][1]-ay)**2
            if st[i,4]>0.1*A0 and (best is None or d<best[0]): best=(d,i)
        if not best: return r['poly']
        l=best[1]
    comp=(lab==l).astype(np.uint8)
    if comp.sum()<0.45*A0 or comp.sum()>0.93*A0: return r['poly']
    comp=cv2.dilate(comp,np.ones((3,3),np.uint8))&mk
    ys,xs=np.nonzero(comp); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    if comp.sum()>0.78*(x1-x0)*(y1-y0) or (x1-x0)*(y1-y0)<2500: return [[int(x0),int(y0)],[int(x1),int(y0)],[int(x1),int(y1)],[int(x0),int(y1)]]
    return ortho(comp)
def ortho(m,g=4):
    H,W=m.shape; sm=cv2.resize(m.astype(np.uint8),(W//g,H//g),interpolation=cv2.INTER_AREA); sm=(sm>0).astype(np.uint8)
    sm=cv2.morphologyEx(sm,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    cs,_=cv2.findContours(sm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea)[:,0,:]
    P=[]
    for k in range(len(c)):
        a=c[k]; b=c[(k+1)%len(c)]; P.append((int(a[0]),int(a[1])))
        if a[0]!=b[0] and a[1]!=b[1]:
            cand=(int(b[0]),int(a[1])); alt=(int(a[0]),int(b[1])); P.append(cand if sm[cand[1],cand[0]] else alt)
    Q=[]
    for k in range(len(P)):
        p0=P[k-1]; p1=P[k]; p2=P[(k+1)%len(P)]
        if (p0[0]==p1[0]==p2[0]) or (p0[1]==p1[1]==p2[1]) or p1==p0: continue
        Q.append(p1)
    return [[int((q[0]+.5)*g),int((q[1]+.5)*g)] for q in Q]
CUTLOG=[]
def snap_poly(poly,segs,maxd=6):
    P=[list(map(float,p)) for p in poly]; n=len(P)
    if n<4: return poly
    cx=sum(p[0] for p in P)/n; cy=sum(p[1] for p in P)/n
    for i in range(n):
        a,b=P[i],P[(i+1)%n]
        if abs(a[1]-b[1])<0.6 and abs(a[0]-b[0])>3:   # horizontal edge
            x0,x1=sorted([a[0],b[0]]); best=None
            for s in segs:
                if s[5]!='h': continue
                ov=min(x1,max(s[0],s[2]))-max(x0,min(s[0],s[2]))
                if ov<0.4*(x1-x0): continue
                d=abs(s[1]-a[1])
                if d<=maxd and (best is None or d<best[0]): best=(d,s)
            if best:
                s=best[1]; inward=1 if cy>s[1] else -1; y=s[1]+inward*s[4]/2
                a[1]=b[1]=y
        elif abs(a[0]-b[0])<0.6 and abs(a[1]-b[1])>3:
            y0,y1=sorted([a[1],b[1]]); best=None
            for s in segs:
                if s[5]!='v': continue
                ov=min(y1,max(s[1],s[3]))-max(y0,min(s[1],s[3]))
                if ov<0.4*(y1-y0): continue
                d=abs(s[0]-a[0])
                if d<=maxd and (best is None or d<best[0]): best=(d,s)
            if best:
                s=best[1]; inward=1 if cx>s[0] else -1; x=s[0]+inward*s[4]/2
                a[0]=b[0]=x
    return P
data={'rooms':[],'halls':[],'walls':[],'segs':[]}
for m in ['PW1','PW2','L','E1','E2','E1z','E3']:
    p=fits['E1' if m=='E1z' else m]
    tr=(lambda q:[Mz[0,0]*q[0]+Mz[0,1]*q[1]+Mz[0,2],Mz[1,0]*q[0]+Mz[1,1]*q[1]+Mz[1,2]]) if m=='E1z' else (lambda q:q)
    for r in json.load(open(m+'_rooms.json')):
        if not r.get('poly') or len(r['poly'])<3: continue
        poly=r['poly']
        if m!='L':
            np_=cutroom(m,r)
            if np_ is not poly: CUTLOG.append((m,r['num'],r['name'],r['poly'],np_)); poly=np_
        if m!='E1z' and m!='L' or (m=='L' and r.get('shape')=='rect'): poly=snap_poly(poly,getsegs(m))
        data['rooms'].append(dict(map=m,floor=FLOOR[m],num=r['num'],name=r['name'],poly=[w(p,tr(q)) for q in poly],box=r.get('box',0)))
    if m=='E1z': continue
    G=GLASS.get(m,[])
    for x1,y1,x2,y2,th,o in getsegs(m):
        mx,my=(x1+x2)/2,(y1+y2)/2; gl=any(a<=mx<=c and b<=my<=d for a,b,c,d in G)
        A=w(p,(x1,y1)); B=w(p,(x2,y2))
        if not (inside([A,B])): continue
        Lw=((A[0]-B[0])**2+(A[1]-B[1])**2)**.5
        curved= m=='L' or (m in('E1','E2') and max(A[0],B[0])<65 and min(A[1],B[1])>-60) or (m=='E2' and max(A[0],B[0])<100 and min(A[1],B[1])>-35)
        if o=='d' and not curved and not gl and Lw<2.6: continue   # door-swing arcs and specks
        data['segs'].append(dict(floor=FLOOR[m],a=A,b=B,t=0.42 if th>=4.5 else 0.22,glass=int(gl)))
    for outer,holes in corridors(m):
        P_=[w(p,q) for q in outer]
        if inside(P_):
            HH=[[w(p,q) for q in h] for h in holes]; HH=[h for h in HH if len(h)>=3 and SP(h).buffer(0).area>200]
            data['halls'].append(dict(map=m,floor=FLOOR[m],poly=P_,holes=HH))
    for outer,holes in walls(m,True):
        P_=[w(p,q) for q in outer]
        if inside(P_): data['walls'].append(dict(map=m,floor=FLOOR[m],poly=P_,holes=[[w(p,q) for q in h] for h in holes],glass=1))
    for outer,holes in walls(m):
        P_=[w(p,q) for q in outer]
        if inside(P_) and (SP(P_).area<12 or 2*SP(P_).area/SP(P_).length<1.3): data['walls'].append(dict(map=m,floor=FLOOR[m],poly=P_,holes=[[w(p,q) for q in h] for h in holes]))
from shapely.geometry import LineString, Polygon
from shapely.strtree import STRtree
_n0=len(data['segs'])
for f in (1,2,3):
    rp=[Polygon(r['poly']).buffer(0) for r in data['rooms'] if r['floor']==f]
    rp=[p for p in rp if p.area>4]
    tree=STRtree(rp)
    for s in data['segs']:
        if s['floor']!=f or s['glass']: continue
        l=LineString([s['a'],s['b']])
        if l.length>=8: continue
        for i in tree.query(l):
            if rp[i].buffer(-0.45).contains(l): s['drop']=1; break
data['segs']=[s for s in data['segs'] if not s.get('drop')]
print('clutter walls removed',_n0-len(data['segs']))
json.dump(data,open('plan.json','w'))
print('cut',len(CUTLOG)); json.dump(CUTLOG,open('cutlog.json','w')); print(len(data['rooms']),len(data['halls']),len(data['walls']),sum(len(x['poly']) for x in data['walls']), sum(len(h['poly']) for h in data['halls']))
