# Smooth hallways: fill the jagged slivers between hallway floor and the walls/rooms, then straighten the edges.
import json
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely.validation import make_valid
d=json.load(open('plan_dump.json'))
def poly(flat,holes=()):
    p=Polygon([(flat[i],flat[i+1]) for i in range(0,len(flat),2)],[[(h[i],h[i+1]) for i in range(0,len(h),2)] for h in holes])
    return make_valid(p).buffer(0)
out=[]
for f in sorted({h[0] for h in d['H']}):
    rooms=unary_union([poly(r[5]) for r in d['R'] if r[0]==f and len(r[5])>=6])
    halls=[(h[1],poly(h[2],h[3] if len(h)>3 else [])) for h in d['H'] if h[0]==f]
    allh=unary_union([g for _,g in halls])
    interior=unary_union([rooms,allh]).buffer(1.1,join_style=2).buffer(-1.1,join_style=2)   # close gaps up to ~2 m (wall zones)
    newh=interior.difference(rooms.buffer(-0.05))
    # keep only pieces touching an original hallway (don't turn leftover closets into hall)
    pieces=[g for g in (newh.geoms if hasattr(newh,'geoms') else [newh]) if g.area>2 and g.intersects(allh.buffer(-0.1))]
    newh=unary_union(pieces).buffer(-0.12,join_style=2).buffer(0.12,join_style=2).simplify(0.3,preserve_topology=True)
    before=sum(len(g.exterior.coords) for _,g in halls if hasattr(g,'exterior'))
    for g in (newh.geoms if hasattr(newh,'geoms') else [newh]):
        if g.geom_type!='Polygon' or g.area<2: continue
        ext=[round(v,2) for xy in list(g.exterior.coords)[:-1] for v in xy]
        hol=[[round(v,2) for xy in list(r.coords)[:-1] for v in xy] for r in g.interiors if Polygon(r).area>1.5]
        mp=next((m for m,gg in halls if gg.intersects(g)),'')
        out.append([f,mp,ext,hol])
    print(f,'halls',len(halls),'->',sum(1 for o in out if o[0]==f),'area',round(allh.area),'->',round(newh.area))
open('halls2.js','w').write('/* hallways smoothed: gaps to walls filled, edges straightened (halls_fix.py) */\nconst PLAN_H2='+json.dumps(out,separators=(',',':'))+';\n')
