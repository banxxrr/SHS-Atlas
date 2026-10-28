import numpy as np, itertools, glob, sys, json
from PIL import Image
TR='./frames/'
def load(k): return np.asarray(Image.open(glob.glob(TR+'*'+k+'.*')[0]).convert('RGB')).astype(np.float32)
SLOTS=[(0,0),(725,0),(1195,0),(0,203),(725,203),(1195,203)]
W,H=710,877
def region(t,ox,oy,x0,x1,y0,y1):
    return t[y0-oy:y1-oy, x0-ox:x1-ox]
def err(ta,sa,tb,sb):
    ax0,ay0=sa;bx0,by0=sb
    x0=max(ax0,bx0);x1=min(ax0+W,bx0+W);y0=max(ay0+60,by0+60);y1=min(ay0+H,by0+H)
    if x1-x0<50 or y1-y0<50: return None
    return float(np.abs(region(ta,ax0,ay0,x0,x1,y0,y1)-region(tb,bx0,by0,x0,x1,y0,y1)).mean())
def solve(keys):
    T={k:load(k) for k in keys}
    best=None
    for perm in itertools.permutations(keys,6):
        e=0;n=0
        for i in range(6):
            for j in range(i+1,6):
                r=err(T[perm[i]],SLOTS[i],T[perm[j]],SLOTS[j])
                if r is not None: e+=r;n+=1
        e/=n
        if best is None or e<best[0]: best=(e,perm)
    return best
def build(perm,out):
    img=np.full((1080,1920,3),255,np.float32)
    for k,(ox,oy) in zip(perm[::-1],SLOTS[::-1]):
        t=load(k); y0=60 if oy==0 else 0
        img[oy+y0:oy+H, ox:ox+W]=t[y0:H,:W]
    Image.fromarray(img.astype(np.uint8)).save(out)
if __name__=='__main__':
    name=sys.argv[1]; keys=sys.argv[2:]
    if len(keys)==6 and name.endswith('!'):
        name=name[:-1]; b=(0,tuple(keys))
    else: b=solve(keys)
    print(name,b); build(b[1],name+'.png')
