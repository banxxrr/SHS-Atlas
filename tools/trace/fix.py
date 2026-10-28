import re,importlib,sys
def fix(m,boxes,drop_names=(),drop_xy=()):
    """replace all seeds whose number is in boxes (or listed names) with the given boxes"""
    path=f'cfg/{m}.py'; s=open(path).read()
    nums={b[0] for b in boxes if b[0]}
    cfg=importlib.import_module('cfg.'+m); importlib.reload(cfg)
    n=0
    for t in cfg.SEEDS:
        if (t[0] in nums) or ((t[0],t[1]) in drop_names) or any(abs(t[2]-x)<4 and abs(t[3]-y)<4 for x,y in drop_xy):
            pat=re.compile(r"""\(%s,(?:'(?:[^'\\]|\\.)*'|"[^"]*"),%d,%d\),?"""%(re.escape(repr(t[0])),t[2],t[3]))
            s,k=pat.subn('',s,count=1); n+=k
    # drop old boxes with the same numbers
    for b in cfg.BOXES:
        if b[0] in nums:
            pat=re.compile(r"""\(%s,(?:'(?:[^'\\]|\\.)*'|"[^"]*"),%d,%d,%d,%d\),?"""%(re.escape(repr(b[0])),*b[2:6]))
            s,k=pat.subn('',s,count=1)
    s=s.replace("BOXES=[","BOXES=["+"".join(repr(tuple(b))+",\n" for b in boxes),1)
    open(path,'w').write(s); return n
