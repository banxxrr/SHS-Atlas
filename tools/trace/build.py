import sys; sys.path.insert(0,'.')
from extract import *
from PIL import ImageDraw
NUMRE=re.compile(r'[1-8]\d{3}[A-Za-z]?')
def build(name,toks,extra_nums=()):
    a,lab,corr,wall,white=segment(name+'.png')
    H,W=lab.shape
    nums=[]
    for k in toks:
        t=k['t'].strip('.,;:|()[]')
        if not NUMRE.fullmatch(t): continue
        t=t[:4]+t[4:].upper()
        cx,cy=k['x']+k['w']/2,k['y']+k['h']/2
        if any(n['t']==t and abs(n['cx']-cx)<25 and abs(n['cy']-cy)<15 for n in nums): continue
        nums.append(dict(t=t,cx=cx,cy=cy,h=k['h'],w=k['w']))
    for t,cx,cy in extra_nums: nums.append(dict(t=t,cx=cx,cy=cy,h=12,w=30,manual=1))
    words=[k for k in toks if re.fullmatch(r"[A-Za-z][A-Za-z.'/&-]*",k['t'].strip(',.:;')) and k['c']>30]
    rooms=[]
    for n in nums:
        x,y=int(n['cx']),int(n['cy'])
        best=None
        for dy in range(-6,7,2):
            for dx in range(-int(n['w']/2),int(n['w']/2)+1,3):
                yy,xx=y+dy,x+dx
                if 0<=yy<H and 0<=xx<W and lab[yy,xx]>0:
                    best=lab[yy,xx]; break
            if best: break
        bb=None
        if best:
            ys,xs=np.where(lab==best)
            bb=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
        nm=[]
        if bb:
            for w in words:
                wx,wy=w['x']+w['w']/2,w['y']+w['h']/2
                if bb[0]<=wx<=bb[2] and bb[1]<=wy<=bb[3] and wy>n['cy']-2 and lab[int(min(H-1,wy)),int(min(W-1,wx))] in (best,0):
                    if not any(abs(o['x']-w['x'])<6 and abs(o['y']-w['y'])<6 for o in nm): nm.append(w)
            nm.sort(key=lambda w:(round(w['y']/8),w['x']))
        rooms.append(dict(num=n['t'],cx=n['cx'],cy=n['cy'],bb=bb,name=' '.join(w['t'] for w in nm),manual=n.get('manual',0)))
    return a,rooms
def overlay(name,a,rooms,out,scale=1.0):
    im=Image.fromarray(a.astype(np.uint8)); d=ImageDraw.Draw(im)
    for r in rooms:
        if r['bb']:
            x0,y0,x1,y1=r['bb']; big=(x1-x0)*(y1-y0)>120000
            d.rectangle([x0,y0,x1,y1],outline=(255,0,0) if not big else (255,140,0),width=2)
        d.text((r['cx']-12,r['cy']+8),r['num'],fill=(0,160,0))
    im.save(out,quality=90)
