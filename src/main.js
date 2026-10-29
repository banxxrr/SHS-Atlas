(() => {
const FH = 4.4, PLATE = .3, P = 9.5;
const rooms = []; let uid = 0;
let mode='all', selected=null, hovered=null;

const TYPES = {
  class:{label:'Classroom', tok:'--t-class'},
  lab:{label:'Lab & tech', tok:'--t-lab'},
  arts:{label:'Fine & performing arts', tok:'--t-arts'},
  ath:{label:'Athletics', tok:'--t-ath'},
  comm:{label:'Commons & dining', tok:'--t-comm'},
  svc:{label:'Offices & services', tok:'--t-svc'},
  lib:{label:'Library & study', tok:'--t-lib'},
  link:{label:'Walkway', tok:'--t-link'},
  out:{label:'Outdoors', tok:'--t-out'},
  unk:{label:'Unconfirmed room', tok:'--t-unk'},
  bldg:{label:'Building', tok:'--t-unk'}
};
const SRC = {
  sub:['2023–24 Substitute Handbook','https://resources.finalsite.net/images/v1692293380/d125org/qbg90awiyayoajiby2qa/SubstituteHandbook2023-2024.pdf'],
  cat:['Co-Curricular Catalog (2019)','https://resources.finalsite.net/images/v1553618385/d125org/kkahyrle0stixafffsgq/Co-Curricular_Catalog_Complete.pdf'],
  sst:['Student Services page','https://www.d125.org/student-life/student-services'],
  test:['Testing Center page','https://www.d125.org/academics/testing-center'],
  tut:['Tutoring page','https://www.d125.org/academics/tutoring'],
  nurse:['Health Services page','https://www.d125.org/student-life/health-services'],
  arts:['Fine Arts events page','https://www.d125.org/events/fine-arts'],
  vis:['Visit Us page','https://www.d125.org/about/visit-us'],
  pwc:['Patriot Wellness Center page','https://www.d125.org/student-life/patriot-wellness-center'],
  store:['School Store page','https://www.d125.org/student-life/patriot-school-store'],
  ath:['Athletic Facilities page','https://athletics.d125.org/facilities'],
  nat:['Patriot Natatorium team page','https://www.gomotionapp.com/team/ilpac/page/team-info/pool-location'],
  dh19:['Daily Herald, 2019 addition','https://dailyherald.com/?p=204792'],
  dh20:['Daily Herald, field house plans','https://www.dailyherald.com/news/20200114/stevenson-high-school-details-plans-for-massive-expansion'],
  ilgbc:['Illinois Green Alliance case study','https://illinoisgreenalliance.org/wp-content/uploads/2023/06/Adlai-E.-Stevenson-EBA-I-vFINAL.pdf'],
  gil:['Gilbane project page','https://www.gilbaneco.com/projects/adlai-e-stevenson-high-school-district-125/'],
  entry:['SchoolDesigns: new entry addition','https://schooldesigns.com/Projects/adlai-e-stevenson-high-school-new-entry-addition'],
  osm:['OpenStreetMap outlines','https://www.openstreetmap.org/relation/9731465'],
  gmap:['Google Maps satellite & Street View','https://www.google.com/maps/place/Adlai+E.+Stevenson+High+School'],
  ccc:['College Career Center page','https://www.d125.org/academics/college-career-center'],
  fcs:['Family & Consumer Sciences page','https://www.d125.org/academics/academic-divisions/applied-arts/family-consumer-sciences'],
  guide:['2025–26 Student Guidebook','https://resources.finalsite.net/images/v1723474393/d125org/jzz6df6cvuhximi0k6re/StudentGuidebookFinal.pdf'],
  cset:['Computer Science, Engineering & Technology page','https://www.d125.org/academics/academic-divisions/computer-science-engineering-and-technology'],
  math:['SHS Math Team blog','https://shsmathteam.com/blog/'],
  stm:['The Statesman (student newspaper)','https://www.statesmanshs.org/'],
  carts:['Communication Arts page','https://www.d125.org/academics/academic-divisions/communication-arts'],
  yb:['Ambassador Yearbook page','https://www.d125.org/student-life/activities/clubs/media/ambassador-yearbook'],
  clubs:['Club pages on d125.org','https://www.d125.org/student-life/activities/clubs'],
  ody:['Odyssey event page','https://www.d125.org/events/odyssey'],
  tech:['Tech Services page','https://www.d125.org/student-life/tech-services'],
  abs:['Reporting an Absence page','https://www.d125.org/parents/reporting-an-absence'],
  boost:['Sports Boosters page','https://www.d125.org/parents/parent-groups/sports-boosters'],
  ppa:['Patriot Parent Association page','https://www.d125.org/parents/parent-groups/patriot-parent-association'],
  fgen:['First-Generation Families page','https://www.d125.org/academics/college-career-center/college/first-generation-families'],
  varts:['Visual Arts page','https://www.d125.org/academics/academic-divisions/fine-arts/visual-arts'],
  tran:['Transfer Students page','https://www.d125.org/student-life/transfer-students'],
  wiki:['Wikipedia history','https://en.wikipedia.org/wiki/Stevenson_High_School_(Lincolnshire,_Illinois)'],
  plan:['Official floor plans shown in the SHSMaps demo (shsmaps.com, now offline), Dec 2023','https://www.youtube.com/watch?v=54fehKVMXkc'],
  pdf3:['District 125 campus map PDF, school year 2023–24','https://www2.d125.org/SMART/maps/shs_campus_map.pdf'],
  poster:['Posted fire evacuation plan, West Building level 1 (photo)',''],
  poster2:['Posted fire evacuation plan, West Building level 2 (photo)',''],
  photo3:['Door signs photographed on East level 3 by a student','']
};
const BLD = {West:'West Building', Link:'The Link', Front:'Glass Commons wing', Arts:'Performing arts wing', FH:'Field House & Natatorium', East:'East Building', Add:'East Building · 2019 addition', Site:'Grounds'};

function add(o){ o.id='r'+(uid++); o.span=o.span||1; o.kind=o.kind||'room'; rooms.push(o); return o; }
function slab(kind,bld,floor,x0,x1,z0,z1){ return add({kind,bld,floor,type:kind,x0,x1,z0,z1,name:''}); }
function space(bld,floor,name,type,x0,x1,z0,z1,ex={}){ return add(Object.assign({bld,floor,name,type,num:'',x0,x1,z0,z1,conf:true},ex)); }
const pad2=n=>String(n).padStart(2,'0');

/*PUB*/

/* ================= REAL FOOTPRINTS (OpenStreetMap, meters; x = east, z = south; origin 42.1993 N, 87.9455 W) ================= */
const W_OUT=[[-103.5,3.5],[-106,4],[-108,4],[-108,21.5],[-116,21.5],[-116,56],[-104,60.5],[-104.5,92.5],[-97.5,96],[-92,98],[-96,98],[-98.5,98],[-99,214],[-101,219],[-103.5,222],[-191.5,222],[-191,201],[-150.5,202],[-150.5,194],[-193.5,193],[-193,-68.5],[-181,-68.5],[-181,-60.5],[-144.5,-60],[-144.5,-17],[-138,-17],[-137.5,-23],[-135,-25.5],[-132.5,-23.5],[-133,-20.5],[-132.5,-16.5],[-104,-16],[-104,-11.5]];
const W_IN=[[[-145.5,127],[-146,142],[-123.5,142],[-123,127]],[[-172,153],[-172,168.5],[-150,168.5],[-150,153]],[[-145.5,167],[-145.5,182],[-123.5,182.5],[-123.5,167]]];
const LINK=[[-104,-11.5],[-86.5,-11.5],[-86.5,-15],[-104,-15.5]];
const E_OUT=[[-85.5,12.5],[-35,12.5],[-35,1],[-34,1],[-33.5,-4],[-32.5,-8.5],[-30.5,-12.5],[-27.5,-16.5],[-24,-20],[-19.5,-23],[-13.5,-23.5],[-13,-22],[-17,-20.5],[-20.5,-18],[-24,-15.5],[-22,-13.5],[-19,-16],[-16,-17.5],[-13,-18.5],[-10,-19.5],[-5.5,-19.5],[0.5,-18.5],[5,-16],[8.5,-13],[11,-15.5],[5.5,-19.5],[0,-22],[0,-23],[5,-21],[8.5,-27],[10.5,-25.5],[14.5,-15],[19.5,-2.5],[20.5,-1.5],[19.5,-1.5],[19.5,13.5],[20.5,13.5],[21,14],[24.5,14.5],[24.5,22],[47.5,22],[47.5,21],[59.5,21],[59.5,0.5],[79,0.5],[79.5,-10],[88,-10],[84,-2.5],[80,3],[96.5,3],[99,-1.5],[101,-6.5],[103,-12],[105,-21],[109.5,-21],[110.5,-26],[108,-26.5],[103,-28.5],[98.5,-29.5],[94,-30],[88.5,-30.5],[83,-31],[83,-39],[141,-38],[141.5,-47],[146,-47],[146.5,-52.5],[146.5,-78.5],[145.5,-79],[145.5,-110],[114,-111],[114,-118],[106.5,-117.5],[106.5,-122],[95,-122],[95.5,-119],[93.5,-119],[93.5,-124],[96.5,-124],[96.5,-129.5],[94,-129.5],[94,-217.5],[66.5,-217.5],[66.5,-214],[64.5,-214],[64.5,-222],[12,-222],[11.5,-213],[4,-213],[4,-192.5],[11.5,-193],[11.5,-185],[4.5,-185],[4,-144.5],[10,-144.5],[10,-137],[3.5,-137],[4,-122],[10.5,-122],[10.5,-115.5],[8,-115.5],[7.5,-51.5],[11,-51.5],[11,-39],[9,-38],[4,-39.5],[4.5,-40.5],[-2,-41.5],[-2,-42.5],[-5.5,-43],[-7.5,-43],[-11.5,-42.5],[-11.5,-42],[-18,-40.5],[-17,-37.5],[-19.5,-37],[-20,-37.5],[-24,-36],[-28,-33.5],[-26.5,-31],[-31.5,-27],[-36,-23],[-31,-19],[-34,-14.5],[-52.5,-14.5],[-52.5,-16.5],[-57,-16],[-60.5,-15.5],[-64.5,-15.5],[-68.5,-16],[-68,-15],[-68,-14.5],[-86.5,-15],[-86.5,1.5],[-85.5,1]];
const ADD_OUT=[[145.5,-106.5],[148.5,-106.5],[148.5,-110],[158,-110],[158,-114],[175.5,-113.5],[175.5,-102],[177,-102.5],[177,-96.5],[178,-96.5],[178,-52.5],[176.5,-52.5],[176.5,-46.5],[175,-46.5],[175,-36],[158,-36],[158,-43.5],[155,-43.5],[155,-42.5],[146,-42.5],[146,-47],[146.5,-52.5],[154.5,-52],[158,-52.5],[158,-55.5],[156.5,-55.5],[157,-94],[158,-94],[158,-96.5],[145.5,-97]];
const E_COURT=[[91,-89.5],[90.5,-85.5],[93.5,-85.5],[93,-63.5],[90,-63.5],[90,-60],[120.5,-59.5],[120.5,-58],[125,-58],[125,-63],[123.5,-63],[124,-85],[125,-85],[125,-90],[120.5,-90],[120.5,-88.5]];

/* ================= INTERIOR — traced from the official Stevenson floor plans (SHSMaps, via its creators' demo video) ================= */
/*PLAN*/
/*DOORS*/
/*HALLS*/
/*VLINKS*/
const unpack=a=>{ const o=[]; for(let i=0;i<a.length;i+=2) o.push([a[i],a[i+1]]); return o; };
const bboxOf=pts=>{ const xs=pts.map(p=>p[0]), zs=pts.map(p=>p[1]); return {x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)}; };
function typeOf(num,name){
  const n=name||'';
  if(/Performing Arts|Stage|Theat|Recital|Band|Choral|Orchestra|Music|MidiLab|Auditorium|Black Box|Scene Shop|Costume|Dressing|Green Room|Dimmer|Sound Rm|Light Control|Piano|Dance|Darkroom|Art\b|Art |Photo/i.test(n)) return 'arts';
  if(/Sports Center|Field House|Aquatic|Natatorium|Locker|PE |P\.E\.|Fitness|Wrestling|Aerobics|Training|Trainers|Tub|Coach|Pool|Multi-Purpose|Equipment Storage|Fieldhouse/i.test(n)) return 'ath';
  if(/Learning Center|ILC|Learn Lab|Study|Literacy|Quiet|Library/i.test(n)) return 'lib';
  if(/Commons|Servery|Kitchen|Dining|Forum|Snack|Book Store|Lounge|Wash Station|Food Prep/i.test(n)) return 'comm';
  if(/Lab|PLTW|STEM|Science|Chem|Computer|Programming|Green Screen|Media|Broadcast|News Studio|Wood Shop|Fashion|SMARTdesk|AV \/ IT|MDF|IDF/i.test(n)) return 'lab';
  if(/Classroom|\bCR\b|Class\b|English|Math|SS\b|ESL|Special Ed|Spec Ed|Small Group|Business|Health CR|Life Skills|TYC|Little Patriots|Conference Center|Journalism|Communication Arts|Testing|Fine Arts/i.test(n)) return 'class';
  return 'svc';
}
const EAST_COMMONS=new Set(['4300','4304','4305','4306','4308','4310','4310A','4314','4316','4400']);
function bldOf(map,num){
  if(map==='W1'||map==='W2'||map==='PW1'||map==='PW2') return 'West';
  if(map==='E3') return /^53/.test(num)?'FH':/^81/.test(num)?'Add':'East';
  if(map==='L') return (parseInt(num,10)>=3029)?'Front':'Link';
  if(/^4/.test(num)) return EAST_COMMONS.has(num)?'East':'Arts';
  if(/^5/.test(num)) return 'FH';
  if(/^[678]1/.test(num)) return 'Add';
  return 'East';
}
// published facts about a room (clubs, offices) matched by number, including ranges like 1508–10 or 1200/1202
function pubFor(num){
  if(!num) return null; const n=parseInt(num,10), s4=num.slice(0,4);
  for(const k in pubBy){ const p=pubBy[k];
    if(k===num||k===s4) return p;
    const m=k.match(/^(\d{4})(?:[–\/-](\d{2,4}))?$/); if(!m||!m[2]) continue;
    const a=+m[1], b=m[2].length===2? Math.floor(a/100)*100+(+m[2]) : +m[2];
    if(num.length===4 && n>=a && n<=b && (n===a||n===b||(m[0].includes('–')&&n%2===a%2))) return p; }
  return null; }
// tall, multi-level or showcase spaces
const SPEC={
  '1100':{span:2,h:8.5,major:1,glass:1}, '1103':{major:1}, '1214':{span:2,h:8.5,major:1,glass:1}, '1212':{span:2,h:8.5,major:1,glass:1},
  '1210':{major:1}, '1312':{major:1}, '2300':{major:1}, '2115':{major:1}, '2206':{major:1,glass:1,h:3.8}, '1123':{major:1}, '1120':{major:1},
  '4000|Performing Arts Center':{span:3,h:13,major:1,glass:1}, '4000|Stage':{span:3,h:19,glass:1}, '4200|Little Theater':{span:2,h:7,major:1,glass:1}, '4100|Recital Hall':{span:2,h:6,major:1,glass:1},
  '4400':{major:1}, '4300':{major:1}, '5026':{span:3,h:14,major:1,glass:1}, '5000':{span:2,h:11,major:1,glass:1}, '5206':{major:1,glass:1},
  '6064':{major:1,h:.5}, '6000':{major:1}, '7026':{major:1}, '3046':{major:1}, '3014':{major:1}, '6080':{major:1}, '7080':{major:1}
};
const byNum={};
const PLAN_NOTE='Number, name and outline traced from the official Stevenson floor plan.';
const SMALL_NOTE=' Small label read from a low-resolution video frame, so a letter may be off.';
for(const [floor,map,num,name,box,flat] of PLAN_R){
  const shape=unpack(flat), bb=bboxOf(shape), sp=SPEC[num+'|'+name]||SPEC[num]||{}, p=pubFor(num);
  let note=PLAN_NOTE+(/^\d{4}[A-Z]$/.test(num)&&(bb.x1-bb.x0)*(bb.z1-bb.z0)<20?SMALL_NOTE:''); if(p){ note=`Known as: ${p.name}.${p.note?' '+p.note:''} ${PLAN_NOTE}`; }
  const r=add(Object.assign({bld:bldOf(map,num),floor,num,name:name||'Room',type:typeOf(num,name),shape,conf:true,src:map==='E3'?'pdf3':'plan',psrc:p?p.src:null,note:map==='E3'?note.replace(PLAN_NOTE,'Number, name and outline traced from the district\'s 2023–24 campus map.'):note,plan:map},bb,sp));
  if(num) (byNum[num]=byNum[num]||[]).push(r);
}
for(const [floor,map,flat,holes] of PLAN_H){ const shape=unpack(flat); add(Object.assign({kind:'hall',bld:'Site',floor,type:'link',name:'',shape,holes:holes.map(unpack)},bboxOf(shape))); }
const roomBy=(num,name)=>(byNum[num]||[]).find(r=>!name||r.name===name)||null;

/* Level 3 (8xxx and the PWC mezzanine) is traced from the district's 2023–24 campus map PDF. Door photos a student took in Oct 2026 add detail. */
const PH3N=t=>t;
const PHOTO3={
  '8100':{name:'Conference Room',type:'svc',note:PH3N('Conference room beside the elevator, with an outside window over the parking lot.')},
  '8102':{name:'Elevator',type:'svc',note:PH3N('The addition elevator stops on level 3.')},
  '8104':{name:'Science Lab',type:'lab',note:PH3N('Glass-fronted science lab in the 2019 addition.')},
  '8108':{name:'Science Lab',type:'lab',note:PH3N('Glass-fronted science lab at the corner of the addition hallway, beside 8110. On level 2 this spot is a stairwell, so the outline here is rough.')},
  '8110':{name:'Science Lab',type:'lab',note:PH3N('Glass-fronted science lab beside 8112 and 8108, on the gallery hallway that overlooks the addition atrium (living green wall, butterfly art wall).')},
  '8112':{name:'Science Lab',type:'lab',note:PH3N('Glass-fronted science lab with two doors (one says "Please use other door"), next to 8110 on the gallery hallway above the addition atrium.')},
  '8008':{name:'Science Lab (Biology)',type:'lab',note:PH3N('Biology lab with two doors; signs point to the main door. In the Math/Science wing (hall sign: Rooms 8022–8000 Math/Science).')},
  '8010':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom; a side door says "Please use main door." Math/Science wing.')},
  '8018':{name:'Math/Science Classroom',type:'class',note:PH3N('Math/Science wing (hall sign: Rooms 8022–8000 Math/Science).')},
  '8000':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom at the start of the Math/Science wing.')},
  '8004':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom with a large window onto the hall.')},
  '8006':{name:'Office',type:'svc',note:PH3N('Small office door in a white wall next to an interior window.')},
  '8092':{name:'Conference Room',type:'svc',note:PH3N('Conference room at the end of the hall by the exit stairs, next to a window onto the courtyard.')},
  '8080':{name:'Mathematics & Science Office',type:'svc',note:PH3N('Math/Science division office: glass double doors marked "8080 Main Entrance," with a trophy case and staff restrooms along the hall.')},
  '8084':{name:'Staff Lounge',type:'svc',note:PH3N('Staff lounge in the elevator lobby; the elevator sign says students need a pass signed by the nurse.')},
  '8082':{name:'Storage',type:'svc',note:PH3N('Storage room in the elevator lobby.')},
  '8056':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom with two doors (one says "Please use the other door"), outside windows on the far side.')},
  '8058':{name:'Science Lab (Biology)',type:'lab',note:PH3N('Biology lab classroom.')},
  '8064':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom with two doors.')},
  '8066':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom with two doors.')},
  '8068':{name:'Science Lab (Chemistry)',type:'lab',note:PH3N('Chemistry classroom with two doors; Physics Club and the Chemistry Help Room meet here.')},
  '8072':{name:'Chemical Prep',type:'lab',note:PH3N('Chemical prep / supply room for the science labs.')},
  '8032':{name:'Classroom',type:'class',note:PH3N('Classroom with a tall sidelight window by the door.')},
  '8036':{name:'Classroom',type:'class',note:PH3N('Classroom with outside windows. Scholastic Bowl and Future Doctors of America have met in 8036–40 (2019 club catalog).')},
  '8038':{name:'Classroom',type:'class',note:PH3N('Classroom. Scholastic Bowl and Future Doctors of America have met in 8036–40 (2019 club catalog).')},
  '8040':{name:'Classroom',type:'class',note:PH3N('Classroom with outside windows. Scholastic Bowl and Future Doctors of America have met in 8036–40 (2019 club catalog).')},
  '8042':{name:'AV Storage',type:'svc',note:PH3N('AV storage closet beside the club bulletin board and seating area.')},
  '8044A':{name:'Electrical Room',type:'svc',note:PH3N('Electrical room by the seating nook with the club bulletin board.')},
  '8046':{name:'Classroom',type:'class',note:PH3N('Classroom. The Sophomore Class Board has met in 8046–48 (2019 club catalog).')},
  '8048':{name:'Classroom',type:'class',note:PH3N('Classroom with outside windows, at the corner where the hall sign reads "Rooms 8048–8068 Math/Science ahead · Rooms 8042–8000 to the left." The Sophomore Class Board has met in 8046–48.')},
  '8115':{name:'Conference Room',type:'svc',note:PH3N('Conference room on the 2019 addition hallway.')},
  '8115A':{name:'Custodial / Electrical',type:'svc',note:PH3N('Custodial closet, electrical room and roof irrigation drain.')},
  '8118':{name:'Storage',type:'svc',note:PH3N('Storage room on the 2019 addition hallway (dark brick walls, terrazzo floor).')},
  '8119':{name:'Room 8119',type:'svc',note:PH3N('Door on the 2019 addition hallway; the sign shows only the number.')},
  '8120':{name:'IDF / Electrical',type:'svc',note:PH3N('IDF (network) and electrical room on the 2019 addition hallway.')},
  '8079':{name:'Electrical',type:'svc',note:PH3N('Electrical room next to the staff restrooms.')},
  '8090':{name:'Room 8090',type:'svc',note:PH3N('Door near the end of the Math/Science hall.')},
  '8105':{name:'Conference Room',type:'svc',note:PH3N('Conference room in the 2019 addition.')},
  '8105A':{name:'Electrical / Storage',type:'svc',note:PH3N('Electrical and storage closet beside 8105.')},
  '8024':{name:'Science Lab',type:'lab',note:PH3N('Lab classroom with two doors ("Please use other door") and outside windows.')},
  '8026':{name:'Classroom',type:'class',note:PH3N('Classroom with a tall sidelight window by the door.')},
  '8030':{name:'Classroom',type:'class',note:PH3N('Classroom with outside windows.')},
  '8022':{name:'Math/Science Classroom',type:'class',note:PH3N('Math/Science wing; the hall sign here reads "Rooms 8022–8000 Math/Science · Rooms 8092–8070 ahead · Rooms 8024–8068 to the right."')}};
for(const r of rooms){ if(r.floor!==3||r.kind!=='room') continue; const ph=PHOTO3[r.num]; if(!ph) continue;
  r.note=`${r.note} A student's door photo (Oct 2026) confirms it: ${ph.note.replace(/ Number from a door sign.*$/,'')}`; r.photo=1; }

/* Jazzman's Café: labeled "Jazzman's" on the plan in the Glass Commons, against the wall by Pool Storage (placed with a student's help) */
add({bld:'Front',floor:1,num:'',name:"Jazzman's Café",type:'comm',x0:57.1,x1:63.4,z0:-53.9,z1:-44.5,h:2.6,conf:true,src:'plan',note:"Small café counter in the Glass Commons, against the wall beside Pool Storage (5006), across from the big window into the pool. Labeled \"Jazzman's\" on the official plan."});

/* the Link walkway itself (between the West plan and the Link plan) */
add({kind:'hall',bld:'Link',floor:1,type:'link',name:'',x0:-101,x1:-80,z0:-15.5,z1:-11.2});

/* Level 4: the rooftop of the 2019 addition, from the district's 2023–24 campus map (greenhouse, roof gardens, green roof, mechanical) */
const L4=[["9100", "Elevator", "svc", 154.78, 157.63, -47.3, -43.6], ["9101", "Vestibule", "svc", 154.61, 168.43, -51.08, -46.5], ["9102", "SE Stairs", "svc", 168.43, 176.21, -51.08, -46.5], ["9103", "Green Roof", "out", 158.2, 174.9, -46.5, -36.2], ["9104A", "Greenhouse Head End", "lab", 166.27, 176.21, -56.87, -51.17], ["9104", "Greenhouse", "lab", 166.27, 176.21, -69.23, -56.87], ["9106A", "Mech", "svc", 166.27, 171.46, -73.38, -69.23], ["9106B", "Electrical", "svc", 171.46, 176.21, -73.38, -69.23], ["9106", "Mech", "svc", 166.27, 176.21, -79.42, -73.38], ["9107", "Mech Well", "svc", 166.27, 176.21, -97.31, -79.42], ["9109", "NE Stairs", "svc", 166.27, 176.21, -102.06, -97.31], ["9105", "Roof Gardens", "out", 157.63, 166.27, -102.06, -51.17]];
for(const [num,name,type,x0,x1,z0,z1] of L4){ const out=type==='out';
  add({bld:'Add',floor:4,num,name,type,x0,x1,z0,z1,conf:true,src:'pdf3',h:out?.35:(num==='9107'?4.2:3.4),glass:num==='9104'||num==='9104A'?1:0,major:num==='9104'||num==='9105'?1:0,
    note:{'9104':'Rooftop science greenhouse built with the 2019 net-zero addition.','9105':'Planted roof gardens on top of the addition.','9103':'Green (planted) roof at the south end of the addition.','9101':'Vestibule at the top of the SE stairs and elevator, opening onto the roof.'}[num]||'Rooftop level of the 2019 addition.'}); }

/* courtyards (OpenStreetMap; they match the open courts on the plans) */
for(const p of W_IN) add(Object.assign({kind:'court',bld:'West',floor:1,shape:p,type:'out',name:'Courtyard',conf:true,ground:1,h:.2,src:'osm',note:'One of three open courtyards inside the West Building.'},bboxOf(p)));
add(Object.assign({kind:'court',bld:'East',floor:1,shape:E_COURT,type:'out',name:'East Courtyard',conf:true,ground:1,h:.2,src:'osm',note:'Open courtyard inside the East Building classroom ring.'},bboxOf(E_COURT)));

/* Glass Commons (4110): the open, curved glass wing along the Circle Drive (corridor-colored on the plan) */
function arcShape(cx,cz,r0,r1,a0,a1,n=28){ const pts=[];
  for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*r1, cz+Math.sin(a)*r1]); }
  for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*r0, cz+Math.sin(a)*r0]); }
  return pts; }
const GC=arcShape(-7,0,21,36,Math.PI*1.12,Math.PI*1.66);
add(Object.assign({bld:'Front',floor:1,num:'4110',name:'Glass Commons',type:'comm',shape:GC,span:2,h:8,major:1,glass:1,conf:true,src:'plan',note:'The curved, tiered glass commons wrapping the Circle Drive, between the Main Office (3046) and the Recital Hall. Drop-off at the Circle Drive by Lot B. '+PLAN_NOTE},bboxOf(GC)));

/* ================= SITE (OpenStreetMap) ================= */
const LOTS=[['Lot B','The Point Parking Lot B',[[-62,151.5],[-22.5,150],[-11.5,150],[-13,39.5],[-36,36],[-84.5,35.5],[-91.5,34],[-94,83.5],[-78.5,115],[-83,118],[-73.5,137],[-69,137]]],
 ['Lot D','Field House/Pool Parking Lot D',[[110,-137],[109,-154.5],[109.5,-227],[172,-227],[178.5,-222.5],[181.5,-216],[181,-137.5],[178,-132.5],[173,-129],[112,-130]]],
 ['','Parking Lot D',[[46.5,-296],[47.5,-240.5],[118.5,-240],[119.5,-295.5]]],['','Parking Lot D',[[124,-287],[137.5,-295],[177.5,-296],[188,-285.5],[189,-238],[123.5,-240]]],
 ['Lot C','Faculty Parking Lot C',[[116,-28.5],[113,-21],[111,-16.5],[104,2],[94.5,27],[178.5,29],[176,-28]]],
 ['Lot E','Sports Center Parking Lot E',[[-132,-227.5],[-192.5,-226.5],[-190.5,-103.5],[-130,-104.5]]],
 ['Lot A','Faculty Parking Lot A',[[-197,275.5],[-189,271.5],[-160.5,254.5],[-151,272.5],[-176,283],[-169,334],[-189,336.5]]],
 ['PC','Port Clinton Parking Lot',[[26,-550.5],[62.5,-551],[63.5,-477],[27,-476.5]]],
 ['','',[[-123,-205],[-123.5,-226.5],[-96.5,-227.5],[-96,-206]]],['','',[[-36,-206],[-36,-227],[-4.5,-228],[-4,-206.5]]],
 ['','',[[8.5,-444.5],[18.5,-444.5],[17.5,-418],[-5,-417.5],[-3,-384],[-19,-380],[-23,-404.5],[-20,-433],[-3.5,-433],[7.5,-436.5]]]];
const WATER=[[[-37,282.5],[-48.5,293.5],[-64,306],[-77.5,309.5],[-98,300.5],[-98.5,282],[-97,270],[-84.5,254],[-65,242.5],[-62.5,238],[-69,216.5],[-68,184.5],[-61,178.5],[-45,178.5],[-41.5,193],[-35.5,226.5],[-34,259.5]],
 [[180.5,-527],[177.5,-504],[180.5,-459],[171,-444.5],[162,-440.5],[143,-455],[141.5,-469],[148,-497.5],[148,-515.5],[144,-528.5],[155.5,-542.5],[169.5,-542]],
 [[129,207.5],[132,194.5],[143,193],[164,195],[176,194],[175,186.5],[158,187.5],[138.5,183.5],[122.5,183],[115,178],[114.5,168],[107.5,159],[106.5,143],[101.5,133.5],[75.5,132.5],[66.5,123.5],[62,129],[24.5,130],[25.5,139],[55.5,140.5],[80,142],[85.5,148],[85.5,174],[87,183],[84,196],[88.5,201.5],[108.5,204],[123.5,210]]];
const PITCHES=[['baseball',[[-170.5,-539],[-163,-548],[-70.5,-547],[-57,-529],[-53.5,-502],[-57.5,-477.5],[-68,-457],[-87.5,-442],[-115.5,-430.5],[-143.5,-435],[-171,-448]]],
 ['baseball',[[-172.5,-362],[-168.5,-356.5],[-96,-363],[-98,-390],[-109.5,-415.5],[-125.5,-426.5],[-147,-431.5],[-166,-433]]],
 ['baseball',[[-54,-246.5],[-65.5,-258.5],[-59.5,-344],[-35.5,-345.5],[-7,-341.5],[21.5,-323],[37.5,-297],[39.5,-247]]],
 ['baseball',[[-170.5,-242.5],[-178,-252.5],[-172.5,-352],[-113.5,-351],[-91,-334.5],[-76.5,-315.5],[-77.5,-282.5],[-83,-248.5]]],
 ['baseball',[[-92,-373.5],[-79,-361],[-16.5,-362],[-16,-385],[-19,-405.5],[-27,-420],[-42.5,-431.5],[-59.5,-436.5],[-90.5,-436]]],
 ['soccer',[[34,-418],[33,-307],[100,-307.5],[100,-417.5]]],['soccer',[[108.5,-418],[108,-307],[175,-308],[175,-417.5]]],
 ['football',[[123,-438.5],[74,-438],[71.5,-546],[120.5,-546]]],['football',[[-47,-439.5],[3,-440],[1.5,-547.5],[-47,-548]]]];
const ROADS=[
 ['Half Day Road (Route 22)',13,[[-330,370],[-274.5,363.5],[-232,358.5],[-186,352.5],[-108.5,343],[-39.5,331.5],[-12,326],[20.5,319.5],[91.5,304.5],[168.5,290],[204,283.5],[285,267],[372,248],[400,241]]],
 ['Port Clinton Road',10,[[-330,-571.5],[-188,-572],[-110.5,-572],[54,-569],[230.5,-563],[298,-560.5],[380,-558.5]]],
 ['Stevenson Drive',8,[[-12,326],[-9,280],[-8.5,204.5],[-8.5,146],[-8,32],[-6.5,12.5]]],
 ['Stevenson Drive',8,[[-8,32],[91,35],[152,36.5],[174,36.5],[180,32],[184,16],[183.5,-40.5],[184,-124.5],[184.5,-219],[180.5,-226],[171.5,-230.5],[133,-230.5],[89.5,-230.5],[31,-231],[-68,-230.5],[-128.5,-231],[-194,-232]]],
 ['N Hotz Road',8,[[204,283.5],[203.5,150.5],[203.5,42],[204.5,-85],[204.5,-122.5],[211.5,-134],[225,-140],[244,-145.5],[326,-171.5],[371,-186]]],
 ['N Apple Hill Lane',7,[[-307.5,360],[-307.5,216.5],[-306.5,-48],[-306.5,-110.5],[-305.5,-369],[-305,-571.5]]],
 ['',6,[[-188,-551.5],[-186.5,-415],[-187,-395.5],[-189.5,-290.5],[-194,-232]]],
 ['',6,[[-196,-100],[-196.5,-74.5],[-197.5,20.5],[-197,183],[-198,248],[-189,271.5],[-183.5,300],[-178.5,335],[-176.5,351.5]]],
 ['',6,[[-196,-100],[-183,-88],[-158.5,-85.5],[-139.5,-90],[-132,-95.5],[-127.5,-107],[-128,-177.5],[-128.5,-216.5]]],
 ['',6,[[-6.5,-76],[-4.5,-97.5],[-2.5,-102.5],[-2,-200.5],[-2,-231.5]]],['',6,[[-2,-215.5],[-33.5,-215.5]]],['',6,[[-96,-231],[-96,-216],[-120.5,-216.5]]],
 ['',6,[[-8,32],[-85.5,31],[-97,40.5],[-97,80.5],[-93.5,90],[-74.5,126.5],[-65.5,141],[-58.5,142.5],[-23.5,141],[-8.5,146]]],['',5,[[-23,32],[-23.5,141]]],
 ['',6,[[91,35],[101,16],[108.5,-1],[116.5,-18.5],[183.5,-18.5]]],['',6,[[101,16],[166,18.5],[165,-1],[108.5,-1]]],
 ['',6,[[103.5,-230.5],[103.5,-139],[110.5,-128],[131.5,-125.5],[184,-124.5]]],['',5,[[114,-126],[114.5,-215.5]]],['',5,[[150,-125],[150,-230]]],
 ['',5,[[54,-569],[53.5,-484],[32,-484],[32,-543],[53.5,-542.5]]],['',5,[[23,-378.5],[22.5,-411],[17.5,-418],[19.5,-472.5],[32,-484]]],
 ['',5,[[133.5,-286.5],[78,-286.5],[78,-249],[186.5,-248.5],[186.5,-283],[177.5,-287],[133.5,-286.5]]],['',5,[[186.5,-248.5],[184.5,-219]]]];
const CIRCLE=[-7,0,12.5];

/* ================= user edits ================= */
const KEY='shs-map-edits-v3';
let edits={}; try{ edits=JSON.parse(localStorage.getItem(KEY)||'{}')||{}; }catch(e){ edits={}; }
const saveEdits=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(edits)); }catch(e){} };
const disp=r=>({num:(edits[r.id]&&edits[r.id].num!=null)?edits[r.id].num:r.num, name:(edits[r.id]&&edits[r.id].name!=null)?edits[r.id].name:r.name});
const top=r=>r.floor+r.span-1;
const onFloor=(r,N)=>r.floor<=N && N<=top(r);

/* ================= three.js ================= */
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true});
const COARSE=window.matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,COARSE?1.5:2));
let dirty=3; const inval=()=>{ dirty=Math.max(dirty,2); };
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,1,5000);
const HOME_T=new THREE.Vector3(-30,0,-60), HOME_P=new THREE.Vector3(250,330,330);
camera.position.copy(HOME_P);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.target.copy(HOME_T); controls.enableDamping=true; controls.dampingFactor=.09;
controls.maxPolarAngle=1.45; controls.minDistance=20; controls.maxDistance=1600;
// map-style controls: one finger / left mouse moves the map, two fingers / right mouse turn the view, pinch / scroll zooms
controls.screenSpacePanning=false; controls.panSpeed=1.1; controls.rotateSpeed=.6;
controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};
controls.addEventListener('change',inval);
['pointerdown','pointermove','pointerup','wheel','touchstart','touchmove','touchend'].forEach(ev=>stage.addEventListener(ev,inval,{passive:true,capture:true}));
/* ---- map-app touch gestures (replace OrbitControls' touch handling) ----
   one finger: drag the map (the spot under your finger stays under it), flick to glide
   two fingers: pinch to zoom, twist to turn, move to drag
   three fingers: slide up/down to tilt the view, left/right to turn it
   double-tap: zoom in there */
{ const el=renderer.domElement, ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), plane=new THREE.Plane(new THREE.Vector3(0,1,0),0), tmpV=new THREE.Vector3(), Y=new THREE.Vector3(0,1,0);
  const T=new Map(); let g=null, glide=null, lastTap=null;
  const ground=(x,y)=>{ const b=el.getBoundingClientRect(); ndc.set((x-b.left)/b.width*2-1,-((y-b.top)/b.height)*2+1); ray.setFromCamera(ndc,camera);
    plane.constant=-controls.target.y; const p=new THREE.Vector3(); if(!ray.ray.intersectPlane(plane,p)) return null; return p.distanceTo(camera.position)>3000?null:p; };
  const shift=(dx,dz)=>{ camera.position.x+=dx; camera.position.z+=dz; controls.target.x+=dx; controls.target.z+=dz; };
  const rotY=(pv,ang)=>{ for(const v of [camera.position,controls.target]){ tmpV.copy(v).sub(pv).applyAxisAngle(Y,ang); v.copy(pv).add(tmpV); } };
  const zoomAt=(pv,k)=>{ const d=camera.position.distanceTo(controls.target), nd=Math.max(controls.minDistance,Math.min(controls.maxDistance,d*k)); k=nd/d;
    for(const v of [camera.position,controls.target]){ tmpV.copy(v).sub(pv).multiplyScalar(k); v.copy(pv).add(tmpV); } };
  const two=()=>{ const [a,b]=[...T.values()]; return {mx:(a.x+b.x)/2,my:(a.y+b.y)/2,d:Math.hypot(b.x-a.x,b.y-a.y),ang:Math.atan2(b.y-a.y,b.x-a.x)}; };
  const begin=()=>{ glide=null;
    if(T.size===1){ const t=[...T.values()][0]; g={n:1,anchor:ground(t.x,t.y),x:t.x,y:t.y,t:performance.now(),vx:0,vz:0}; }
    else if(T.size===2){ const m=two(); g={n:2,anchor:ground(m.mx,m.my),m0:m,prev:m,mode:'map'}; }
    else if(T.size>=3){ const v=[...T.values()]; g={n:3,prev:{x:v.reduce((a,t)=>a+t.x,0)/v.length,y:v.reduce((a,t)=>a+t.y,0)/v.length}}; } else g=null; };
  const opt={passive:false,capture:true};
  stage.addEventListener('touchstart',e=>{ if(e.target!==el) return; e.stopPropagation(); e.preventDefault(); anim=null;
    for(const t of e.changedTouches) T.set(t.identifier,{x:t.clientX,y:t.clientY,x0:t.clientX,y0:t.clientY,t0:performance.now()}); begin(); inval(); },opt);
  stage.addEventListener('touchmove',e=>{ if(!g) return; e.stopPropagation(); e.preventDefault();
    for(const t of e.changedTouches){ const o=T.get(t.identifier); if(o){ o.x=t.clientX; o.y=t.clientY; } }
    if(g.n===1&&T.size===1){ const t=[...T.values()][0], p=ground(t.x,t.y);
      if(g.anchor&&p){ const dx=g.anchor.x-p.x, dz=g.anchor.z-p.z, now=performance.now(), dt=Math.max(8,now-g.t); shift(dx,dz);
        g.vx=.6*g.vx+.4*dx/dt; g.vz=.6*g.vz+.4*dz/dt; g.t=now; } }
    else if(g.n===3&&T.size>=3){ const v=[...T.values()], c={x:v.reduce((a,t)=>a+t.x,0)/v.length,y:v.reduce((a,t)=>a+t.y,0)/v.length};
      const dx=c.x-g.prev.x, dy=c.y-g.prev.y, off=tmpV.copy(camera.position).sub(controls.target), sph=new THREE.Spherical().setFromVector3(off);
      sph.phi=Math.max(.02,Math.min(controls.maxPolarAngle,sph.phi-dy*.006)); sph.theta-=dx*.006; off.setFromSpherical(sph); camera.position.copy(controls.target).add(off);
      g.prev=c; }
    else if(g.n===2&&T.size>=2){ const m=two();
      if(g.anchor){ let da=m.ang-g.prev.ang; if(da>Math.PI) da-=2*Math.PI; if(da<-Math.PI) da+=2*Math.PI;
        rotY(g.anchor,da); zoomAt(g.anchor,g.prev.d/Math.max(1,m.d)); const p=ground(m.mx,m.my); if(p) shift(g.anchor.x-p.x,g.anchor.z-p.z); }
      g.prev=m; }
    camera.lookAt(controls.target); inval(); },opt);
  const end=e=>{ e.stopPropagation(); const was=g;
    for(const t of e.changedTouches){ const o=T.get(t.identifier); T.delete(t.identifier);
      if(o&&e.type==='touchend'&&T.size===0&&was&&was.n===1&&Math.hypot(o.x-o.x0,o.y-o.y0)<8&&performance.now()-o.t0<300){
        const now=performance.now();
        if(lastTap&&now-lastTap.t<320&&Math.hypot(o.x-lastTap.x,o.y-lastTap.y)<40){ const p=ground(o.x,o.y);
          if(p){ const nt=controls.target.clone().lerp(p,.5), np=nt.clone().add(camera.position.clone().sub(controls.target).multiplyScalar(.5)); startAnim(nt,np); } lastTap=null; }
        else lastTap={t:now,x:o.x,y:o.y}; } }
    if(T.size===0&&was&&was.n===1&&performance.now()-was.t<80&&Math.hypot(was.vx,was.vz)>.02) glide={vx:was.vx,vz:was.vz,t:performance.now()};
    begin(); inval(); };
  stage.addEventListener('touchend',end,opt); stage.addEventListener('touchcancel',end,opt);
  (function tick(now){ if(glide){ const dt=Math.min(40,now-glide.t); glide.t=now; shift(glide.vx*dt,glide.vz*dt); const k=Math.pow(.94,dt/16); glide.vx*=k; glide.vz*=k;
      if(Math.hypot(glide.vx,glide.vz)<.003) glide=null; inval(); } requestAnimationFrame(tick); })(performance.now()); }

scene.add(new THREE.HemisphereLight(0xffffff,0x8a9a8e,.72));
const sun=new THREE.DirectionalLight(0xffffff,.62); sun.position.set(-220,420,300); scene.add(sun);

function shapeOf(pts,holes){ const s=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const h of (holes||[])) s.holes.push(new THREE.Path(h.map(([x,z])=>new THREE.Vector2(x,-z)))); return s; }
function extrude(pts,h,holes,mats,y0=0){ const g=new THREE.ExtrudeGeometry(shapeOf(pts,holes),{depth:h,bevelEnabled:false}); g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,mats); m.position.y=y0; scene.add(m); return m; }
function flatPoly(pts,y,color){ const g=new THREE.ShapeGeometry(shapeOf(pts)); g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:color||0x999999})); m.position.y=y; scene.add(m); return m; }

/* ---- facade & roof textures (Street View: tan brick with long window bands; glass entries; satellite: solar roofs on the East Building) ---- */
function canvasTex(w,h,draw,rx,ry){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=4; return t; }
const brickTex=canvasTex(256,128,(g,w,h)=>{ g.fillStyle='#c9b48e'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(120,98,66,.22)'; g.lineWidth=1;
  for(let y=0;y<h;y+=6){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  g.fillStyle='#34414b'; g.fillRect(0,44,w,40); g.fillStyle='#7d8b95'; for(let x=0;x<w;x+=32) g.fillRect(x,44,3,40); g.fillStyle='#b9a37c'; g.fillRect(0,84,w,4); },1/14,1/FH);
const glassTex=canvasTex(128,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8fb2c2'); gr.addColorStop(1,'#56778a'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle='rgba(235,240,242,.85)'; for(let x=0;x<w;x+=32) g.fillRect(x,0,3,h); g.fillRect(0,0,w,3); g.fillRect(0,62,w,3); },1/6,1/FH);
const solarTex=canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#d6d8d3'; g.fillRect(0,0,w,h); g.fillStyle='#22324d';
  for(let y=4;y<h;y+=31) for(let x=4;x<w;x+=31) g.fillRect(x,y,27,27); },1/7,1/7);
const roofTex=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#d4d5d0'; g.fillRect(0,0,w,h); g.fillStyle='rgba(0,0,0,.05)'; g.fillRect(0,0,w,2); g.fillRect(0,0,2,h); },1/10,1/10);
const M={
  brick:new THREE.MeshLambertMaterial({map:brickTex}), glass:new THREE.MeshLambertMaterial({map:glassTex,transparent:true,opacity:.92}),
  solar:new THREE.MeshLambertMaterial({map:solarTex}), roof:new THREE.MeshLambertMaterial({map:roofTex}), white:new THREE.MeshLambertMaterial({color:0xf2f2ee}),
  green:new THREE.MeshLambertMaterial({color:0x6f9a5b})
};

/* ---- exterior building masses (heights from levels: West 2, East 3; tall volumes from satellite) ---- */
const shells=[];
function shell(name,pts,h,roof,side,ex={}){ const m=extrude(pts,h,ex.holes,[roof,side],ex.y0||0);
  const r=Object.assign({kind:'shell',name,bld:ex.bld||'Site',floor:1,span:1,type:'bldg',conf:true,num:'',note:ex.note||'',src:ex.src||'osm',ext:1},ex.r||{});
  const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]); Object.assign(r,{x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),topY:(ex.y0||0)+h});
  m.userData.r=r; r.mesh=m; shells.push(r);
  const ol=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map(([x,z])=>new THREE.Vector3(x,.15,z))),new THREE.LineBasicMaterial({color:0x666666,transparent:true,opacity:.7}));
  scene.add(ol); r.outline=ol; return r; }
const rect=(x0,x1,z0,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
function hull(pts){ const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]), cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
  for(const q of p){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0) lo.pop(); lo.push(q); }
  for(const q of p.reverse()){ while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0) up.pop(); up.push(q); }
  return lo.slice(0,-1).concat(up.slice(0,-1)); }
const WN='West Building', EN='East Building';
shell(WN,W_OUT,2*FH+1,M.roof,M.brick,{holes:W_IN,bld:'West',note:'The original 1965 school, two levels of tan brick with long window bands, built around three courtyards. Outline from OpenStreetMap; façade from Street View.'});
shell('Sports Center',[[-193,-68.5],[-181,-68.5],[-181,-60.5],[-145,-60],[-145,-17],[-193,-17]],2*FH+1,M.roof,M.brick,{bld:'West',note:'Main gym at the north end of the West Building, facing Lot E.',src:'ath'});
shell('The Point / Forum',[[-138,58],[-116,56],[-104,60.5],[-104.5,92.5],[-97.5,96],[-92,98],[-138,98]],8.5,M.white,M.glass,{bld:'West',note:'2004 glass entry with a swept, canted white roof and a flagpole out front, seen from Lot B on Street View.',src:'entry'});
shell('The Link',LINK,4.4,M.roof,M.glass,{bld:'Link',note:'Indoor walkway between the West and East buildings (1995).',src:'osm'});
shell(EN,E_OUT,FH+.8,M.roof,M.brick,{bld:'East',note:'The 1995 East Building with the PAC, natatorium, field house and three levels of classrooms. Outline from OpenStreetMap; roofs from satellite.'});
{ const f=roomBy('5026'); shell('Field House',f?rect(f.x0-1,f.x1+1,f.z0-1,f.z1+1):rect(11.5,60,-222,-122),14,M.solar,M.brick,{bld:'FH',note:'Expanded in 2022: courts inside a 200 m track, turf and cardio. Solar panels cover the roof.',src:'dh20'}); }
shell('Patriot Wellness Center',rect(60,94,-217.5,-122),12,M.solar,M.brick,{bld:'FH',note:'2022 multi-level fitness center beside Lot D.',src:'pwc'});
shell('PWC entrance',[[94,-129.5],[96.5,-129.5],[96.5,-124],[93.5,-124],[93.5,-119],[95,-122],[106.5,-122],[106.5,-117.5],[114,-118],[114,-111],[94,-111]],2*FH+.8,M.solar,M.glass,{bld:'FH',note:'Patriot Wellness Center entrance, glass on the lower level.',src:'pwc'});
{ const n=roomBy('5000'); shell('Patriot Natatorium',n?rect(n.x0-1,n.x1+1,n.z0-1,n.z1+1):rect(11,70,-110,-53),12,M.solar,M.brick,{bld:'FH',note:'The Aquatic Center: a 50-meter pool between the cardio rooms and the pool locker rooms (floor plan room 5000a).',src:'nat'}); }
shell('Classroom ring',[[70,-110],[145.5,-110],[145.5,-38],[83,-38],[70,-38]],3*FH+.8,M.solar,M.brick,{holes:[E_COURT],bld:'East',note:'Three levels of classrooms (6xxx, 7xxx, 8xxx) around a planted courtyard.',src:'gmap'});
{ const h=roomBy('4000','Performing Arts Center'), st=roomBy('4000','Stage');
  if(h) shell('Performing Arts Center',hull(h.shape),13,M.roof,M.brick,{bld:'Arts',note:'Fan-shaped house of the PAC, with the Recital Hall and Little Theater on its north side (floor plan).',src:'plan'});
  if(st) shell('PAC fly tower',hull(st.shape),19,M.roof,M.brick,{bld:'Arts',note:'Stage house of the PAC, on its south side next to the scene shop (floor plan).',src:'plan'}); }
shell('East Commons',[[60,-31],[103,-31],[103,-12],[99,-1.5],[96.5,3],[80,3],[84,-2.5],[88,-10],[79.5,-10],[79,0.5],[60,0.5]],7.5,M.roof,M.brick,{bld:'East',note:'Lower roof beside the PAC, facing Lot C; estimated home of the East Commons.',src:'gmap'});
shell('Glass Commons',GC,8,M.white,M.glass,{bld:'Front',note:'Curved, tiered glass wing hugging the Circle Drive.',src:'gmap'});
shell('2019 Addition',ADD_OUT,3*FH+.8,M.solar,M.glass,{bld:'Add',note:'56,800 sq ft, three stories plus a rooftop greenhouse; glass-dominated façade; net-zero energy with green roofs and solar.',src:'dh19'});
// rooftop greenhouse + garden beds on the addition, district office, grounds building, bleachers
const roofExtras=new THREE.Group(); scene.add(roofExtras);
{ const RT=3*FH+.8, box=(x0,x1,z0,z1,h,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,h,z1-z0),mat); m.position.set((x0+x1)/2,RT+h/2,(z0+z1)/2); roofExtras.add(m); };
  for(const [num,,type,x0,x1,z0,z1] of L4){
    if(num==='9104'||num==='9104A') box(x0,x1,z0,z1,3.6,M.glass);
    else if(type==='out'){ const n=Math.max(1,Math.floor((z1-z0)/4)); for(let i=0;i<n;i++) box(x0+.6,x1-.6,z0+i*(z1-z0)/n+.6,z0+(i+1)*(z1-z0)/n-.6,.5,M.green); }
    else box(x0,x1,z0,z1,num==='9107'?4.2:3.6,M.brick); } }
shell('District 125 Administration Center',[[-39.5,-225],[-39.5,-206],[-88.5,-206.5],[-88.5,-225.5]],8,M.roof,M.brick,{note:'2 Stevenson Drive. Two levels (OpenStreetMap).'});
shell('Grounds building',[[2.5,-410.5],[18.5,-411],[19,-379.5],[3,-379]],5,M.roof,M.brick,{note:'Grounds building by the Port Clinton lot.',src:'sub'});
shell('West bleachers',[[-117,-134],[-106,-134.5],[-105.5,-89],[-110,-89],[-110,-91],[-115.5,-90.5],[-115.5,-130.5],[-117.5,-130.5]],4.5,M.white,M.white,{note:'Stadium grandstand (OpenStreetMap).'});
shell('East bleachers',[[-23,-142],[-8.5,-142],[-8.5,-117],[-5,-117],[-5,-100.5],[-9,-100.5],[-9,-80.5],[-23,-80.5]],6,M.white,M.white,{note:'Stadium grandstand with press box; visitors bleachers were replaced in 2011.',src:'osm'});

/* ---- ground, lots, water, fields, roads ---- */
const siteMeshes=[];
const ground=new THREE.Mesh(new THREE.PlaneGeometry(760,1000),new THREE.MeshLambertMaterial({color:0xcccccc})); ground.rotation.x=-Math.PI/2; ground.position.set(25,-.06,-120); scene.add(ground);
siteMeshes.push({mesh:ground,tok:'--ground'});
const siteLabels=[];
for(const [lab,full,pts] of LOTS){ siteMeshes.push({mesh:flatPoly(pts,.03),tok:'--lot'}); if(lab){ const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]); siteLabels.push([lab,(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2]); } }
for(const pts of WATER) siteMeshes.push({mesh:flatPoly(pts,.12),tok:'--water'});
for(const [k,pts] of PITCHES) siteMeshes.push({mesh:flatPoly(pts,.15),tok:k==='baseball'?'--t-out':'--field'});
function roadMesh(pts,w){ for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i],[bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.5) continue;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(L+w*.6,w),new THREE.MeshLambertMaterial({color:0x999999})); m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(bz-az,bx-ax);
  m.position.set((ax+bx)/2,.07,(az+bz)/2); scene.add(m); siteMeshes.push({mesh:m,tok:'--road'}); } }
for(const [n,w,pts] of ROADS) roadMesh(pts,w);
{ const c=new THREE.Mesh(new THREE.RingGeometry(CIRCLE[2]-4,CIRCLE[2]+4,48),new THREE.MeshLambertMaterial({color:0x999999,side:THREE.DoubleSide})); c.rotation.x=-Math.PI/2; c.position.set(CIRCLE[0],.09,CIRCLE[1]); scene.add(c); siteMeshes.push({mesh:c,tok:'--road'});
  const isl=new THREE.Mesh(new THREE.CircleGeometry(CIRCLE[2]-4,40),new THREE.MeshLambertMaterial({color:0x999999})); isl.rotation.x=-Math.PI/2; isl.position.set(CIRCLE[0],.1,CIRCLE[1]); scene.add(isl); siteMeshes.push({mesh:isl,tok:'--t-out'}); }
// stadium: turf field inside a 400 m track (field from OpenStreetMap: x -88..-40, z -164..-56)
{ const cx=-64,za=-146,zb=-74,N=40;
  // a 400 m oval drawn as a strip between two stadium-shaped loops (the old Shape+hole triangulated into bow-tie wedges)
  const loop_=r=>{ const P=[]; for(let k=0;k<=N;k++){ const a=Math.PI-Math.PI*k/N; P.push([cx+r*Math.cos(a),zb+r*Math.sin(a)]); }
    for(let k=0;k<=N;k++){ const a=-Math.PI*k/N; P.push([cx+r*Math.cos(a),za+r*Math.sin(a)]); } return P; };
  const O=loop_(37), I=loop_(28.5), pos=[], idx=[];
  for(let k=0;k<O.length;k++){ pos.push(O[k][0],0,O[k][1], I[k][0],0,I[k][1]); }
  for(let k=0;k<O.length;k++){ const a=2*k,b=2*k+1,c=2*((k+1)%O.length),d=c+1; idx.push(a,c,b, b,c,d); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((v,i)=>i%3===1?1:0),3)); g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x999999,side:THREE.DoubleSide})); m.position.y=.18; scene.add(m); siteMeshes.push({mesh:m,tok:'--track'});
  const f=flatPoly([[-88,-164.5],[-40,-164],[-40,-56],[-88.5,-56]],.22); siteMeshes.push({mesh:f,tok:'--field'});
  for(let i=1;i<10;i++){ const l=new THREE.Mesh(new THREE.PlaneGeometry(48,.4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7})); l.rotation.x=-Math.PI/2; l.position.set(-64,.26,-164+i*10.8); scene.add(l); } }

/* ---- interior detail (visible on level views through the see-through big rooms) ---- */
const details=[];
function detail(parent,mesh){ details.push({p:parent,mesh}); scene.add(mesh); return mesh; }
function plane(w,d,x,y,z,color,op=1){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({color,transparent:op<1,opacity:op})); m.rotation.x=-Math.PI/2; m.position.set(x,y,z); return m; }
const Y1=PLATE+.06, mid=r=>[(r.x0+r.x1)/2,(r.z0+r.z1)/2];
// natatorium: 50 m pool (north–south), 8 lanes
{ const n=roomBy('5000'); if(n){ const [cx,cz]=mid(n), pw=Math.min(19,n.x1-n.x0-8), pl=Math.min(52,n.z1-n.z0-7);
  detail(n,plane(pw,pl,cx,Y1,cz,0x3fa7d6)); for(let i=1;i<8;i++) detail(n,plane(.22,pl,cx-pw/2+i*pw/8,Y1+.02,cz,0xffffff)); detail(n,plane(pw,.4,cx,Y1+.02,cz,0xd94a4a)); } }
// field house: courts inside a 200 m track
{ const f=roomBy('5026'); if(f){ const [cx,cz]=mid(f), rx=(f.x1-f.x0)/2-2, rz=(f.z1-f.z0)/2-3;
  const tr=new THREE.Mesh(new THREE.RingGeometry(rx-3.5,rx,48),new THREE.MeshLambertMaterial({color:0xc06a4a,side:THREE.DoubleSide})); tr.rotation.x=-Math.PI/2; tr.position.set(cx,Y1,cz); tr.scale.set(1,rz/rx,1); detail(f,tr);
  for(let k=0;k<4;k++){ const z=cz+(k-1.5)*16.5; detail(f,plane(24,13.3,cx,Y1+.01,z,0xd8b884)); detail(f,plane(.3,13.3,cx,Y1+.02,z,0xffffff)); } } }
// sports center: three courts
{ const g=roomBy('1100'); if(g){ const [cx,cz]=mid(g); for(let k=0;k<3;k++) detail(g,plane(26,15,cx,Y1,cz+(k-1)*21,0xd8b884)); } }
// seating: PAC house rises north from the stage; the West Auditorium (level 2) rises south from its stage
{ const h=roomBy('4000','Performing Arts Center'); if(h){ const [cx]=mid(h), W=(h.x1-h.x0);
  for(let i=0;i<9;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(W*.5+i*.9,.4+i*.45,2.2),new THREE.MeshLambertMaterial({color:0x8b3a3a})); s.position.set(cx,PLATE+(.4+i*.45)/2,h.z1-6-i*2.6); detail(h,s); } } }
{ const a=roomBy('2206'); if(a){ const [cx]=mid(a), W=(a.x1-a.x0);
  for(let i=0;i<7;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(W*.7,.3+i*.35,2),new THREE.MeshLambertMaterial({color:0x8b3a3a})); s.position.set(cx,FH+PLATE+(.3+i*.35)/2,a.z0+3+i*2.4); detail(a,s); } } }
// trees in courtyards
const treeMat=new THREE.MeshLambertMaterial({color:0x4f7d43});
for(const [x,z] of [[98,-80],[110,-70],[118,-82],[102,-66],[-135,134],[-161,160],[-135,175]]){ const t=new THREE.Mesh(new THREE.SphereGeometry(3.4,10,8),treeMat); t.position.set(x,4.2,z); scene.add(t); }

/* ---- walls: straight segments vectorized from the blue wall lines on the official plans (door gaps kept); glass where the plan shows a window ---- */
const WALL_H=3.8, wallMeshes=[];
function segGeo(list,H=WALL_H){ // merged boxes, one per wall segment
  const pos=[], idx=[]; let v=0;
  for(const [x1,z1,x2,z2,t] of list){ const L=Math.hypot(x2-x1,z2-z1); if(L<.05) continue; const nx=-(z2-z1)/L*t/2, nz=(x2-x1)/L*t/2;
    const c=[[x1+nx,z1+nz],[x2+nx,z2+nz],[x2-nx,z2-nz],[x1-nx,z1-nz]];
    for(const y of [0,H]) for(const [x,z] of c) pos.push(x,y,z);
    const q=[[0,1,2,0,2,3],[4,6,5,4,7,6],[0,4,5,0,5,1],[1,5,6,1,6,2],[2,6,7,2,7,3],[3,7,4,3,4,0]];
    for(const f of q) for(const k of f) idx.push(v+k); v+=8; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const WALLSEG={};
{ const add_=(f,gl,s)=>{ const k=f+(gl?'g':''); (WALLSEG[k]=WALLSEG[k]||[]).push(s); };
  const CUT={}; for(const [i,a,b] of DOOR_CUTS) (CUT[i]=CUT[i]||[]).push([a,b]);
  // also drop wall bits that sit inside a doorway (leftover door-swing lines that showed as black slits through the gold)
  const DR=DOORS.map(([f,x1,z1,x2,z2,t])=>{ const L=Math.hypot(x2-x1,z2-z1)||1; return {f,x1,z1,ux:(x2-x1)/L,uz:(z2-z1)/L,L,d:Math.max(.5,t*2.2)/2+.05}; });
  PLAN_S.forEach(([f,gl,x1,z1,x2,z2,t],i)=>{ if(gl) return; for(const D of DR){ if(D.f!==f) continue;
      // segment in door coords: a along the gap, b across it; clip to the box 0.03<a<L-0.03, |b|<d
      const A=p=>[(p[0]-D.x1)*D.ux+(p[1]-D.z1)*D.uz,-(p[0]-D.x1)*D.uz+(p[1]-D.z1)*D.ux], P=A([x1,z1]), Q=A([x2,z2]);
      let t0=0,t1=1; const clip=(p,q)=>{ if(Math.abs(p)<1e-9) return q>=0; const r=q/p; if(p<0){ if(r>t1) return false; if(r>t0) t0=r; } else { if(r<t0) return false; if(r<t1) t1=r; } return true; };
      const dx=Q[0]-P[0], dy=Q[1]-P[1];
      if(clip(-dx,P[0]-.03)&&clip(dx,D.L-.03-P[0])&&clip(-dy,P[1]+D.d)&&clip(dy,D.d-P[1])&&t1-t0>.001) (CUT[i]=CUT[i]||[]).push([t0,t1]); } });
  PLAN_S.forEach(([f,gl,x1,z1,x2,z2,t],i)=>{ if(!CUT[i]){ add_(f,gl,[x1,z1,x2,z2,t]); return; }
    // keep only the parts of this wall that aren't a doorway
    const cs=CUT[i].sort((p,q)=>p[0]-q[0]); let u0=0; const at=u=>[x1+(x2-x1)*u,z1+(z2-z1)*u];
    for(const [a,b] of cs.concat([[1,1]])){ if(a-u0>.002) add_(f,gl,[...at(u0),...at(a),t]); u0=Math.max(u0,b); } });
  for(const r of rooms){ if(r.kind!=='room'||!/^poster/.test(r.src||'')) continue; const T=.22;
    for(const s of [[r.x0,r.z0,r.x1,r.z0],[r.x0,r.z1,r.x1,r.z1],[r.x0,r.z0,r.x0,r.z1],[r.x1,r.z0,r.x1,r.z1]]) add_(r.floor,0,[...s,T]); }
  for(const k in WALLSEG){ const gl=k.endsWith('g'), f=parseInt(k,10);
    const m=new THREE.Mesh(segGeo(WALLSEG[k]), gl? new THREE.MeshLambertMaterial({color:0x7fb8d8,transparent:true,opacity:.35,depthWrite:false}) : new THREE.MeshBasicMaterial({color:0x333333,transparent:true}));
    m.position.y=(f-1)*FH+PLATE; m.userData.floor=f; m.userData.glass=gl; scene.add(m); wallMeshes.push(m); } }
/* ---- doorways: a gold threshold across each gap in the walls, so doors read as doors, not holes ---- */
const doorMeshes=[];
// each doorway gets a gold frame: a low threshold across the gap, full-height posts on both sides, and a header across the top
{ const sill={}, post={}, head={}, push=(o,f,v)=>(o[f]=o[f]||[]).push(v);
  for(const [f,x1,z1,x2,z2,t] of DOORS){ const L=Math.hypot(x2-x1,z2-z1); if(L<.3) continue; const ux=(x2-x1)/L, uz=(z2-z1)/L, d=Math.max(.5,t*2.2), pw=.16;
    push(sill,f,[x1,z1,x2,z2,d]);
    push(head,f,[x1-ux*pw,z1-uz*pw,x2+ux*pw,z2+uz*pw,d]);
    push(post,f,[x1-ux*pw,z1-uz*pw,x1+ux*.04,z1+uz*.04,d]); push(post,f,[x2-ux*.04,z2-uz*.04,x2+ux*pw,z2+uz*pw,d]); }
  const mat=new THREE.MeshBasicMaterial({color:0xe8c703,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
  for(const f in sill){ const y0=(f-1)*FH+PLATE;
    for(const [list,H,y] of [[sill[f],.12,.02],[post[f],WALL_H+.06,0],[head[f],.45,WALL_H-.39]]){ const m=new THREE.Mesh(segGeo(list,H),mat);
      m.position.y=y0+y; m.userData.floor=+f; m.renderOrder=2; scene.add(m); doorMeshes.push(m); } } }

/* ---- interior room meshes ---- */
const meshes=[];
for(const r of rooms){
  const y0=(r.floor-1)*FH; let h,y,geo;
  if(r.kind==='plate'){ h=PLATE; } else if(r.kind==='hall'){ h=.18; } else if(r.ground){ h=r.h; } else { h=r.h||3.4; }
  if(r.shape){ const s=shapeOf(r.shape,r.holes); geo=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false}); geo.rotateX(-Math.PI/2); y = r.ground? 0 : y0+PLATE; }
  else { const inset=(r.kind==='room'&&!r.ground)?.2:0; geo=new THREE.BoxGeometry(Math.max(.4,r.x1-r.x0-inset*2),h,Math.max(.4,r.z1-r.z0-inset*2));
    y = r.kind==='plate'? y0+PLATE/2 : r.kind==='hall'? y0+PLATE+.04 : r.ground? h/2 : y0+PLATE+h/2; }
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0xffffff,transparent:true}));
  if(r.shape) m.position.set(0,y,0); else m.position.set((r.x0+r.x1)/2,y,(r.z0+r.z1)/2);
  m.userData.r=r; scene.add(m); r.mesh=m; r.topY=(r.shape? y : y-h/2)+h;
  if(r.kind==='room'||r.kind==='court'){ const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,30),new THREE.LineBasicMaterial({color:0x333333,transparent:true})); m.add(e); r.edges=e; meshes.push(m); }
}
for(const s of shells) meshes.push(s.mesh);
const pick=rooms.filter(r=>r.kind==='room'||r.kind==='court');
const confirmed=pick.filter(r=>r.conf);

/*NAV*/
/* ================= labels ================= */
let C={};
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
/* Labels are measured now but only painted the first time they are actually drawn on screen,
   and each canvas is shrunk to 1x1 once the GPU has its copy. Hundreds of full-size label canvases
   are what made phones (iOS caps total canvas memory) run out of memory. */
const measureCtx=document.createElement('canvas').getContext('2d');
function makeSprite(lines,opts={}){
  const dpr=COARSE?1.75:2,padX=9,padY=6; let w=0,h=padY*2;
  for(const L of lines){ measureCtx.font=L.font; L.w=measureCtx.measureText(L.text).width; L.h=L.size*1.18; w=Math.max(w,L.w); h+=L.h; }
  w+=padX*2;
  const theme={panel:C.panel,line:C.line,route:C.route};
  const mat=new THREE.SpriteMaterial({depthTest:false,depthWrite:false,transparent:true,opacity:0});
  const sp=new THREE.Sprite(mat); sp.renderOrder=10; sp.userData.px={w,h};
  sp.onBeforeRender=()=>{ if(mat.map) return;
    const c=document.createElement('canvas'),g=c.getContext('2d'); c.width=Math.ceil(w*dpr); c.height=Math.ceil(h*dpr); g.scale(dpr,dpr);
    if(!opts.bare){ rr(g,1,1,w-2,h-2,6); g.fillStyle=opts.fill||theme.panel; g.globalAlpha=.94; g.fill(); g.globalAlpha=1; g.lineWidth=opts.sel?2.5:1; g.strokeStyle=opts.sel?theme.route:theme.line; g.stroke(); }
    let y=padY; g.textAlign='center'; g.textBaseline='top';
    for(const L of lines){ g.font=L.font; g.fillStyle=L.color; g.fillText(L.text,w/2,y+L.size*.06); y+=L.h; }
    const tex=new THREE.CanvasTexture(c); tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false;
    tex.onUpdate=()=>{ c.width=1; c.height=1; tex.onUpdate=null; };
    mat.map=tex; mat.opacity=1; mat.needsUpdate=true; inval(); };
  return sp; }
function disposeSprite(s){ scene.remove(s); if(s.material.map) s.material.map.dispose(); s.material.dispose(); }
function centerOf(r){ return [(r.x0+r.x1)/2,(r.z0+r.z1)/2]; }
function roomLabel(r){
  if(r.label){ disposeSprite(r.label); r.label=null; }
  if(!r.conf && !edits[r.id]) return;
  const d=disp(r), lines=[];
  if(d.num) lines.push({text:d.num,font:`700 28px ${C.mono}`,size:28,color:C.fg});
  lines.push({text:d.name,font:`600 ${d.num?18:24}px ${d.num?C.body:C.display}`,size:d.num?18:24,color:d.num?C.muted:C.fg});
  const sp=makeSprite(lines,{sel:selected===r});
  const roomW=Math.max(r.x1-r.x0,r.z1-r.z0), base=r.major?.1:.05;
  const k=Math.max(.03,Math.min(base,(Math.max(roomW,9)*1.1)/sp.userData.px.w));
  sp.scale.set(sp.userData.px.w*k,sp.userData.px.h*k,1);
  const [cx,cz]=centerOf(r); sp.position.set(cx,r.topY+1.2,cz); scene.add(sp); r.label=sp;
  r.labDist=55+14*Math.sqrt(Math.max(4,(r.x1-r.x0)*(r.z1-r.z0)));
}
const AREA=[['WEST BUILDING',-150,18,150],['SPORTS CENTER',-162,18,-26],['EAST BUILDING',108,22,-74],['FIELD HOUSE',36,22,-168],['PATRIOT WELLNESS CENTER',78,20,-200],['NATATORIUM',37,20,-82],
  ['PERFORMING ARTS CENTER',37,26,-8],['EAST COMMONS',94,14,-14],['GLASS COMMONS',-7,14,-32],['2019 ADDITION',168,24,-75],['STADIUM',-64,8,-110],['BASEBALL / SOFTBALL',-90,8,-400],['SOCCER',104,8,-362],
  ['HALF DAY ROAD · ROUTE 22',100,6,300],['PORT CLINTON ROAD',40,6,-585],['STEVENSON DRIVE',6,6,230],['N HOTZ ROAD',218,6,60],['DISTRICT OFFICE',-64,14,-216]];
const markers=[['Door 45',-192,212],['Door 46',-110,223],['Door 1',-97,80],['Door 17',95,-170],['SMARTdesk 3014',...(roomBy('3014')?mid(roomBy('3014')):[-58,-7])],['Sports Center entrance',-170,-70],['Circle Drive entrance',-7,-22],['PWC entrance',120,-131]];
let areaSprites=[],siteSprites=[],hallSprites=[];
function areaLabels(){
  areaSprites.forEach(disposeSprite); siteSprites.forEach(disposeSprite); hallSprites.forEach(disposeSprite);
  hallSprites=HALL_LABELS.map(([f,t,x,z])=>{ const sp=makeSprite([{text:t,font:`700 22px ${C.body}`,size:22,color:C.hallInk}],{fill:C.hallTag}); const k=.075;
    sp.scale.set(sp.userData.px.w*k,sp.userData.px.h*k,1); sp.position.set(x,(f-1)*FH+PLATE+1.4,z); sp.userData.floor=f; sp.renderOrder=9; scene.add(sp); return sp; });
  areaSprites=AREA.map(([t,x,y,z])=>{ const s=makeSprite([{text:t,font:`700 34px ${C.display}`,size:34,color:C.fg}]); const k=.19; s.scale.set(s.userData.px.w*k,s.userData.px.h*k,1); s.position.set(x,y,z); scene.add(s); return s; });
  siteSprites=[];
  for(const [t,x,z] of siteLabels){ const sp=makeSprite([{text:t,font:`700 36px ${C.display}`,size:36,color:C.panel}],{fill:C.fg}); const k=.22; sp.scale.set(sp.userData.px.w*k,sp.userData.px.h*k,1); sp.position.set(x,4,z); scene.add(sp); siteSprites.push(sp); }
  for(const [t,x,z] of markers){ const sp=makeSprite([{text:t,font:`600 22px ${C.body}`,size:22,color:C.panel}],{fill:C.fg}); const k=.13; sp.scale.set(sp.userData.px.w*k,sp.userData.px.h*k,1); sp.position.set(x,9,z); scene.add(sp); siteSprites.push(sp); }
}

/* ================= theme ================= */
function readTheme(){ inval();
  const cs=getComputedStyle(document.documentElement), v=n=>cs.getPropertyValue(n).trim();
  C={panel:v('--panel'),fg:v('--fg'),muted:v('--muted'),line:v('--line'),accent:v('--accent'),pine:v('--pine'),display:v('--f-display'),body:v('--f-body'),mono:v('--f-mono'),edge:v('--edge')};
  C.route=v('--route')||C.accent; C.accentC=new THREE.Color(C.route); C.hallTag=v('--hall-tag'); C.hallInk=v('--hall-ink');
  renderer.setClearColor(new THREE.Color(v('--scene')));
  for(const s of siteMeshes) s.mesh.material.color.set(v(s.tok));
  for(const r of rooms){ if(!r.mesh) continue;
    const tok=r.kind==='plate'?'--plate':r.kind==='hall'?'--hall':TYPES[r.type].tok;
    r.mesh.material.color.set(v(tok)); if(r.edges) r.edges.material.color.set(r.conf?C.edge:v('--line')); }
  for(const s of shells) s.outline.material.color.set(C.edge);
  for(const w of wallMeshes) if(!w.userData.glass) w.material.color.set(v('--wall'));
  if(doorMeshes.length) doorMeshes[0].material.color.set(v('--door'));
}
function rebuildLabels(){ for(const r of pick) roomLabel(r); areaLabels(); applyMode(); }

/* ================= view modes: Outside (photo-style exterior) or a level (see-through interior) ================= */
function applyMode(){ inval();
  const out=mode==='all';
  for(const s of shells){ s.mesh.visible=out; s.active=out; s.outline.visible=!out; }
  roofExtras.visible=out;
  for(const r of rooms){ if(!r.mesh) continue;
    let vis=!out, ghost=false, lab=false;
    if(!out){ const N=+mode;
      if(r.ground){ vis=true; lab=N===1; }
      else if(r.floor>N) vis=false; else if(top(r)>=N) lab=true; else ghost=true; }
    r.mesh.visible=vis; r.ghost=ghost; r.active=vis&&!ghost; r.showLab=lab&&vis;
    const unk=r.type==='unk', see=r.glass&&r.active;
    r.mesh.material.opacity= ghost? .08 : see? .28 : unk? .75 : 1; r.mesh.material.depthWrite=!ghost && !see;
    if(r.edges) r.edges.material.opacity= ghost? .1 : unk? .45 : see? .9 : .6;
  }
  for(const d of details){ d.mesh.visible=!out && d.p.active; }
  areaSprites.forEach(s=>s.visible=out);
  hallSprites.forEach(s=>s.visible=!out && s.userData.floor===+mode);
  for(const d of doorMeshes) d.visible=!out && d.userData.floor===+mode;
  for(const w of wallMeshes){ const f=w.userData.floor; w.visible=!out && f<=+mode; const cur=f===+mode;
    if(w.userData.glass){ w.material.opacity=cur?.35:.04; continue; }
    w.material.opacity=cur?1:.06; w.material.depthWrite=cur; }
  document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===String(mode))));
  const onLvl= out? confirmed : confirmed.filter(r=>!r.ground && onFloor(r,+mode));
  document.getElementById('badgeTitle').textContent= out? 'Outside' : 'Level '+mode;
  document.getElementById('badgeSub').textContent= out? 'Pick a level to go inside' : `${onLvl.length} rooms`;
  paintSel(); renderList(); if(typeof paintRoute==='function') paintRoute();
}
function setMode(m){ mode= m==='all'?'all':String(m); applyMode(); }
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
function paintSel(){ inval();
  for(const r of pick){ if(!r.mesh) continue; const m=r.mesh.material;
    if(r===selected){ m.emissive=C.accentC.clone().multiplyScalar(.5); r.edges.material.color.copy(C.accentC); r.edges.material.opacity=1; }
    else { m.emissive= (r===hovered&&r.active)? C.accentC.clone().multiplyScalar(.2) : new THREE.Color(0); r.edges.material.color.set(r.conf?C.edge:C.line); } }
  for(const s of shells){ const mats=Array.isArray(s.mesh.material)?s.mesh.material:[s.mesh.material]; }
}

/* ================= list + number estimator ================= */
const listEl=document.getElementById('list'), q=document.getElementById('q');
function estimate(numStr){
  // nearest room in the same hallway block (first two digits) on the plans; level 3 uses the ≈8xxx copies
  const n=parseInt(numStr,10), blk=Math.floor(n/100); let best=null,bd=1e9;
  for(const r of pick){ const k=r.num||(r.range||'').replace('≈',''); const m=parseInt(k.slice(0,4),10);
    if(isNaN(m)||Math.floor(m/100)!==blk) continue; const d=Math.abs(m-n); if(d<bd){ bd=d; best=r; } }
  return best; }
function zoneText(n){ const z=Math.floor(n/1000); return ({1:'West Building, level 1',2:'West Building, level 2',3:'The Link, between the two buildings',4:'Performing arts wing',5:'Field House & natatorium',6:'East Building, level 1',7:'East Building, level 2',8:'East Building, level 3'})[z]||'Unknown zone'; }
function sortKey(r){ const d=disp(r); return (d.num?'a'+d.num:'b'+d.name); }
function renderList(){
  const s=q.value.trim().toLowerCase();
  let L=confirmed.slice().concat(pick.filter(r=>!r.conf&&(edits[r.id]||(s&&r.est3&&r.range.includes(s)))));
  if(s) L=L.filter(r=>{ const d=disp(r); return (d.num+' '+d.name+' '+BLD[r.bld]+' '+(r.note||'')).toLowerCase().includes(s); });
  else if(mode!=='all') L=L.filter(r=>onFloor(r,+mode)||(r.ground&&mode==='1'));
  L.sort((a,b)=>sortKey(a).localeCompare(sortKey(b),undefined,{numeric:true}));
  listEl.innerHTML=''; const frag=document.createDocumentFragment();
  if(/^\d{4}$/.test(s) && !L.some(r=>disp(r).num.includes(s)||(r.range||'')==='≈'+s)){
    const e=estimate(s), b=document.createElement('button'); b.className='row est';
    b.innerHTML='<span class="n"></span><span class="nm"></span><span class="meta"></span>';
    b.querySelector('.n').textContent=s; b.querySelector('.nm').textContent=e?'Not labeled on the plan':'Not on the map';
    b.querySelector('.meta').textContent=zoneText(+s)+(e?` · nearest labeled room: ${disp(e).num||e.range}`:' · no rooms in that block');
    if(e) b.addEventListener('click',()=>{ estNum=s; select(e,true); }); frag.appendChild(b); }
  for(const r of L){ const d=disp(r), b=document.createElement('button');
    b.className='row'; b.setAttribute('aria-current',String(r===selected));
    b.innerHTML='<span class="n"></span><span class="nm"></span><span class="meta"></span>';
    if(d.num) b.querySelector('.n').textContent=d.num; else b.querySelector('.n').innerHTML='<svg class="i" viewBox="0 0 24 24" style="width:18px;height:18px;color:var(--muted)"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    const nm=b.querySelector('.nm'), sw=document.createElement('i'); sw.className='sw'; sw.style.background=`var(${TYPES[r.type].tok})`; nm.appendChild(sw); nm.appendChild(document.createTextNode(d.name));
    b.querySelector('.meta').textContent=`${BLD[r.bld]} · ${r.ground?'Outdoors':(r.span>1?`Levels ${r.floor}–${top(r)}`:'Level '+r.floor)}`;
    b.addEventListener('click',()=>{ estNum=null; select(r,true); }); frag.appendChild(b); }
  if(!frag.childNodes.length){ listEl.innerHTML='<div class="empty">Nothing matches. Try a four-digit room number to see its estimated spot.</div>'; return; }
  listEl.appendChild(frag); }
q.addEventListener('input',renderList);
const lg=document.getElementById('legend');
{ const s=document.createElement('span'); s.innerHTML='<i class="sw" style="background:var(--hall)"></i>'; s.appendChild(document.createTextNode('Hallway')); lg.appendChild(s); }
{ const s=document.createElement('span'); s.innerHTML='<i class="sw" style="background:var(--door)"></i>'; s.appendChild(document.createTextNode('Doorway')); lg.appendChild(s); }
for(const [k,t] of Object.entries(TYPES)){ if(k==='link'||k==='bldg') continue; const s=document.createElement('span'); s.innerHTML=`<i class="sw" style="background:var(${t.tok})"></i>`; s.appendChild(document.createTextNode(t.label)); lg.appendChild(s); }
document.getElementById('stConf').textContent=pick.filter(r=>(r.src==='plan'||/^poster/.test(r.src))&&r.num&&!r.est3).length;
document.getElementById('stEst').textContent=pick.filter(r=>r.est3).length;

/* ================= selection card ================= */
const card=document.getElementById('card'); let editing=false, estNum=null;
function select(r,fly){
  const prev=selected; selected=r; editing=false;
  if(r && !r.ext && !r.ground && (mode==='all'||!onFloor(r,+mode))) mode=String(r.floor);
  if(prev&&prev!==r&&!prev.ext) roomLabel(prev);
  if(r&&!r.ext) roomLabel(r);
  applyMode(); if(r&&fly) flyTo(r); renderCard(); if(r&&!r.ext&&disp(r).num) setHash('room='+encodeURIComponent(disp(r).num)); }
function renderCard(){
  const r=selected; if(!r){ card.hidden=true; return; }
  card.hidden=false; const d=disp(r);
  if(r.ext){ const s=SRC[r.src];
    card.innerHTML=`<div class="top"><div><div class="nm"></div></div><button class="x" aria-label="Close"><svg class="i" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="meta"></div><span class="chip ok">Outline from OpenStreetMap · look from satellite & Street View</span><div class="desc"></div>
      <div class="acts"><button class="ghostbtn" id="goIn">See inside</button>${s?`<a class="ghostbtn" style="text-decoration:none" target="_blank" rel="noopener" href="${s[1]}">Open source</a>`:''}</div>`;
    card.querySelector('.nm').textContent=r.name; card.querySelector('.meta').textContent=BLD[r.bld]||'Campus';
    card.querySelector('.desc').textContent=r.note+(s?` Source: ${s[0]}.`:'');
    card.querySelector('.x').onclick=()=>select(null); card.querySelector('#goIn').onclick=()=>{ selected=null; setMode('1'); renderCard(); };
    return; }
  const lvl=r.ground?'Outdoors':(r.span>1?`Levels ${r.floor}–${top(r)}`:`Level ${r.floor}`);
  const shownNum=d.num||(estNum&&!r.conf?estNum:'');
  let chip,desc=r.note||'';
  if(r.photo){ chip='<span class="chip ok">Number from a door photo · position estimated</span>'; }
  else if(r.user){ chip='<span class="chip">Described by a student · position estimated</span>'; const s=SRC[r.src]; if(s) desc+=` Source: ${s[0]}.`; }
  else if(r.est3){ chip=`<span class="chip">Level 3 · position estimated</span>`;
    if(!r.conf) desc=`Level 3 of the East Building isn't in the published floor plans. This outline repeats level 2, so it is probably room ${r.range.replace('≈','')}.`;
    const s=SRC[r.src]; if(r.conf&&s) desc+=` Source: ${s[0]}.`; }
  else if(r.conf){ const s=SRC[r.src], p=r.psrc&&SRC[r.psrc];
    chip=(r.src==='plan'||r.src==='pdf3')?'<span class="chip ok">From the official floor plan</span>':(r.src==='poster'||r.src==='poster2')?'<span class="chip ok">From the posted evacuation plan</span>':`<span class="chip ok">${d.num?'Number & name':'Name'} from sources</span>`;
    if(p) desc+=` Club/office info: ${p[0]}.`; if(s&&r.src!=='plan') desc+=(desc?' ':'')+`Source: ${s[0]}.`; }
  else if(r.cut){ chip='<span class="chip">Position estimated</span>'; desc=`The plan images end just short of the West Building's south wall, so the rooms along it aren't shown. Rooms numbered ${r.range} (such as ${r.floor===1?'1902–1914':'2900s'}) are likely here.`; }
  else { chip='<span class="chip">Unconfirmed</span>'; desc='Not labeled on the floor plan.'; }
  card.innerHTML=`<div class="top"><div>${shownNum?'<div class="num"></div>':''}<div class="nm"></div></div><button class="x" aria-label="Close"><svg class="i" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div class="meta"></div>${chip}<div class="desc"></div>
    ${editing?`<form class="edit"><label>Room number<input id="edNum" autocomplete="off"></label><label>Room name<input id="edName" autocomplete="off"></label>
      <div class="acts"><button class="primary" type="submit">Save label</button><button class="ghostbtn" type="button" id="edCancel">Cancel</button>${edits[r.id]?'<button class="ghostbtn" type="button" id="edReset">Restore original</button>':''}</div></form>`
    :`<div class="acts"><button class="ghostbtn" id="edOpen">Edit label</button><button class="ghostbtn" id="zoomTo">Zoom to room</button><button class="ghostbtn" id="dirTo">Directions here</button><button class="ghostbtn" id="dirFrom">From here</button>${r.conf&&SRC[r.src]&&SRC[r.src][1]?`<a class="ghostbtn" style="text-decoration:none" target="_blank" rel="noopener" href="${SRC[r.src][1]}">Open source</a>`:''}</div>`}`;
  if(shownNum) card.querySelector('.num').textContent=shownNum;
  card.querySelector('.nm').textContent= r.conf||edits[r.id]? d.name : (estNum?'Estimated location':'Unconfirmed room');
  card.querySelector('.meta').textContent=`${BLD[r.bld]} · ${lvl} · ${TYPES[r.type].label}${edits[r.id]?' · edited by you':''}`;
  card.querySelector('.desc').textContent=desc;
  card.querySelector('.x').onclick=()=>select(null);
  if(editing){ const f=card.querySelector('form'), n=card.querySelector('#edNum'), m=card.querySelector('#edName');
    n.value=d.num||estNum||''; m.value=r.conf?d.name:''; n.focus();
    f.onsubmit=e=>{ e.preventDefault(); edits[r.id]={num:n.value.trim(),name:m.value.trim()||'Room',origNum:r.num||r.range||'',origName:r.conf?r.name:'(unconfirmed)',bld:r.bld,floor:r.floor}; saveEdits(); editing=false; roomLabel(r); applyMode(); renderCard(); };
    card.querySelector('#edCancel').onclick=()=>{ editing=false; renderCard(); };
    const rs=card.querySelector('#edReset'); if(rs) rs.onclick=()=>{ delete edits[r.id]; saveEdits(); editing=false; roomLabel(r); applyMode(); renderCard(); };
  } else { card.querySelector('#edOpen').onclick=()=>{ editing=true; renderCard(); }; card.querySelector('#zoomTo').onclick=()=>flyTo(r);
    const tag=disp(r).num?`${disp(r).num} · ${disp(r).name}`:disp(r).name;
    card.querySelector('#dirTo').onclick=()=>{ $('dTo').value=tag; if($('dFrom').value) go(); else $('dFrom').focus(); };
    card.querySelector('#dirFrom').onclick=()=>{ $('dFrom').value=tag; if($('dTo').value) go(); else $('dTo').focus(); }; } }
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&selected&&!editing) select(null); });

/* ================= camera ================= */
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; let anim=null;
function flyTo(r){ const [cx,cz]=centerOf(r); const c=new THREE.Vector3(cx,r.ext?0:(r.floor-1)*FH,cz);
  const dir=camera.position.clone().sub(controls.target).normalize(); if(dir.y<.6){ dir.y=.6; dir.normalize(); }
  const dist=Math.max(55,Math.max(r.x1-r.x0,r.z1-r.z0)*2.3)*(camera.aspect<1?1.45:1); startAnim(c,c.clone().add(dir.multiplyScalar(dist))); }
function startAnim(t,p){ anim={t0:performance.now(),dur:reduce?0:750,fT:controls.target.clone(),fP:camera.position.clone(),tT:t,tP:p}; }
document.getElementById('resetView').onclick=()=>startAnim(HOME_T.clone(),HOME_P.clone());

/* ================= picking ================= */
const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(), tip=document.getElementById('tip');
function pickAt(ev){ const b=renderer.domElement.getBoundingClientRect();
  ptr.x=((ev.clientX-b.left)/b.width)*2-1; ptr.y=-((ev.clientY-b.top)/b.height)*2+1; ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects(meshes.filter(m=>m.userData.r.active && m.visible),false);
  for(const h of hits){ const r=h.object.userData.r; if(r.glass && hits.length>1 && h===hits[0]) continue; return r; }
  return hits.length? hits[0].object.userData.r : null; }
let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY}; });
renderer.domElement.addEventListener('pointerup',e=>{ if(!down) return; const mv=Math.hypot(e.clientX-down.x,e.clientY-down.y); down=null; if(mv<5){ estNum=null; select(pickAt(e),false); } });
renderer.domElement.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||e.buttons){ tip.hidden=true; return; }
  const r=pickAt(e); if(r!==hovered){ hovered=r; paintSel(); }
  renderer.domElement.classList.toggle('hovering',!!r);
  if(r){ const d=disp(r), b=stage.getBoundingClientRect(); tip.hidden=false; tip.innerHTML='';
    if(d.num){ const s=document.createElement('span'); s.className='n'; s.textContent=d.num; tip.appendChild(s); }
    tip.appendChild(document.createTextNode(r.ext||r.conf||edits[r.id]? d.name : (r.range?`Unconfirmed · about ${r.range}`:'Unconfirmed room')));
    tip.style.left=(e.clientX-b.left)+'px'; tip.style.top=(e.clientY-b.top)+'px'; } else tip.hidden=true; });
renderer.domElement.addEventListener('pointerleave',()=>{ tip.hidden=true; if(hovered){ hovered=null; paintSel(); } });

/* ================= copy corrections ================= */
document.getElementById('copyEdits').onclick=()=>{
  const out=Object.values(edits).map(e=>({area:BLD[e.bld],level:e.floor,was:`${e.origNum} ${e.origName}`.trim(),now:`${e.num} ${e.name}`.trim()}));
  const msg=document.getElementById('copyMsg'), fb=document.getElementById('copyFallback');
  if(!out.length){ msg.textContent='No edits yet.'; return; }
  const txt=JSON.stringify(out,null,2); const fallback=()=>{ fb.hidden=false; fb.value=txt; fb.select(); msg.textContent='Select and copy the text below.'; };
  try{ navigator.clipboard.writeText(txt).then(()=>{ msg.textContent=`Copied ${out.length} correction${out.length>1?'s':''}.`; },fallback); }catch(e){ fallback(); } };

/* ================= loop ================= */
const needle=document.getElementById('needle');
function resize(){ const w=stage.clientWidth,h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/Math.max(1,h); camera.updateProjectionMatrix(); inval(); }
new ResizeObserver(resize).observe(stage); resize();
const tmp=new THREE.Vector3();
function loop(now){
  if(anim){ const t=anim.dur?Math.min(1,(now-anim.t0)/anim.dur):1, e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    controls.target.lerpVectors(anim.fT,anim.tT,e); camera.position.lerpVectors(anim.fP,anim.tP,e); if(t>=1) anim=null; }
  if(anim) inval();
  if(controls.update()) inval();
  if(dirty>0){ dirty--;
    needle.style.transform=`rotate(${controls.getAzimuthalAngle()}rad)`;
    // keep the near plane as far out as possible: stops flat ground layers (fields, track, lots) from flickering through each other
    const d=camera.position.distanceTo(controls.target), near=Math.max(.5,Math.min(40,d*.05));
    if(Math.abs(near-camera.near)>near*.1){ camera.near=near; camera.updateProjectionMatrix(); }
    for(const r of pick){ if(!r.label) continue; const [cx,cz]=centerOf(r);
      r.label.visible=r.showLab && (r.major||r===selected||camera.position.distanceTo(tmp.set(cx,r.topY,cz))<r.labDist); }
    if(mode!=='all') for(const sp of hallSprites) sp.visible= sp.userData.floor===+mode && camera.position.distanceTo(sp.position)<240;
    renderer.render(scene,camera); }
  requestAnimationFrame(loop); }

/*NAVUI*/
/* ================= boot ================= */
function onTheme(){ readTheme(); rebuildLabels(); renderCard(); if(ROUTE) drawRoute(ROUTE); }
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',onTheme);
new MutationObserver(onTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
readTheme(); rebuildLabels(); setMode('all'); requestAnimationFrame(loop);
const fontsReady=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2500))]):Promise.resolve();
fontsReady.then(()=>{ readTheme(); rebuildLabels(); });
{ const h=new URLSearchParams((location.hash||'').slice(1));
  if(h.get('from')&&h.get('to')){ $('dFrom').value=h.get('from'); $('dTo').value=h.get('to'); setTimeout(go,300); }
  else if(h.get('room')){ const r=findRoom(h.get('room')); if(r) setTimeout(()=>{ estNum=null; select(r,true); },300); } }
})();
