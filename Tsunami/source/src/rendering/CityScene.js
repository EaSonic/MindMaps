import * as T from '../../vendor/three.module.js';
import {mat} from './materials.js';
import {box,mesh,sphere,rod,createBuilding} from './models.js';
import {LAND_Y,hash} from '../simulation/locations.js';
export function disposeGeometry(root){root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.userData.ownedMaterial)o.material.dispose();});}
export function createCityScene(s){const root=new T.Group(),buildings=new Map();
  box(root,112,28,22,0xb7ad98,94,-11,0,'concrete');box(root,112,.25,17,0x707779,94,LAND_Y-.1,0,'asphalt');
  box(root,112,.22,1.6,0xc2bfb0,94,LAND_Y,4.8,'stone');box(root,112,.22,1.6,0xbab8a9,94,LAND_Y,-4.5,'stone');
  for(let x=42;x<145;x+=7)box(root,3,.01,.08,0xd2ccb1,x,LAND_Y+.05,4.1);
  // Underwater shelf: objects remain visible against a textured bed.
  box(root,110,1,24,0x9f997d,-17,-25.6,0,'stone');
  for(let i=0;i<28;i++){sphere(root,.4+hash(i)*.9,0x9b9982,-66+hash(i+9)*98,-24.7,hash(i+6)*12-6,1.5,.55,1);}
  for(let i=0;i<s.buildings.length;i++){const b=s.buildings[i],g=createBuilding(b,i,s.location.id);g.position.set(b.x,b.y,-1);root.add(g);buildings.set(b.id,g);}
  // Atmospheric distant neighborhood uses real low-detail geometry, not a flat city picture.
  const backdrop=new T.Group();backdrop.position.z=-29;root.add(backdrop);
  for(let i=0;i<24;i++){const x=35+i*4.6,h=s.location.id==='hawaii'?5+hash(i)*9:10+hash(i)*24;box(backdrop,3.5,h,4,0x839eac,x,h/2+3,0);for(let j=3;j<h;j+=3)box(backdrop,3.2,.13,.04,0xb2c3cc,x,j,2.04);}
  if(s.location.id==='shanghai'){
    const x=77;rod(backdrop,[x,3,0],[x,52,0],.45,0x7c949e);for(const y of [21,40]){sphere(backdrop,y===21?3.2:2.1,0xa18482,x,y,0);for(const a of [0,2.1,4.2])rod(backdrop,[x+Math.cos(a)*4,3,Math.sin(a)*4],[x+Math.cos(a),21,Math.sin(a)],.4,0x8ca1ab);}
    rod(backdrop,[x,50,0],[x,59,0],.15,0x8ea4b1);
    box(backdrop,5,51,5,0x6c8d9b,111,28,0,'glass');for(let y=4;y<53;y+=1.5)box(backdrop,5.1,.08,5.1,0xadc0c7,111,y,0);
    box(backdrop,5,39,5,0x7d9da8,96,23,0,'glass');box(backdrop,5,.6,5,0xacbbc2,96,45,0);box(backdrop,.5,6,5,0x9bb1bb,93.8,42,0);box(backdrop,.5,6,5,0x9bb1bb,98.2,42,0);
  }else if(s.location.id==='newyork'){
    box(backdrop,6,32,5,0x8d9ba1,91,20,0,'stone');box(backdrop,4.4,10,4,0xa8b4b8,91,41,0,'stone');box(backdrop,2.4,5,2.6,0xb8c0c2,91,48,0);rod(backdrop,[91,50,0],[91,61,0],.1,0xb8c3c8);
    const geo=new T.CylinderGeometry(2.4,4.3,48,4,1);mesh(geo,mat(0x71949f,'glass'),backdrop,119,27,0).rotation.y=Math.PI/4;
    for(let y=6;y<50;y+=2)box(backdrop,3.2,.08,.08,0xabc0c5,119,y,2.5);
    rod(backdrop,[119,51,0],[119,66,0],.10,0x9aafb8);
  }else{
    for(let i=0;i<7;i++){const h=13+hash(i)*20;const geo=new T.SphereGeometry(18,28,18,0,Math.PI*2,0,Math.PI/2),p=geo.attributes.position;for(let v=0;v<p.count;v++){const x=p.getX(v),z=p.getZ(v),y=p.getY(v);p.setY(v,y*(.88+.12*Math.sin(x*.3+i)*Math.cos(z*.27)));}geo.computeVertexNormals();const hill=mesh(geo,mat(i%2?0x7e9975:0x819b80),backdrop,34+i*17,3,-10);hill.scale.set(1.35,h/18,.7);}
  }
  // Soft sky clouds.
  for(let i=0;i<11;i++){const cloud=new T.Group();cloud.position.set(-65+i*19,58+hash(i)*12,-65);root.add(cloud);for(let j=0;j<4;j++){const o=sphere(cloud,3.4,0xe7eff0,j*3,hash(i+j)*2,0,1.9,.55,.7);o.material=mat(0xe5edf1);o.castShadow=false;}}
  return {root,buildings};
}
