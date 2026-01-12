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
  const RED = 2;
  const BROWN = 3;
  const DARK_YELLOW = 4;
  const GREEN = 5;
  const WHITE = 6;

  // The combination we must preserve as the first one: ["blue","darkYellow","brown","green"]
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

  // --- LOGIC TO REPRODUCE FIRST 27 ---
  
  // Filter based on original rules
  const validPermutations = allPermutations.filter(p => {
    // Rule 1: White and Yellow cannot be adjacent
    // Rule 2: Blue and Green cannot be adjacent
    for (let i = 0; i < p.length - 1; i++) {
      const current = p[i];
      const next = p[i+1];
      if ((current === WHITE && next === YELLOW) || (current === YELLOW && next === WHITE)) return false;
      if ((current === BLUE && next === GREEN) || (current === GREEN && next === BLUE)) return false;
    }
    // Exclude the first combination
    if (p.length === firstCombinationIndices.length && p.every((val, index) => val === firstCombinationIndices[index])) {
        return false;
    }
    return true;
  });

  // Original Theme Scoring
  const scoreCombinationOld = (combo) => {
    let score = 0;
    const hasGreen = combo.includes(GREEN);
    const hasBrown = combo.includes(BROWN);
    const hasYellow = combo.includes(YELLOW);
    const hasDarkYellow = combo.includes(DARK_YELLOW);
    const hasBlue = combo.includes(BLUE);
    const hasWhite = combo.includes(WHITE);
    const hasRed = combo.includes(RED);

    if (hasGreen && hasBrown) score += 2;
    if (hasYellow && hasGreen) score += 1;
    if (hasDarkYellow && hasGreen) score += 1;
    if (hasBlue && hasWhite) score += 1;
    if (hasBrown && (hasYellow || hasDarkYellow)) score += 2;

    if (hasRed && hasGreen) score -= 1;
    if (hasRed && hasBlue) score -= 1;
    if (hasRed) score -= 0.5;

    return score;
  };

  // Reproduce the shuffle and sort for the first 27
  const permutationsForOld = [...validPermutations];

  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Shuffle
  for (let i = permutationsForOld.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [permutationsForOld[i], permutationsForOld[j]] = [permutationsForOld[j], permutationsForOld[i]];
  }

  // Sort
  permutationsForOld.sort((a, b) => scoreCombinationOld(b) - scoreCombinationOld(a));

  // The first 27 (1 fixed + 26 from the list)
  const fixedPart = [firstCombinationIndices, ...permutationsForOld.slice(0, 26)];

  // --- NEW LOGIC FOR 28-108 ---

  // Helper to check if a permutation is already in fixedPart
  const isUsed = (p) => {
    return fixedPart.some(fixed => fixed.every((val, idx) => val === p[idx]));
  };

  // Candidates: All valid permutations (using basic adjacency rules) minus the ones already used
  const candidates = validPermutations.filter(p => !isUsed(p));

  // New Scoring/Filtering Rules
  const scoreCombinationNew = (combo) => {
    let score = 0;
    const hasGreen = combo.includes(GREEN);
    const hasBrown = combo.includes(BROWN);
    const hasYellow = combo.includes(YELLOW);
    const hasDarkYellow = combo.includes(DARK_YELLOW);
    const hasBlue = combo.includes(BLUE);
    const hasWhite = combo.includes(WHITE);
    const hasRed = combo.includes(RED);

    // Rule 1: Must have White or Yellow
    if (!hasWhite && !hasYellow) {
        return -1000; // Discard
    }

    // Rule 2: Not too large span / Not too eye-catching
    if (hasRed) score -= 2; // Red is very eye-catching
    if (hasRed && hasGreen) score -= 3;
    if (hasRed && hasBlue) score -= 3;
    
    // Reward harmonious/soft combinations
    if (hasWhite) score += 2;
    if (hasYellow) score += 1;
    
    // Analogous / Earthy bonuses
    if (hasBrown && hasDarkYellow) score += 1;
    if (hasGreen && hasYellow) score += 1;
    if (hasBlue && hasWhite) score += 1;
    
    if (hasBlue && hasRed && hasYellow) score -= 2;

    return score;
  };

  // Shuffle candidates first
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Identify independent Red pool for injection (sorted by score)
  // We use filter to get a new array, but references to permutations are same
  let redInjectionPool = candidates.filter(p => p.includes(RED) && scoreCombinationNew(p) > -500);
  redInjectionPool.sort((a, b) => scoreCombinationNew(b) - scoreCombinationNew(a));

  // Categorize candidates to ensure balance
  const onlyWhite = [];
  const onlyYellow = [];
  const both = [];

  candidates.forEach(p => {
    if (scoreCombinationNew(p) <= -500) return; // Filter invalid

    const hasW = p.includes(WHITE);
    const hasY = p.includes(YELLOW);
    if (hasW && hasY) both.push(p);
    else if (hasW) onlyWhite.push(p);
    else if (hasY) onlyYellow.push(p);
  });

  // Sort each group by score
  onlyWhite.sort((a, b) => scoreCombinationNew(b) - scoreCombinationNew(a));
  onlyYellow.sort((a, b) => scoreCombinationNew(b) - scoreCombinationNew(a));
  both.sort((a, b) => scoreCombinationNew(b) - scoreCombinationNew(a));

  // Interleave to get balanced mix (approx 27 of each for the 81 slots)
  const newPart = [];
  const usedSet = new Set();
  let i = 0;
  let redIdx = 0;

  const tryAdd = (p) => {
      if (usedSet.has(p)) return false;
      newPart.push(p);
      usedSet.add(p);
      return true;
  };

  while (newPart.length < 81) {
    // Inject Red occasionally in range 62-108 (indices 34-80)
    // Every ~6th item
    if (newPart.length >= 34 && (newPart.length - 34) % 6 === 0 && redIdx < redInjectionPool.length) {
        const p = redInjectionPool[redIdx++];
        if (tryAdd(p)) {
            continue;
        }
    }

    let added = false;
    // Cycle through: Only White -> Only Yellow -> Both
    if (i < onlyWhite.length) { if (tryAdd(onlyWhite[i])) added = true; }
    if (newPart.length < 81 && i < onlyYellow.length) { if (tryAdd(onlyYellow[i])) added = true; }
    if (newPart.length < 81 && i < both.length) { if (tryAdd(both[i])) added = true; }
    
    if (!added && i > candidates.length * 2) break; // End breakdown
    i++;
  }

  const finalPermutations = [...fixedPart, ...newPart];

  return finalPermutations.map((indices, index) => ({
    id: index + 1,
    colors: indices.map(i => COLORS[i])
  }));
}
