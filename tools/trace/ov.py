import sys; sys.path.insert(0,'.')
from fit import *
from PIL import Image, ImageDraw
def overlay(img,polys,p,out):
    im=Image.open(img).convert('RGB'); d=ImageDraw.Draw(im)
    for poly in polys:
        q=np.array(poly); u,v=tf(p,q[:,0],q[:,1])
        d.line(list(zip(u,v))+[(u[0],v[0])],fill=(255,0,0),width=3)
    im.resize((1440,810)).save(out,quality=88)
