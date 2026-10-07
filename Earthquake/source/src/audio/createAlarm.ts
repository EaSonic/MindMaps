import type { AlarmHandle } from './AudioController';

type AudioContextConstructor = new () => AudioContext;

export function createAlarm(): AlarmHandle | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const tone = context.createOscillator();
  const pulse = context.createOscillator();
  const pulseDepth = context.createGain();
  const master = context.createGain();

  tone.type = 'sawtooth';
  tone.frequency.value = 720;
  pulse.type = 'sine';
  pulse.frequency.value = 1.35;
  pulseDepth.gain.value = 150;
  master.gain.value = 0.035;

  pulse.connect(pulseDepth);
  pulseDepth.connect(tone.frequency);
  tone.connect(master);
  master.connect(context.destination);
  tone.start();
  pulse.start();
  void context.resume().catch(() => undefined);

  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      tone.stop();
      pulse.stop();
      tone.disconnect();
      pulse.disconnect();
      pulseDepth.disconnect();
      master.disconnect();
      void context.close().catch(() => undefined);
    },
  };
}
