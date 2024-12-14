import React, { useState } from "react";
import subjectsByHierarchy from "../models/subjects_by_hierarchy.json";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ScrollPanel } from "primereact/scrollpanel";
import SubjectsTree from "../components/SubjectsTree";

export default function Browse() {
    const totalTabsLayer0 = Object.keys(subjectsByHierarchy).length;
    const [activeIndicesLayer0, setActiveIndicesLayer0] = useState(Array.from({ length: totalTabsLayer0 }, (_, i) => i));
    const [activeIndicesLayer1, setActiveIndicesLayer1] = useState(0);

    const toggleAccordions = () => {
        if (activeIndicesLayer0.length === totalTabsLayer0) {
            setActiveIndicesLayer0([]);
            setActiveIndicesLayer1(null);
        } else {
            setActiveIndicesLayer0(Array.from({ length: totalTabsLayer0 }, (_, i) => i));
            setActiveIndicesLayer1(0);
        }
    };

    const areAllOpen = activeIndicesLayer0.length === totalTabsLayer0;

    const formatHeight = (value, index) => {
        const values = Object.values(value);
        const determineSubgroups = (values) => {
            const subgroups = [];
            let currentGroup = [];

            values.forEach((item) => {
                if (typeof item === "object" && !Array.isArray(item)) {
                    if (currentGroup.length > 0) {
                        subgroups.push(currentGroup);
                        currentGroup = [];
                    }
                    subgroups.push([item]);
                } else {
                    currentGroup.push(item);
                    if (currentGroup.length === 3) {
                        subgroups.push(currentGroup);
                        currentGroup = [];
                    }
                }
            });

            if (currentGroup.length > 0) {
                subgroups.push(currentGroup);
            }

            return subgroups;
        };

        const subgroups = determineSubgroups(values);

        let subgroupIndex = 0;
        let totalProcessed = 0;

        for (let i = 0; i < subgroups.length; i++) {
            const groupSize = subgroups[i].length;
            if (index < totalProcessed + groupSize) {
                subgroupIndex = i;
                break;
            }
            totalProcessed += groupSize;
        }

        const subgroup = subgroups[subgroupIndex];
        const positionInSubgroup = index - totalProcessed;

        const max = Math.max(...subgroup.map((item) => (Array.isArray(item) ? item.length : 0)));

        if (Array.isArray(subgroup[positionInSubgroup]) && subgroup[positionInSubgroup].length < max) {
            return Array.from({ length: max - subgroup[positionInSubgroup].length }, (_, idx) => <p key={idx} style={{ height: "24px" }}></p>);
        }

        return null;
    };

    const renderHierarchy = (node) => {
        if (Array.isArray(node)) {
            return node.map((subject, index) => (
                <p key={index}>
                    <a onClick={() => (window.location.href = `/search?q=subjects:${subject}`)} className="gap-2 hover:text-royalRed transition-all duration-300 cursor-pointer underline font-medium">
                        {subject}
                    </a>
                </p>
            ));
        }

        if (typeof node === "object" && node !== null) {
            return Object.entries(node).map(([key, value], index) => {
                if (key === "reference_subjects") {
                    return (
                        <div key={index}>
                            <div className="mb-4 font-extrabold text-lg">{renderHierarchy(value)}</div>
                        </div>
                    );
                }

                if (key === "subgroups") {
                    return (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            {Array.isArray(value) ? (
                                <div>{renderHierarchy(value)}</div>
                            ) : typeof value === "object" ? (
                                Object.entries(value).map(([subgroupKey, subgroupValue], idx) => {
                                    if (typeof subgroupValue === "object" && !Array.isArray(subgroupValue)) {
                                        return (
                                            <div key={idx} className="text-left w-full col-span-3">
                                                <Accordion activeIndex={activeIndicesLayer1}>
                                                    <AccordionTab header={<h3 className="text-xl font-normal text-royalRed">{subgroupKey} kurac</h3>}>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {Object.entries(subgroupValue).map(([innerKey, innerValue], innerIdx) => (
                                                                <div key={innerIdx} className="basis-1/3 text-left mt-2">
                                                                    <Accordion activeIndex={activeIndicesLayer1}>
                                                                        <AccordionTab header={<h5 className="text-lg font-normal text-gray-700">{innerKey}</h5>}>
                                                                            <div className="ml-2">{renderHierarchy(innerValue)}</div>
                                                                            <div>{formatHeight(subgroupValue, innerIdx, subgroupKey)}</div>
                                                                        </AccordionTab>
                                                                    </Accordion>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </AccordionTab>
                                                </Accordion>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className="basis-1/3 text-left">
                                            <Accordion activeIndex={activeIndicesLayer1}>
                                                <AccordionTab header={<h5 className="font-normal text-lg text-gray-700">{subgroupKey}</h5>}>
                                                    <div className="ml-2">{renderHierarchy(subgroupValue)}</div>
                                                    <div>{formatHeight(value, idx)}</div>
                                                </AccordionTab>
                                            </Accordion>
                                        </div>
                                    );
                                })
                            ) : null}
                        </div>
                    );
                }

                return (
                    <AccordionTab key={index} header={<h3 className="font-normal w-full text-xs text-royalRed">{key}</h3>}>
                        <div className="">{renderHierarchy(value)}</div>
                    </AccordionTab>
                );
            });
        }

        return null;
    };

    return (
        <div className="m-auto flex flex-col justify-center items-center max-w-[1200px] w-[95%]">
            <h2 className="text-center text-black mt-10">Browse by Subject</h2>
            <div className="w-full flex justify-end mb-2">
                <button onClick={toggleAccordions} className="bg-royalRed text-white px-4 py-2 rounded hover:bg-darkRed transition-all">
                    {areAllOpen ? "Close All" : "Open All"}
                </button>
            </div>

            <div className="border-2 border-outlineGray w-full h-[70vh] overflow-auto p-5 rounded-md">
                <Accordion multiple activeIndex={activeIndicesLayer0} onTabChange={(e) => setActiveIndicesLayer0(e.index)}>
                    {renderHierarchy(subjectsByHierarchy)}
                </Accordion>
            </div>
        </div>
    );
}
