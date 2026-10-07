export const LOCATIONS = {
  shanghai: {id:'shanghai',name:'Shanghai',subtitle:'Huangpu River',sky:0xb9d7e8,water:0x428b99,wallColors:[0xd9cbb2,0xb78973,0xe7ddc1,0x9eb2b5,0xd5c4a7,0xb6bab7],roofs:[0x657c73,0x965e46,0x667477,0x43575d],heights:[16,22,18,32,23,28],palm:false},
  newyork: {id:'newyork',name:'New York',subtitle:'New York City · Harbor',sky:0xb8cfdf,water:0x42869d,wallColors:[0xad735c,0xd9cdb9,0x8d9a9f,0xb08868,0xc8c3b2,0x607e89],roofs:[0x5c676b,0x797066,0x596264],heights:[22,26,34,18,31,38],palm:false},
  hawaii: {id:'hawaii',name:'Hawaii',subtitle:'Hawaiian coast',sky:0xb9e0ea,water:0x279b9c,wallColors:[0xe3d9b7,0xb5c9b9,0xd6b199,0xcdd0c3,0xe7ddc4,0xb8c3bf],roofs:[0x916a50,0x566f6a,0x9a7362],heights:[10,14,12,21,15,25],palm:true},
};
export const BUILDING_X=[49,63,78,93,109,126];
export const BASE_HEIGHT=18, CALM_SEA=5, DAM_X=38, LAND_Y=3;
export const WAVE_HEIGHTS=[9.9,15.3,21.6,30.6,41.4];
export const WAVE_DAMAGE=[6,10,16,24,36];
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const hash=(n)=>{const x=Math.sin(n*127.1+31.7)*43758.5453;return x-Math.floor(x);};
