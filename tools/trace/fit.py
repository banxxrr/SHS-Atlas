import re,json,numpy as np, sys
sys.path.insert(0,'.')
from seg import classes
from scipy import ndimage as ndi
from scipy.optimize import minimize
src=open('../main.js').read()
def arr(name):
    m=re.search(r'const '+name+r'=(\[.*?\]);\n',src); return json.loads(m.group(1))
P={k:arr(k) for k in ['W_OUT','W_IN','LINK','E_OUT','ADD_OUT','E_COURT']}
def edges(polys,step=0.5):
    pts=[]
    for poly in polys:
        for i in range(len(poly)):
            a=np.array(poly[i]);b=np.array(poly[(i+1)%len(poly)])
            n=max(1,int(np.linalg.norm(b-a)/step))
            for t in np.linspace(0,1,n,endpoint=False): pts.append(a+(b-a)*t)
    return np.array(pts)
def tf(p,X,Y):  # world (x,z) -> px,py ; p=(s,x0,z0,th)
    s,x0,z0,th=p
    c,sn=np.cos(th),np.sin(th)
    dx=X-x0; dz=z0-Y
    u=( c*dz + sn*dx)/s; v=(-sn*dz + c*dx)/s
    return u,v
def inv(p,px,py):
    s,x0,z0,th=p; c,sn=np.cos(th),np.sin(th)
    dz=(c*px - sn*py)*s; dx=(sn*px + c*py)*s
    return x0+dx, z0-dz
def run(img,polys,p0,valid=None,trunc=12):
    a,wall,white=classes(img)
    dt=ndi.distance_transform_edt(~wall)
    H,W=wall.shape
    pts=edges(polys)
    def loss(p):
        u,v=tf(p,pts[:,0],pts[:,1])
        ok=(u>=0)&(u<W-1)&(v>=0)&(v<H-1)
        if valid is not None: ok&=valid(u,v)
        if ok.sum()<50: return 1e3
        d=dt[v[ok].astype(int),u[ok].astype(int)]
        return np.minimum(d,trunc).mean() + 0.002*(len(u)-ok.sum())
    best=None
    for ds in [0.97,1,1.03]:
        q=list(p0); q[0]*=ds
        r=minimize(loss,q,method='Nelder-Mead',options={'xatol':1e-4,'fatol':1e-4,'maxiter':4000,'initial_simplex':None})
        if best is None or r.fun<best.fun: best=r
    return best
if __name__=='__main__':
    pass
