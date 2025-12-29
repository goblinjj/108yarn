import { useEffect, useRef, useCallback } from 'react';

export const useSound = () => {
  const sounds = useRef({
    click: new Audio('/sounds/click.mp3'),
    scroll: new Audio('/sounds/scroll.mp3'),
    complete: new Audio('/sounds/complete.mp3'),
  });

  useEffect(() => {
    // Preload sounds
    Object.values(sounds.current).forEach(audio => {
      audio.load();
    });
  }, []);

  const play = useCallback((type) => {
    const original = sounds.current[type];
    if (original) {
      // Clone the node to allow overlapping sounds (important for rapid scrolling/clicking)
      const clone = original.cloneNode();
      clone.volume = original.volume;
      clone.play().catch(e => {
        // Ignore auto-play errors or interruptions
      });
    }
  }, []);

  return { play };
};
