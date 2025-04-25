import React from 'react';
import { getHexPoints } from '../utils/hexUtils';

// Define hex size constants
const HEX_SIZE = 40; // Reduced base size to accommodate the larger grid
const HEX_WIDTH = HEX_SIZE * 2; // Width of a hex is 2 * size
const HEX_HEIGHT = HEX_SIZE * Math.sqrt(3); // Height is size * sqrt(3)
const HORIZONTAL_SPACING = HEX_WIDTH + HEX_SIZE * (1 - Math.cos(Math.PI / 3)) * 2; // Hexes overlap horizontally by 1/4 width
const VERTICAL_SPACING = HEX_HEIGHT / 2; // Vertical spacing between rows

interface HexGridProps {
  colors: string[][];
  onCellClick?: (row: number, col: number) => void;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  colors, 
  onCellClick, 
}) => {
  // Calculate grid dimensions
  const rows = colors.length;
  const cols = colors[0]?.length || 0;
  
  // Calculate SVG viewBox dimensions
  const svgWidth = cols * HORIZONTAL_SPACING + (HEX_WIDTH / 4);
  const svgHeight = rows * VERTICAL_SPACING + (HEX_HEIGHT / 2);

  const [isDrawing, setIsDrawing] = React.useState(false);

  const findHexUnderMouse = (event: React.MouseEvent<SVGPolygonElement>): {row: number, col: number} | null => {
    const { clientX, clientY } = event;
    const element = document.elementFromPoint(clientX, clientY);
  
    if (element === null || !(element instanceof SVGPolygonElement)) {
      return null;
    }

    // You can extract data attributes or other information from the element
    // For example, if you add data attributes for row and column:
    const row = Number(element.getAttribute('data-row'));
    const col = Number(element.getAttribute('data-col'));
    return { row, col };
  }

  const handlePointerDown = (event: React.PointerEvent<SVGPolygonElement>) => {
    const hex = findHexUnderMouse(event);
    if (hex !== null) {
      setIsDrawing(true);
      const { row, col } = hex;
      onCellClick?.(row, col);
    }
   
  }
  const handlePointerUp = () => {
    setIsDrawing(false);
  }
  const handlePointerMove = (event: React.PointerEvent<SVGPolygonElement>) => {
    const hex = findHexUnderMouse(event);
    if (hex !== null) {
      const { row, col } = hex;
      if (isDrawing) {
        onCellClick?.(row, col);
      }
    }
  }
  const handlePointerLeave = (event: React.PointerEvent<SVGPolygonElement>) => {
    const hex = findHexUnderMouse(event);
    if (hex === null) {
      setIsDrawing(false);
    }
  }


  
  return (
    <div className="hex-grid-container" style={{ width: '100%', height: '100%' }}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height="100%"
        className="hex-grid-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          className="hex-grid"
          transform={`translate(${HEX_WIDTH / 2}, ${HEX_HEIGHT / 2})`}
        >
          {colors.map((row, rowIndex) => {
            // Calculate y-coordinate for the entire row
            const rowY = rowIndex * VERTICAL_SPACING;
            
            return (
              <g 
                key={`row-${rowIndex}`}
                className="hex-row"
                // Move both x and y transforms to the row g element
                transform={`translate(${rowIndex % 2 === 1 ? HORIZONTAL_SPACING / 2 : 0}, ${rowY})`}
              >
                {row.map((color, colIndex) => {
                  // Calculate x position for each hex (y is now handled in the row transform)
                  const x = colIndex * HORIZONTAL_SPACING;
                  
                  return (
                    <polygon
                      key={`cell-${rowIndex}-${colIndex}`}
                      points={getHexPoints(HEX_SIZE)}
                      transform={`translate(${x}, 0)`}
                      fill={color}
                      stroke="#333"
                      strokeWidth={1}
                      className="hex-cell"
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerMove={handlePointerMove}
                      onPointerLeave={handlePointerLeave}
                      data-row={rowIndex}
                      data-col={colIndex}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;