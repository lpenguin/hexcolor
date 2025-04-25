import React from 'react';
import { getHexPoints } from '../utils/hexUtils';

// Type for a hex cell with position and color
export interface HexCellProps {
  col: number;
  row: number;
  x: number;
  y: number;
  color: string;
  size: number;
  isHovered: boolean;
}

const HexCell: React.FC<HexCellProps> = ({ col, row, x, y, color, size, isHovered }) => {
  return (
    <polygon
      key={`${row},${col}`}
      points={getHexPoints(size)}
      transform={`translate(${x}, ${y}) ${isHovered ? 'scale(1.3)' : ''}`}
      fill={color}
      stroke={isHovered ? "#fff" : "#000"}
      strokeWidth={isHovered ? 2 : 1}
      className="hex-cell-svg"
    />
  );
};

export default HexCell;