// src/components/editor/photo/PropertiesPanel.jsx
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

const PropertiesPanel = ({ activeObject, onColorChange, onOpacityChange }) => {
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(1);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  
  // Update panel values when selected object changes
  useEffect(() => {
    if (activeObject) {
      setColor(activeObject.fill || '#000000');
      setOpacity(activeObject.opacity || 1);
    }
  }, [activeObject]);
  
  // Handle color change
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    onColorChange(newColor.hex);
  };
  
  // Handle opacity change
  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    onOpacityChange(newOpacity);
  };
  
  // If no object is selected, show empty panel
  if (!activeObject) {
    return (
      <div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
        <p className="text-gray-500 italic">Select an object to edit its properties</p>
      </div>
    );
  }
  
  return (
    <div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
      <h3 className="font-medium text-lg mb-4">Properties</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fill Color
        </label>
        <div 
          className="h-10 rounded border border-gray-300 cursor-pointer flex items-center p-1"
          onClick={() => setColorPickerVisible(!colorPickerVisible)}
        >
          <div 
            className="w-8 h-8 rounded"
            style={{ backgroundColor: color }}
          ></div>
          <span className="ml-2 text-sm">{color}</span>
        </div>
        
        {colorPickerVisible && (
          <div className="absolute mt-1 z-10">
            <div 
              className="fixed inset-0"
              onClick={() => setColorPickerVisible(false)}
            ></div>
            <SketchPicker 
              color={color}
              onChange={handleColorChange}
            />
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opacity: {Math.round(opacity * 100)}%
        </label>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={handleOpacityChange}
          className="w-full"
        />
      </div>
      
      {activeObject.type === 'i-text' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Double-click on text to edit it directly on canvas.
          </p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-6">
        <p>Tip: Use arrow keys to move selected object</p>
        <p>Hold Shift to resize proportionally</p>
      </div>
    </div>
  );
};

export default PropertiesPanel;