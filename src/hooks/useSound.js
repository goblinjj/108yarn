import { useEffect, useRef, useCallback } from 'react';

export const useSound = () => {
  const audioContextRef = useRef(null);
  const buffersRef = useRef({});

  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    let ctx;
    try {
      ctx = new AudioContext();
      audioContextRef.current = ctx;
    } catch (e) {
      console.error("Failed to create AudioContext", e);
      return;
    }

    // Helper to decode audio data compatible with older browsers (callback-based)
    const decodeAudio = (arrayBuffer) => {
      return new Promise((resolve, reject) => {
        try {
          // Try using the promise-based API if available, or fallback to callbacks
          const res = ctx.decodeAudioData(arrayBuffer, resolve, reject);
          // If it returns a promise (modern browsers), handle it
          if (res && typeof res.then === 'function') {
            res.catch(reject);
          }
        } catch (e) {
          reject(e);
        }
      });
    };

    // Load sounds
    const loadSound = async (url, name) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await decodeAudio(arrayBuffer);
        buffersRef.current[name] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load sound: ${name}`, e);
      }
    };

    loadSound('/sounds/click.mp3', 'click');
    loadSound('/sounds/complete.mp3', 'complete');
    loadSound('/sounds/final.mp3', 'final');

    return () => {
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(e => console.error("Failed to close AudioContext", e));
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
