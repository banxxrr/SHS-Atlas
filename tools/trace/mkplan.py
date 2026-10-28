import json
d=json.load(open('plan.json'))
f=lambda pts:[v for p in pts for v in (round(p[0],2),round(p[1],2))]
R=[[r['floor'],'E1' if r['map']=='E1z' else r['map'],r['num'],r['name'],r['box'],[v for p in r['poly'] for v in (round(p[0],2),round(p[1],2))]] for r in d['rooms']]
H=[[h['floor'],h['map'],f(h['poly']),[f(hh) for hh in h['holes']]] for h in d['halls']]
S=[[s['floor'],s['glass'],round(s['a'][0],2),round(s['a'][1],2),round(s['b'][0],2),round(s['b'][1],2),s['t']] for s in d['segs']]
open('../plan.js','w').write('const PLAN_R='+json.dumps(R,separators=(',',':'),ensure_ascii=False)+';\nconst PLAN_H='+json.dumps(H,separators=(',',':'))+';\nconst PLAN_S='+json.dumps(S,separators=(',',':'))+';\n')
