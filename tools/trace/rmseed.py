import re,sys
def rm(path,nums,extra_boxes):
    s=open(path).read()
    for n in nums:
        s,k=re.subn(r"""\('%s',(?:'[^']*'|"[^"]*"),\d+,\d+\),"""%re.escape(n),'',s)
        if k<1: print('not found',n)
    s=s.replace("BOXES=[","BOXES=["+extra_boxes,1)
    open(path,'w').write(s)
