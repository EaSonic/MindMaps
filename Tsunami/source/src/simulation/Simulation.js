import {LOCATIONS,BUILDING_X,BASE_HEIGHT,CALM_SEA,DAM_X,LAND_Y,WAVE_HEIGHTS,WAVE_DAMAGE,clamp,hash} from './locations.js';
import {WaterField} from './water.js';
import {updateActors,makePerson,makeBoat,positionPassenger} from './actors.js';
import {updateProps} from './props.js';
export class Simulation {
  constructor(){this.serial=0;this.generation=0;this.selectLocation('shanghai');}
  selectLocation(id){if(!LOCATIONS[id])return false;this.location=LOCATIONS[id];this.size=2;this.reset(BASE_HEIGHT);return true;}
  reset(height){this.generation++;this.status='ready';this.phase='waves';this.time=0;this.nextWave=0;this.rescueAt=null;this.arrivalsAfterBreach=0;this.waves=[];this.particles=[];this.events=[];this.water=new WaterField();this.dam={height,integrity:100,breached:false,breachedAt:null,hits:0};
    this.buildings=BUILDING_X.map((x,i)=>({id:`building-${i}`,x,width:i===3?12:10,height:this.location.heights[i],damage:0,angle:0,y:LAND_Y,fallen:false,light:1,color:this.location.wallColors[i]}));
    this.boats=[makeBoat(this,'skiff',-8),makeBoat(this,'cabin',15),makeBoat(this,'fishing',-40)];
    this.ships=[{id:'ship',x:-34,y:CALM_SEA,angle:0,length:26,flooding:0,sunk:0,passengers:[]}];
    this.people=[];
    for(let i=0;i<18;i++)this.people.push(makePerson(this,43+i*4.8,LAND_Y,i));
    for(const b of this.boats)this.addPassengers(b,2);
    this.addPassengers(this.ships[0],6);
    this.cars=Array.from({length:7},(_,i)=>({id:`car-${i}`,x:47+i*12,y:LAND_Y,angle:0,floatable:i%2===0,floating:false,submerged:false,wet:0,color:[0xddd8c9,0x527888,0xa7483b,0x606763,0xc4b891][i%5]}));
    this.trees=Array.from({length:7},(_,i)=>({id:`tree-${i}`,x:46+i*13,y:LAND_Y,angle:0,damage:0,fallen:false}));
    this.lights=Array.from({length:7},(_,i)=>({id:`light-${i}`,x:51+i*12,y:LAND_Y,angle:0,damage:0,fallen:false}));
    this.bins=Array.from({length:5},(_,i)=>({id:`bin-${i}`,x:53+i*16,y:LAND_Y,angle:0,spilled:false}));this.trash=[];
  }
  addPassengers(b,count){for(let i=0;i<count;i++){const p=makePerson(this,b.x,CALM_SEA,this.people.length);p.state='aboard';p.boatId=b.id;p.offset=(i-(count-1)/2)*(b.length>15?2.7:1.1);p.rescuer=!!b.rescue;positionPassenger(p,b);b.passengers.push(p.id);this.people.push(p);}}
  start(){if(this.status==='running')return false;const size=this.size;if(this.status==='finished')this.reset(this.dam.height);this.size=size;this.status='running';this.event('Tsunami started — people are heading to rooftops');return true;}
  finish(){if(this.status!=='running')return false;this.status='finished';this.event('Finished — inspect the scene or start a fresh run');return true;}
  setSize(v){this.size=clamp(Math.round(v),1,5);}
  setDamHeight(v){if(this.status!=='ready'||!Number.isFinite(v))return false;this.dam.height=clamp(v,BASE_HEIGHT,BASE_HEIGHT*2.5);return true;}
  damageDam(amount){if(this.dam.breached)return;this.dam.integrity=Math.max(0,this.dam.integrity-amount);this.dam.hits++;this.splash(DAM_X,CALM_SEA+this.dam.height,16);if(this.dam.integrity<=0){this.dam.breached=true;this.dam.breachedAt=this.time;this.event('Dam breached — water is rushing into the city');}}
  hammer(){if(this.status!=='running'||this.phase!=='waves'||this.dam.breached)return false;this.damageDam(20);return true;}
  event(text){this.message=text;this.events.push({time:this.time,text});if(this.events.length>12)this.events.shift();}
  splash(x,y,count=8){for(let i=0;i<count&&this.particles.length<260;i++)this.particles.push({id:++this.serial,x,y,vx:(hash(i+this.serial)-.5)*9,vy:2+hash(i*3+this.serial)*7,life:1.2+hash(i+9),type:'spray'});}
  place(kind,x,y){if(this.status==='finished')return {ok:false,reason:'Start a new run to place more'};if(!Number.isFinite(x)||!Number.isFinite(y)||x<-65||x>140)return {ok:false,reason:'Choose a place inside the scene'};
    const w=this.water.sample(x);if(['skiff','cabin','fishing','rescue','rescue-launch'].includes(kind)){
      if(w.depth<1.3||Math.abs(y-w.surface)>9)return {ok:false,reason:'Boats need water — tap near its surface'};
      if(this.boats.length>=14||this.people.length>74)return {ok:false,reason:'Scene is full — leave space for rescue'};
      if(this.boats.some(b=>Math.abs(b.x-x)<2.5))return {ok:false,reason:'Leave a little room between boats'};
      const b=makeBoat(this,kind,x);this.boats.push(b);this.addPassengers(b,2);return {ok:true};
    }
    if(!['person','rescuer'].includes(kind))return {ok:false,reason:'Choose an entity'};
    if(this.people.length>=76)return {ok:false,reason:'Scene is full'};
    const p=makePerson(this,x,LAND_Y,this.people.length);p.rescuer=kind==='rescuer';
    const b=this.boats.find(b=>Math.abs(b.x-x)<b.length/2&&Math.abs(y-(b.y+1.3))<2);
    if(b){if(b.passengers.length>=5)return {ok:false,reason:'This deck is full'};p.state='aboard';p.boatId=b.id;p.offset=clamp(x-b.x,-b.length*.35,b.length*.35);positionPassenger(p,b);b.passengers.push(p.id);}
    else if(w.depth>0.8&&y<=w.surface+3){p.state='swimming';p.y=w.surface-.3;}
    else{const roof=this.buildings.find(b=>!b.fallen&&Math.abs(x-b.x)<b.width/2&&Math.abs(y-(b.y+b.height))<3);if(roof){p.state='roof';p.roofId=roof.id;p.y=roof.y+roof.height;}else if(x>DAM_X+3&&Math.abs(y-LAND_Y)<3){p.y=LAND_Y;}else return {ok:false,reason:'Tap a street, rooftop, boat deck, or water'};}
    this.people.push(p);return {ok:true};
  }
  step(dt){if(this.status!=='running'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1/30);this.time+=dt;
    if(this.phase==='waves'&&this.time>=this.nextWave){const size=this.size;this.waves.push({id:++this.serial,size,height:WAVE_HEIGHTS[size-1],x:-65,arrived:false});this.nextWave=this.time+7;}
    for(const w of this.waves){w.x+=17*dt;if(!w.arrived&&w.x>=DAM_X-1){w.arrived=true;const wasBreached=this.dam.breached;this.damageDam(WAVE_DAMAGE[w.size-1]);this.splash(DAM_X,Math.max(CALM_SEA+w.height,CALM_SEA+this.dam.height),30);if(wasBreached)this.arrivalsAfterBreach++;if(this.arrivalsAfterBreach>=2&&this.rescueAt===null){this.rescueAt=this.time+2;this.nextWave=Infinity;}}}
    this.water.step(dt,CALM_SEA+this.dam.height,this.dam.breached,this.waves.filter(w=>w.x<DAM_X+5));
    this.waves=this.waves.filter(w=>w.x<DAM_X+40);
    if(this.rescueAt!==null&&this.time>=this.rescueAt&&this.phase==='waves'){this.phase='rescue';this.rescueStarted=this.time;for(const x of [-18,-48]){const b=makeBoat(this,'rescue',x);b.automatic=true;this.boats.push(b);this.addPassengers(b,2);}this.event('Rescue boats arriving — rough water can still overturn them');}
    for(const b of this.buildings){const w=this.water.sample(b.x);const force=w.depth*Math.abs(w.velocity);if(w.depth>1)b.damage=clamp(b.damage+dt*(force*.00035+Math.max(0,w.depth-7)*.004),0,1);if(b.damage>.18)b.light=Math.max(0,1-(b.damage-.18)*5);if(b.damage>.62){b.fallen=true;b.angle=Math.min(1.4,b.angle+dt*(b.damage-.5)*.7);b.y=Math.max(LAND_Y-b.height*.25,b.y-dt*.7);}}
    updateProps(this,dt);updateActors(this,dt);
    for(const p of this.particles){p.life-=dt;p.vy-=12*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}this.particles=this.particles.filter(p=>p.life>0);
    if(this.phase==='rescue'&&this.time-this.rescueStarted>20)this.finish();
  }
  snapshot(){return {location:this.location.id,generation:this.generation,status:this.status,phase:this.phase,size:this.size,time:this.time,dam:{...this.dam},buildings:this.buildings.map(b=>({...b})),people:this.people.map(p=>({...p})),boats:this.boats.map(b=>({...b})),ships:this.ships.map(s=>({...s})),cars:this.cars.map(c=>({...c})),trees:this.trees.map(t=>({...t})),lights:this.lights.map(t=>({...t})),bins:this.bins.map(b=>({...b})),trash:this.trash.map(t=>({...t})),water:Array.from(this.water.depth),particles:this.particles.map(p=>({...p}))};}
}
