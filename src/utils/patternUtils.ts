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