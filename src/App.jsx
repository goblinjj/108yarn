import React, { useState, useEffect } from 'react';
import { generateCombinations } from './utils/colors';
import { Check } from 'lucide-react';

function App() {
  const [combinations, setCombinations] = useState([]);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('completedCombinations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    setCombinations(generateCombinations());
  }, []);

  useEffect(() => {
    localStorage.setItem('completedCombinations', JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (id) => {
    setCompleted(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  const progress = Math.round((completed.length / 108) * 100);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {combinations.map((combo) => {
            const isDone = completed.includes(combo.id);
            return (
              <div 
                key={combo.id}
                onClick={() => toggleComplete(combo.id)}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isDone 
                    ? 'border-green-500 bg-green-50 opacity-75' 
                    : 'border-white bg-white shadow-sm hover:shadow-md hover:border-blue-200'
                  }
                `}
              >
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
