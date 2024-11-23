import React from "react";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between items-center p-3 border-b-[1px] border-outlineGray">
      <div onClick={() => (window.location.href = "/")} className="cursor-pointer">
        Lib
      </div>

      <button>Browse</button>
    </div>
  );
}
