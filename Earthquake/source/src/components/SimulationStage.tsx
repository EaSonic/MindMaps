import { useEffect, useRef, useState } from 'react';
import type { DamageSnapshot } from '../simulation/DamageController';
import type { EvacuationSnapshot } from '../simulation/EvacuationController';
import type { PhysicsSnapshot } from '../simulation/PhysicsScene';
import type { LandmarkId, SimulationState } from '../simulation/types';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { getLandmarkDefinition } from '../scene/landmarks';
import { MuteButton } from './MuteButton';

interface SimulationStageProps {
  state: SimulationState;
  snapshot: PhysicsSnapshot;
  damage: DamageSnapshot;
  evacuation: EvacuationSnapshot;
  sceneVersion: number;
  reducedMotion: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

const titles: Record<LandmarkId, string> = {
  eiffel: 'Eiffel Tower',
  pisa: 'Tower of Pisa',
  empire: 'Empire State Building',
  'twin-towers': 'Twin Towers',
};

export function SimulationStage({ state, snapshot, damage, evacuation, sceneVersion, reducedMotion, muted, onToggleMute }: SimulationStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [artworkVersion, setArtworkVersion] = useState(0);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  if (!rendererRef.current) {
    rendererRef.current = new CanvasRenderer(() => setArtworkVersion((version) => version + 1));
  }
  const backgroundArtwork = getLandmarkDefinition(state.landmark).backgroundArtwork;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || globalThis.navigator?.userAgent.includes('jsdom')) return;
    rendererRef.current?.render(canvas, {
      state,
      snapshot,
      damage,
      evacuation,
      reducedMotion,
    });
  }, [state, snapshot, damage, evacuation, reducedMotion, artworkVersion]);

  return (
    <main
      className={`simulation-stage simulation-stage--${state.status}`}
      aria-label={`Earthquake simulation of ${titles[state.landmark]}`}
      data-testid="simulation-stage"
      data-landmark={state.landmark}
      data-status={state.status}
      data-run={state.run}
      data-scene-version={sceneVersion}
      data-reduced-motion={reducedMotion}
      data-evacuation-active={evacuation.active}
      data-broken-constraints={snapshot.constraints.filter((constraint) => constraint.broken).length}
      data-background-artwork={backgroundArtwork}
      style={{ backgroundImage: `url(${backgroundArtwork})` }}
    >
      <canvas ref={canvasRef} className="simulation-canvas" aria-hidden="true" />
      <div className="stage-vignette" aria-hidden="true" />
      <MuteButton muted={muted} onToggle={onToggleMute} />
      {state.status === 'running' && (
        <div className="alarm-banner" aria-hidden="true">
          <span className="alarm-beacon" /> Earthquake alarm
        </div>
      )}
      <div className="scene-status" role="status" aria-live="polite">
        {state.status === 'ready' && 'Ready to shake'}
        {state.status === 'running' && 'Earthquake active — alarm sounding'}
        {state.status === 'finished' && 'Earthquake stopped — inspect the result'}
      </div>
    </main>
  );
}
