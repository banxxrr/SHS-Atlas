import json,sys; sys.path.insert(0,'.')
from fit import P
from PIL import Image, ImageDraw
d=json.load(open('plan.json'))
S=5; X0,Z0=-200,-230
for fl in [1,2]:
    W,H=int(390*S),int(460*S)
    im=Image.new('RGB',(W,H),'white'); g=ImageDraw.Draw(im)
    T=lambda pt:((pt[0]-X0)*S,(pt[1]-Z0)*S)
    for h in d['halls']:
        if h['floor']==fl:
            g.polygon([T(q) for q in h['poly']],fill=(240,215,150))
            for hh in h['holes']: g.polygon([T(q) for q in hh],fill=(255,255,255))
    for r in d['rooms']:
        if r['floor']==fl: g.polygon([T(q) for q in r['poly']],fill=(225,235,250),outline=(150,170,200))
    for w_ in d['walls']:
        if w_['floor']==fl:
            g.polygon([T(q) for q in w_['poly']],fill=(30,30,60))
            for hh in w_['holes']: g.polygon([T(q) for q in hh],fill=(255,255,255))
    for k in ['W_OUT','E_OUT','ADD_OUT']: g.line([T(q) for q in P[k]+[P[k][0]]],fill=(255,0,0),width=1)
    im.save(f'wv{fl}.png')
    for name,box in {'west':(-200,-75,-95,225),'east':(0,-230,180,25)}.items():
        c=im.crop(((box[0]-X0)*S,(box[1]-Z0)*S,(box[2]-X0)*S,(box[3]-Z0)*S)); c.thumbnail((1400,1400)); c.save(f'wv{fl}_{name}.jpg',quality=88)
