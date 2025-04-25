import React, { useRef, useState } from 'react';
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
  const colorOptionsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollStartPosition, setScrollStartPosition] = useState(0);
  
  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!colorOptionsRef.current) return;
    
    setIsDragging(true);
    setStartY(e.pageY);
    setScrollStartPosition(colorOptionsRef.current.scrollTop);
    colorOptionsRef.current.style.cursor = 'grabbing';
  };
  
  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    if (colorOptionsRef.current) {
      colorOptionsRef.current.style.cursor = 'grab';
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (colorOptionsRef.current) {
        colorOptionsRef.current.style.cursor = 'grab';
      }
    }
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !colorOptionsRef.current) return;
    
    e.preventDefault();
    const yDiff = startY - e.pageY;
    colorOptionsRef.current.scrollTop = scrollStartPosition + yDiff;
  };
  
  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent, color?: string) => {
    if (!colorOptionsRef.current) return;
    
    if (color) {
      // This is a touch on a color option, not for scrolling
      // Small delay to determine if it's a tap or scroll
      const touchStartTime = new Date().getTime();
      
      const handleTouchEnd = () => {
        const touchEndTime = new Date().getTime();
        // If touch duration was short, consider it a tap
        if (touchEndTime - touchStartTime < 150) {
          onColorSelect(color);
        }
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      // This is a touch on the container, for scrolling
      setIsDragging(true);
      setStartY(e.touches[0].pageY);
      setScrollStartPosition(colorOptionsRef.current.scrollTop);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !colorOptionsRef.current) return;
    
    const yDiff = startY - e.touches[0].pageY;
    colorOptionsRef.current.scrollTop = scrollStartPosition + yDiff;
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="color-palette">
      <div 
        className="color-options"
        ref={colorOptionsRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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