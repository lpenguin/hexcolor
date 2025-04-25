// Define types for cube coordinates
export interface CubeCoord {
  q: number; // x axis
  r: number; // y axis
  s: number; // z axis (always -q-r)
}

export interface Point {
  x: number; // x coordinate
  y: number; // y coordinate
}

// Convert from 2D row/col grid coordinates to cube coordinates
export const gridToCube = (row: number, col: number): CubeCoord => {
  // Convert to cube coordinates
  const q = col - Math.floor(row / 2);
  const r = row;
  const s = -q - r;
  
  return { q, r, s };
};

// Convert from cube coordinates back to grid coordinates
export const cubeToGrid = (q: number, r: number): { row: number, col: number } => {
  const row = r;
  const col = q + Math.floor(row / 2);
  
  return { row, col };
};

// Get local SVG coordinates from screen coordinates
export const getLocalSVGCoords = (p: Point, targetElement: SVGGraphicsElement): Point => {
  const point = new DOMPoint(p.x, p.y);

  // Get the transformation matrix from screen to targetElement
  const screenCTM = targetElement.getScreenCTM()!;
  const inverseCTM = screenCTM.inverse();

  const localPoint = point.matrixTransform(inverseCTM);
  return { x: localPoint.x, y: localPoint.y };
};

// Convert from pixel position to cube coordinates
export const pointToCube = (x: number, y: number, hexSize: number): CubeCoord => {
  const q = (2/3 * x) / hexSize;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
  const s = -q - r;
  return { q, r, s };
};

// Round floating point cube coordinates to the nearest hex
export const roundToHex = (q: number, r: number, s: number): { rq: number, rr: number, rs: number } => {
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  
  // Fix the coordinate with the largest rounding error
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }
  
  return { rq, rr, rs };
};

// Generate points for a hexagon polygon
export const getHexPoints = (size: number): string => {
  let points = '';
  
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    
    points += `${x},${y} `;
  }
  
  return points.trim();
};