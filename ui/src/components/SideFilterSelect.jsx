import React, {useEffect, useState} from "react";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
import reverseDict from "../models/reverse_dict.json";
import {Accordion, AccordionTab} from 'primereact/accordion';

import { Chip } from 'primereact/chip';



export default function SideFilterSelect(props) {
    const [isOpen, setIsOpen] = useState(true);
    const [filters, setFilters] = useState([]);

    const filterStates = [
        { value: null, tooltip: 'Not Selected', className: 'bg-transparent' },
        { value: 'include', tooltip: 'Filtering', className: 'bg-green-200', icon: 'pi pi-plus' },
        { value: 'exclude', tooltip: 'Excluding', className: 'bg-red-400', icon: 'pi pi-minus' },
    ];


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
                    const nodeValue = node[key];

                    if (typeof nodeValue === "object") {
                        const countNodeValue = nodeValue.count ? ` (${nodeValue.count})` : "";
                        return (
                            <AccordionTab key={key} header={`${key}${countNodeValue}`}>
                                {Object.keys(nodeValue)
                                    .filter(subKey => typeof nodeValue[subKey] === "number" && subKey !== "count")
                                    .map(subKey => {
                                        const currentState = filters.find(f => f.key === subKey)?.state || null;
                                        const currentStateConfig = filterStates.find(state => state.value === currentState);
                                        const currentClass = currentStateConfig?.className || "bg-transparent";
                                        const currentIcon = currentStateConfig?.icon || "";

                                        return (
                                            <div key={subKey} className="flex items-center gap-2">
                                                <button
                                                    className={`text-left flex flex-row pl-2 pr-2 mb-1 rounded !font-normal ${currentClass}`}
                                                    onClick={() => {
                                                        // Determine the next state in the cycle
                                                        const currentIndex = filterStates.findIndex(state => state.value === currentState);
                                                        const nextIndex = (currentIndex + 1) % filterStates.length;
                                                        const newState = filterStates[nextIndex].value;

                                                        // Update the filters state
                                                        const updatedFilters = filters.filter(f => f.key !== subKey);
                                                        if (newState) {
                                                            updatedFilters.push({key: subKey, state: newState});
                                                        }
                                                        setFilters(updatedFilters);

                                                        // Call the filterChange function with updated filters
                                                        props.filterChange(props.title, updatedFilters);
                                                    }}
                                                >
                                                    <div className="mr-2 w-[0.75rem]">
                                                        <i className={currentIcon} style={{ fontSize: '0.75rem' }}></i>
                                                    </div>
                                                    <div>
                                                        {subKey} ({nodeValue[subKey]})
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })}
                                <div className="mt-4">{renderAccordion(nodeValue)}</div>
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
                {filters.map((filter) => {
                    const currentStateConfig = filterStates.find(state => state.value === filter.state);
                    const chipClass = currentStateConfig?.className || "bg-transparent";

                    return (
                        <div key={filter.key}>
                            <Chip
                                label={filter.key}
                                removable
                                className={chipClass} // Apply dynamic background color
                                onRemove={() => {
                                    const newFilters = filters.filter(item => item.key !== filter.key);
                                    setFilters(newFilters);
                                    props.filterChange(props.title, newFilters);
                                }}
                            />
                        </div>
                    );
                })}
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
