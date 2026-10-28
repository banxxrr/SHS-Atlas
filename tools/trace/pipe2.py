import sys, importlib; sys.path.insert(0,'.')
from seg2 import masks, rooms_ws
import numpy as np, cv2, json
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
def run(name,close=2,crops=None):
    cfg=importlib.import_module('cfg.'+name)
    a,wall,corr,white,obst,black=masks(name+'.png'); H,W=wall.shape
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*close+1,2*close+1))
    obst=obst|cv2.morphologyEx(wall.astype(np.uint8),cv2.MORPH_CLOSE,k).astype(bool)
    edge=np.zeros((H,W),bool); edge[:6]=1; edge[-6:]=1; edge[:,:6]=1; edge[:,-6:]=1
    edge|=ndi.binary_dilation(black,iterations=8)
    blk=(white&edge&~obst).astype(np.uint8)
    for c in getattr(cfg,'COURTS',[]): cv2.circle(blk,c,18,1,-1)
    for b in cfg.BOXES: cv2.rectangle(blk,(b[2],b[3]),(b[4],b[5]),1,-1)
    S=cfg.SEEDS
    lab=rooms_ws(obst,[(s[2],s[3]) for s in S],H,W,extra_markers=blk.astype(bool))
    rooms=[]
    for i,s in enumerate(S,1):
        mk=(lab==i)
        if mk.sum()<15:
            mk=np.zeros((H,W),bool); mk[s[3]-6:s[3]+7,s[2]-6:s[2]+7]=True
        rooms.append(dict(num=s[0],name=s[1],mask=mk,seed=[s[2],s[3]]))
    for b in cfg.BOXES:
        mk=np.zeros((H,W),bool); mk[b[3]:b[5]+1,b[2]:b[4]+1]=True
        rooms.append(dict(num=b[0],name=b[1],mask=mk,box=1))
    def bbox(m):
        ys,xs=np.where(m); return [int(np.percentile(xs,.5)),int(np.percentile(ys,.5)),int(np.percentile(xs,99.5)),int(np.percentile(ys,99.5))]
    for r in rooms: r['bb']=bbox(r['mask'])
    out=[]
    for r in rooms:
        m=next((q for q in out if r['num'] and q['num']==r['num'] and q['name']==r['name'] and not (r['bb'][0]>q['bb'][2]+15 or r['bb'][2]<q['bb'][0]-15 or r['bb'][1]>q['bb'][3]+15 or r['bb'][3]<q['bb'][1]-15)),None)
        if m:
            m['mask']=m['mask']|r['mask']; m['bb']=bbox(m['mask'])
        else: out.append(r)
    for r in out:
        mk=r['mask'].astype(np.uint8)
        mk=cv2.morphologyEx(mk,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
        mk=cv2.morphologyEx(mk,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)) if mk.sum()>400 else mk
        cs,_=cv2.findContours(mk,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        if not cs: r['poly']=None; continue
        c=max(cs,key=cv2.contourArea)
        ap=cv2.approxPolyDP(c,2.0,True)[:,0,:]
        r['poly']=ap.tolist(); r['area']=int(r['mask'].sum())
        del r['mask']
    json.dump(out,open(name+'_rooms.json','w'))
    # overlay
    rng=np.random.default_rng(5); col=rng.integers(60,235,(lab.max()+1,3)); col[0]=255
    m=lab>0; t=a.copy(); t[m]=(a[m]*0.45+col[lab[m]]*0.55).astype(np.uint8)
    im=Image.fromarray(t); d=ImageDraw.Draw(im)
    for r in out:
        if r.get('poly'): d.polygon([tuple(p) for p in r['poly']],outline=(255,0,255) if r.get('box') else (220,0,0))
        d.text((r['bb'][0]+2,r['bb'][1]+1),r['num'] or '·',fill=(0,0,160))
    im.save(name+'_m.jpg',quality=92)
    if crops:
        for i,c in enumerate(crops): im.crop(c).resize(((c[2]-c[0])*3//2,(c[3]-c[1])*3//2)).save(f'{name}_m{i}.jpg',quality=90)
    small=[r for r in out if r.get('area',0)<200 and not r.get('box')]
    print(name,len(out),'tiny:',[(r['num'],r['name']) for r in small])
    return out
if __name__=='__main__':
    run(sys.argv[1],crops=[tuple(map(int,c.split(','))) for c in sys.argv[2:]])
