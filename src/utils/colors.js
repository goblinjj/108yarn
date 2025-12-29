export const COLORS = [
  { id: 'yellow', name: '黄', hex: '#FFD700' },
  { id: 'blue', name: '蓝', hex: '#3B82F6' }, // Tailwind blue-500
  { id: 'red', name: '红', hex: '#EF4444' }, // Tailwind red-500
  { id: 'brown', name: '棕', hex: '#8B4513' },
  { id: 'darkYellow', name: '深黄', hex: '#F59E0B' }, // Tailwind amber-500
  { id: 'green', name: '绿', hex: '#22C55E' }, // Tailwind green-500
];

export function generateCombinations() {
  const indices = [0, 1, 2, 3, 4, 5];

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

  // Shuffle deterministically
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = allPermutations.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [allPermutations[i], allPermutations[j]] = [allPermutations[j], allPermutations[i]];
  }

  // Return first 108, mapped to color objects
  return allPermutations.slice(0, 108).map((indices, index) => ({
    id: index + 1,
    colors: indices.map(i => COLORS[i])
  }));
}
