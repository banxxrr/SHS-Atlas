from PIL import Image, ImageDraw
import sys
def zz(name,x0,y0,x1,y1,z=3,out=None):
    im=Image.open(name+'.png').convert('RGB').crop((x0,y0,x1,y1)); im=im.resize(((x1-x0)*z,(y1-y0)*z),Image.LANCZOS); d=ImageDraw.Draw(im)
    for gx in range((x0//10+1)*10,x1,10):
        d.line([((gx-x0)*z,0),((gx-x0)*z,im.height)],fill=(0,170,0) if gx%50==0 else (215,240,215),width=1)
    for gy in range((y0//10+1)*10,y1,10):
        d.line([(0,(gy-y0)*z),(im.width,(gy-y0)*z)],fill=(0,170,0) if gy%50==0 else (215,240,215),width=1)
    for gx in range((x0//50+1)*50,x1,50):
        for gy in range((y0//50+1)*50,y1,50): d.text(((gx-x0)*z+2,(gy-y0)*z+2),f'{gx},{gy}',fill=(0,100,0))
    im.save(out or f'{name}_zz.jpg',quality=90)
if __name__=='__main__':
    a=sys.argv; zz(a[1],*map(int,a[2:6]),out=a[6])
