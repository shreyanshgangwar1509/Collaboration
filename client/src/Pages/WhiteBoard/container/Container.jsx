import React from "react";
import WhiteBoard from "../WhiteBoard";

function Container() {
  return (
    <div className="fixed w-full h-full bg-black flex flex-col items-center">
      <div className="w-[90%] h-[90%] m-auto mt-[1%] bg-white shadow-lg rounded-xl overflow-hidden">
        <WhiteBoard />
      </div>
    </div>
  );
}

export default Container;
