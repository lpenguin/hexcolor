import React, { useRef, useState, useCallback, useEffect } from 'react';
import './HexGrid.css';
import HexCell from './HexCell';
import { 
  CubeCoord, 
  Point, 
  gridToCube, 
  cubeToGrid, 
  getLocalSVGCoords,
  pointToCube,
  roundToHex
} from '../utils/hexUtils';

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

  // SVG coordinate helpers
  const pixelToSvgLocal = useCallback((px: number, py: number): Point => {
    if (!svgGroupRef.current) return { x: 0, y: 0 };
    return getLocalSVGCoords({ x: px, y: py }, svgGroupRef.current);
  }, []);

  // Find hex from pixel coordinates
  const pixelToHex = useCallback((px: number, py: number): HexCell | null => {
    if (!svgRef.current) return null;
    
    const { x, y } = pixelToSvgLocal(px, py);    
    const { q, r, s } = pointToCube(x, y, HEX_SIZE);
    const { rq, rr, rs } = roundToHex(q, r, s);
    
    // Find the hex with these coordinates
    return hexes.find(h => h.q === rq && h.r === rr && h.s === rs) || null;
  }, [hexes, pixelToSvgLocal]);

  // Unified pointer event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    onMouseDown();
    
    // Get pointer coordinates and check for hex
    const hex = pixelToHex(event.clientX, event.clientY);
    if (hex) {
      const { row, col } = cubeToGrid(hex.q, hex.r);
      onCellClick(row, col);
    }
  }, [onCellClick, onMouseDown, pixelToHex]);
  
  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    setIsDrawing(false);
    onMouseUp();
  }, [onMouseUp]);
  
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const hex = pixelToHex(event.clientX, event.clientY);
    
    if (hex) {
      setHoveredHex(hex);
      
      if (isDrawing) {
        const { row, col } = cubeToGrid(hex.q, hex.r);
        onCellHover(row, col);
      }
    }
  }, [isDrawing, onCellHover, pixelToHex]);
  
  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    setIsDrawing(false);
    onMouseUp();
  }, [onMouseUp]);

  // Handle direct hex cell click
  const handleHexClick = useCallback((hex: HexCell) => {
    const { row, col } = cubeToGrid(hex.q, hex.r);
    onCellClick(row, col);
  }, [onCellClick]);

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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: 'none' }} /* Disable browser touch actions */
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
          ref={svgGroupRef}
        >
          {hexes.map((hex) => {
            const isHovered = hoveredHex !== null && hoveredHex.q === hex.q && hoveredHex.r === hex.r;
            
            return (
              <HexCell
                key={`${hex.q},${hex.r},${hex.s}`}
                q={hex.q}
                r={hex.r}
                s={hex.s}
                x={hex.x}
                y={hex.y}
                color={hex.color}
                size={HEX_SIZE}
                isHovered={isHovered}
                onClick={() => handleHexClick(hex)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;