import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimulation } from './useSimulation';

describe('useSimulation', () => {
  const requestAnimationFrameMock = vi.fn(() => 42);
  const cancelAnimationFrameMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('keeps one animation loop across repeated Start and cleans it on Finish', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => result.current.start());
    act(() => result.current.start());
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);
    expect(result.current.activeLoop).toBe(true);

    act(() => result.current.finish());
    expect(cancelAnimationFrameMock).toHaveBeenCalledTimes(1);
    expect(result.current.activeLoop).toBe(false);
  });

  it('rebuilds exactly once after Finish and exactly once for a landmark change', () => {
    const { result } = renderHook(() => useSimulation());
    const initialVersion = result.current.sceneVersion;

    act(() => result.current.start());
    act(() => result.current.finish());
    act(() => result.current.start());
    expect(result.current.sceneVersion).toBe(initialVersion + 1);

    act(() => result.current.selectLandmark('empire'));
    expect(result.current.sceneVersion).toBe(initialVersion + 2);
    expect(result.current.state.landmark).toBe('empire');
    expect(result.current.state.status).toBe('ready');
  });
});
