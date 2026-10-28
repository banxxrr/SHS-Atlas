import numpy as np, cv2
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
from PIL import Image
N8=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def wallmask(m):
    A=np.asarray(Image.open(m+'.png').convert('RGB')).astype(int); r,g,b=A[...,0],A[...,1],A[...,2]
    wm=((b-np.maximum(r,g)>28)&(A.mean(2)<225)).astype(np.uint8)
    wm=cv2.morphologyEx(wm,cv2.MORPH_CLOSE,np.ones((2,2),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(wm); keep=np.zeros_like(wm)
    for i in range(1,n):
        x,y,w,h,ar=st[i]
        if ar<35: continue
        if max(w,h)<30 and ar>0.45*w*h and ar<400: continue
        if ar>1200 and ar>0.35*w*h: continue
        keep[lab==i]=1
    return keep
def trace(sk):
    H,W=sk.shape; S=set(zip(*np.nonzero(sk)))
    def nb(p): return [(p[0]+dy,p[1]+dx) for dy,dx in N8 if (p[0]+dy,p[1]+dx) in S]
    deg={p:len(nb(p)) for p in S}
    nodes={p for p,d in deg.items() if d!=2}
    seen=set(); paths=[]
    def ek(a,b): return (a,b) if a<b else (b,a)
    for n0 in nodes:
        for n1 in nb(n0):
            if ek(n0,n1) in seen: continue
            path=[n0,n1]; seen.add(ek(n0,n1)); prev,cur=n0,n1
            while cur not in nodes:
                nxt=[q for q in nb(cur) if q!=prev and ek(cur,q) not in seen]
                if not nxt: break
                # prefer 4-neighbours to avoid diagonal shortcuts
                nxt.sort(key=lambda q:abs(q[0]-cur[0])+abs(q[1]-cur[1])); q=nxt[0]
                seen.add(ek(cur,q)); path.append(q); prev,cur=cur,q
            paths.append(path)
    # pure cycles
    rest=[p for p in S if p not in nodes and all(ek(p,q) not in seen for q in nb(p))]
    for p0 in rest:
        if any(ek(p0,q) in seen for q in nb(p0)): continue
        path=[p0]; prev=None; cur=p0
        while True:
            nxt=[q for q in nb(cur) if q!=prev and ek(cur,q) not in seen]
            if not nxt: break
            q=nxt[0]; seen.add(ek(cur,q)); path.append(q); prev,cur=cur,q
            if q==p0: break
        if len(path)>3: paths.append(path)
    return paths
def snapseg(a,b,tol=np.deg2rad(9)):
    (x1,y1),(x2,y2)=a,b; dx,dy=x2-x1,y2-y1; ang=np.arctan2(abs(dy),abs(dx))
    if ang<tol: y=(y1+y2)/2; return (x1,y),(x2,y),'h'
    if ang>np.pi/2-tol: x=(x1+x2)/2; return (x,y1),(x,y2),'v'
    return a,b,'d'
def vectorize(m,keep):
    dt=ndi.distance_transform_edt(keep)
    sk=skeletonize(keep>0).astype(np.uint8)
    segs=[]
    for path in trace(sk):
        if len(path)<4: continue
        pts=np.array([[p[1],p[0]] for p in path],np.float32).reshape(-1,1,2)
        ap=cv2.approxPolyDP(pts,1.6,False)[:,0,:]
        th=float(np.median([dt[p] for p in path]))*2
        for i in range(len(ap)-1):
            a,b=tuple(ap[i]),tuple(ap[i+1])
            if np.hypot(b[0]-a[0],b[1]-a[1])<1.5: continue
            a,b,o=snapseg(a,b); segs.append([a[0],a[1],b[0],b[1],th,o])
    # merge collinear axis segments that overlap/touch (same line within 1.5px, gap <=2px)
    out=[s for s in segs if s[5]=='d']
    for o in 'hv':
        L=[s for s in segs if s[5]==o]
        key=(lambda s:(s[1],min(s[0],s[2]))) if o=='h' else (lambda s:(s[0],min(s[1],s[3])))
        L=[[min(s[0],s[2]),s[1],max(s[0],s[2]),s[3],s[4]] if o=='h' else [s[0],min(s[1],s[3]),s[2],max(s[1],s[3]),s[4]] for s in L]
        L.sort(key=lambda s:(round(s[1] if o=='h' else s[0]),s[0] if o=='h' else s[1]))
        used=[False]*len(L)
        for i,s in enumerate(L):
            if used[i]: continue
            cur=list(s); used[i]=True; changed=True
            while changed:
                changed=False
                for j in range(len(L)):
                    if used[j]: continue
                    t=L[j]
                    if o=='h':
                        if abs(t[1]-cur[1])<=1.6 and t[0]<=cur[2]+2.5 and t[2]>=cur[0]-2.5:
                            w1=cur[2]-cur[0]; w2=t[2]-t[0]; y=(cur[1]*w1+t[1]*w2)/max(w1+w2,1e-6)
                            cur=[min(cur[0],t[0]),y,max(cur[2],t[2]),y,max(cur[4],t[4])]; used[j]=True; changed=True
                    else:
                        if abs(t[0]-cur[0])<=1.6 and t[1]<=cur[3]+2.5 and t[3]>=cur[1]-2.5:
                            w1=cur[3]-cur[1]; w2=t[3]-t[1]; x=(cur[0]*w1+t[0]*w2)/max(w1+w2,1e-6)
                            cur=[x,min(cur[1],t[1]),x,max(cur[3],t[3]),max(cur[4],t[4])]; used[j]=True; changed=True
            out.append(cur+[o])
    # extend axis segment ends by half thickness so corners close
    res=[]
    for s in out:
        x1,y1,x2,y2,th,o=s; L=np.hypot(x2-x1,y2-y1)
        if L<2.5 and o!='d': continue
        if o=='d' and L<5: continue
        e=th/2
        if L>0: ux,uy=(x2-x1)/L,(y2-y1)/L; x1-=ux*e; y1-=uy*e; x2+=ux*e; y2+=uy*e
        res.append([x1,y1,x2,y2,th,o])
    return res
