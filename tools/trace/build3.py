import sys; sys.path.insert(0,'.')
from seg2 import masks
from build2 import nums_from
import numpy as np, cv2, re, json
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
def comps(name,close=4):
    a,wall,corr,white,obst,black=masks(name+'.png')
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*close+1,2*close+1))
    wc=cv2.morphologyEx(wall.astype(np.uint8),cv2.MORPH_CLOSE,k).astype(bool)|black
    corr2=ndi.binary_opening(corr,iterations=2)
    lab,n=ndi.label(~(wc|corr2))
    return a,lab,corr,white
def build(name,toks,digits,extra=(),drop=(),boxes=(),close=4):
    a,lab,corr,white=comps(name,close); H,W=lab.shape
    nums=[n for n in nums_from(toks,digits,extra) if not any(n['t']==d[0] and abs(n['cx']-d[1])<40 and abs(n['cy']-d[2])<30 for d in drop)]
    words=[k for k in toks if re.fullmatch(r"[A-Za-z][A-Za-z.'/&-]*",k['t'].strip(',.:;')) and k['c']>35 and len(k['t'])>1]
    sizes=np.bincount(lab.ravel())
    out=[]
    for n in nums:
        x,y=int(n['cx']),int(n['cy'])
        cand=[lab[yy,xx] for yy in range(max(0,y-4),min(H,y+5),2) for xx in range(max(0,x-int(n['w']/2)),min(W,x+int(n['w']/2)),2) if lab[yy,xx]>0]
        l=max(set(cand),key=cand.count) if cand else 0
        bb=None; area=0
        if l:
            ys,xs=np.where(lab==l); area=len(xs)
            bb=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
        if n.get('name') is not None: nmtxt=n['name']
        else:
            nm=[]
            for w in words:
                wx,wy=int(w['x']+w['w']/2),int(w['y']+w['h']/2)
                if 0<=wy<H and 0<=wx<W and wy>n['cy'] and wy<n['cy']+n['h']*3.2 and abs(wx-n['cx'])<max(60,n['w']*2.2):
                    if not any(abs(o['x']-w['x'])<6 and abs(o['y']-w['y'])<6 for o in nm): nm.append(w)
            nm.sort(key=lambda w:(round(w['y']/7),w['x'])); nmtxt=' '.join(w['t'] for w in nm)
        out.append(dict(num=n['t'],cx=round(n['cx']),cy=round(n['cy']),bb=bb,lab=int(l),area=int(area),name=nmtxt,manual=n.get('manual',0),c=n['c']))
    # components shared by several different numbers -> flag
    from collections import Counter
    cnt=Counter(r['lab'] for r in out if r['lab'])
    for r in out: r['shared']=cnt[r['lab']]>1 and len(set(o['num'] for o in out if o['lab']==r['lab']))>1
    for b in boxes:
        out.append(dict(num=b[0],name=b[1],bb=list(b[2:6]),cx=(b[2]+b[4])//2,cy=(b[3]+b[5])//2,lab=0,area=(b[4]-b[2])*(b[5]-b[3]),manual=2,c=99,shared=False))
    return a,lab,out
def overlay(a,lab,rooms,out,grid=True):
    rng=np.random.default_rng(3); col=rng.integers(70,235,(lab.max()+1,3)); col[0]=40
    used=set(r['lab'] for r in rooms if r['lab'] and not r['shared'])
    m=np.isin(lab,list(used))
    tint=a.copy(); tint[m]=(a[m]*0.5+col[lab[m]]*0.5).astype(np.uint8)
    sh=np.isin(lab,[r['lab'] for r in rooms if r['shared']])
    tint[sh]=(a[sh]*0.5+np.array([255,0,0])*0.5).astype(np.uint8)
    im=Image.fromarray(tint); d=ImageDraw.Draw(im)
    if grid:
        for x in range(0,a.shape[1],50): d.line([(x,0),(x,a.shape[0])],fill=(0,200,0) if x%100==0 else (170,230,170),width=1)
        for y in range(0,a.shape[0],50): d.line([(0,y),(a.shape[1],y)],fill=(0,200,0) if y%100==0 else (170,230,170),width=1)
        for x in range(0,a.shape[1],100):
            for y in range(0,a.shape[0],100): d.text((x+2,y+2),f'{x},{y}',fill=(0,120,0))
    for r in rooms:
        if r['manual']==2: d.rectangle(r['bb'],outline=(255,0,255),width=2)
        d.text((r['cx']-14,r['cy']-22),r['num'],fill=(200,0,0) if r['shared'] else (0,0,0))
    im.save(out,quality=92)
