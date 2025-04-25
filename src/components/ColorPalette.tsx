import React from 'react';
import './ColorPalette.css';

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  colors, 
  selectedColor, 
  onColorSelect 
}) => {
  // Handle touch events to prevent default behaviors
  const handleTouchStart = (e: React.TouchEvent, color: string) => {
    // Prevent double-tap zoom and other default behaviors
    e.preventDefault();
    onColorSelect(color);
  };

  return (
    <div className="color-palette">
      <h3>Color Palette</h3>
      <div className="color-options">
        {colors.map((color, index) => (
          <div 
            key={index}
            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            onTouchStart={(e) => handleTouchStart(e, color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;