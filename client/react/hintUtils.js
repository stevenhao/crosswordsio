const reverseIndex = {};

function gridHeuristic() {
}

function match(word, pattern) {
  if (word.length === pattern.length) {
    for (let i = 0; i < word.length; i += 1) {
      if (word[i] !== pattern[i] && pattern[i] !== '.') {
        return false;
      }
    }
    return true;
  }
}

function apply(mask, word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    if ((mask >> i) & 1) {
      result += word[i];
    } else {
      result += '.';
    }
  }
  return result;
}

function getMasks(length) {
  const res = [];
  for (let i = 0; i < 1 << length; i += 1) {
    res.push(i);
  }
  return res;
}


let precomputed = false;
function precompute() {
  wordList.forEach(word => {
    const masks = getMasks(word.length);
    masks.forEach(mask => {
      const pattern = apply(mask, word);
      if (!(pattern in reverseIndex)) {
        reverseIndex[pattern] = [];
      }
      const lst = reverseIndex[pattern];
      if (lst[lst.length - 1] !== word) {
        lst.push(word);
      }
    });
  });
  precomputed = true;
}

function findMatches(pattern) {
  if (!precomputed) {
    precompute();
  }
  return reverseIndex[pattern] || [];
}

function getPatterns(grid) {
  const across = [], down = [];
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      const ch = cell.value == '' ? '.' : cell.value;
      if (!cell.black) {
        across[cell.parents.across] = (across[cell.parents.across] || '') + ch;
        down[cell.parents.down] = (down[cell.parents.down] || '') + ch;
      }
    });
  });
  return {across, down};
}

function heuristic(grid) {
  const {across, down} = getPatterns(grid);
  const patterns = across.concat(down);
  let sum = 0;
  patterns.forEach(pattern => {
    sum += 1 - 1 / Math.max(1/101., findMatches(pattern).length);
  });
  return sum;
}

function evaluate(grid, ori, num, word) {
  let pos = 0;
  const ngrid = grid.map(row => (
    row.map(cell => Object.assign({}, cell, {
      value: !cell.black && cell.parents[ori] === num ? word[pos++] : cell.value
    }))
  ));

  const result = heuristic(ngrid);
  return result;
}

export { evaluate, findMatches, getPatterns };
