import {CALM_SEA,LAND_Y,DAM_X,clamp,hash} from './locations.js';
const CLOTHES=[0x3d6f9c,0xb55b46,0xd4cbaa,0x5e805c,0x9c8062,0x384b63,0xc2a254,0x758da0];
export function makePerson(s,x,y,index){return {id:`person-${++s.serial}`,x,y,angle:0,state:'street',color:CLOTHES[index%CLOTHES.length],skin:[0xc59573,0xa97653,0xe0b294][index%3],speed:2.4+hash(index)*1.8,roofId:null,boatId:null,offset:0,rescuer:false,exhaustion:0,submergedTime:0};}
export function makeBoat(s,kind,x){const surface=s.water.sample(x).surface;return {id:`boat-${++s.serial}`,kind,x,y:surface-.25,angle:0,length:kind==='skiff'?4:kind==='fishing'?6:kind==='rescue-launch'?9:7,rescue:kind.startsWith('rescue'),capsized:false,passengers:[],automatic:false,previousSurface:surface};}
export function positionPassenger(p,b){const deck=b.length>15?4.6:1.2,angle=b.length>15?-b.angle:b.angle;p.x=b.x+p.offset*Math.cos(angle)-deck*Math.sin(angle);p.y=b.y+p.offset*Math.sin(angle)+deck*Math.cos(angle);p.angle=angle;}
function fall(s,p,x,y){p.state='swimming';p.boatId=null;p.roofId=null;p.x=x;p.y=y;p.exhaustion=0;s.splash(x,y,5);}
export function updateActors(s,dt){
  for(const b of s.boats){const w=s.water.sample(b.x),a=s.water.sample(b.x-b.length*.4),z=s.water.sample(b.x+b.length*.4);const rough=Math.abs(w.surface-b.previousSurface)/Math.max(dt,.001);b.previousSurface=w.surface;
    if(!b.capsized){const tilt=Math.atan2(z.surface-a.surface,b.length*.8);b.angle+=(tilt-b.angle)*Math.min(1,dt*3);if(Math.abs(tilt)>.92||rough>(b.rescue?100:48)||Math.abs(w.velocity)>(b.rescue?21:13)){b.capsized=true;s.splash(b.x,w.surface,12);}}
    if(b.capsized)b.angle+=(Math.PI-b.angle)*Math.min(1,dt*2);
    b.y+=(w.surface-(b.capsized?.5:.25)-b.y)*Math.min(1,dt*7);
    let next=clamp(b.x+dt*clamp(w.velocity*.12+(b.rescue&&!b.capsized?4.5:0),-3,7),-65,142),half=b.length/2;
    const barrierHalf=1.8,crest=CALM_SEA+s.dam.height;
    if(!s.dam.breached&&Math.min(a.surface,z.surface)<crest+1){if(b.x<DAM_X&&next+half>DAM_X-barrierHalf)next=Math.min(next,DAM_X-barrierHalf-half-.05);else if(b.x>DAM_X&&next-half<DAM_X+barrierHalf)next=Math.max(next,DAM_X+barrierHalf+half+.05);}
    const tip=next+Math.sign(next-b.x)*half;if(w.depth>=1.3&&s.water.sample(next).depth>=1.3&&s.water.sample(tip).depth>=1.3)b.x=next;
    if(b.rescue&&!b.capsized){for(const p of s.people){if(['swimming','submerged'].includes(p.state)&&Math.abs(p.x-b.x)<b.length*.5&&Math.abs(p.y-w.surface)<2&&b.passengers.length<5){p.state='aboard';p.boatId=b.id;p.offset=(b.passengers.length-2)*.8;p.submergedTime=0;b.passengers.push(p.id);s.event('A rescue boat picked up a swimmer');}}}
  }
  for(const ship of s.ships){const w=s.water.sample(ship.x),bow=s.water.sample(ship.x+ship.length*.35),force=Math.max(0,bow.surface-CALM_SEA-3)+Math.abs(w.velocity)*.5;
    if(force>6)ship.flooding=clamp(ship.flooding+dt*force*.006,0,1);
    if(ship.flooding>.1){ship.angle+=((ship.flooding*1.35)-ship.angle)*dt*.3;ship.sunk+=dt*ship.flooding*.65;}
    ship.y=w.surface-ship.sunk;ship.x+=dt*clamp(w.velocity*.03,-.5,.5);ship.y=Math.max(-23,ship.y);
  }
  for(const p of s.people){const w=s.water.sample(p.x);
    if(p.state==='aboard'){const b=[...s.boats,...s.ships].find(b=>b.id===p.boatId);if(!b)continue;positionPassenger(p,b);
      if(b.capsized||Math.abs(b.angle)>.5||p.y<w.surface-.2){b.passengers=b.passengers.filter(id=>id!==p.id);fall(s,p,p.x,w.surface-.3);}continue;}
    if(p.state==='street'||p.state==='climbing'){
      if(w.depth>1.1){fall(s,p,p.x,w.surface-.3);continue;}
      let roof=s.buildings.find(b=>b.id===p.roofId&&!b.fallen);if(!roof){roof=s.buildings.filter(b=>!b.fallen).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];p.roofId=roof?.id;}
      if(!roof)continue;const edge=roof.x-roof.width*.5-.5,target=roof.y+roof.height;
      if(p.state==='street'){const d=edge-p.x;if(Math.abs(d)>.4)p.x+=Math.sign(d)*Math.min(Math.abs(d),p.speed*dt);else p.state='climbing';}
      if(p.state==='climbing'){p.y=Math.min(target,p.y+dt*(p.speed+2));if(p.y>=target){p.state='roof';p.x=roof.x+(hash(p.id.length+p.speed)-.5)*roof.width*.7;}}
      p.angle=0;continue;
    }
    if(p.state==='roof'){const b=s.buildings.find(b=>b.id===p.roofId);if(!b||b.fallen){fall(s,p,p.x,w.surface-.3);}else{p.y=b.y+b.height;p.angle=0;}continue;}
    if(p.state==='swimming'||p.state==='submerged'){
      p.x+=dt*clamp(w.velocity*.17+(p.x<DAM_X?1.1:.5),-3,5);
      if(p.state==='swimming'){p.y+=(w.surface-.5-p.y)*Math.min(1,dt*7);p.angle=Math.sin(s.time*3+p.speed)*.13;p.exhaustion+=dt*(Math.abs(w.velocity)*.016+Math.max(0,w.surface-16)*.03);if(p.exhaustion>1.6){p.state='submerged';p.y-=1.5;}}
      else {p.y=Math.max(w.bed+.3,p.y-dt*.45);p.angle=.55;}
      if(w.depth>5.1&&p.y+1.4<w.surface)p.submergedTime+=dt;else p.submergedTime=0;
      if(p.submergedTime>8){p.state='drowned';p.angle=1.2;s.event('A person has drowned in deep water');}
      if(w.depth<.6&&p.state==='swimming'){p.state='street';p.y=LAND_Y;}
      continue;
    }
    if(p.state==='drowned'){p.y=Math.max(w.bed+.25,p.y-dt*.65);p.x+=dt*clamp(w.velocity*.06,-.7,.7);p.angle=1.35;}
  }
}
