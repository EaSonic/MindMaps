import {CALM_SEA,DAM_X,LAND_Y,clamp} from './locations.js';
const MIN=-70,MAX=150,DX=1;
const OCEAN_TRANSPORT=7,CITY_TRANSPORT=56,BREACH_TRANSPORT=40;
export class WaterField {
  constructor(){this.depth=new Float64Array(MAX-MIN+1);this.velocity=new Float64Array(this.depth.length);this.bed=Float64Array.from(this.depth,(_,i)=>i+MIN<=DAM_X?-25:LAND_Y+Math.max(0,i+MIN-95)*0.01);this.depth.forEach((_,i)=>this.depth[i]=i+MIN<=DAM_X?CALM_SEA-this.bed[i]:0);this.inflow=0;this.outflow=0;}
  index(x){return clamp(Math.round(x-MIN),0,this.depth.length-1);}
  sample(x){const i=this.index(x);return {surface:this.bed[i]+this.depth[i],depth:this.depth[i],velocity:this.velocity[i],bed:this.bed[i]};}
  step(dt,crest,breached,pulses){
    const n=this.depth.length;
    // Bounded height-gradient transport. Flux is conservative inside the grid.
    for(let k=0;k<3;k++){
      const sub=dt/3,flux=new Float64Array(n-1),change=new Float64Array(n);
      for(let i=0;i<n-1;i++){
        const a=this.bed[i]+this.depth[i],b=this.bed[i+1]+this.depth[i+1];
        // Floods move quickly along the city while the ocean keeps its wave shape.
        let f=(a-b)*sub*(i+MIN>DAM_X?CITY_TRANSPORT:OCEAN_TRANSPORT);
        if(i+MIN===DAM_X){if(!breached)f=Math.max(0,a-crest)*sub*11;else f=(a-b)*sub*BREACH_TRANSPORT;}
        f=clamp(f,-this.depth[i+1]*0.24,this.depth[i]*0.24);
        flux[i]=f;change[i]-=f;change[i+1]+=f;
      }
      for(let i=0;i<n;i++){this.depth[i]=Math.max(0,this.depth[i]+change[i]);this.velocity[i]=this.velocity[i]*0.94+(i<n-1?flux[i]/sub:0)*0.06;}
      // Maintain explicit ocean boundary reservoir, tracking its exchange.
      const ocean=CALM_SEA-this.bed[0];const d=(ocean-this.depth[0])*Math.min(1,sub*6);this.depth[0]+=d;d>0?this.inflow+=d:this.outflow-=d;
      const out=Math.max(0,this.depth[n-1])*sub*0.2;this.depth[n-1]-=out;this.outflow+=out;
    }
    // Source pulses are an explicitly accounted moving-volume inlet near the dam.
    for(const p of pulses){const center=p.x;for(let x=Math.max(MIN,Math.floor(center-10));x<Math.min(DAM_X,Math.ceil(center+10));x++){
      const i=this.index(x),target=CALM_SEA+Math.max(0,p.height)*Math.exp(-(((x-center)/5.5)**2))-this.bed[i];
      const add=Math.max(0,target-this.depth[i])*Math.min(1,dt*13);this.depth[i]+=add;this.inflow+=add;
    }}
  }
}
