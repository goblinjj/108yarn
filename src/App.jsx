import React, { useState, useEffect, useRef } from 'react';
import { generateCombinations } from './utils/colors';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './hooks/useSound';

function App() {
  const [combinations, setCombinations] = useState([]);
  const { play } = useSound();
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('completedCombinations');
    return saved ? JSON.parse(saved) : [];
  });
  // New state for delayed sorting
  const [sortedCompleted, setSortedCompleted] = useState(() => {
    const saved = localStorage.getItem('completedCombinations');
    return saved ? JSON.parse(saved) : [];
  });

  const [pending, setPending] = useState([]);
  const timers = useRef({});

  useEffect(() => {
    setCombinations(generateCombinations());
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (pending.length > 0) {
      // Play ticking sound while any card is loading
      interval = setInterval(() => {
        play('scroll');
      }, 150); // Play every 150ms for a mechanical ticking effect
    }
    return () => clearInterval(interval);
  }, [pending, play]);

  useEffect(() => {
    localStorage.setItem('completedCombinations', JSON.stringify(completed));
    
    // Delay the update of sortedCompleted to allow animation/visual feedback
    const timer = setTimeout(() => {
      setSortedCompleted(prev => {
        // Play sound only if we added a new item (length increased)
        if (completed.length > prev.length) {
          play('complete');
        }
        return completed;
      });
    }, 600); // 600ms delay

    return () => clearTimeout(timer);
  }, [completed, play]);

  const handleCardClick = (id) => {
    if (completed.includes(id)) {
      play('click');
      setCompleted(prev => prev.filter(c => c !== id));
      return;
    }

    if (pending.includes(id)) {
      play('click');
      clearTimeout(timers.current[id]);
      delete timers.current[id];
      setPending(prev => prev.filter(i => i !== id));
      return;
    }

    play('click');
    setPending(prev => [...prev, id]);
    timers.current[id] = setTimeout(() => {
      setCompleted(prev => [...prev, id]);
      setPending(prev => prev.filter(i => i !== id));
      delete timers.current[id];
    }, 1500);
  };

  const progress = Math.round((completed.length / 108) * 100);

  // Use sortedCompleted for sorting logic instead of completed
  const sortedCombinations = [...combinations].sort((a, b) => {
    const aCompleted = sortedCompleted.includes(a.id);
    const bCompleted = sortedCompleted.includes(b.id);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">毛线颜色组合 (108种)</h1>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 max-w-md mx-auto">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-600">
            进度: {completed.length} / 108 ({progress}%)
          </p>
        </header>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {sortedCombinations.map((combo) => {
              const isDone = completed.includes(combo.id);
              const isPending = pending.includes(combo.id);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  key={combo.id}
                  onClick={() => handleCardClick(combo.id)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-colors duration-200 overflow-hidden
                    ${isDone 
                      ? 'border-green-500 bg-green-50 opacity-75' 
                      : isPending
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-white bg-white shadow-sm hover:shadow-md hover:border-blue-200'
                    }
                  `}
                >
                  {isPending && (
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1.5 bg-blue-500 z-10"
                    />
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-mono text-gray-400">#{combo.id}</span>
                    {isDone && <Check className="w-5 h-5 text-green-500" />}
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {combo.colors.map((color, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className="w-10 h-10 rounded-full shadow-inner border border-black/10"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <span className="text-xs text-gray-500">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
