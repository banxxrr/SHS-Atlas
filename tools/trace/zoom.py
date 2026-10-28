from PIL import Image, ImageDraw
import sys
def zooms(name,x0,y0,x1,y1,tw=480,th=360,z=2):
    im=Image.open(name+'.png').convert('RGB')
    k=0; outs=[]
    for y in range(y0,y1,th):
        for x in range(x0,x1,tw):
            c=im.crop((x,y,x+tw,y+th)).resize((tw*z,th*z),Image.LANCZOS); d=ImageDraw.Draw(c)
            for gx in range((x//25+1)*25,x+tw,25):
                d.line([((gx-x)*z,0),((gx-x)*z,th*z)],fill=(0,190,0) if gx%100==0 else (190,235,190),width=1)
            for gy in range((y//25+1)*25,y+th,25):
                d.line([(0,(gy-y)*z),(tw*z,(gy-y)*z)],fill=(0,190,0) if gy%100==0 else (190,235,190),width=1)
            for gx in range((x//100+1)*100,x+tw,100):
                for gy in range((y//100+1)*100,y+th,100): d.text(((gx-x)*z+3,(gy-y)*z+3),f'{gx},{gy}',fill=(0,120,0))
            fn=f'{name}_z{k}.jpg'; c.save(fn,quality=90); outs.append((fn,x,y)); k+=1
    return outs
if __name__=='__main__':
    n=sys.argv[1]; a=list(map(int,sys.argv[2:6]))
    for o in zooms(n,*a): print(o)
