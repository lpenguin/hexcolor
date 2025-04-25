import React, { useRef, useState, useCallback, useEffect } from 'react';
import './HexGrid.css';

// Define types for cube coordinates
interface CubeCoord {
  q: number; // x axis
  r: number; // y axis
  s: number; // z axis (always -q-r)
}

interface Point {
  x: number; // x coordinate
  y: number; // y coordinate
}

// Type for a hex cell with position and color
interface HexCell extends CubeCoord, Point {
  color: string;
}

interface HexGridProps {
  grid: string[][];
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

// Convert from 2D row/col grid coordinates to cube coordinates
const gridToCube = (row: number, col: number): CubeCoord => {
  // Convert to cube coordinates
  const q = col - Math.floor(row / 2);
  const r = row;
  const s = -q - r;
  
  return { q, r, s };
};

// Convert from cube coordinates back to grid coordinates
const cubeToGrid = (q: number, r: number): { row: number, col: number } => {
  const row = r;
  const col = q + Math.floor(row / 2);
  
  return { row, col };
};

const getLocalSVGCoords = (p: Point, targetElement: SVGGraphicsElement): Point => {
  const point = new DOMPoint(p.x, p.y);

  // Get the transformation matrix from screen to targetElement
  const screenCTM = targetElement.getScreenCTM()!;
  const inverseCTM = screenCTM.inverse();

  const localPoint = point.matrixTransform(inverseCTM);
  return { x: localPoint.x, y: localPoint.y };
}

const HEX_SIZE = 50; // Base size of hexagons

const HexGrid: React.FC<HexGridProps> = ({ 
  grid, 
  onCellClick, 
  onCellHover,
  onMouseDown,
  onMouseUp
}) => {
  const [hexes, setHexes] = useState<HexCell[]>([]);
  const [hoveredHex, setHoveredHex] = useState<CubeCoord | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgGroupRef = useRef<SVGGElement>(null);

  // Create the hex grid data using cube coordinates
  useEffect(() => {
    const newHexes: HexCell[] = [];
    
    // Convert the 2D grid to a list of hex cells with cube coordinates
    grid.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        // Convert to cube coordinates
        const { q, r, s } = gridToCube(rowIndex, colIndex);
        
        // Calculate pixel position
        const x = HEX_SIZE * 3/2 * q;
        const y = HEX_SIZE * Math.sqrt(3) * (r + q/2);
        
        newHexes.push({ q, r, s, x, y, color });
      });
    });
    
    setHexes(newHexes);
  }, [grid]);

  // Generate points for a hexagon
  const getHexPoints = useCallback((size: number): string => {
    let points = '';
    
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      
      points += `${x},${y} `;
    }
    
    return points.trim();
  }, []);

  // Round floating point cube coordinates to the nearest hex
  const roundToHex = (q: number, r: number, s: number) => {
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

  const pixelToSvgLocal = (px: number, py: number): Point => {

    if (!svgGroupRef.current) return { x: 0, y: 0 };

    return getLocalSVGCoords(
      { x: px, y: py },
      svgGroupRef.current
    );
  };

  const pointToCube = (x: number, y: number): CubeCoord => {
    const q = (2/3 * x) / HEX_SIZE; // 50 is the hex size
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / HEX_SIZE;
    const s = -q - r;
    return { q, r, s };
  };

  // Find hex from pixel coordinates as a regular closure (not using useCallback)
  const pixelToHex = (px: number, py: number): HexCell | null => {
    if (!svgRef.current) return null;
    
    const { x, y } = pixelToSvgLocal(px, py);    
    const { q, r, s } = pointToCube(x, y);
    const { rq, rr, rs } = roundToHex(q, r, s);
    
    // Find the hex with these coordinates
    return hexes.find(h => h.q === rq && h.r === rr && h.s === rs) || null;
  };

  // Handle all mouse interactions
  const handleMouseDown = () => {
    setIsDrawing(true);
    onMouseDown();
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    onMouseUp();
  };
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const localCoords = pixelToSvgLocal(event.clientX, event.clientY);

    const hex = pixelToHex(event.clientX, event.clientY);
    if (hex) {
      setHoveredHex(hex);
      
      if (isDrawing) {
        const { row, col } = cubeToGrid(hex.q, hex.r);
        onCellHover(row, col);
      }
    }
  }, [isDrawing, onCellHover]);
  
  const handleHexClick = useCallback((hex: HexCell) => {
    const { row, col } = cubeToGrid(hex.q, hex.r);
    onCellClick(row, col);
  }, [onCellClick]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    onMouseDown();
    
    const touch = event.touches[0];
    const hex = pixelToHex(touch.clientX, touch.clientY);
    
    if (hex) {
      const { row, col } = cubeToGrid(hex.q, hex.r);
      onCellClick(row, col);
    }
  }, [onCellClick, onMouseDown]);
  
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    
    const touch = event.touches[0];
    const hex = pixelToHex(touch.clientX, touch.clientY);
    
    if (hex) {
      setHoveredHex(hex);
      const { row, col } = cubeToGrid(hex.q, hex.r);
      onCellHover(row, col);
    }
  }, [isDrawing, onCellHover]);
  
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(false);
    onMouseUp();
  }, [onMouseUp]);

  // Calculate SVG dimensions based on grid size
  const svgWidth = Math.max(grid[0]?.length * 1.5 * HEX_SIZE + HEX_SIZE, 300);
  const svgHeight = Math.max(grid.length * HEX_SIZE * Math.sqrt(3) + HEX_SIZE, 300);

  return (
    <div className="hex-grid-container">
      <svg 
        ref={svgRef}
        className="hex-grid-svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          {/* Define the gradient */}
          <linearGradient id="hex-outline-gradient" x1="50%" y1="50%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#999999" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
        </defs>

        {/* Center the grid in the SVG */}
        <g
          transform={`translate(${0}, ${0})`}
          ref={svgGroupRef}
        >
          {hexes.map((hex) => {
            const isHovered = hoveredHex && 
                             hoveredHex.q === hex.q && 
                             hoveredHex.r === hex.r;
            
            return (
              <polygon
                key={`${hex.q},${hex.r},${hex.s}`}
                points={getHexPoints(HEX_SIZE)}
                transform={`translate(${hex.x}, ${hex.y}) ${isHovered ? 'scale(1.05)' : ''}`}
                fill={hex.color}
                stroke={isHovered ? "#fff" : "url(#hex-outline-gradient)"}
                strokeWidth={isHovered ? 2 : 1}
                onClick={() => handleHexClick(hex)}
                className="hex-cell-svg"
                data-q={hex.q}
                data-r={hex.r}
                data-s={hex.s}
              />
            );
          })}
        </g>

      </svg>
    </div>
  );
};

export default HexGrid;