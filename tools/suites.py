# Merge the back rooms of a suite into the suite: one space, no inner walls or doors.
import json,re
from shapely.geometry import Polygon, LineString, Point
from shapely.ops import unary_union
from shapely.validation import make_valid
d=json.load(open('plan_dump.json')); D=json.load(open('doors_dump.json')); S=json.load(open('walls_dump.json'))
poly=lambda f:make_valid(Polygon([(f[i],f[i+1]) for i in range(0,len(f),2)])).buffer(0)
MERGE=re.compile(r"^$|^room$|office|storage|mdf|idf|equipment|wash|food prep|kitchen|conf|work|phone|psych|speech|shower|drying|changing|dressing|locker room|restroom|sound|light|tub|mechanical|electrical|control|cogen|ada|quiet room|stage storage|band storage|^staff",re.I)
SKIP={'5026','1000','1208'}
rooms={}
for r in d['R']:
    if r[2]: rooms[(r[0],r[2])]=r
groups=[]
for (f,num),r in rooms.items():
    if not re.fullmatch(r'\d{4}',num) or num in SKIP: continue
    kids=[k for (ff,n),k in rooms.items() if ff==f and re.fullmatch(num+r'([A-Z]|-\d)',n) and MERGE.search(k[3].strip())]
    if kids: groups.append((f,num,r,kids))
merge=[]; wdrop=set(); ddrop=set(); shapes=[]; loose=[]
for f,num,r,kids in groups:
    U=unary_union([poly(r[5])]+[poly(k[5]) for k in kids]).buffer(.3,join_style=2).buffer(-.3,join_style=2)
    inner=U.buffer(-.35,join_style=2)
    for k in kids: merge.append([f,k[2],num])
    # unnumbered spaces inside the suite (Front Desk…) join it too
    for r2 in d['R']:
        if r2[0]==f and not r2[2] and r2[3] and U.buffer(.2).contains(poly(r2[5]).centroid) and MERGE.search(r2[3].strip()+' office') :
            c=poly(r2[5]).centroid; loose.append([f,r2[3],round(c.x,2),round(c.y,2),num]); U=unary_union([U,poly(r2[5])]).buffer(.3,join_style=2).buffer(-.3,join_style=2)
    g=U if U.geom_type=='Polygon' else max(U.geoms,key=lambda x:x.area)
    g=g.simplify(.15)
    shapes.append([f,num,[round(v,2) for xy in list(g.exterior.coords)[:-1] for v in xy]])
    inner=U.buffer(-.35,join_style=2)
    for i,s in enumerate(S):
        if s[0]!=f: continue
        L=LineString([(s[2],s[3]),(s[4],s[5])])
        if L.length>0 and L.intersection(inner).length>=.5*L.length: wdrop.add(i)
    for i,dd in enumerate(D['DOORS']):
        if dd[0]==f and inner.contains(Point((dd[1]+dd[3])/2,(dd[2]+dd[4])/2)): ddrop.add(i)
print('groups',len(groups),'merged rooms',len(merge),'walls dropped',len(wdrop),'doors dropped',len(ddrop))
open('suites.js','w').write('/* suites: back rooms merged into their suite [floor,child,parent]; inner walls and doors removed (suites.py) */\nconst SUITE_MERGE='+json.dumps(merge)+';\nconst SUITE_LOOSE='+json.dumps(loose)+';\nconst SUITE_SHAPE='+json.dumps(shapes)+';\nconst WALL_DROP=new Set('+json.dumps(sorted(wdrop))+');\nconst DOOR_DROP=new Set('+json.dumps(sorted(ddrop))+');\n')
