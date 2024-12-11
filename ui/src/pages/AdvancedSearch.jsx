import React, { useState } from "react";

export default function AdvancedSearch() {
    /**
     * {
     *  field: string,
     *  term: string
     * }
     */
    const [queryTerms, setQueryTerms] = useState([]);
    const [queryBoolean, setQueryBoolean] = useState("AND");

    function changeQueryTerm(newTerm, index) {
        let newQueryTerms = [...queryTerms];
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

            <div className="flex flex-col gap-3 mt-3">
                {queryTerms.map((queryObject, index) => (
                    <div>
                        <input type="text" onChange={(e) => changeQueryTerm(e.target.value, index)} />
                        <select onChange={(e) => changeQueryField(e.target.value, index)}>
                            <option>Any field</option>
                            <option>Title</option>
                            <option>Description</option>
                            <option>Author</option>
                            <option>Subjects</option>
                        </select>
                        <button onClick={() => deleteQueryTerm(index)}>delete</button>
                    </div>
                ))}
            </div>
            <button onClick={() => setQueryTerms([...queryTerms, { field: "*", term: "" }])}>+ add row</button>
            <br />

            <label>boolean</label>
            <select onChange={(e) => setQueryBoolean(e.target.value)}>
                <option>AND</option>
                <option>OR</option>
            </select>

            <br />
            <button onClick={() => (window.location.href = `/search?q=${queryTerms.map((obj) => obj.field + ":" + obj.term).join(" ")}&q.op=${queryBoolean}`)}>search</button>
        </div>
    );
}
