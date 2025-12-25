export const generateFairBoard = (boardNumber: number) => {
  const columns = [
    { min: 1, max: 15 }, 
    { min: 16, max: 30 }, 
    { min: 31, max: 45 }, 
    { min: 46, max: 60 }, 
    { min: 61, max: 75 },
  ];
  
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const matrix: (number | string)[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

  columns.forEach((col, colIdx) => {
    const pool = Array.from({ length: 15 }, (_, i) => col.min + i);
    // Shuffle pool with seed
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(boardNumber + colIdx * 543 + i) * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // Fill column
    for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
      if (colIdx === 2 && rowIdx === 2) {
        matrix[rowIdx][colIdx] = "*"; 
      } else {
        matrix[rowIdx][colIdx] = pool[rowIdx];
      }
    }
  });
  
  return matrix;
};

export const checkBingoWin = (matrix: (number | string)[][], marked: (number | string)[]) => {
  const isMarked = (val: number | string) => val === '*' || marked.includes(val);

  // Check Rows
  for (let r = 0; r < 5; r++) {
    if (matrix[r].every(cell => isMarked(cell))) return { type: 'ROW', index: r };
  }

  // Check Cols
  for (let c = 0; c < 5; c++) {
    let colFull = true;
    for (let r = 0; r < 5; r++) {
      if (!isMarked(matrix[r][c])) {
        colFull = false;
        break;
      }
    }
    if (colFull) return { type: 'COL', index: c };
  }

  // Check Diagonals
  let diag1 = true;
  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!isMarked(matrix[i][i])) diag1 = false;
    if (!isMarked(matrix[i][4 - i])) diag2 = false;
  }
  if (diag1) return { type: 'DIAG', index: 1 };
  if (diag2) return { type: 'DIAG', index: 2 };

  // Check Corners Pattern (All 4 corners)
  if (isMarked(matrix[0][0]) && isMarked(matrix[0][4]) && isMarked(matrix[4][0]) && isMarked(matrix[4][4])) {
    return { type: 'CORNER', index: 0 };
  }

  return null;
};