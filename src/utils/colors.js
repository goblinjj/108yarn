export const COLORS = [
  { id: 'yellow', name: '黄', hex: '#FFD700' },
  { id: 'blue', name: '蓝', hex: '#3B82F6' }, // Tailwind blue-500
  { id: 'red', name: '红', hex: '#EF4444' }, // Tailwind red-500
  { id: 'brown', name: '棕', hex: '#8B4513' },
  { id: 'darkYellow', name: '深黄', hex: '#F59E0B' }, // Tailwind amber-500
  { id: 'green', name: '绿', hex: '#22C55E' }, // Tailwind green-500
  { id: 'white', name: '白', hex: '#FFFFFF' },
];

export function generateCombinations() {
  const indices = [0, 1, 2, 3, 4, 5, 6];
  
  // IDs for rule checking
  const YELLOW = 0;
  const BLUE = 1;
  const GREEN = 5;
  const WHITE = 6;

  // The combination we must preserve as the first one: ["blue","darkYellow","brown","green"]
  // Indices based on COLORS array: 1, 4, 3, 5
  const firstCombinationIndices = [1, 4, 3, 5];

  function getPermutations(arr, size) {
    if (size === 1) {
      return arr.map(item => [item]);
    }
    let permutations = [];
    arr.forEach((item, index) => {
      const smallerPermutations = getPermutations(
        arr.slice(0, index).concat(arr.slice(index + 1)),
        size - 1
      );
      smallerPermutations.forEach(sp => {
        permutations.push([item].concat(sp));
      });
    });
    return permutations;
  }

  const allPermutations = getPermutations(indices, 4);

  // Filter based on rules
  const validPermutations = allPermutations.filter(p => {
    // Rule 1: White and Yellow cannot be adjacent
    // Rule 2: Blue and Green cannot be adjacent
    for (let i = 0; i < p.length - 1; i++) {
      const current = p[i];
      const next = p[i+1];
      
      // Check White & Yellow
      if ((current === WHITE && next === YELLOW) || (current === YELLOW && next === WHITE)) {
        return false;
      }
      
      // Check Blue & Green
      if ((current === BLUE && next === GREEN) || (current === GREEN && next === BLUE)) {
        return false;
      }
    }
    
    // Also exclude the first combination if it appears (so we don't duplicate it)
    if (p.length === firstCombinationIndices.length && p.every((val, index) => val === firstCombinationIndices[index])) {
        return false;
    }

    return true;
  });

  // Shuffle deterministically
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = validPermutations.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [validPermutations[i], validPermutations[j]] = [validPermutations[j], validPermutations[i]];
  }

  // Prepend the preserved first combination
  const finalPermutations = [firstCombinationIndices, ...validPermutations];

  // Return first 108, mapped to color objects
  return finalPermutations.slice(0, 108).map((indices, index) => ({
    id: index + 1,
    colors: indices.map(i => COLORS[i])
  }));
}
