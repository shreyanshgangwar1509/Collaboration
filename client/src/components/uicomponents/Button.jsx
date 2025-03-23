import React from "react";

function Button({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
