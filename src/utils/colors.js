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

  // Theme Scoring for "Field" (田野)
  // Prioritize: Green, Brown, Yellows, Blue, White
  // Penalize: Clashing high contrast without nature context
  const scoreCombination = (combo) => {
    let score = 0;
    const hasGreen = combo.includes(5);
    const hasBrown = combo.includes(3);
    const hasYellow = combo.includes(0);
    const hasDarkYellow = combo.includes(4);
    const hasBlue = combo.includes(1);
    const hasWhite = combo.includes(6);
    const hasRed = combo.includes(2);

    // Bonus for nature combinations
    if (hasGreen && hasBrown) score += 2; // Earth & Grass
    if (hasYellow && hasGreen) score += 1; // Flowers/Crops
    if (hasDarkYellow && hasGreen) score += 1;
    if (hasBlue && hasWhite) score += 1; // Sky & Clouds
    if (hasBrown && (hasYellow || hasDarkYellow)) score += 2; // Harvest/Soil

    // Penalize "unnatural" clashes or too busy
    if (hasRed && hasGreen) score -= 1; // Can be harsh
    if (hasRed && hasBlue) score -= 1;
    
    // Slight penalty for Red in general as it's an accent in fields
    if (hasRed) score -= 0.5;

    return score;
  };

  // Sort by score descending, then shuffle within same score
  // To do this deterministically with shuffle, we can group by score
  const scoredPermutations = validPermutations.map(p => ({
    p,
    score: scoreCombination(p)
  }));

  scoredPermutations.sort((a, b) => b.score - a.score);

  // Shuffle deterministically within groups of same score to avoid patterns
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // We need to shuffle items that have the same score
  // But simple sort is stable or not guaranteed. Let's just shuffle the whole list first?
  // No, we want high scores first.
  // Let's shuffle the whole valid list first, then sort. 
  // Since sort is stable in modern JS, the random order within ties will be preserved.
  
  // 1. Shuffle validPermutations first
  for (let i = validPermutations.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [validPermutations[i], validPermutations[j]] = [validPermutations[j], validPermutations[i]];
  }

  // 2. Sort by score
  validPermutations.sort((a, b) => scoreCombination(b) - scoreCombination(a));

  // Prepend the preserved first combination
  const finalPermutations = [firstCombinationIndices, ...validPermutations];

  // Return first 108, mapped to color objects
  return finalPermutations.slice(0, 108).map((indices, index) => ({
    id: index + 1,
    colors: indices.map(i => COLORS[i])
  }));
}
