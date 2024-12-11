import React, {useEffect, useState} from "react";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
import reverseDict from "../models/reverse_dict.json";
import {Accordion, AccordionTab} from 'primereact/accordion';

import { Chip } from 'primereact/chip';



export default function SideFilterSelect(props) {
    const [isOpen, setIsOpen] = useState(true);
    const [filters, setFilters] = useState([]);


    function buildTreeFromJSON(jsonData) {
        const filterKeys = Object.keys(props.dict);
        const filtered = Object.fromEntries(
            Object.entries(jsonData)
                .filter(([key]) => filterKeys.includes(key))
                .sort(([, valueA], [, valueB]) => valueB.length - valueA.length));
        let tree = {};

        Object.entries(filtered).forEach(([key, value]) => {
            let branch = tree;
            let key_count = props.dict[key]
            for (let i = value.length - 1; i >= -1; i--) {

                if (i === -1) {
                    branch[key] = key_count;
                } else {
                    const folder = value[i];
                    if (!branch[folder]) {
                        branch[folder] = {count: 0};
                    }
                    branch = branch[folder]
                    branch["count"] += key_count;
                }
            }
        });

        const unfilteredKeys = filterKeys.filter(key => !(key in filtered));

        if (unfilteredKeys.length > 0) {
            console.error("keys not categorized", unfilteredKeys);
            tree["Uncategorized"] = tree["Uncategorized"] || { count: 0 };
            unfilteredKeys.forEach(key => {
                tree["Uncategorized"][key] = props.dict[key];
                tree["Uncategorized"]["count"] += props.dict[key];
            });
        }
        return tree;
    }

    function sortNodeFields(node) {
        if (typeof node !== "object" || node === null) {
            return node;
        }

        const sortedKeys = Object.keys(node)
            .sort((a, b) => {
                if (a === "count") return 1;
                if (b === "count") return -1;

                if (a === "Uncategorized") return 1;
                if (b === "Uncategorized") return -1;

                const aIsString = typeof node[a] === "string";
                const bIsString = typeof node[b] === "string";

                if (aIsString && !bIsString) return -1;
                if (!aIsString && bIsString) return 1;

                return a.localeCompare(b);
            });

        const sortedNode = {};
        for (const key of sortedKeys) {
            sortedNode[key] = sortNodeFields(node[key]);
        }

        return sortedNode;
    }


    function renderAccordion(node) {
        if (typeof node !== "object" || node === null) {
            return null;
        }

        return (
            <Accordion multiple activeIndex={null}>
                {Object.keys(node).map((key) => {
                    const value = node[key];

                    if (typeof value === "object") {
                        const countValue = value.count ? ` (${value.count})` : "";
                        return (
                            <AccordionTab key={key} header={`${key}${countValue}`}>
                                {Object.keys(value)
                                    .filter(subKey => typeof value[subKey] === "number" && subKey !== "count")
                                    .map(subKey => {
                                        const isSelected = filters.includes(subKey);
                                        return (
                                            <div key={subKey}>
                                                <button
                                                    className={`text-left pl-2 pr-2 rounded !font-normal ${
                                                        isSelected ? "bg-red-700 text-white" : ""
                                                    }`}
                                                    onClick={() => {
                                                        const newFilters = isSelected
                                                            ? filters.filter(item => item !== subKey)
                                                            : [...filters, subKey];
                                                        setFilters(newFilters);
                                                        props.filterChange(props.title, newFilters);
                                                    }}
                                                >
                                                    {subKey} ({value[subKey]})
                                                </button>
                                            </div>
                                        );
                                    })}
                                <div className="mt-4">{renderAccordion(value)}</div>
                            </AccordionTab>
                        );
                    }

                    return null;
                })}
            </Accordion>
        );
    }


    function renderTree() {
        const node = buildTreeFromJSON(reverseDict);
        const sorted_node = sortNodeFields(node);
        return renderAccordion(sorted_node);
    }


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
            <div
                className="flex flex-wrap gap-2 mb-4 overflow-y-auto"
                style={{minHeight: '50px', maxHeight: '200px'}}
            >
                {filters.map((filter) => (
                    <div key={filter}>
                        <Chip
                            label={filter}
                            removable
                            onRemove={() => {
                                const newFilters = filters.filter(item => item !== filter);
                                setFilters(newFilters);
                                props.filterChange(props.title, newFilters);
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center cursor-pointer">
                <div className="uppercase text-secondaryGray font-bold flex gap-3">
                    <p onClick={() => setIsOpen(!isOpen)}>{props.title}</p>
                    <button onClick={clearFilters} className="underline relative z-10 font-normal">
                        reset
                    </button>
                </div>
                <button onClick={() => setIsOpen(!isOpen)}>{isOpen ?
                    <MdKeyboardArrowUp className="text-secondaryGray"/> :
                    <MdKeyboardArrowDown className="text-secondaryGray"/>}</button>
            </div>

            {isOpen && (
                <div className="flex flex-col gap-1 mt-1">
                    {renderTree()}
                </div>
            )}
        </div>
    );
}
