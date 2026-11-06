import { useEffect, useRef } from 'react';

// Fired by VOReplayButton on every accepted tap. A replay is the child engaging, so an idle-hint
// ladder should restart instead of firing a hint over (or right after) the replayed line.
export const VO_REPLAY_EVENT = 'ganesha:vo-replay';

export default function useOnVoiceReplay(callback) {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    const handler = () => ref.current?.();
    window.addEventListener(VO_REPLAY_EVENT, handler);
    return () => window.removeEventListener(VO_REPLAY_EVENT, handler);
  }, []);
}
