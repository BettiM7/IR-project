import React, { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function SideFilterSelect(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [categories, setCategories] = useState({});
  const [filters, setFilters] = useState([]);
  const [filterString, setFilterString] = useState("");

  async function fetchFields(query) {
    const response = await fetch(`http://localhost:8983/solr/textbooks/select?q=*:*&fl=subjects&rows=100000`);

    if (!response.ok) {
      throw new Error("Failed to fetch data from Solr");
    }

    const data = await response.json();

    // count the number of documents for each subject
    const categoryCounts = data.response.docs.reduce((acc, doc) => {
      doc.subjects.forEach((subject) => {
        acc[subject] = (acc[subject] || 0) + 1;
      });
      return acc;
    }, {});

    setCategories(categoryCounts);
  }

  useEffect(() => {
    fetchFields();
  }, []);

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

    setFilterString(newFilters.join("%0A"));

    props.filterChange("subjects", newFilters);
  }

  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <p className="uppercase text-secondaryGray font-bold">Category</p>
        {isOpen ? <MdKeyboardArrowUp className="text-secondaryGray" /> : <MdKeyboardArrowDown className="text-secondaryGray" />}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 mt-1">
          {Object.keys(props.dict).map((key, index) => (
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
