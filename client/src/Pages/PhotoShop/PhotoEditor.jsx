import React, { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import { saveAs } from 'file-saver';

// Remove this line
// const fabric = window.fabric;

const PhotoEditor = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeObject, setActiveObject] = useState(null);
  const [canvasModified, setCanvasModified] = useState(false);
  
  // Initialize the canvas
  useEffect(() => {
    // Access fabric from window when component is mounted
    const fabric = window.fabric;
    
    if (!fabric) {
      console.error('Fabric.js not loaded!');
      return;
    }
    
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5'
    });
    
    const canvas = fabricCanvasRef.current;
    
    // Set up event listeners
    canvas.on('selection:created', (e) => setActiveObject(e.selected[0]));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected[0]));
    canvas.on('selection:cleared', () => setActiveObject(null));
    canvas.on('object:modified', () => setCanvasModified(true));
    canvas.on('object:added', () => setCanvasModified(true));
    
    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, []);
  
  // Image upload handler
  const handleImageUpload = (event) => {
    const fabric = window.fabric;
    if (!fabric) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgObj = new Image();
      imgObj.src = e.target.result;
      
      imgObj.onload = () => {
        const image = new fabric.Image(imgObj);
        
        // Scale image to fit canvas if needed
        if (image.width > fabricCanvasRef.current.width || 
            image.height > fabricCanvasRef.current.height) {
          const scale = Math.min(
            fabricCanvasRef.current.width / image.width,
            fabricCanvasRef.current.height / image.height
          );
          image.scale(scale * 0.9); // 90% of max size
        }
        
        fabricCanvasRef.current.add(image);
        fabricCanvasRef.current.centerObject(image);
        fabricCanvasRef.current.setActiveObject(image);
        fabricCanvasRef.current.renderAll();
      };
    };
    
    reader.readAsDataURL(file);
    // Reset the input value to allow uploading the same file again
    event.target.value = null;
  };
  
  // Text tool
  const addText = () => {
    const fabric = window.fabric;
    if (!fabric) return;
    
    const text = new fabric.IText('Double click to edit', {
      left: 50,
      top: 50,
      fontFamily: 'Arial',
      fill: '#000000',
      fontSize: 20
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };
  
  // Shape tools
  const addRectangle = () => {
    const fabric = window.fabric;
    if (!fabric) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3498db',
      stroke: '#2980b9',
      strokeWidth: 2
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };
  
  const addCircle = () => {
    const fabric = window.fabric;
    if (!fabric) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: '#e74c3c',
      stroke: '#c0392b',
      strokeWidth: 2
    });
    
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };
  
  // Delete selected object
  const deleteSelected = () => {
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    
    if (activeObjects.length) {
      activeObjects.forEach(obj => {
        fabricCanvasRef.current.remove(obj);
      });
      
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };
  
  // Canvas actions
  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.setBackgroundColor('#f5f5f5', fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
    }
  };
  
  const saveCanvas = () => {
    const canvas = fabricCanvasRef.current;
    
    // Convert to a data URL and download
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const blob = dataURLToBlob(dataURL);
    saveAs(blob, 'canvas-image.png');
    setCanvasModified(false);
  };
  
  // Helper function to convert data URL to Blob
  const dataURLToBlob = (dataURL) => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    
    for (let i = 0; i < raw.length; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  };
  
  // Object properties handlers
  const changeObjectColor = (color) => {
    if (!activeObject) return;
    
    activeObject.set('fill', color);
    fabricCanvasRef.current.renderAll();
  };
  
  const changeObjectOpacity = (opacity) => {
    if (!activeObject) return;
    
    activeObject.set('opacity', opacity);
    fabricCanvasRef.current.renderAll();
  };
  
  // Apply a filter to the selected image
  const applyFilter = (filterType) => {
    const fabric = window.fabric;
    if (!fabric || !activeObject || !activeObject.filters) return;
    
    const obj = activeObject;
    
    if (filterType === 'grayscale') {
      obj.filters.push(new fabric.Image.filters.Grayscale());
    } else if (filterType === 'sepia') {
      obj.filters.push(new fabric.Image.filters.Sepia());
    } else if (filterType === 'invert') {
      obj.filters.push(new fabric.Image.filters.Invert());
    } else if (filterType === 'brightness') {
      obj.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
    }
    
    obj.applyFilters();
    fabricCanvasRef.current.renderAll();
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Toolbar 
        onAddText={addText}
        onAddRectangle={addRectangle}
        onAddCircle={addCircle}
        onUploadImage={() => fileInputRef.current.click()}
        onDeleteSelected={deleteSelected}
        onClearCanvas={clearCanvas}
        onSaveCanvas={saveCanvas}
        hasSelection={!!activeObject}
        applyFilter={applyFilter}
      />
      
      <div className="flex flex-1">
        <div className="flex-1 flex justify-center items-center bg-gray-200 overflow-auto p-4">
          <canvas ref={canvasRef} className="border border-gray-400 shadow-lg" />
        </div>
        
        <PropertiesPanel 
          activeObject={activeObject}
          onColorChange={changeObjectColor}
          onOpacityChange={changeObjectOpacity}
        />
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
    </div>
  );
};

export default PhotoEditor;
