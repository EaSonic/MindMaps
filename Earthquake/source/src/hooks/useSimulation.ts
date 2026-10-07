import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AudioController } from '../audio/AudioController';
import { getLandmarkDefinition } from '../scene/landmarks';
import { DamageController, type DamageSnapshot } from '../simulation/DamageController';
import { EvacuationController, type EvacuationSnapshot } from '../simulation/EvacuationController';
import { PhysicsScene, type PhysicsSnapshot } from '../simulation/PhysicsScene';
import { intensityConfig } from '../simulation/config';
import { createInitialState, simulationReducer } from '../simulation/state';
import type { LandmarkId } from '../simulation/types';

const viewport = { width: 1200, height: 760 };

const emptyDamage: DamageSnapshot = {
  brokenConstraintIds: [],
  toppledTreeIds: [],
  lightStates: {},
};

const emptyEvacuation: EvacuationSnapshot = {
  active: false,
  people: [],
  occupants: [],
  vehicles: [],
};

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const sceneRef = useRef<PhysicsScene | null>(null);
  if (!sceneRef.current) sceneRef.current = new PhysicsScene(1);
  const damageRef = useRef(new DamageController(1));
  const audioRef = useRef(new AudioController());
  const evacuationRef = useRef<EvacuationController | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const [snapshot, setSnapshot] = useState<PhysicsSnapshot>(() => sceneRef.current!.snapshot());
  const [damage, setDamage] = useState<DamageSnapshot>(emptyDamage);
  const [evacuation, setEvacuation] = useState<EvacuationSnapshot>(emptyEvacuation);
  const [sceneVersion, setSceneVersion] = useState(1);
  const [activeLoop, setActiveLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const rebuild = useCallback((landmark: LandmarkId, incrementVersion: boolean) => {
    const seed = stateRef.current.run + sceneVersion + 11;
    const definition = getLandmarkDefinition(landmark);
    sceneRef.current!.mount(definition, viewport);
    damageRef.current = new DamageController(seed);
    evacuationRef.current = new EvacuationController(sceneRef.current!.snapshot().cityProps, viewport, seed);
    elapsedRef.current = 0;
    setSnapshot(sceneRef.current!.snapshot());
    setDamage(damageRef.current.update(sceneRef.current!.snapshot(), 0, intensityConfig(stateRef.current.strength)));
    setEvacuation(evacuationRef.current.snapshot());
    if (incrementVersion) setSceneVersion((version) => version + 1);
  }, [sceneVersion]);

  useEffect(() => {
    rebuild('eiffel', false);
    return () => {
      if (animationFrameRef.current !== null && globalThis.cancelAnimationFrame) {
        globalThis.cancelAnimationFrame(animationFrameRef.current);
      }
      sceneRef.current?.destroy();
      audioRef.current.stopAlarm();
    };
    // The initial scene is mounted once; subsequent rebuilds are action-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof globalThis.matchMedia !== 'function') return;
    const query = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null && globalThis.cancelAnimationFrame) {
      globalThis.cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = null;
    lastFrameRef.current = null;
    setActiveLoop(false);
  }, []);

  const frame = useCallback((timestamp: number) => {
    const current = stateRef.current;
    if (current.status !== 'running') return;
    const delta = lastFrameRef.current === null ? 16 : Math.min(50, timestamp - lastFrameRef.current);
    lastFrameRef.current = timestamp;
    elapsedRef.current += delta;
    const intensity = intensityConfig(current.strength);
    sceneRef.current!.step(delta, intensity);
    let nextSnapshot = sceneRef.current!.snapshot();
    const nextDamage = damageRef.current.update(nextSnapshot, elapsedRef.current, intensity);
    sceneRef.current!.breakConstraints(nextDamage.brokenConstraintIds);
    nextSnapshot = sceneRef.current!.snapshot();
    const nextEvacuation = evacuationRef.current?.update(delta, current.status, intensity) ?? emptyEvacuation;
    setSnapshot(nextSnapshot);
    setDamage(nextDamage);
    setEvacuation(nextEvacuation);
    if (globalThis.requestAnimationFrame) {
      animationFrameRef.current = globalThis.requestAnimationFrame(frame);
    }
  }, []);

  const start = useCallback(() => {
    if (stateRef.current.status === 'running') return;
    if (stateRef.current.status === 'finished') {
      rebuild(stateRef.current.landmark, true);
    }
    dispatch({ type: 'start' });
    stateRef.current = simulationReducer(stateRef.current, { type: 'start' });
    audioRef.current.startAlarm();
    if (animationFrameRef.current === null && globalThis.requestAnimationFrame) {
      animationFrameRef.current = globalThis.requestAnimationFrame(frame);
      setActiveLoop(true);
    }
  }, [frame, rebuild]);

  const finish = useCallback(() => {
    if (stateRef.current.status !== 'running') return;
    sceneRef.current!.freeze();
    audioRef.current.stopAlarm();
    setSnapshot(sceneRef.current!.snapshot());
    dispatch({ type: 'finish' });
    stateRef.current = simulationReducer(stateRef.current, { type: 'finish' });
    stopLoop();
  }, [stopLoop]);

  const selectLandmark = useCallback((landmark: LandmarkId) => {
    if (landmark === stateRef.current.landmark && stateRef.current.status === 'ready') return;
    stopLoop();
    audioRef.current.stopAlarm();
    rebuild(landmark, true);
    dispatch({ type: 'select-landmark', landmark });
    stateRef.current = simulationReducer(stateRef.current, { type: 'select-landmark', landmark });
  }, [rebuild, stopLoop]);

  const smaller = useCallback(() => dispatch({ type: 'smaller' }), []);
  const bigger = useCallback(() => dispatch({ type: 'bigger' }), []);
  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      audioRef.current.setMuted(next);
      if (!next && stateRef.current.status === 'running') audioRef.current.startAlarm();
      return next;
    });
  }, []);

  return {
    state,
    snapshot,
    damage,
    evacuation,
    sceneVersion,
    activeLoop,
    muted,
    reducedMotion,
    start,
    finish,
    smaller,
    bigger,
    selectLandmark,
    toggleMute,
  };
}
