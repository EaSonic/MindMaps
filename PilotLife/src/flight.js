export const AIRCRAFT = [
 {id:'eastern',name:'China Eastern',model:'A320 · twin engine',color:0x173f8f,accent:0xd82430,cost:0,ceiling:12000},
 {id:'spring',name:'Spring Airlines',model:'A320 · twin engine',color:0x458b32,accent:0x92ba42,cost:600,ceiling:12000},
 {id:'cathay',name:'Cathay Pacific',model:'A350 · twin engine',color:0x00655f,accent:0x7ba6a0,cost:1200,ceiling:13000},
 {id:'president',name:"American president’s plane",model:'Presidential transport',color:0x2b698e,accent:0xbda569,cost:2000,ceiling:13000},
 {id:'fighter',name:'Falcon fighter',model:'Fictional jet · high altitude',color:0x69737b,accent:0x313b45,cost:2800,ceiling:20000}
];
const city=(name,lat,lon)=>({name,lat,lon});
export const CITIES={Paris:city('Paris',48.86,2.35),Shanghai:city('Shanghai',31.23,121.47),London:city('London',51.51,-.13),Tokyo:city('Tokyo',35.68,139.69),Beijing:city('Beijing',39.9,116.4),Washington:city('Washington',38.9,-77.03),Rome:city('Rome',41.9,12.5),Tehran:city('Tehran',35.69,51.39),'Bermuda Triangle':city('Bermuda Triangle',27,-69),'San Francisco':city('San Francisco',37.77,-122.42)};
export const INTRO={id:'intro',from:'Paris',to:'Shanghai',hazard:null};
export const ROUTES=[
 {id:'bermuda',from:'Bermuda Triangle',to:'San Francisco',hazard:'Bermuda Triangle'},
 {id:'london',from:'Shanghai',to:'London',hazard:null},
 {id:'tokyo',from:'Paris',to:'Tokyo',hazard:null},
 {id:'beijing',from:'London',to:'Beijing',hazard:null},
 {id:'iran',from:'Tehran',to:'Rome',hazard:'Iran'},
 {id:'washington',from:'Tokyo',to:'Washington',hazard:null},
 {id:'paris',from:'Beijing',to:'Paris',hazard:null},
 {id:'shanghai',from:'San Francisco',to:'Shanghai',hazard:null}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const freshCareer=()=>({credits:0,earned:0,levels:0,emergencies:0,unlocked:['eastern'],aircraft:'eastern'});
export function loadCareer(raw){try{const c=JSON.parse(raw),d=freshCareer();if(!c||typeof c!=='object')return d;for(const k of ['credits','earned','levels','emergencies'])d[k]=Number.isFinite(c[k])?clamp(Math.floor(c[k]),0,1e8):0;d.earned=Math.max(d.credits,d.earned);d.unlocked=[...new Set(['eastern',...(Array.isArray(c.unlocked)?c.unlocked:[]).filter(id=>AIRCRAFT.some(a=>a.id===id))])];d.aircraft=d.unlocked.includes(c.aircraft)?c.aircraft:'eastern';return d;}catch{return freshCareer();}}
export function assignRoute(c,random=Math.random){return c.levels===0?{...INTRO}:{...ROUTES[Math.min(ROUTES.length-1,Math.floor(random()*ROUTES.length))]};}
export function createFlight(c,random=Math.random){const route=assignRoute(c,random);return {route,aircraft:c.aircraft,phase:'cruise',location:route.from,target:'Runway 27',x:0,y:430,z:2600,heading:0,pitch:0,roll:0,speed:88,vertical:0,throttle:.65,gear:false,broken:0,elapsed:0,approachTime:0,phaseTime:0,progress:0,assist:false,paid:false,reward:0,damage:0,failureAt:18+random()*35,secondFailureAt:55+random()*20,attackAt:10+random()*12,attackCount:0,warning:'Explore the skies above '+route.from,worldVersion:0,random};}
export function beginApproach(f){f.phase='approach';f.location=f.route.to;f.x=f.route.id==='intro'?0:1150;f.y=190;f.z=3000;f.heading=0;f.pitch=-.035;f.roll=0;f.speed=72;f.throttle=.42;f.vertical=-2.5;f.approachTime=0;f.progress=1;f.phaseTime=0;f.worldVersion++;f.target=f.route.id==='intro'?'Huangpu River':'Runway 27';f.warning=f.route.id==='intro'?'Shanghai ahead. Prepare for your emergency landing.':'Approach assigned runway. Lower landing gear before touchdown.';}
export function failEngine(f,count=1){f.broken=clamp(count,0,2);f.target=f.route.to==='Shanghai'?'Huangpu River':'Open water';f.warning=f.broken===2?'BOTH ENGINES FAILED · Glide to water · Gear OFF':'LEFT ENGINE FAILED · Right engine working · Find a safe landing';}
export function updateFlight(f,input,dt){if(!['cruise','approach'].includes(f.phase))return;f.elapsed+=dt;f.phaseTime+=dt;
 if(f.phase==='cruise'){f.progress=clamp(f.elapsed/38,0,.99);if(input.skip||f.elapsed>=38){beginApproach(f);return;}f.location=f.progress<.2?f.route.from:f.progress>.85?f.route.to:f.route.hazard||'Forested mountain range';}
 else{f.approachTime+=dt;if(f.route.id==='intro'&&f.approachTime>=7&&f.broken<2)failEngine(f,2);else if(f.route.id!=='intro'&&f.approachTime>=f.failureAt&&f.broken===0)failEngine(f,1);else if(f.route.id!=='intro'&&f.approachTime>=f.secondFailureAt&&f.broken===1)failEngine(f,2);}
 if(input.faster)f.throttle=clamp(f.throttle+dt*.3,0,1);if(input.slower)f.throttle=clamp(f.throttle-dt*.3,0,1);
 const turn=(input.right?1:0)-(input.left?1:0),pitch=(input.up?1:0)-(input.down?1:0);f.roll+=(turn*-.45-f.roll)*Math.min(1,dt*2.4);f.heading+=turn*dt*.24;
 if(pitch)f.pitch=clamp(f.pitch+pitch*dt*.18,-.48,.4);else f.pitch*=Math.exp(-dt*.4);
 if(f.assist&&f.phase==='approach'){
  const tx=f.broken&&!f.gear?0:1150,dx=tx-f.x,transfer=f.broken&&!f.gear&&Math.abs(dx)>170,climb=transfer&&f.broken===1&&f.y<300,desiredHeading=climb?0:clamp(Math.atan2(dx,transfer?Math.max(150,f.y*2):Math.max(300,f.z+850)),-.85,.85);let delta=desiredHeading-f.heading;delta=Math.atan2(Math.sin(delta),Math.cos(delta));if(!turn)f.heading+=clamp(delta,-.25,.25)*dt;if(!pitch)f.pitch=-Math.asin(clamp((climb?-8:transfer?1.2:f.y>10?4.2:2.4)/Math.max(40,f.speed),-.2,.2));if(!input.faster&&!input.slower)f.throttle=climb?.65:f.broken===2?0:f.broken===1?.45:.28;f.roll*=Math.exp(-dt*3);
 }
 const a=AIRCRAFT.find(a=>a.id===f.aircraft),fighter=f.aircraft==='fighter';let desired=f.broken===2?62:40+f.throttle*(fighter?200:105)*(f.broken===1?.72:1);if(f.gear)desired-=8;
 f.speed+=(desired-f.speed)*Math.min(1,dt*.22);f.vertical=f.speed*Math.sin(f.pitch)-(f.broken===2&&!f.assist?1.8:0);if(f.speed<45)f.vertical-=7;f.y=clamp(f.y+f.vertical*dt,-1,a.ceiling);f.x+=Math.sin(f.heading)*f.speed*dt;f.z-=Math.cos(f.heading)*f.speed*dt;
 if(f.route.hazard&&f.phase==='approach'&&f.approachTime>=f.attackAt){f.attackCount++;f.attackAt+=10+f.random()*9;if(f.attackCount===1)failEngine(f,1);else if(f.attackCount>=3)failEngine(f,2);f.warning='Fictional enemy jets · Evasive steering · Land safely';}
 if(Math.abs(f.x)>7500||Math.abs(f.z)>8500){f.warning='Leaving the flight area. Turn toward the landing marker.';}
}
export function landingOutcome({surface,speed,vertical,roll,pitch,gear}){const stable=speed>=30&&speed<=95&&Math.abs(vertical)<=6&&Math.abs(roll)<.28&&Math.abs(pitch)<.25;if(surface==='water'&&stable&&!gear)return 'water';if(surface==='runway'&&stable&&gear)return 'runway';return 'crash';}
export function completeFlight(f,c,outcome){if(f.paid)return;f.paid=true;f.reward=outcome==='water'?850:600;if(f.broken||outcome==='water')c.emergencies++;c.levels++;c.credits+=f.reward;c.earned=(c.earned||0)+f.reward;f.phase='complete';f.phaseTime=0;}
export function unlockAircraft(c,id){const a=AIRCRAFT.find(a=>a.id===id);if(!a)return false;if(c.unlocked.includes(id)){c.aircraft=id;return true;}if(c.credits<a.cost)return false;c.credits-=a.cost;c.unlocked.push(id);c.aircraft=id;return true;}
export function restartFlight(f){const route=f.route,aircraft=f.aircraft,random=f.random;Object.assign(f,createFlight({levels:route.id==='intro'?0:1,aircraft},random),{route});beginApproach(f);f.gear=false;f.y=220;f.speed=72;f.broken=route.id==='intro'?2:0;f.warning='Airborne checkpoint restored · You can try the landing again';}
