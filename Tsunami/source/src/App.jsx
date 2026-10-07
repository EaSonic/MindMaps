import {useCallback,useState} from 'react';
import {Simulation} from './simulation/Simulation';
import {LOCATIONS} from './simulation/locations';
import {Controls} from './components/Controls';
import {Tools} from './components/Tools';
import {Palette} from './components/Palette';
import {Stage} from './components/Stage';
import {Icon} from './components/Icons';
export default function App(){const [simulation]=useState(()=>new Simulation()),[revision,setRevision]=useState(0),[mode,setMode]=useState('none'),[images,setImages]=useState({});const update=useCallback(()=>setRevision(v=>v+1),[]);const chooseMode=(next)=>setMode(m=>m===next?'none':next);const selectCity=(id)=>{simulation.selectLocation(id);setMode('none');update();};const start=()=>{simulation.start();setMode('none');update();};const finish=()=>{simulation.finish();setMode('none');update();};
  return <div className="app-shell"><header className="header"><div className="brand"><Icon name="wave" size={30}/><h1>Tsunami Simulator</h1></div><nav aria-label="Choose a location">{Object.values(LOCATIONS).map(city=><button key={city.id} aria-pressed={simulation.location.id===city.id} onClick={()=>selectCity(city.id)}>{city.name}</button>)}</nav><span className="run-state">{simulation.status==='ready'?'Ready':simulation.status==='finished'?'Finished':simulation.phase==='rescue'?'Rescue':'Tsunami active'}</span></header><div className="workspace"><Tools mode={mode} onMode={chooseMode} status={simulation.status}/><Stage simulation={simulation} mode={mode} onMode={setMode} onUpdate={update} onImages={setImages}/><Palette mode={mode} onMode={chooseMode} images={images} status={simulation.status}/></div><Controls state={simulation} onStart={start} onFinish={finish} onSize={delta=>{simulation.setSize(simulation.size+delta);update();}}/></div>;
}
