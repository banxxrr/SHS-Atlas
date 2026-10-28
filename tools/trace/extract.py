import numpy as np, subprocess, csv, re, json, sys
from PIL import Image, ImageOps
from scipy import ndimage as ndi
def segment(path):
    a=np.asarray(Image.open(path).convert('RGB')).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]; m=a.mean(2); sat=a.max(2)-a.min(2)
    wall=(b-np.maximum(r,g)>30)&(m<215)
    red=(r-np.maximum(g,b)>40)
    corr=(sat<16)&(m>=208)&(m<=228.5)&~wall
    white=(m>=248)
    room=(~wall)&(~corr)&(~white)&(~red)&(m>20)   # includes ink/text
    lab,n=ndi.label(room)
    return a,lab,corr,wall,white
def ocr(path,tag,scale=3,psm='11',thr=None):
    im=Image.open(path).convert('L')
    im=im.resize((im.width*scale,im.height*scale),Image.LANCZOS)
    if thr: im=im.point(lambda v:255 if v>thr else 0)
    tmp=f'/tmp/_{tag}.png'; im.save(tmp)
    subprocess.run(['tesseract',tmp,tmp[:-4],'--psm',psm,'-c','tessedit_create_tsv=1'],capture_output=True)
    out=[]
    for d in csv.DictReader(open(tmp[:-4]+'.tsv'),delimiter='\t',quoting=3):
        t=(d['text'] or '').strip()
        if not t: continue
        x,y,w,h=[int(d[k])/scale for k in ['left','top','width','height']]
        out.append(dict(t=t,x=x,y=y,w=w,h=h,c=float(d['conf'])))
    return out
