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
    <div 
      className="hex-cell" 
      style={{ backgroundColor: color }}
      onClick={() => onCellClick(row, col)}
    />
  );
};

interface HexGridProps {
  grid: string[][];
  onCellClick: (row: number, col: number) => void;
}

const HexGrid: React.FC<HexGridProps> = ({ grid, onCellClick }) => {
  return (
    <div className="hex-grid">
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