import React, { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function SideFilterSelect(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState([]);

  function filterCheckboxChange(e) {
    let filter = e.target.name;
    let isChecked = e.target.checked;

    let newFilters = [];
    if (isChecked) {
      newFilters = [...filters, filter];
      setFilters(newFilters);
    } else {
      newFilters = filters.filter((item) => item !== filter);
      setFilters(newFilters);
    }

    props.filterChange(props.title, newFilters);
  }

  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <p className="uppercase text-secondaryGray font-bold">{props.title}</p>
        {isOpen ? <MdKeyboardArrowUp className="text-secondaryGray" /> : <MdKeyboardArrowDown className="text-secondaryGray" />}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 mt-1">
          {/* for sorting alphabetically */}
          {/* {Object.keys(props.dict)
            .sort()
            .map((key, index) => ( */}
          {Object.entries(props.dict)
            .sort((a, b) => b[1] - a[1])
            .map(([key], index) => (
              <div key={index}>
                <label className="cursor-pointer flex gap-2">
                  <input type="checkbox" name={key} onChange={(e) => filterCheckboxChange(e)} />
                  <p>
                    {key} ({props.dict[key]})
                  </p>
                </label>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
