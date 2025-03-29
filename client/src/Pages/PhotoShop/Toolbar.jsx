// src/components/editor/photo/Toolbar.jsx
import React from 'react';

const Toolbar = ({ 
  onAddText, 
  onAddRectangle, 
  onAddCircle, 
  onUploadImage, 
  onDeleteSelected, 
  onClearCanvas, 
  onSaveCanvas, 
  hasSelection,
  applyFilter
}) => {
  return (
    <div className="bg-gray-800 text-white p-3 flex items-center gap-2 flex-wrap">
      <div className="border-r border-gray-600 pr-3 flex gap-2">
        <button 
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onUploadImage}
        >
          Upload Image
        </button>
      </div>
      
      <div className="border-r border-gray-600 pr-3 flex gap-2">
        <button 
          className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={onAddText}
        >
          Add Text
        </button>
        <button 
          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={onAddRectangle}
        >
          Rectangle
        </button>
        <button 
          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={onAddCircle}
        >
          Circle
        </button>
      </div>
      
      <div className="border-r border-gray-600 pr-3 flex gap-2">
        <button 
          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
        >
          Delete
        </button>
      </div>
      
      {hasSelection && (
        <div className="border-r border-gray-600 pr-3 flex gap-2">
          <div className="dropdown relative">
            <button 
              className="px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 dropdown-toggle"
            >
              Apply Filter
            </button>
            <div className="dropdown-menu absolute hidden bg-white text-gray-800 mt-1 py-1 rounded shadow-lg z-10">
              <button 
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => applyFilter('grayscale')}
              >
                Grayscale
              </button>
              <button 
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => applyFilter('sepia')}
              >
                Sepia
              </button>
              <button 
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => applyFilter('invert')}
              >
                Invert
              </button>
              <button 
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => applyFilter('brightness')}
              >
                Brighten
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="ml-auto flex gap-2">
        <button 
          className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
          onClick={onClearCanvas}
        >
          Clear Canvas
        </button>
        <button 
          className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={onSaveCanvas}
        >
          Save as PNG
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
