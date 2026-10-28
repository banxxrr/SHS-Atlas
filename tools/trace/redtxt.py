import numpy as np, cv2, subprocess, json, sys
from PIL import Image
def red_labels(name):
    a=np.asarray(Image.open(name+'.png').convert('RGB')).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    m=((r>170)&(g<150)&(b<150)&(r-g>60)).astype(np.uint8)
    # route line is dark maroon: exclude low-brightness
    k=cv2.getStructuringElement(cv2.MORPH_RECT,(9,5))
    d=cv2.dilate(m,k)
    n,lab,st,_=cv2.connectedComponentsWithStats(d)
    out=[]
    for i in range(1,n):
        x,y,w,h,A=st[i]
        if A<60 or w<8 or h<6 or w>260 or h>200: continue
        if m[y:y+h,x:x+w].sum()<25: continue
        crop=255-np.clip(m[y:y+h,x:x+w]*255,0,255).astype(np.uint8)
        vert=h>w*1.6
        if vert: crop=np.rot90(crop,-1)
        crop=cv2.copyMakeBorder(cv2.resize(crop,None,fx=4,fy=4,interpolation=cv2.INTER_CUBIC),20,20,20,20,cv2.BORDER_CONSTANT,value=255)
        cv2.imwrite('_r.png',crop)
        t=subprocess.run(['tesseract','_r.png','-','--psm','6'],capture_output=True,text=True).stdout.strip().replace('\n',' / ')
        out.append(dict(x=int(x+w/2),y=int(y+h/2),w=int(w),h=int(h),vert=bool(vert),t=t))
    return out
if __name__=='__main__':
    for m in sys.argv[1:]:
        L=red_labels(m); json.dump(L,open(m+'_red.json','w'))
        print(m,len(L))
        for l in L: print(' ',l['x'],l['y'],'V' if l['vert'] else 'H',repr(l['t']))
