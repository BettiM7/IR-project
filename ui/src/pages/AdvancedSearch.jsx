import React, { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosSearch } from "react-icons/io";

export default function AdvancedSearch() {
    /**
     * {
     *  field: string,
     *  term: string
     * }
     */
    const [queryTerms, setQueryTerms] = useState([{ field: "*", term: "*" }]);
    const [queryBoolean, setQueryBoolean] = useState("AND");

    function changeQueryTerm(newTerm, index) {
        let newQueryTerms = [...queryTerms];
        if (newTerm == "") newTerm = "*";
        newQueryTerms[index].term = newTerm;
        console.log(newQueryTerms);
        setQueryTerms(newQueryTerms);
    }

    function changeQueryField(newField, index) {
        let newQueryTerms = [...queryTerms];
        if (newField == "Any field") newField = "*";
        newQueryTerms[index].field = newField.toLowerCase();
        console.log(newQueryTerms);
        setQueryTerms(newQueryTerms);
    }

    function deleteQueryTerm(index) {
        let newQueryTerms = [...queryTerms];
        newQueryTerms = newQueryTerms.filter((_, i) => i !== index);
        setQueryTerms(newQueryTerms);
    }

    return (
        <div className="py-10 max-w-[1080px] mx-auto">
            <h2>Construct query</h2>

            <div className="flex flex-col gap-3 mt-5">
                {queryTerms.map((queryObject, index) => (
                    <>
                        {" "}
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="Insert term..." className="p-3 rounded-md" onChange={(e) => changeQueryTerm(e.target.value, index)} />
                            <select onChange={(e) => changeQueryField(e.target.value, index)} className="p-3 border-[1px] bg-white border-outlineGray rounded-md">
                                <option>Any field</option>
                                <option>Title</option>
                                <option>Description</option>
                                <option>Author</option>
                                <option>Subjects</option>
                            </select>
                            <button onClick={() => deleteQueryTerm(index)} className="bg-royalRed p-2 rounded-md hover:bg-gray-200 text-white hover:text-royalRed transition-all duration-300">
                                <FaRegTrashAlt className="h-6 w-6" />
                            </button>
                        </div>
                        {index != queryTerms.length - 1 && queryBoolean}
                    </>
                ))}
            </div>

            <button onClick={() => setQueryTerms([...queryTerms, { field: "*", term: "*" }])} className="flex items-center gap-2 border-[1px] border-outlineGray p-3 rounded-md hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5">
                Add row <AiOutlinePlus />
            </button>

            <div className="mt-5 flex items-center gap-2">
                <label className="font-bold">Set boolean</label>
                {/* <select onChange={(e) => setQueryBoolean(e.target.value)} className="p-3 border-[1px] bg-white border-outlineGray rounded-md">
                    <option>AND</option>
                    <option>OR</option>
                </select> */}
                <div className="flex rounded-md overflow-hidden border-outlineGray border-[1px]">
                    <button className={`py-3 px-4 ${queryBoolean == "AND" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white border-outlineGray border-r-[1px]`} onClick={() => setQueryBoolean("AND")}>
                        AND
                    </button>
                    <button className={`py-3 px-4 ${queryBoolean == "OR" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white`} onClick={() => setQueryBoolean("OR")}>
                        OR
                    </button>
                </div>
            </div>

            <br />
            <button onClick={() => (window.location.href = `/search?q=${queryTerms.map((obj) => obj.field + ":" + obj.term).join(" ")}&q.op=${queryBoolean}`)} className="border-[1px] border-outlineGray py-3 px-4 rounded-md flex gap-2 items-center">
                Submit search
                <IoIosSearch className="h-5 w-5" />
            </button>
        </div>
    );
}
