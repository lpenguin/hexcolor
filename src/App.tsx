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
  const GRID_SIZE_X = 10;
  const GRID_SIZE_Y = 20;
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
    for (let i = 0; i < GRID_SIZE_Y; i++) {
      const row = Array(GRID_SIZE_X).fill(DEFAULT_COLOR);
      newGrid.push(row);
    }
    return newGrid;
  });
  
  // Selected color state
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  
  // Drawing mode state
  const [currentMode, setCurrentMode] = useState<DrawMode>(DrawMode.PAINT);
  
  
  // Function to handle cell clicks based on current mode
  const handleCellClick = (row: number, col: number) => {
    // Add boundary check to prevent accessing undefined rows/columns
    if (row < 0 || row >= GRID_SIZE_Y || col < 0 || col >= GRID_SIZE_X) {
      console.warn(`Attempted to access invalid cell at row ${row}, col ${col}`);
      return;
    }

    const color = grid[row][col];
    if (color === selectedColor) {
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
        break;
        
      default:
        console.warn(`Unknown drawing mode: ${currentMode}`);
    }
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
      if (row < 0 || row >= GRID_SIZE_Y || col < 0 || col >= GRID_SIZE_X) {
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
        queue.push([row-2, col]);
        queue.push([row+2, col]);
        queue.push([row-1, col-1]);
        queue.push([row-1, col]);
        queue.push([row+1, col-1]);
        queue.push([row+1, col]);
      } else {
        queue.push([row-2, col]);
        queue.push([row+2, col]);
        queue.push([row-1, col+1]);
        queue.push([row-1, col]);
        queue.push([row+1, col+1]);
        queue.push([row+1, col]);
      }
    }
    
    // Update the grid once all filling is done
    setGrid(newGrid);
  };

  // Function to handle paint button click
  const handlePaintClick = () => {
    setCurrentMode(DrawMode.PAINT);
  };

  // Function to handle fill button click
  const handleFillClick = () => {
    setCurrentMode(DrawMode.FILL);
  };
  
  // Function to handle clear grid
  const handleClearGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE_Y; i++) {
      const row = Array(GRID_SIZE_X).fill(DEFAULT_COLOR);
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
          parsedGrid.length === GRID_SIZE_Y &&
          parsedGrid.every(row => Array.isArray(row) && row.length === GRID_SIZE_X)
        ) {
          setGrid(parsedGrid);
        }
      } catch (error) {
        console.error('Error loading saved grid:', error);
      }
    }
  }, []);


  return (
    <div className="app-container">
      <main>
        <div className="tools">
          <div className="tool-group">
            <button 
              onClick={handlePaintClick} 
              className={`tool-button ${currentMode === DrawMode.PAINT ? 'selected' : ''}`}
            >
              <img src="./icons/paint-icon.svg" alt="Paint Tool" />
            </button>
            <button 
              onClick={handleFillClick} 
              className={`tool-button ${currentMode === DrawMode.FILL ? 'selected' : ''}`}
            >
              <img src="./icons/fill-icon.svg" alt="Fill Tool" />
            </button>
          </div>
          <button 
            onClick={handleClearGrid} 
            className="tool-button clear"
          >
            <img src="./icons/clear-icon.svg" alt="Clear Grid" />
          </button>
        </div>

        <HexGrid 
          colors={grid}
          onCellClick={handleCellClick}
        />
        
        <ColorPalette 
          colors={COLORS} 
          selectedColor={selectedColor} 
          onColorSelect={setSelectedColor}
        />
      </main>
    </div>
  );
}

export default App;
