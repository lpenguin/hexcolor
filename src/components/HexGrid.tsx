import React from 'react';
import './HexGrid.css';

interface HexCellProps {
  row: number;
  col: number;
  color: string;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  isDrawing: boolean;
}

const HexCell: React.FC<HexCellProps> = ({ 
  row, 
  col, 
  color, 
  onCellClick, 
  onCellHover,
  isDrawing
}) => {
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
      className="hex-cell-container" 
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
  const [isDrawing, setIsDrawing] = React.useState(false);
  
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

  return (
    <div 
      className="hex-grid"
      onMouseDown={handleMouseDownGrid}
      onMouseUp={handleMouseUpGrid}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnterGrid}
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
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HexGrid;