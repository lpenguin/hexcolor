// Utility functions for generating various patterns on the hex grid

/**
 * Generates a Voronoi diagram pattern for a hex grid
 * @param gridSizeY Number of rows in the grid
 * @param gridSizeX Number of columns in the grid
 * @param colors Array of colors to use for the regions
 * @param numRegions Number of regions to generate (defaults to 5)
 * @returns 2D array of colors representing the Voronoi pattern
 */
export const generateVoronoiPattern = (
  gridSizeY: number, 
  gridSizeX: number, 
  colors: string[],
  numRegions: number = 5
): string[][] => {
  // Create a new grid
  const grid: string[][] = [];
  
  // Generate random "seed" points for the Voronoi regions
  const seedPoints: {row: number, col: number, color: string}[] = [];
  
  // Ensure we don't use more regions than available colors
  const actualRegions = Math.min(numRegions, colors.length);
  
  // Generate seed points
  for (let i = 0; i < actualRegions; i++) {
    const row = Math.floor(Math.random() * gridSizeY);
    const col = Math.floor(Math.random() * gridSizeX);
    // Get a random color from the colors array, excluding white/default
    const colorIndex = Math.floor(Math.random() * (colors.length));
    seedPoints.push({
      row,
      col,
      color: colors[colorIndex]
    });
  }
  
  // For each cell in the grid, find the closest seed point and assign its color
  for (let row = 0; row < gridSizeY; row++) {
    const gridRow: string[] = [];
    
    for (let col = 0; col < gridSizeX; col++) {
      let closestSeed = seedPoints[0];
      let minDistance = calculateHexDistance(row, col, closestSeed.row, closestSeed.col);
      
      // Find the closest seed point
      for (let i = 1; i < seedPoints.length; i++) {
        const seed = seedPoints[i];
        const distance = calculateHexDistance(row, col, seed.row, seed.col);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestSeed = seed;
        }
      }
      
      // Assign the color of the closest seed
      gridRow.push(closestSeed.color);
    }
    
    grid.push(gridRow);
  }
  
  return grid;
};

/**
 * Calculate the distance between two hex cells in a grid
 * This uses the Manhattan distance in cube coordinates
 */
function calculateHexDistance(row1: number, col1: number, row2: number, col2: number): number {
  // Convert to cube coordinates (q, r, s)
  // In a hexagonal grid, we need to account for the offset in even/odd rows
  const q1 = col1 - Math.floor(row1 / 2);
  const r1 = row1;
  const s1 = -q1 - r1;
  
  const q2 = col2 - Math.floor(row2 / 2);
  const r2 = row2;
  const s2 = -q2 - r2;
  
  // Manhattan distance in cube coordinates
  return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(s1 - s2)) / 2;
}

/**
 * Generates a pattern with geometric shapes on the hex grid
 * @param gridSizeY Number of rows in the grid
 * @param gridSizeX Number of columns in the grid
 * @param colors Array of colors to use for the shapes
 * @param numShapes Number of shapes to generate (defaults to 6)
 * @returns 2D array of colors representing the shapes pattern
 */
export const generateShapesPattern = (
  gridSizeY: number, 
  gridSizeX: number, 
  colors: string[],
  numShapes: number = 6
): string[][] => {
  // Create a new grid with default background color
  const grid: string[][] = [];
  for (let i = 0; i < gridSizeY; i++) {
    grid.push(Array(gridSizeX).fill(colors[colors.length - 3])); // Use light gray as background
  }
  
  // Generate different shapes
  for (let s = 0; s < numShapes; s++) {
    // Select a random shape type (0: circle, 1: hexagon, 2: triangle)
    const shapeType = Math.floor(Math.random() * 3);
    
    // Get a random color from the colors array, excluding the last 4 (white, grays, black)
    const colorIndex = Math.floor(Math.random() * (colors.length - 4));
    const shapeColor = colors[colorIndex];
    
    // Generate random center point for the shape
    const centerRow = Math.floor(Math.random() * gridSizeY);
    const centerCol = Math.floor(Math.random() * gridSizeX);
    
    // Random size for the shape (radius)
    const size = Math.floor(Math.random() * 4) + 2;  // 2 to 5 cells radius
    
    switch (shapeType) {
      case 0: // Circle
        drawCircle(grid, centerRow, centerCol, size, shapeColor);
        break;
      case 1: // Hexagon
        drawHexagon(grid, centerRow, centerCol, size, shapeColor);
        break;
      case 2: // Triangle
        drawTriangle(grid, centerRow, centerCol, size, shapeColor);
        break;
    }
  }
  
  return grid;
};

/**
 * Draws a circular shape on the grid
 */
function drawCircle(
  grid: string[][], 
  centerRow: number, 
  centerCol: number, 
  radius: number, 
  color: string
): void {
  const gridSizeY = grid.length;
  const gridSizeX = grid[0].length;
  
  // Check each cell in the grid
  for (let row = 0; row < gridSizeY; row++) {
    for (let col = 0; col < gridSizeX; col++) {
      // Calculate hex distance from center
      const distance = calculateHexDistance(row, col, centerRow, centerCol);
      
      // If distance is less than or equal to radius, color the cell
      if (distance <= radius) {
        grid[row][col] = color;
      }
    }
  }
}

/**
 * Draws a hexagonal shape on the grid
 */
function drawHexagon(
  grid: string[][], 
  centerRow: number, 
  centerCol: number, 
  size: number, 
  color: string
): void {
  const gridSizeY = grid.length;
  const gridSizeX = grid[0].length;
  
  // Check each cell in the grid
  for (let row = 0; row < gridSizeY; row++) {
    for (let col = 0; col < gridSizeX; col++) {
      // Calculate cube coordinates
      const q1 = col - Math.floor(row / 2);
      const r1 = row;
      const s1 = -q1 - r1;
      
      const q2 = centerCol - Math.floor(centerRow / 2);
      const r2 = centerRow;
      const s2 = -q2 - r2;
      
      // For a regular hexagon, all coordinates must be within the size
      if (Math.max(
        Math.abs(q1 - q2),
        Math.abs(r1 - r2),
        Math.abs(s1 - s2)
      ) < size) {
        grid[row][col] = color;
      }
    }
  }
}

/**
 * Draws a triangular shape on the grid
 */
function drawTriangle(
  grid: string[][], 
  centerRow: number, 
  centerCol: number, 
  size: number, 
  color: string
): void {
  const gridSizeY = grid.length;
  const gridSizeX = grid[0].length;
  
  // Define triangle vertices in cube coordinates
  // Base center
  const q0 = centerCol - Math.floor(centerRow / 2);
  const r0 = centerRow;
  const s0 = -q0 - r0;
  
  // Randomly select orientation (0-5)
  const orientation = Math.floor(Math.random() * 6);
  
  // Check each cell in the grid
  for (let row = 0; row < gridSizeY; row++) {
    for (let col = 0; col < gridSizeX; col++) {
      // Calculate cube coordinates
      const q = col - Math.floor(row / 2);
      const r = row;
      const s = -q - r;
      
      // Apply triangle check based on orientation
      let inTriangle = false;
      
      switch (orientation) {
        case 0: // Pointing up
          inTriangle = r <= r0 && r >= r0 - size && q >= q0 - size && s >= s0 - size;
          break;
        case 1: // Pointing up-right
          inTriangle = q >= q0 && q <= q0 + size && r >= r0 - size && s <= s0;
          break;
        case 2: // Pointing down-right
          inTriangle = s <= s0 && s >= s0 - size && q >= q0 && r <= r0 + size;
          break;
        case 3: // Pointing down
          inTriangle = r >= r0 && r <= r0 + size && q <= q0 + size && s <= s0 + size;
          break;
        case 4: // Pointing down-left
          inTriangle = q <= q0 && q >= q0 - size && r <= r0 + size && s >= s0;
          break;
        case 5: // Pointing up-left
          inTriangle = s >= s0 && s <= s0 + size && q <= q0 && r >= r0 - size;
          break;
      }
      
      if (inTriangle) {
        grid[row][col] = color;
      }
    }
  }
}