import { useEffect, useRef, useCallback } from 'react';

export const useSound = () => {
  const audioContextRef = useRef(null);
  const buffersRef = useRef({});

  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Load sounds
    const loadSound = async (url, name) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffersRef.current[name] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load sound: ${name}`, e);
      }
    };

    loadSound('/sounds/click.mp3', 'click');
    loadSound('/sounds/complete.mp3', 'complete');

    return () => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);

  const unlock = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Play a silent buffer to warm up the engine (iOS/Android trick)
    if (ctx) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  }, []);

  const play = useCallback((type) => {
    const ctx = audioContextRef.current;
    const buffer = buffersRef.current[type];
    
    if (ctx && buffer) {
      // Ensure context is running (sometimes it suspends)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  }, []);

  return { play, unlock };
};
