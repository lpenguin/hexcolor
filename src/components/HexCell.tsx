import React from 'react';
import { CubeCoord } from '../utils/hexUtils';
import { getHexPoints } from '../utils/hexUtils';

// Type for a hex cell with position and color
export interface HexCellProps extends CubeCoord {
  x: number;
  y: number;
  color: string;
  size: number;
  isHovered: boolean;
  onClick: () => void;
}

const HexCell: React.FC<HexCellProps> = ({
  q, r, s, x, y, color, size, isHovered, onClick
}) => {
  return (
    <polygon
      key={`${q},${r},${s}`}
      points={getHexPoints(size)}
      transform={`translate(${x}, ${y}) ${isHovered ? 'scale(1.05)' : ''}`}
      fill={color}
      stroke={isHovered ? "#fff" : "url(#hex-outline-gradient)"}
      strokeWidth={isHovered ? 2 : 1}
      onClick={onClick}
      className="hex-cell-svg"
      data-q={q}
      data-r={r}
      data-s={s}
    />
  );
};

export default HexCell;