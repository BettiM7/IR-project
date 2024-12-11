import React, {useState} from "react";
import subjectsByHierarchy from "../models/subjects_by_hierarchy.json";
import {Accordion, AccordionTab} from 'primereact/accordion';
import {ScrollPanel} from 'primereact/scrollpanel';


export default function Browse() {
    const totalTabsLayer0 = Object.keys(subjectsByHierarchy).length;
    const [activeIndicesLayer0, setActiveIndicesLayer0] = useState(
        Array.from({ length: totalTabsLayer0 }, (_, i) => i)
    );
    const [activeIndicesLayer1, setActiveIndicesLayer1] = useState(
        0
    );

    const toggleAccordions = () => {
        if (activeIndicesLayer0.length === totalTabsLayer0) {
            setActiveIndicesLayer0([]);
            setActiveIndicesLayer1(null)
        } else {
            setActiveIndicesLayer0(Array.from({ length: totalTabsLayer0 }, (_, i) => i));
            setActiveIndicesLayer1(0)
        }
    };

    const areAllOpen = activeIndicesLayer0.length === totalTabsLayer0;

    const formatHeight = (value, index) => {
        const values = Object.values(value);
        const determineSubgroups = (values) => {
            const subgroups = [];
            let currentGroup = [];

            values.forEach((item) => {
                if (typeof item === 'object' && !Array.isArray(item)) {
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
            return Array.from(
                { length: max - subgroup[positionInSubgroup].length },
                (_, idx) => (
                    <p key={idx} style={{ height: '24px' }}>
                    </p>
                )
            );
        }

        return null;
    };


    const renderHierarchy = (node) => {
        if (Array.isArray(node)) {
            return node.map((subject, index) => (
                <p key={index}>
                    <a
                        onClick={() => (window.location.href = `/search?q=subjects:${subject}`)}
                        className="gap-2 hover:text-royalRed transition-all duration-300 cursor-pointer underline font-medium"
                    >
                        {subject}
                    </a>
                </p>
            ));
        }

        if (typeof node === "object" && node !== null) {
            return Object.entries(node).map(([key, value], index) => {
                    if (key === "reference_subjects") {
                        return (
                            <div  key={index}>
                                <div className="mb-4 font-extrabold text-lg">{renderHierarchy(value)}</div>
                            </div>
                        );
                    }

                    if (key === "subgroups") {
                        return (
                            <div key={index} className="flex flex-wrap gap-y-6">
                                {Array.isArray(value) ? (
                                    <div>
                                        {renderHierarchy(value)}
                                    </div>
                                ) : typeof value === "object" ? (
                                    Object.entries(value).map(([subgroupKey, subgroupValue], idx) => {
                                        if (typeof subgroupValue === "object" && !Array.isArray(subgroupValue)) {
                                            return (
                                                <div key={idx} className="text-left w-full">
                                                    <Accordion activeIndex={activeIndicesLayer1}>
                                                        <AccordionTab header={
                                                            <h3 className="text-xl font-bold text-royalRed">{subgroupKey}</h3>
                                                        }>
                                                            <div className="flex flex-wrap gap-y-6">
                                                                {Object.entries(subgroupValue).map(([innerKey, innerValue], innerIdx) => (
                                                                    <div key={innerIdx}
                                                                         className="basis-1/3 text-left mt-2">
                                                                        <Accordion activeIndex={activeIndicesLayer1}>
                                                                            <AccordionTab header={
                                                                                <h5
                                                                                    className="text-lg font-semibold text-gray-700">{innerKey}
                                                                                </h5>
                                                                            }>
                                                                                <div className="ml-2">
                                                                                    {renderHierarchy(innerValue)}
                                                                                </div>
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
                                                    <AccordionTab header={
                                                        <h5 className="font-bold text-lg text-gray-700">{subgroupKey}</h5>
                                                    }>
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
                        <AccordionTab key={index} header={
                            <h3 className="font-bold w-full text-xs text-royalRed">{key}</h3>
                        }>
                            <div className="mt-4 ml-4">{renderHierarchy(value)}</div>
                        </AccordionTab>
                    );
                }
            )
                ;
        }

        return null;
    };

    return (
        <div className="m-auto flex flex-col justify-center items-center">
            <h2 className="text-center font-semibold text-royalRed mt-10">Browse by Subject</h2>
            <div className="w-full flex justify-end mb-2 pr-4"  style={{width: '95%'}}>
                <button
                    onClick={toggleAccordions}
                    className="bg-royalRed text-white px-4 py-2 rounded hover:bg-darkRed transition-all"
                >
                    {areAllOpen ? "Close All" : "Open All"}
                </button>
            </div>
            <ScrollPanel style={{width: '95%', height: '70vh', overflow: "auto"}}>
                <Accordion
                    multiple
                    activeIndex={activeIndicesLayer0}
                    onTabChange={(e) => setActiveIndicesLayer0(e.index)}
                >
                    {renderHierarchy(subjectsByHierarchy)}
                </Accordion>
            </ScrollPanel>
        </div>
    );
}
