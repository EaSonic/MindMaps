import { describe, expect, it, vi } from 'vitest';
import { AudioController, type AlarmHandle } from './AudioController';

function createHandle(): AlarmHandle {
  return { stop: vi.fn() };
}

describe('AudioController', () => {
  it('starts from a user action, never duplicates an alarm, and stops cleanly', () => {
    const handle = createHandle();
    const factory = vi.fn(() => handle);
    const audio = new AudioController(factory);

    expect(audio.startAlarm()).toBe(true);
    expect(audio.startAlarm()).toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);

    audio.stopAlarm();
    expect(handle.stop).toHaveBeenCalledTimes(1);
    expect(audio.isPlaying()).toBe(false);
  });

  it('stops on mute and refuses to start while muted', () => {
    const handle = createHandle();
    const factory = vi.fn(() => handle);
    const audio = new AudioController(factory);

    audio.startAlarm();
    audio.setMuted(true);
    expect(handle.stop).toHaveBeenCalledTimes(1);
    expect(audio.startAlarm()).toBe(false);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('fails safely when Web Audio is unavailable or rejected', () => {
    const missing = new AudioController(() => null);
    const rejected = new AudioController(() => {
      throw new Error('AudioContext rejected');
    });

    expect(() => missing.startAlarm()).not.toThrow();
    expect(missing.startAlarm()).toBe(false);
    expect(() => rejected.startAlarm()).not.toThrow();
    expect(rejected.startAlarm()).toBe(false);
  });
});
