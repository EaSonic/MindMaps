import { ControlBar } from './components/ControlBar';
import { LandmarkSelector } from './components/LandmarkSelector';
import { SimulationStage } from './components/SimulationStage';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const simulation = useSimulation();

  return (
    <div className="app-shell">
      <LandmarkSelector value={simulation.state.landmark} onChange={simulation.selectLandmark} />
      <SimulationStage
        state={simulation.state}
        snapshot={simulation.snapshot}
        damage={simulation.damage}
        evacuation={simulation.evacuation}
        sceneVersion={simulation.sceneVersion}
        reducedMotion={simulation.reducedMotion}
        muted={simulation.muted}
        onToggleMute={simulation.toggleMute}
      />
      <ControlBar
        status={simulation.state.status}
        strength={simulation.state.strength}
        onStart={simulation.start}
        onFinish={simulation.finish}
        onSmaller={simulation.smaller}
        onBigger={simulation.bigger}
      />
    </div>
  );
}
