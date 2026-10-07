import {LAND_Y,clamp,hash} from './locations.js';
export function updateProps(s,dt){
  for(const c of s.cars){const w=s.water.sample(c.x);if(w.depth>.6)c.wet+=dt;c.floating=c.floatable&&w.depth>1;c.submerged=!c.floating&&w.depth>1.2;
    if(c.floating){c.y+=(w.surface-.6-c.y)*Math.min(1,dt*3);c.angle=Math.sin(s.time*.5+c.x)*.12;c.x+=dt*clamp(w.velocity*.08,-1,2);}
    else{c.y+=(LAND_Y-c.y)*dt*2;if(c.submerged)c.x+=dt*clamp(w.velocity*.025,-.2,.4);}
  }
  for(const t of [...s.trees,...s.lights]){const w=s.water.sample(t.x);if(w.depth>.5)t.damage=clamp(t.damage+dt*(w.depth*.025+Math.abs(w.velocity)*.014),0,1);if(t.damage>.7)t.fallen=true;if(t.fallen)t.angle=Math.min(Math.PI*.47,t.angle+dt*.5);else t.angle=t.damage*.18;}
  for(const b of s.bins){const w=s.water.sample(b.x);if(w.depth>.5){b.y+=(w.surface-.4-b.y)*Math.min(1,dt*4);b.x+=dt*clamp(w.velocity*.06,-.6,1.5);b.angle=Math.sin(s.time*.7+b.x)*.4;if(!b.spilled){b.spilled=true;for(let i=0;i<6;i++)s.trash.push({id:`trash-${++s.serial}`,binId:b.id,x:b.x+(i-2.5)*.3,y:w.surface+.02,offset:(i-2.5)*.3,phase:hash(i+s.serial)*6});}}}
  for(const t of s.trash){const b=s.bins.find(b=>b.id===t.binId);t.x=b.x+t.offset+Math.sin(s.time*.8+t.phase)*.15;t.y=s.water.sample(t.x).surface+.05+Math.sin(s.time+t.phase)*.04;}
}
