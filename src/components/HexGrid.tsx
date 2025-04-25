import React from 'react';
import './HexGrid.css';

interface HexCellProps {
  row: number;
  col: number;
  color: string;
  onCellClick: (row: number, col: number) => void;
}

const HexCell: React.FC<HexCellProps> = ({ row, col, color, onCellClick }) => {
  return (
    <div className="hex-cell-container" onClick={() => onCellClick(row, col)}>
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
}

const HexGrid: React.FC<HexGridProps> = ({ grid, onCellClick }) => {
  return (
    <div className="hex-grid">
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
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HexGrid;