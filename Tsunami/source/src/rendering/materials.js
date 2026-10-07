import * as T from '../../vendor/three.module.js';
const cache=new Map(),textures={};
export async function loadMaterials(){
  if(typeof document==='undefined')return;
  const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Material texture could not load'));image.src=`${import.meta.env.BASE_URL}art/material-atlas.png`;});
  for(const [kind,x,y] of [['concrete',0,0],['brick',1,0],['stone',0,1],['asphalt',1,1]]){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.drawImage(img,x*img.width/2,y*img.height/2,img.width/2,img.height/2,0,0,512,512);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=4;textures[kind]=tex;}
  for(const [key,m]of cache){const kind=key.split(':')[0];if(textures[kind]){m.map=textures[kind];m.bumpMap=textures[kind];m.bumpScale=.035;m.needsUpdate=true;}}
}
export function mat(color=0xcccccc,kind='plain',roughness=.75){const key=`${kind}:${color}:${roughness}`;if(cache.has(key))return cache.get(key);const m=new T.MeshStandardMaterial({color,roughness,metalness:kind==='glass'?.35:kind==='metal'?.55:0,map:textures[kind]||null,bumpMap:textures[kind]||null,bumpScale:.035});cache.set(key,m);return m;}
export function disposeMaterials(){for(const m of cache.values())m.dispose();for(const t of Object.values(textures))t.dispose();cache.clear();for(const key of Object.keys(textures))delete textures[key];}
