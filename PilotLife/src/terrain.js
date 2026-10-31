// Shared by visible terrain, tree placement, and the collision surface.
export function terrainHeight(x,z){const band=Math.max(0,(Math.abs(x)-2500)/7000);return Math.max(0,Math.pow(band,1.2)*(250+700*(Math.sin(x*.0011)*Math.cos(z*.0007)+1)/2)+band*100*Math.sin(x*.004+z*.002)-4);}
