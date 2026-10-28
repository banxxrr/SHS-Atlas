import numpy as np
from PIL import Image
from scipy import ndimage as ndi
def classes(path):
    a=np.asarray(Image.open(path).convert('RGB')).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    wall=(b-r>45)&(b-g>45)
    white=(r>=246)&(g>=246)&(b>=246)
    return a,wall,white
def fill(mask,x,y):
    lab,n=ndi.label(mask)
    l=lab[y,x]
    if l==0: return None
    ys,xs=np.where(lab==l); return xs.min(),ys.min(),xs.max(),ys.max(),len(xs)
