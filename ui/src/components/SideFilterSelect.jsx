import React, { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function SideFilterSelect(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState([]);
  const [showMore, setShowMore] = useState(false);

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

  function clearFilters() {
    for (const filter of filters) {
      let checkboxes = document.getElementsByName(filter);
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    }

    setFilters([]);
    props.filterChange(props.title, []);
  }

  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer">
        <div className="uppercase text-secondaryGray font-bold flex gap-3">
          <p onClick={() => setIsOpen(!isOpen)}>{props.title}</p>
          <button onClick={clearFilters} className="underline relative z-10 font-normal">
            reset
          </button>
        </div>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <MdKeyboardArrowUp className="text-secondaryGray" /> : <MdKeyboardArrowDown className="text-secondaryGray" />}</button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 mt-1">
          {/* for sorting alphabetically */}
          {/* {Object.keys(props.dict)
            .sort()
            .map((key, index) => ( */}
          {Object.entries(props.dict)
            .sort((a, b) => b[1] - a[1])
            .map(
              ([key], index) =>
                (index < 10 || showMore) && (
                  <div key={index}>
                    <label className="cursor-pointer flex gap-2">
                      <input type="checkbox" name={key} onChange={(e) => filterCheckboxChange(e)} />
                      <p>
                        {key != "[]" ? key : "--no subject--"} ({props.dict[key]})
                      </p>
                    </label>
                  </div>
                )
            )}
          {Object.entries(props.dict).length > 10 && (
            <button onClick={() => setShowMore(!showMore)} className="text-secondaryGray underline text-left">
              {showMore ? "Show less..." : "Show more..."}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
