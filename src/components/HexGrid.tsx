import React, { useRef, useEffect, useState, useCallback } from 'react';
import './HexGrid.css';

interface HexCellProps {
  row: number;
  col: number;
  color: string;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  isDrawing: boolean;
  registerCellRef: (row: number, col: number, element: HTMLDivElement) => void;
}

const HexCell: React.FC<HexCellProps> = ({ 
  row, 
  col, 
  color, 
  onCellClick, 
  onCellHover,
  isDrawing,
  registerCellRef
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  
  // Register this cell's ref with the parent grid for touch tracking
  useEffect(() => {
    if (cellRef.current) {
      registerCellRef(row, col, cellRef.current);
    }
  }, [row, col, registerCellRef]);
  
  // Handle all mouse interactions in one place
  const handleMouseDown = () => {
    onCellClick(row, col);
  };
  
  const handleMouseEnter = () => {
    if (isDrawing) {
      onCellHover(row, col);
    }
  };

  return (
    <div 
      ref={cellRef}
      className="hex-cell-container" 
      data-row={row}
      data-col={col}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <svg className="hex-cell" viewBox="0 0 100 115">
        {/* Background fill using the defined hex shape */}
        <use href="#hex-shape" fill={color} />
        
        {/* Outline using the defined outline shape with gradient */}
        <use href="#hex-outline-shape" />
      </svg>
    </div>
  );
};

interface HexGridProps {
  grid: string[][];
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  grid, 
  onCellClick, 
  onCellHover,
  onMouseDown,
  onMouseUp
}) => {
  // State to track if drawing is active
  const [isDrawing, setIsDrawing] = useState(false);
  // Ref to track last touch position to avoid duplicate updates
  const lastTouchRef = useRef<{row: number, col: number} | null>(null);
  // Ref to store cell elements for touch tracking
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Ref to the grid element
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Register cell refs for touch detection
  const registerCellRef = useCallback((row: number, col: number, element: HTMLDivElement) => {
    cellRefs.current.set(`${row}-${col}`, element);
  }, []);
  
  // Find the cell element at a given position
  const findCellAtPosition = useCallback((x: number, y: number) => {
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (!element) return null;
    
    // Look for the closest element with data-row and data-col attributes
    let current = element;
    while (current && (!current.dataset.row || !current.dataset.col)) {
      if (current.parentElement) {
        current = current.parentElement;
      } else {
        break;
      }
    }
    
    if (current && current.dataset.row && current.dataset.col) {
      const row = parseInt(current.dataset.row, 10);
      const col = parseInt(current.dataset.col, 10);
      return { row, col, element: current };
    }
    
    return null;
  }, []);
  
  // Handle grid-level mouse events
  const handleMouseDownGrid = () => {
    setIsDrawing(true);
    onMouseDown();
  };
  
  const handleMouseUpGrid = () => {
    setIsDrawing(false);
    onMouseUp();
  };
  
  // Handle leaving the grid
  const handleMouseLeave = () => {
    if (isDrawing) {
      // Don't stop drawing state internally to keep track if we re-enter
      // but do tell the parent that mouse is up for its tracking
      onMouseUp();
    }
  };
  
  // Handle re-entering the grid with mouse still down
  const handleMouseEnterGrid = (e: React.MouseEvent) => {
    if (e.buttons === 1 && !isDrawing) {
      // If mouse button is pressed when re-entering, restart drawing mode
      setIsDrawing(true);
      onMouseDown();
    }
  };
  
  // Handle touch events at grid level
  const handleTouchStartGrid = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/zooming
    const touch = e.touches[0];
    const cell = findCellAtPosition(touch.clientX, touch.clientY);
    
    if (cell) {
      // Start drawing and apply color to the first cell
      setIsDrawing(true);
      onMouseDown();
      onCellClick(cell.row, cell.col);
      lastTouchRef.current = { row: cell.row, col: cell.col };
    }
  };
  
  const handleTouchEndGrid = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    onMouseUp();
    lastTouchRef.current = null;
  };
  
  const handleTouchMoveGrid = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/zooming
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const cell = findCellAtPosition(touch.clientX, touch.clientY);
    
    if (cell) {
      const { row, col } = cell;
      // Only update if we've moved to a new cell
      if (!lastTouchRef.current || 
          lastTouchRef.current.row !== row || 
          lastTouchRef.current.col !== col) {
        onCellHover(row, col);
        lastTouchRef.current = { row, col };
      }
    }
  };

  return (
    <div 
      ref={gridRef}
      className="hex-grid"
      onMouseDown={handleMouseDownGrid}
      onMouseUp={handleMouseUpGrid}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnterGrid}
      onTouchStart={handleTouchStartGrid}
      onTouchEnd={handleTouchEndGrid}
      onTouchMove={handleTouchMoveGrid}
    >
      {/* Define shared resources once */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* Define the gradient */}
          <linearGradient id="hex-outline-gradient" x1="50%" y1="50%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#999999" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          
          {/* Define a single hexagon shape for both fill and outline */}
          <path 
            id="hex-shape" 
            d="M50,0 L100,25 L100,90 L50,115 L0,90 L0,25 Z" 
          />
          
          {/* The outline now references the same path */}
          <path 
            id="hex-outline-shape" 
            d="M50,0 L100,25 L100,90 L50,115 L0,90 L0,25 Z" 
            fill="none" 
            stroke="url(#hex-outline-gradient)" 
            strokeWidth="2"
          />
        </defs>
      </svg>
      
      {grid.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`hex-row ${rowIndex % 2 === 0 ? 'hex-row-even' : 'hex-row-odd'}`}
        >
          {row.map((color, colIndex) => (
            <HexCell 
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              color={color}
              onCellClick={onCellClick}
              onCellHover={onCellHover}
              isDrawing={isDrawing}
              registerCellRef={registerCellRef}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HexGrid;