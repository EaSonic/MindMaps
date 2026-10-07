import { createAlarm } from './createAlarm';

export interface AlarmHandle {
  stop: () => void;
}

export type AlarmFactory = () => AlarmHandle | null;

export class AudioController {
  private handle: AlarmHandle | null = null;
  private muted = false;
  private readonly factory: AlarmFactory;

  constructor(factory: AlarmFactory = createAlarm) {
    this.factory = factory;
  }

  startAlarm(): boolean {
    if (this.muted) return false;
    if (this.handle) return true;
    try {
      this.handle = this.factory();
      return this.handle !== null;
    } catch {
      this.handle = null;
      return false;
    }
  }

  stopAlarm(): void {
    if (!this.handle) return;
    this.handle.stop();
    this.handle = null;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopAlarm();
  }

  isMuted(): boolean {
    return this.muted;
  }

  isPlaying(): boolean {
    return this.handle !== null;
  }
}
