import { useEffect, useRef, useCallback } from 'react';

export const useSound = () => {
  const sounds = useRef(null);

  // Initialize sounds lazily once
  if (!sounds.current) {
    sounds.current = {
      click: new Audio('/sounds/click.mp3'),
      complete: new Audio('/sounds/complete.mp3'),
    };
  }

  useEffect(() => {
    // Preload sounds
    Object.values(sounds.current).forEach(audio => {
      audio.load();
    });
  }, []);

  const unlock = useCallback(() => {
    Object.values(sounds.current).forEach(audio => {
      audio.muted = true;
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(e => {
            // Ignore errors
          }).finally(() => {
            audio.muted = false;
          });
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }
      } catch (e) {
        audio.muted = false;
      }
    });
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

  return { play, unlock };
};
