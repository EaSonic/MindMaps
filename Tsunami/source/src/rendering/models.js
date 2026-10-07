import * as T from '../../vendor/three.module.js';
import {mat} from './materials.js';
export function mesh(geometry,material,parent,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
export function box(parent,w,h,d,color,x=0,y=0,z=0,kind='plain'){return mesh(new T.BoxGeometry(w,h,d),mat(color,kind),parent,x,y,z);}
export function sphere(parent,r,color,x,y,z,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,12,9),mat(color),parent,x,y,z);o.scale.set(sx,sy,sz);return o;}
export function rod(parent,a,b,r,color){const from=new T.Vector3(...a),to=new T.Vector3(...b);const v=to.clone().sub(from);const o=mesh(new T.CylinderGeometry(r,r,v.length(),7),mat(color,'metal'),parent,...from.clone().add(to).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function windowRow(g,y,w,count,z,lit=false){const frameGeo=new T.BoxGeometry(.85,1.55,.17),glassGeo=new T.BoxGeometry(.66,1.30,.10);const f=new T.InstancedMesh(frameGeo,mat(0xc4bda9,'stone'),count),glass=new T.InstancedMesh(glassGeo,mat(lit?0xccac68:0x426373,'glass',.2),count);const m=new T.Matrix4();for(let i=0;i<count;i++){const x=-w/2+(i+1)*w/(count+1);f.setMatrixAt(i,m.makeTranslation(x,y,z));glass.setMatrixAt(i,m.makeTranslation(x,y,z+.075));}f.castShadow=false;glass.castShadow=false;if(lit){glass.material=glass.material.clone();glass.userData.ownedMaterial=true;glass.userData.lit=true;glass.material.emissive.setHex(0xad8245);glass.material.emissiveIntensity=.1;}g.add(f,glass);return glass;}
export function createBuilding(def,index=0,city='shanghai'){
  const g=new T.Group(),w=def.width,h=def.height,d=5.4,kind=index%3===1?'brick':index===3?'plain':'stone';g.userData.sections=[];g.userData.windows=[];
  const floors=Math.max(3,Math.round(h/3.2)),fh=h/floors;
  for(let f=0;f<floors;f++){const section=new T.Group();section.position.y=f*fh;g.add(section);g.userData.sections.push(section);const setback=index===3&&f>floors*.65?.8:1;
    box(section,w*setback,fh,d*setback,def.color,0,fh/2,0,kind);
    box(section,w*setback+.32,.15,d*setback+.25,0xc8bcaa,0,fh-.08,0,'stone');
    g.userData.windows.push(windowRow(section,fh*.48,w*setback,Math.floor(w/1.65),d*setback/2+.04,f%3===1));
    // Actual returns, corner piers and balcony depth are visible from the camera.
    for(const x of [-w*setback/2+.22,w*setback/2-.22])box(section,.4,fh,.28,0xd4c7ad,x,fh/2,d*setback/2+.08,'stone');
    if(index%2===0&&f>0&&f%2===1){box(section,w*.7,.18,1.05,0xbdb3a4,0,.18,d/2+.55,'stone');rod(section,[-w*.35,1,d/2+1],[w*.35,1,d/2+1],.035,0x474b4a);for(let i=0;i<8;i++)rod(section,[-w*.34+i*w*.68/7,.3,d/2+1],[-w*.34+i*w*.68/7,1,d/2+1],.025,0x474b4a);}
    // Visible side windows.
    for(let r=0;r<2;r++){box(section,.08,1.25,.65,0x486473,w*setback/2+.04,fh*.5,-1+r*2,'glass');}
  }
  const roof=new T.Group();roof.position.y=h;g.add(roof);g.userData.roof=roof;
  const roofColor=city==='hawaii'?[0x8b6047,0x657a67,0xa1735e][index%3]:[0x657871,0x925d49,0x667279,0x4f626a][index%4];
  if(index%3!==0){const shape=new T.Shape();shape.moveTo(-w/2-.4,0);shape.lineTo(0,2.2);shape.lineTo(w/2+.4,0);shape.closePath();mesh(new T.ExtrudeGeometry(shape,{depth:d+.6,bevelEnabled:false}),mat(roofColor),roof,0,0,-d/2-.3);for(let x=-w/2;x<w/2;x+=.7)rod(roof,[x,.14,d/2+.32],[0,2.22,d/2+.32],.015,roofColor);}
  else{box(roof,w+.4,.3,d+.4,roofColor,0,.15,0);for(const z of [-d/2,d/2])box(roof,w+.3,.6,.15,0xbbbaa8,0,.4,z,'stone');box(roof,2,.8,1.8,0x8e979a,1,.7,0,'metal');}
  box(roof,.7,2,.7,0x9c8170,-w*.25,1,0,'brick');
  // Doors, masonry entry steps, awnings and external evacuation stair.
  box(g,1.6,2.4,.18,0x364b50,0,1.2,d/2+.14);box(g,1.9,.22,1,0xbcb6a9,0,.1,d/2+.5,'stone');
  box(g,w*.75,.15,.9,index%2?0x566f64:0x9a6e55,0,2.6,d/2+.5);
  const stairX=-w/2-.55;for(let y=0;y<h;y+=.9){box(g,1,.08,.8,0x5d6462,stairX,y,d/2+.65,'metal');}rod(g,[stairX-.5,0,d/2+1.1],[stairX-.5,h,d/2+1.1],.045,0x4e5552);rod(g,[stairX+.5,0,d/2+1.1],[stairX+.5,h,d/2+1.1],.045,0x4e5552);
  return g;
}
export function createDam(height){const g=new T.Group();g.userData.center=new T.Group();g.add(g.userData.center);box(g.userData.center,3.6,height+30,11,0xc1b9a9,0,(height-30)/2,0,'concrete');box(g.userData.center,4.2,.55,11.5,0xd2c9b6,0,height+.15,0,'concrete');for(const z of [-5.5,5.5])box(g.userData.center,.25,height+30,.18,0x9f9c90,-1.7,(height-30)/2,z,'concrete');box(g,7,1,14,0xaaa797,0,-30,0,'concrete');return g;}
export function createPerson(p){const g=new T.Group();const skin=p.skin||0xc89c77,color=p.rescuer?0xd9853e:p.color||0x46768f;
  sphere(g,.16,skin,0,1.51,0,1,1.2,.9);sphere(g,.17,p.rescuer?0xe7c267:0x44372c,0,1.61,-.02,1,.55,1);box(g,.07,.08,.09,skin,0,1.52,.15);
  const torso=mesh(new T.CapsuleGeometry(.16,.42,3,8),mat(color),g,0,1.13,0);torso.scale.x=1.12;
  const arms=[],legs=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.21,1.32,0);g.add(arm);mesh(new T.CapsuleGeometry(.06,.42,2,7),mat(color),arm,0,-.23,0);sphere(arm,.066,skin,0,-.49,0);arms.push(arm);const leg=new T.Group();leg.position.set(side*.105,.83,0);g.add(leg);mesh(new T.CapsuleGeometry(.079,.6,2,7),mat(0x34424b),leg,0,-.32,0);box(leg,.15,.1,.28,0x282b2b,0,-.73,.065);legs.push(leg);}
  if(p.rescuer){box(g,.38,.11,.32,0xd9d6b3,0,1.13,0);box(g,.32,.3,.12,0x474b43,0,1.15,-.24);}
  g.userData.arms=arms;g.userData.legs=legs;g.userData.torso=torso;return g;}
function hullShape(length){const s=new T.Shape();s.moveTo(-length*.5,.5);s.quadraticCurveTo(-length*.42,-.6,-length*.25,-.7);s.lineTo(length*.24,-.7);s.quadraticCurveTo(length*.48,-.45,length*.5,.65);s.lineTo(-length*.5,.5);return s;}
export function createBoat(kind){const g=new T.Group(),length=kind==='skiff'?4:kind==='fishing'?6:kind==='rescue-launch'?9:7,width=kind==='skiff'?1.4:2.1,rescue=kind.startsWith('rescue');
  mesh(new T.ExtrudeGeometry(hullShape(length),{depth:width,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.12,bevelThickness:.1}),mat(rescue?0xbe5940:kind==='skiff'?0xbabcb2:0xe0ddd0),g,0,0,-width/2);
  box(g,length*.75,.12,width*.86,0xb9a586,0,.48,0,'stone');
  for(const z of [-width/2,width/2]){rod(g,[-length*.4,1,z],[length*.36,1,z],.035,0xd2d6d2);for(let i=0;i<5;i++)rod(g,[-length*.4+i*length*.19,.5,z],[-length*.4+i*length*.19,1,z],.03,0xb5bcb7);}
  if(kind!=='skiff'){box(g,length*.34,1.15,width*.77,0xe5e2d5,0,1.04,0);box(g,length*.37,.13,width*.95,0xd4d6ca,0,1.68,0);box(g,length*.27,.5,.06,0x3e697b,0,1.26,width*.4,'glass');box(g,.1,.65,width*.65,0x395e6e,length*.175,1.23,0,'glass');rod(g,[-.8,1.7,0],[-.8,3.1,0],.03,0x5f6f70);rod(g,[-.8,2.7,0],[.1,2.7,0],.025,0x697979);}
  else for(const x of [-.9,.65])box(g,.6,.15,width*.85,0x93816b,x,.7,0);
  sphere(g,.2,0x161d23,-length*.33,.15,width/2+.1,1,1,.5);sphere(g,.2,0x161d23,length*.15,.15,width/2+.1,1,1,.5);
  if(rescue){box(g,.8,.15,.6,0x477cab,-.6,1.8,0);for(const z of [-width*.55,width*.55])mesh(new T.CapsuleGeometry(.25,length*.7,2,8),mat(0xc37441),g,0,.45,z).rotation.z=Math.PI/2;}
  return g;}
export function createShip(){const g=new T.Group(),len=26,width=6.2;mesh(new T.ExtrudeGeometry(hullShape(len),{depth:width,bevelEnabled:true,bevelSize:.35,bevelThickness:.25,bevelSegments:2}),mat(0xe0ded2,'metal',.45),g,0,-1.3,-width/2);box(g,len*.87,.4,width*.93,0xb78961,0,-.1,0,'stone');
  for(let i=0;i<4;i++){const l=20-i*2.7;box(g,l,1.2,width-i*.6,0xdadcd3,-.5,i*1.15+.4,0);windowRow(g,i*1.15+.45,l,Math.floor(l/.7),(width-i*.6)/2+.03);for(const z of [-width/2+.15,width/2-.15])rod(g,[-l/2,i*1.15+1,z],[l/2,i*1.15+1,z],.035,0xb8c4c2);}
  box(g,2,2,1.8,0x546c75,-2,5,0,'metal');box(g,2.3,.3,2.1,0x323d43,-2,6,0);box(g,2.4,1,2.6,0xe8e6dc,5,4.5,0);for(let i=0;i<4;i++)box(g,1.7,.5,.8,0xcc7946,-7+i*3,1,3.4);rod(g,[6,4,0],[6,7.3,0],.045,0x697d7e);return g;}
export function createCar(index,color){const g=new T.Group(),length=index%3===0?4.5:3.6;box(g,length,.7,1.7,color,0,.6,0,'metal');box(g,length*.55,.72,1.55,color,-.15,1.26,0,'metal');box(g,length*.45,.48,.04,0x426374,-.15,1.28,.8,'glass');box(g,.05,.5,1.4,0x496879,length*.25,1.26,0,'glass');for(const x of [-length*.29,length*.29])for(const z of [-.9,.9])mesh(new T.CylinderGeometry(.4,.4,.2,12),mat(0x202b2e),g,x,.4,z).rotation.x=Math.PI/2;box(g,.3,.2,1.65,0xe0d3a7,length*.48,.68,0);return g;}
export function createTree(palm=false){const g=new T.Group();rod(g,[0,0,0],[.3,5.2,0],.16,0x70533e);if(palm){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const curve=new T.QuadraticBezierCurve3(new T.Vector3(.3,5.3,0),new T.Vector3(Math.cos(a)*1.7,6.4,Math.sin(a)*1.7),new T.Vector3(Math.cos(a)*3,4.1,Math.sin(a)*3));mesh(new T.TubeGeometry(curve,8,.16,4,false),mat(i%2?0x4e7c46:0x668d4c),g);}}else{for(let i=0;i<8;i++){const a=i*2.4;rod(g,[.2,3.5,0],[Math.sin(a)*1.5,5+i%2,Math.cos(a)*1.2],.075,0x70543e);sphere(g,1.2,i%2?0x526f3a:0x658447,Math.sin(a)*1.15,4.6+(i%3)*.6,Math.cos(a)*.8,1.15,.9,1);}}return g;}
export function createLight(){const g=new T.Group();rod(g,[0,0,0],[0,5.2,0],.065,0x5c6563);rod(g,[0,5.2,0],[.8,5.5,0],.06,0x5c6563);box(g,.8,.18,.35,0xbec2ac,.8,5.45,0,'metal');box(g,.62,.04,.28,0xe2d5a2,.8,5.32,0);box(g,.3,.1,.3,0x929c8d,0,.05,0);return g;}
export function createBin(){const g=new T.Group();box(g,.75,1.1,.65,0x5d7467,0,.6,0,'metal');const lid=box(g,.84,.12,.73,0x394d42,0,1.2,0);g.userData.lid=lid;box(g,.25,.13,.08,0xa9b1a2,0,.94,.38);for(const x of [-.25,.25])sphere(g,.1,0x242d2a,x,.12,-.35);return g;}
