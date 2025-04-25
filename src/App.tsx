import { useState, useEffect } from 'react';
import HexGrid from './components/HexGrid';
import ColorPalette from './components/ColorPalette';
import './App.css';

// Define drawing modes
enum DrawMode {
  PAINT,  // Regular painting
  FILL    // Flood fill
}

function App() {
  const GRID_SIZE = 10;
  const DEFAULT_COLOR = '#EEEEEE';
  
  // Define color palette
  const COLORS = [
    '#FF6B6B', // Red
    '#FFD93D', // Yellow
    '#6BCB77', // Green
    '#4D96FF', // Blue
    '#9B5DE5', // Purple
    '#F15BB5', // Pink
    '#00BBF9', // Cyan
    '#FF9E00', // Orange
    '#8AC926', // Lime
    '#FFFFFF', // White
    '#AAAAAA', // Light Gray
    '#555555', // Dark Gray
    '#000000', // Black
  ];

  // Initialize grid with default color
  const [grid, setGrid] = useState<string[][]>(() => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = Array(GRID_SIZE).fill(DEFAULT_COLOR);
      newGrid.push(row);
    }
    return newGrid;
  });
  
  // Selected color state
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  
  // Drawing mode state
  const [currentMode, setCurrentMode] = useState<DrawMode>(DrawMode.PAINT);
  
  // Add state to track if the mouse is pressed for drawing
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  
  // Function to handle cell clicks based on current mode
  const handleCellClick = (row: number, col: number) => {
    // Add boundary check to prevent accessing undefined rows/columns
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      console.warn(`Attempted to access invalid cell at row ${row}, col ${col}`);
      return;
    }
    
    switch (currentMode) {
      case DrawMode.PAINT:
        // Regular painting mode
        const newGrid = [...grid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = selectedColor;
        setGrid(newGrid);
        break;
        
      case DrawMode.FILL:
        // Flood fill mode
        const targetColor = grid[row][col];
        floodFill(row, col, targetColor, selectedColor);
        // Reset to paint mode after filling
        setCurrentMode(DrawMode.PAINT);
        break;
        
      default:
        console.warn(`Unknown drawing mode: ${currentMode}`);
    }
  };
  
  // Function to handle cell hover while drawing
  const handleCellHover = (row: number, col: number) => {
    if (isDrawing && currentMode === DrawMode.PAINT) {
      handleCellClick(row, col);
    }
  };
  
  // Function to start drawing when mouse is pressed
  const handleMouseDown = () => {
    setIsDrawing(true);
  };
  
  // Function to stop drawing when mouse is released
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  // Function to handle flood fill
  const floodFill = (startRow: number, startCol: number, targetColor: string, replacementColor: string) => {
    // If the target is already the replacement color, no need to fill
    if (targetColor === replacementColor) {
      return;
    }
    
    // Create a new grid to work with
    const newGrid = grid.map(row => [...row]);
    
    // Create a queue for BFS flood fill
    const queue: [number, number][] = [[startRow, startCol]];
    
    // Process cells in the queue
    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      
      // Skip if out of bounds
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        continue;
      }
      
      // Skip if not the target color
      if (newGrid[row][col] !== targetColor) {
        continue;
      }
      
      // Update the color
      newGrid[row][col] = replacementColor;
      
      // Add neighbors to the queue - proper hexagonal adjacency
      // In a hexagonal grid:
      // Even rows: cells are aligned with the left cells in adjacent rows
      // Odd rows: cells are aligned with the right cells in adjacent rows
      const isEvenRow = row % 2 === 0;
      
      if (isEvenRow) {
        // For even rows
        queue.push([row-1, col]);   // top-left
        queue.push([row-1, col+1]); // top-right
        queue.push([row, col-1]);   // left
        queue.push([row, col+1]);   // right
        queue.push([row+1, col]);   // bottom-left
        queue.push([row+1, col+1]); // bottom-right
      } else {
        // For odd rows
        queue.push([row-1, col-1]); // top-left
        queue.push([row-1, col]);   // top-right
        queue.push([row, col-1]);   // left
        queue.push([row, col+1]);   // right
        queue.push([row+1, col-1]); // bottom-left
        queue.push([row+1, col]);   // bottom-right
      }
    }
    
    // Update the grid once all filling is done
    setGrid(newGrid);
  };

  // Function to handle fill button click
  const handleFillClick = () => {
    // Ask user to click a cell to flood fill
    alert('Select a cell to flood fill with the selected color');
    
    // Switch to fill mode
    setCurrentMode(DrawMode.FILL);
  };
  
  // Function to handle clear grid
  const handleClearGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = Array(GRID_SIZE).fill(DEFAULT_COLOR);
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  // Save grid to localStorage when changed
  useEffect(() => {
    localStorage.setItem('hexColorGrid', JSON.stringify(grid));
  }, [grid]);

  // Load grid from localStorage on initial render
  useEffect(() => {
    const savedGrid = localStorage.getItem('hexColorGrid');
    if (savedGrid) {
      try {
        const parsedGrid = JSON.parse(savedGrid);
        if (
          Array.isArray(parsedGrid) && 
          parsedGrid.length === GRID_SIZE &&
          parsedGrid.every(row => Array.isArray(row) && row.length === GRID_SIZE)
        ) {
          setGrid(parsedGrid);
        }
      } catch (error) {
        console.error('Error loading saved grid:', error);
      }
    }
  }, []);

  // Add event listeners for mouse up on window to stop drawing
  // even when mouse is released outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="app-container">
      <main>
        <div className="control-panel">
          <ColorPalette 
            colors={COLORS} 
            selectedColor={selectedColor} 
            onColorSelect={setSelectedColor}
          />
          
          <div className="tools">
            <button onClick={handleFillClick} className="tool-button">
              Flood Fill
            </button>
            <button onClick={handleClearGrid} className="tool-button clear">
              Clear Grid
            </button>
          </div>
        </div>

        <HexGrid 
          grid={grid} 
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </main>
    </div>
  );
}

export default App;
