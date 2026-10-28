import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
from skimage.segmentation import watershed
def masks(path):
    a=np.asarray(Image.open(path).convert('RGB'))
    ai=a.astype(int); r,g,b=ai[...,0],ai[...,1],ai[...,2]
    black=(ai.mean(2)<25)
    black=ndi.binary_opening(black,iterations=3)  # letterbox only, not text
    wall=((b-np.maximum(r,g)>28)&(ai.mean(2)<225))
    wall=ndi.binary_dilation(wall,iterations=1)|black
    ink=((ai.mean(2)<212)|(ai.max(2)-ai.min(2)>40))&~wall
    ink=ndi.binary_dilation(ink,iterations=1).astype(np.uint8)
    clean=cv2.inpaint(np.ascontiguousarray(a),ink,3,cv2.INPAINT_TELEA)
    med=cv2.medianBlur(clean,5).astype(int)
    m=med.mean(2); sat=med.max(2)-med.min(2)
    corr=(sat<18)&(m>=205)&(m<=229.5)
    white=(m>=248)
    obst=wall|corr
    return a,wall,corr,white,obst,black
def rooms_ws(obst,seeds,H,W,extra_markers=None):
    dist=ndi.distance_transform_edt(~obst)
    mk=np.zeros((H,W),np.int32)
    for i,(x,y) in enumerate(seeds,1):
        x=int(min(W-1,max(0,x)));y=int(min(H-1,max(0,y)))
        if obst[y,x]:
            y0,x0=max(0,y-12),max(0,x-25)
            ys,xs=np.where(~obst[y0:y+13,x0:x+26])
            if len(ys)==0: continue
            j=np.argmin((ys+y0-y)**2+((xs+x0-x)**2)*0.3); y=y0+ys[j]; x=x0+xs[j]
        cv2.circle(mk,(int(x),int(y)),3,i,-1)
    if extra_markers is not None: mk[extra_markers&(mk==0)]=-1
    mk[obst]=0
    lab=watershed(-dist,mk,mask=~obst)
    lab[lab<0]=0
    return lab
