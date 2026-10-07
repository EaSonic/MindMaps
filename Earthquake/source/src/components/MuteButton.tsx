interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      className="mute-button"
      type="button"
      aria-label={muted ? 'Unmute alarm' : 'Mute alarm'}
      aria-pressed={muted}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
        {muted ? (
          <path d="m17 9 4 4m0-4-4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        ) : (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        )}
      </svg>
    </button>
  );
}
