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

    // Mobile Audio Unlock: Play all sounds silently on first interaction
    const unlock = () => {
      Object.values(sounds.current).forEach(audio => {
        // Skip 'click' sound in unlock to avoid cutting off the real click sound
        // But ensure it's loaded
        if (audio === sounds.current.click) {
          audio.load();
          return;
        }

        audio.muted = true;
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
            }).catch(e => {
              // Ignore errors
            });
          } else {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
          }
        } catch (e) {
          // Ignore errors
        }
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
