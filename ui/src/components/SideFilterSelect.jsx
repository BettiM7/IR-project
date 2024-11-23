import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function SideFilterSelect() {
  const [isOpen, setIsOpen] = useState(true);

  const filters = ["history", "business", "management", "computer science", "mathematics"];
  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <p className="uppercase text-secondaryGray font-bold">Category</p>
        {isOpen ? <MdKeyboardArrowUp className="text-secondaryGray" /> : <MdKeyboardArrowDown className="text-secondaryGray" />}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 mt-1">
          {filters.map((filter, index) => (
            <div key={index}>
              <label className="cursor-pointer flex gap-2">
                <input type="checkbox" />
                <p>{filter}</p>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
