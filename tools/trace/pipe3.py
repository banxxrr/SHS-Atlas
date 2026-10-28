import sys, importlib, json; sys.path.insert(0,'.')
from seg2 import masks, rooms_ws
import numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
RADII=[1,2,3,4,5,6,8,10,12]
def grow(ob,x,y,maxs=260,thr=0.3,hard=None):
    H,W=ob.shape; x0=x1=x; y0=y1=y
    hb=(lambda a: hard is not None and a.any())
    act=[1,1,1,1]
    while any(act):
        if act[0]:
            if x0-1<0 or ob[y0:y1+1,x0-1].mean()>thr or hb(hard[y0:y1+1,x0-1]) or x1-x0>maxs: act[0]=0
            else: x0-=1
        if act[1]:
            if x1+1>=W or ob[y0:y1+1,x1+1].mean()>thr or hb(hard[y0:y1+1,x1+1]) or x1-x0>maxs: act[1]=0
            else: x1+=1
        if act[2]:
            if y0-1<0 or ob[y0-1,x0:x1+1].mean()>thr or hb(hard[y0-1,x0:x1+1]) or y1-y0>maxs: act[2]=0
            else: y0-=1
        if act[3]:
            if y1+1>=H or ob[y1+1,x0:x1+1].mean()>thr or hb(hard[y1+1,x0:x1+1]) or y1-y0>maxs: act[3]=0
            else: y1+=1
    return x0,y0,x1,y1
def run(name,crops=None,verbose=False):
    cfg=importlib.import_module('cfg.'+name)
    a,wall,corr,white,obst,black=masks(name+'.png'); H,W=wall.shape
    corr2=cv2.morphologyEx(corr.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8)).astype(bool)
    edge=np.zeros((H,W),bool); edge[:6]=1; edge[-6:]=1; edge[:,:6]=1; edge[:,-6:]=1
    edge|=ndi.binary_dilation(black,iterations=8)
    outside=np.zeros((H,W),np.uint8)
    for c in getattr(cfg,'COURTS',[]): cv2.circle(outside,c,14,1,-1)
    S=[s for s in cfg.SEEDS]; B=list(cfg.BOXES)
    boxmask=np.zeros((H,W),bool)
    for b in B: boxmask[b[3]:b[5]+1,b[2]:b[4]+1]=True
    labs={}
    for r in RADII:
        k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*r+1,2*r+1))
        ob=cv2.morphologyEx(wall.astype(np.uint8),cv2.MORPH_CLOSE,k).astype(bool)|corr2|black|boxmask
        lab,n=ndi.label(~ob)
        # components touching frame edge / letterbox are outside
        bad=set(np.unique(lab[edge]))|set(np.unique(lab[outside.astype(bool)]))
        labs[r]=(lab,bad,np.bincount(lab.ravel()))
    def free(x,y,ob):
        if not ob[y,x]: return x,y
        for d in range(1,14):
            for dy in range(-d,d+1):
                for dx in range(-d,d+1):
                    yy,xx=y+dy,x+dx
                    if 0<=yy<H and 0<=xx<W and not ob[yy,xx]: return xx,yy
        return x,y
    key=lambda s:(s[0],s[1])
    cells=[]; fb=[]
    for i,s in enumerate(S):
        got=None
        for r in RADII:
            lab,bad,cnt=labs[r]
            x,y=free(s[2],s[3],lab==0)
            l=lab[y,x]
            if l==0 or l in bad or cnt[l]>70000: continue
            others=[t for t in S if t is not s and key(t)!=key(s) and (lab[max(0,t[3]-4):t[3]+5,max(0,t[2]-8):t[2]+9]==l).any()]
            if others: continue
            got=(lab==l); break
        cells.append(got)
        if got is None: fb.append(i)
    gob=(wall|corr2|black)
    def hardfor(i):
        h=np.zeros((H,W),bool)
        for j,t in enumerate(S):
            if j!=i and key(t)!=key(S[i]): h[max(0,t[3]-3):t[3]+4,max(0,t[2]-3):t[2]+4]=True
        h|=boxmask; return h
    for i in fb:
        s_=S[i]; x,y=free(s_[2],s_[3],gob)
        x0,y0,x1,y1=grow(gob,x,y,hard=hardfor(i))
        m=np.zeros((H,W),bool); m[y0:y1+1,x0:x1+1]=True; cells[i]=m
    rooms=[]
    for i,s in enumerate(S):
        m=cells[i]
        if m is None: m=np.zeros((H,W),bool); m[s[3]-5:s[3]+6,s[2]-5:s[2]+6]=True
        rooms.append(dict(num=s[0],name=s[1],mask=m,fb=i in fb,seed=[s[2],s[3]]))
    for b in B:
        m=np.zeros((H,W),bool); m[b[3]:b[5]+1,b[2]:b[4]+1]=True
        rooms.append(dict(num=b[0],name=b[1],mask=m,box=1))
    for p in getattr(cfg,'POLYS',[]):
        m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[np.array(p[2],np.int32)],1)
        rooms.append(dict(num=p[0],name=p[1],mask=m.astype(bool),box=1,fixed=[list(q) for q in p[2]]))
    # merge same number+name pieces that touch
    out=[]
    for r in rooms:
        hit=None
        for q in out:
            if r['num'] and q['num']==r['num'] and q['name']==r['name']:
                if (ndi.binary_dilation(q['mask'],iterations=8)&r['mask']).any(): hit=q; break
        if hit: hit['mask']|=r['mask']; hit['fb']=hit.get('fb') or r.get('fb')
        else: out.append(r)
    # exclusive ownership: boxes first, then smaller cells win
    own=np.full((H,W),-1,np.int32)
    order=sorted(range(len(out)),key=lambda i:(0 if out[i].get('box') else 1, out[i]['mask'].sum()))
    for i in order:
        m=out[i]['mask']&(own<0); own[m]=i
    curved_map=(name=='L')
    for i,r in enumerate(out):
        curved=curved_map and r.get('seed',[0,0])[1]>600
        m=(own==i).astype(np.uint8)
        if r.get('fixed'): r['poly']=r['fixed']; r['shape']='poly'; continue
        if r.get('box'):
            ys,xs=np.where(m)
            if len(xs)==0: r['poly']=None; continue
        else:
            m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)) if m.sum()>300 else m
        n,cl,st,_=cv2.connectedComponentsWithStats(m)
        if n<2: r['poly']=None; continue
        j=1+int(np.argmax(st[1:,4])); m=(cl==j).astype(np.uint8)
        ys,xs=np.where(m); A=len(xs)
        x0,x1=np.percentile(xs,1),np.percentile(xs,99); y0,y1=np.percentile(ys,1),np.percentile(ys,99)
        fill=A/max(1,(x1-x0+1)*(y1-y0+1))
        r['area']=A; r['fill']=round(float(fill),2)
        sub=own[int(y0):int(y1)+2,int(x0):int(x1)+2]
        foreign=((sub>=0)&(sub!=i)).mean() if sub.size else 1
        if fill<=0.80 and A<2600 and not curved and r.get('seed'):
            gx,gy=free(r['seed'][0],r['seed'][1],gob); ii=next(k for k,t in enumerate(S) if [t[2],t[3]]==r['seed']); bx0,by0,bx1,by1=grow(gob,gx,gy,maxs=90,hard=hardfor(ii))
            r['poly']=[[bx0,by0],[bx1+1,by0],[bx1+1,by1+1],[bx0,by1+1]]; r['shape']='rect'; r['grown']=1; continue
        if fill>0.80 and not curved and foreign<0.03:
            r['poly']=[[int(x0),int(y0)],[int(x1)+1,int(y0)],[int(x1)+1,int(y1)+1],[int(x0),int(y1)+1]]; r['shape']='rect'; continue
        cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE); c=max(cs,key=cv2.contourArea)
        rr=cv2.minAreaRect(c); rf=A/max(1,rr[1][0]*rr[1][1])
        if curved and rf>0.78:
            r['poly']=cv2.boxPoints(rr).round().astype(int).tolist(); r['shape']='rot'; continue
        # rectilinear outline on a 4px grid (only horizontal/vertical edges)
        g=4; sm=cv2.resize(m,(W//g,H//g),interpolation=cv2.INTER_AREA)
        sm=(sm>0).astype(np.uint8)
        sm=cv2.morphologyEx(sm,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
        sm=cv2.morphologyEx(sm,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
        cs,_=cv2.findContours(sm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        if not cs: r['poly']=None; continue
        c=max(cs,key=cv2.contourArea)[:,0,:]
        # orthogonalize: replace diagonal steps by an L through the inside cell, then drop collinear points
        P=[]
        for k in range(len(c)):
            a_=c[k]; b_=c[(k+1)%len(c)]; P.append((int(a_[0]),int(a_[1])))
            if a_[0]!=b_[0] and a_[1]!=b_[1]:
                cand=(int(b_[0]),int(a_[1])); alt=(int(a_[0]),int(b_[1]))
                P.append(cand if sm[cand[1],cand[0]] else alt)
        Q=[]
        for k in range(len(P)):
            p0=P[k-1]; p1=P[k]; p2=P[(k+1)%len(P)]
            if (p0[0]==p1[0]==p2[0]) or (p0[1]==p1[1]==p2[1]) or p1==p0: continue
            Q.append(p1)
        cx=np.mean([q[0] for q in Q]); cy=np.mean([q[1] for q in Q])
        pts=[[int((q[0]+0.5)*g),int((q[1]+0.5)*g)] for q in Q]
        if curved:
            pts=cv2.approxPolyDP(c.reshape(-1,1,2).astype(np.int32),1.2,True)[:,0,:]*g; pts=pts.tolist()
        r['poly']=pts; r['shape']='poly'
    for r in out: r.pop('mask',None)
    out=[r for r in out if r.get('poly')]
    json.dump(out,open(name+'_rooms.json','w'))
    im=Image.fromarray(a.copy()); d=ImageDraw.Draw(im,'RGBA')
    rng=np.random.default_rng(7)
    for r in out:
        c=tuple(int(v) for v in rng.integers(40,220,3))
        d.polygon([tuple(p) for p in r['poly']],fill=c+(70,),outline=(255,0,255) if r.get('box') else ((255,120,0) if r.get('fb') else (200,0,0)))
        xs=[p[0] for p in r['poly']]; ys=[p[1] for p in r['poly']]
        d.text((min(xs)+2,min(ys)+1),r['num'] or '·',fill=(0,0,150))
    im.save(name+'_m.jpg',quality=92)
    if crops:
        for i,c in enumerate(crops): im.crop(c).resize(((c[2]-c[0])*3//2,(c[3]-c[1])*3//2)).save(f'{name}_m{i}.jpg',quality=90)
    print(name,len(out),'fallback:',[(out_r['num'],out_r['name']) for out_r in out if out_r.get('fb')])
    return out
if __name__=='__main__':
    run(sys.argv[1],crops=[tuple(map(int,c.split(','))) for c in sys.argv[2:]])
