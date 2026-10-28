import sys; sys.path.insert(0,'.')
from seg2 import *
import re,json
from PIL import ImageDraw
from scipy import ndimage as ndi
NUMRE=re.compile(r'[1-8]\d{3}[A-Za-z]?')
def nums_from(toks,digits,extra=()):
    nums=[]
    for k in toks:
        t=k['t'].strip('.,;:|()[]')
        if not NUMRE.fullmatch(t) or t[0] not in digits: continue
        t=t[:4]+t[4:].upper()
        cx,cy=k['x']+k['w']/2,k['y']+k['h']/2
        if any(n['t']==t and abs(n['cx']-cx)<25 and abs(n['cy']-cy)<15 for n in nums): continue
        nums.append(dict(t=t,cx=cx,cy=cy,h=k['h'],w=k['w'],c=k['c']))
    for e in extra:
        t,cx,cy=e[:3]; nm=e[3] if len(e)>3 else None
        nums.append(dict(t=t,cx=cx,cy=cy,h=14,w=34,manual=1,name=nm,c=99))
    return nums
def build(name,toks,digits,extra=(),drop=()):
    a,wall,corr,white,obst,black=masks(name+'.png'); H,W=wall.shape
    nums=[n for n in nums_from(toks,digits,extra) if not any(n['t']==d[0] and abs(n['cx']-d[1])<40 and abs(n['cy']-d[2])<30 for d in drop)]
    # outside + courtyard markers: white areas connected to frame border/letterbox, and 'Courtyard' words
    edge=np.zeros((H,W),bool); edge[:6]=1; edge[-6:]=1; edge[:,:6]=1; edge[:,-6:]=1
    edge|=ndi.binary_dilation(black,iterations=8)
    outside=white&edge&~obst
    for k in toks:
        if 'ourtyard' in k['t']:
            cv2.circle(outside.view(np.uint8),(int(k['x']+k['w']/2),int(k['y']+k['h']/2)),18,1,-1)
    big=np.zeros_like(outside)
    lab=rooms_ws(obst,[(n['cx'],n['cy']+n['h']*0.3) for n in nums],H,W,extra_markers=outside)
    words=[k for k in toks if re.fullmatch(r"[A-Za-z][A-Za-z.'/&-]*",k['t'].strip(',.:;')) and k['c']>35 and len(k['t'])>1]
    out=[]
    for i,n in enumerate(nums,1):
        ys,xs=np.where(lab==i)
        bb=None if len(xs)<20 else [int(np.percentile(xs,.5)),int(np.percentile(ys,.5)),int(np.percentile(xs,99.5)),int(np.percentile(ys,99.5))]
        if n.get('name') is not None: nmtxt=n['name']
        else:
            nm=[]
            for w in words:
                wx,wy=int(w['x']+w['w']/2),int(w['y']+w['h']/2)
                if 0<=wy<H and 0<=wx<W and wy>n['cy'] and wy<n['cy']+n['h']*3.2 and abs(wx-n['cx'])<max(60,n['w']*2.2) and lab[wy,wx] in (i,0):
                    if not any(abs(o['x']-w['x'])<6 and abs(o['y']-w['y'])<6 for o in nm): nm.append(w)
            nm.sort(key=lambda w:(round(w['y']/7),w['x'])); nmtxt=' '.join(w['t'] for w in nm)
        out.append(dict(num=n['t'],cx=round(n['cx']),cy=round(n['cy']),bb=bb,area=int(len(xs)),name=nmtxt,manual=n.get('manual',0),c=n['c']))
    return a,lab,out
def overlay(a,lab,rooms,out,crop=None):
    rng=np.random.default_rng(1); col=rng.integers(60,230,(lab.max()+1,3)); col[0]=255
    tint=(a*0.55+col[lab]*0.45).astype(np.uint8)
    im=Image.fromarray(tint); d=ImageDraw.Draw(im)
    for r in rooms:
        if r['bb']: d.rectangle(r['bb'],outline=(200,0,0),width=1)
        d.text((r['cx']-14,r['cy']-20),r['num'],fill=(0,0,0))
    if crop: im=im.crop(crop)
    im.save(out,quality=90)
