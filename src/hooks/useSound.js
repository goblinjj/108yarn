import { useEffect, useRef, useCallback } from 'react';

export const useSound = () => {
  const sounds = useRef({
    click: new Audio('/sounds/click.mp3'),
    scroll: new Audio('/sounds/scroll.mp3'),
    complete: new Audio('/sounds/complete.mp3'),
  });

  useEffect(() => {
    // Mobile Audio Unlock: Play all sounds silently on first interaction
    const unlock = () => {
      Object.values(sounds.current).forEach(audio => {
        audio.muted = true;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }).catch(e => {
          // Ignore errors during unlock
        });
      });
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };

    document.addEventListener('touchstart', unlock);
    document.addEventListener('click', unlock);

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  const play = useCallback((type) => {
    const audio = sounds.current[type];
    if (audio) {
      // Reset to start to allow rapid replay (no overlap, but better mobile compatibility)
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Ignore auto-play errors or interruptions
      });
    }
  }, []);

  return { play };
};
