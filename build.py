"""Build the site from src/: site/index.html (beta front page) and site/map.html (the map). Run: python3 build.py"""
import os
D=os.path.dirname(os.path.abspath(__file__)); S=lambda f: open(os.path.join(D,'src',f),encoding='utf-8').read()
js=S('main.js')
for tag,f in [('/*PUB*/','pub.js'),('/*PLAN*/','plan.js'),('/*DOORS*/','doors.js'),('/*HALLS2*/','halls2.js'),('/*SUITES*/','suites.js'),('/*HALLS*/','halllabels.js'),('/*VLINKS*/','vlinks.js'),('/*NAV*/','nav.js'),('/*NAVUI*/','navui.js')]:
    assert tag in js, tag; js=js.replace(tag,S(f))
k=js.rindex('})();'); js=js[:k]+S('glue.js')+'\n'+js[k:]
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="SHS Atlas: a student-made 3D map of Stevenson High School with every room, walking directions and floor-by-floor views.">
<meta property="og:title" content="SHS Atlas">
<meta property="og:description" content="Find any room at Stevenson High School and get walking directions.">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
'''
shell=S('shell.html')
assert shell.count('<div class="app"')==1
shell=shell.replace('<div class="app"','</head>\n<body>\n<div class="app"')
html=head+shell+js+'\n</script>\n</body>\n</html>\n'
os.makedirs(os.path.join(D,'site'),exist_ok=True)
open(os.path.join(D,'site','map.html'),'w',encoding='utf-8').write(html)
open(os.path.join(D,'site','index.html'),'w',encoding='utf-8').write(S('home.html'))
os.makedirs(os.path.join(D,'site','_dev'),exist_ok=True)
open(os.path.join(D,'site','_dev','console.js'),'w',encoding='utf-8').write(S('devconsole.js'))  # served only with the dev cookie (functions/_middleware.js)
print('site/map.html',len(html)//1024,'KB; site/index.html (beta front page)')
