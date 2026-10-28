import sys; sys.path.insert(0,'.')
from seg2 import masks, rooms_ws
from build2 import nums_from
import numpy as np, cv2, re, json
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
def build(name,toks,digits,extra=(),drop=(),boxes=(),names={},close=2):
    a,wall,corr,white,obst,black=masks(name+'.png'); H,W=wall.shape
    if close:
        k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*close+1,2*close+1))
        obst=obst|cv2.morphologyEx(wall.astype(np.uint8),cv2.MORPH_CLOSE,k).astype(bool)
    nums=[n for n in nums_from(toks,digits,extra) if not any(n['t']==d[0] and abs(n['cx']-d[1])<40 and abs(n['cy']-d[2])<30 for d in drop)]
    edge=np.zeros((H,W),bool); edge[:6]=1; edge[-6:]=1; edge[:,:6]=1; edge[:,-6:]=1
    edge|=ndi.binary_dilation(black,iterations=8)
    outside=(white&edge&~obst).astype(np.uint8)
    for k in toks:
        if 'ourtyard' in k['t']: cv2.circle(outside,(int(k['x']+k['w']/2),int(k['y']+k['h']/2)),18,1,-1)
    for b in boxes: cv2.rectangle(outside,(b[2],b[3]),(b[4],b[5]),1,-1)   # boxes block flooding
    lab=rooms_ws(obst,[(n['cx'],n['cy']) for n in nums],H,W,extra_markers=outside.astype(bool))
    words=[k for k in toks if re.fullmatch(r"[A-Za-z][A-Za-z.'/&-]*",k['t'].strip(',.:;')) and k['c']>35 and len(k['t'])>1]
    out=[]
    for i,n in enumerate(nums,1):
        ys,xs=np.where(lab==i)
        bb=None if len(xs)<30 else [int(np.percentile(xs,.5)),int(np.percentile(ys,.5)),int(np.percentile(xs,99.5)),int(np.percentile(ys,99.5))]
        if n.get('name') is not None: nmtxt=n['name']
        else:
            nm=[]
            for w in words:
                wx,wy=int(w['x']+w['w']/2),int(w['y']+w['h']/2)
                if 0<=wy<H and 0<=wx<W and wy>n['cy'] and wy<n['cy']+n['h']*3.2 and abs(wx-n['cx'])<max(60,n['w']*2.2) and lab[wy,wx] in (i,0):
                    if not any(abs(o['x']-w['x'])<6 and abs(o['y']-w['y'])<6 for o in nm): nm.append(w)
            nm.sort(key=lambda w:(round(w['y']/7),w['x'])); nmtxt=' '.join(w['t'] for w in nm)
        out.append(dict(num=n['t'],cx=round(n['cx']),cy=round(n['cy']),bb=bb,area=int(len(xs)),name=nmtxt,manual=n.get('manual',0),i=i))
    for b in boxes:
        out.append(dict(num=b[0],name=b[1],bb=list(b[2:6]),cx=(b[2]+b[4])//2,cy=(b[3]+b[5])//2,area=(b[4]-b[2])*(b[5]-b[3]),manual=2,i=0))
    # merge duplicates of the same number whose boxes touch
    merged=[]
    for r in out:
        m=next((q for q in merged if q['num']==r['num'] and q['bb'] and r['bb'] and not (r['bb'][0]>q['bb'][2]+12 or r['bb'][2]<q['bb'][0]-12 or r['bb'][1]>q['bb'][3]+12 or r['bb'][3]<q['bb'][1]-12)),None)
        if m:
            m['bb']=[min(m['bb'][0],r['bb'][0]),min(m['bb'][1],r['bb'][1]),max(m['bb'][2],r['bb'][2]),max(m['bb'][3],r['bb'][3])]
            if len(r['name'])>len(m['name']): m['name']=r['name']
            m.setdefault('also',[]).append(r['i'])
        else: merged.append(r)
    for r in merged:
        if r['num'] in names: r['name']=names[r['num']]
    return a,lab,merged
def overlay(a,lab,rooms,out):
    rng=np.random.default_rng(3); col=rng.integers(70,235,(lab.max()+1,3)); col[0]=255
    m=lab>0; tint=a.copy(); tint[m]=(a[m]*0.5+col[lab[m]]*0.5).astype(np.uint8)
    im=Image.fromarray(tint); d=ImageDraw.Draw(im)
    for x in range(0,a.shape[1],50): d.line([(x,0),(x,a.shape[0])],fill=(0,170,0) if x%100==0 else (175,225,175),width=1)
    for y in range(0,a.shape[0],50): d.line([(0,y),(a.shape[1],y)],fill=(0,170,0) if y%100==0 else (175,225,175),width=1)
    for x in range(0,a.shape[1],100):
        for y in range(0,a.shape[0],100): d.text((x+2,y+2),f'{x},{y}',fill=(0,110,0))
    for r in rooms:
        if r['bb']: d.rectangle(r['bb'],outline=(255,0,255) if r['manual']==2 else (200,0,0),width=2 if r['manual']==2 else 1)
        d.text((r['cx']-14,r['cy']-22),r['num'],fill=(0,0,200) if r['manual'] else (0,0,0))
    im.save(out,quality=92)
def run(name,digits,fix,crops):
    toks=json.load(open(name+'_tok.json'))
    a,lab,rooms=build(name,toks,digits,**fix)
    overlay(a,lab,rooms,name+'_g.jpg')
    im=Image.open(name+'_g.jpg')
    for i,c in enumerate(crops): im.crop(c).save(f'{name}_g{i}.jpg')
    json.dump(rooms,open(name+'_rooms.json','w'))
    return rooms
