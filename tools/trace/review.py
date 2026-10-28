import json,sys
from PIL import Image, ImageDraw
def sheet(m,nums=None,pad=25,z=3,cols=3,maxw=1500):
    R=json.load(open(m+'_rooms.json')); src=Image.open(m+'.png').convert('RGB')
    sel=[r for r in R if not r.get('box') and r.get('shape')!='rect'] if nums is None else [r for r in R if (r['num'] or r['name']) in nums]
    tiles=[]
    for r in sel:
        xs=[p[0] for p in r['poly']]; ys=[p[1] for p in r['poly']]
        x0,y0,x1,y1=max(0,min(xs)-pad),max(0,min(ys)-pad),min(src.width,max(xs)+pad),min(src.height,max(ys)+pad)
        c=src.crop((x0,y0,x1,y1)).resize(((x1-x0)*z,(y1-y0)*z),Image.LANCZOS); d=ImageDraw.Draw(c)
        for gx in range((x0//10+1)*10,x1,10): d.line([((gx-x0)*z,0),((gx-x0)*z,8)],fill=(0,150,0),width=2)
        for gy in range((y0//10+1)*10,y1,10): d.line([(0,(gy-y0)*z),(8,(gy-y0)*z)],fill=(0,150,0),width=2)
        d.polygon([((p[0]-x0)*z,(p[1]-y0)*z) for p in r['poly']],outline=(255,0,0),width=2)
        d.rectangle([0,0,260,16],fill=(255,255,255)); d.text((3,2),f"{r['num']} {r['name'][:18]} x{x0}-{x1} y{y0}-{y1}",fill=(0,0,0))
        tiles.append(c)
    return tiles
def pack(tiles,out,maxw=1500):
    rows=[];row=[];w=0
    for t in tiles:
        if w+t.width>maxw and row: rows.append(row);row=[];w=0
        row.append(t);w+=t.width+6
    if row: rows.append(row)
    H=sum(max(t.height for t in r)+6 for r in rows); im=Image.new('RGB',(maxw,H),'white'); y=0
    for r in rows:
        x=0
        for t in r: im.paste(t,(x,y)); x+=t.width+6
        y+=max(t.height for t in r)+6
    im.save(out,quality=88); return im.size
if __name__=='__main__':
    m=sys.argv[1]; t=sheet(m); n=int(sys.argv[2]) if len(sys.argv)>2 else 8
    for k in range(0,len(t),n): print(pack(t[k:k+n],f'rv_{m}_{k//n}.jpg'))
