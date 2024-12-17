import React, { useEffect, useState } from "react";
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
    const [languagesDict, setLanguagesDict] = useState({});
    const [languageFilter, setLanguageFilter] = useState("*");
    const [isbnFilter, setIsbnFilter] = useState("*");
    const [yearFilter, setYearFilter] = useState("*");

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

    async function fetchLanguages() {
        const response = await fetch("http://localhost:8983/solr/textbooks/select?q=*:*&fl=language&rows=100000");

        if (!response.ok) {
            throw new Error("Failed to fetch data from Solr");
        }

        const data = await response.json();

        const languages = data.response.docs;

        console.log(languages);
        let newLanguagesDict = {};
        languages.forEach((language) => {
            language = language.language;
            if (newLanguagesDict[language]) {
                newLanguagesDict[language] += 1;
            } else {
                newLanguagesDict[language] = 1;
            }
        });

        console.log(newLanguagesDict);
        setLanguagesDict(newLanguagesDict);
    }

    useEffect(() => {
        fetchLanguages();
    }, []);

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

            {queryTerms.length > 1 && (
                <div className="mt-5 flex items-center gap-2">
                    <label>Set boolean</label>
                    <div className="flex rounded-md overflow-hidden border-outlineGray border-[1px]">
                        <button className={`py-3 px-4 ${queryBoolean == "AND" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white border-outlineGray border-r-[1px]`} onClick={() => setQueryBoolean("AND")}>
                            AND
                        </button>
                        <button className={`py-3 px-4 ${queryBoolean == "OR" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white`} onClick={() => setQueryBoolean("OR")}>
                            OR
                        </button>
                    </div>
                </div>
            )}

            <button onClick={() => (window.location.href = `/search?q=${queryTerms.map((obj) => obj.field + ":" + obj.term).join(" ")}&q.op=${queryBoolean}`)} className="border-[1px] border-outlineGray py-3 px-4 rounded-md flex gap-2 items-center hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5">
                Submit search
                <IoIosSearch className="h-5 w-5" />
            </button>

            <hr className="my-5" />

            <h2>Narrow search</h2>

            <div className="flex flex-col mt-5">
                <label className="font-bold">Language</label>
                <select className="p-3 w-[300px] border-[1px] bg-white border-outlineGray rounded-md" onChange={(e) => setLanguageFilter(e.target.value == "Any language" ? "*" : e.target.value)}>
                    <option value={"Any language"}>Any language</option>

                    {Object.keys(languagesDict).map((language) => (
                        <option key={language} value={language}>
                            {language} ({languagesDict[language]})
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col mt-5">
                <label className="font-bold">Publication year</label>
                <input type="number" className="p-3 rounded-md w-[300px]" placeholder="Year..." onChange={(e) => setYearFilter(e.target.value)} />
            </div>

            <div className="flex flex-col mt-5">
                <label className="font-bold">ISBN</label>
                <div className="flex gap-2">
                    <input type="text" className="p-3 rounded-md w-[300px]" placeholder="ISBN number..." onChange={(e) => setIsbnFilter(e.target.value == "" ? "*" : e.target.value)} />
                </div>

                {isbnFilter !== "*" && isbnFilter.length !== 10 && isbnFilter.length !== 13 && <p className="text-red-500">ISBN number must be either 10 or 13 characters long</p>}
            </div>

            <button
                onClick={() => {
                    const params = new URLSearchParams();

                    if (languageFilter && languageFilter !== "*") {
                        params.append("q", `language:${languageFilter}`);
                    }

                    if (isbnFilter && isbnFilter !== "*") {
                        if (isbnFilter.length === 10) {
                            params.append("q", `isbn10:${isbnFilter}`);
                        } else {
                            params.append("q", `isbn13:${isbnFilter}`);
                        }
                    }

                    if (yearFilter && yearFilter !== "*") {
                        params.append("q", `publish_date:${yearFilter}`);
                    }

                    const query = params.getAll("q").join(" AND ");

                    const searchURL = `/search?q=${query}`;

                    window.location.href = searchURL;
                }}
                className="border-[1px] border-outlineGray py-3 px-4 rounded-md flex gap-2 items-center hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5"
            >
                Submit search
                <IoIosSearch className="h-5 w-5" />
            </button>
        </div>
    );
}
