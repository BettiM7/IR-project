import React, {useState, useRef} from "react";
import {FaRegTrashAlt} from "react-icons/fa";
import {AiOutlinePlus} from "react-icons/ai";
import {IoIosSearch} from "react-icons/io";
import {Dropdown} from "primereact/dropdown";
import {Toast} from "primereact/toast";
import {useNavigate} from "react-router-dom";
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';



export default function AdvancedSearch() {
    const [queryTerms, setQueryTerms] = useState([{field: null, term: null}]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [startYear, setStartYear] = useState(null);
    const [endYear, setEndYear] = useState(null);
    const [isbn, setIsbn] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const fieldOptions = [
        {label: "Any field", value: "Any field"},
        {label: "Title", value: "Title"},
        {label: "Description", value: "Description"},
        {label: "Author", value: "Author"},
        {label: "Subjects", value: "Subjects"},
    ];

    const languageOptions = [
        {label: 'Arabic (152)', value: 'Arabic'},
        {label: 'Armenian (2)', value: 'Armenian'},
        {label: 'Azerbaijani (2)', value: 'Azerbaijani'},
        {label: 'Belarusian (2)', value: 'Belarusian'},
        {label: 'Bengali (3)', value: 'Bengali'},
        {label: 'Bulgarian (15)', value: 'Bulgarian'},
        {label: 'Burmese (1)', value: 'Burmese'},
        {label: 'Catalan (1)', value: 'Catalan'},
        {label: 'Chinese (80)', value: 'Chinese'},
        {label: 'Croatian (3)', value: 'Croatian'},
        {label: 'Czech (1)', value: 'Czech'},
        {label: 'Danish (3)', value: 'Danish'},
        {label: 'Dutch (7)', value: 'Dutch'},
        {label: 'Dutch; Flemish (4)', value: 'Dutch; Flemish'},
        {label: 'English (11.911)', value: 'English'},
        {label: 'English,Arabic (1)', value: 'English,Arabic'},
        {label: 'English,German (1)', value: 'English,German'},
        {label: 'English,Multiple languages (1)', value: 'English,Multiple languages'},
        {label: 'English,Spanish (1)', value: 'English,Spanish'},
        {label: 'English,Ukrainian (1)', value: 'English,Ukrainian'},
        {label: 'Estonian (1)', value: 'Estonian'},
        {label: 'Finnish (6)', value: 'Finnish'},
        {label: 'French (111)', value: 'French'},
        {label: 'French,English (1)', value: 'French,English'},
        {label: 'Galician (1)', value: 'Galician'},
        {label: 'German (126)', value: 'German'},
        {label: 'German,English (3)', value: 'German,English'},
        {label: 'Greek, Modern (1453-) (2)', value: 'Greek, Modern (1453-)'},
        {label: 'Hawaiian (1)', value: 'Hawaiian'},
        {label: 'Hebrew (14)', value: 'Hebrew'},
        {label: 'Hindi (1)', value: 'Hindi'},
        {label: 'Hungarian (2)', value: 'Hungarian'},
        {label: 'Icelandic (4)', value: 'Icelandic'},
        {label: 'Indic (Other) (1)', value: 'Indic (Other)'},
        {label: 'Indonesian (1)', value: 'Indonesian'},
        {label: 'Iranian (Other) (1)', value: 'Iranian (Other)'},
        {label: 'Irish (3)', value: 'Irish'},
        {label: 'Italian (18)', value: 'Italian'},
        {label: 'Japanese (137)', value: 'Japanese'},
        {label: 'Kazakh (1)', value: 'Kazakh'},
        {label: 'Khmer (2)', value: 'Khmer'},
        {label: 'Korean (86)', value: 'Korean'},
        {label: 'Latin (3)', value: 'Latin'},
        {label: 'Latvian (2)', value: 'Latvian'},
        {label: 'Macedonian (1)', value: 'Macedonian'},
        {label: 'Malayalam (1)', value: 'Malayalam'},
        {label: 'Mandarin (3)', value: 'Mandarin'},
        {label: 'Mandingo (1)', value: 'Mandingo'},
        {label: 'Mayan languages (1)', value: 'Mayan languages'},
        {label: 'Modern Greek (19)', value: 'Modern Greek'},
        {label: 'Niger-Kordofanian (Other) (2)', value: 'Niger-Kordofanian (Other)'},
        {label: 'Norwegian (3)', value: 'Norwegian'},
        {label: 'Oirat (1)', value: 'Oirat'},
        {label: 'Oromo (1)', value: 'Oromo'},
        {label: 'Persian (5)', value: 'Persian'},
        {label: 'Polish (22)', value: 'Polish'},
        {label: 'Portuguese (28)', value: 'Portuguese'},
        {label: 'Romanian (4)', value: 'Romanian'},
        {label: 'Russian (58)', value: 'Russian'},
        {label: 'Serbian (1)', value: 'Serbian'},
        {label: 'Shona (1)', value: 'Shona'},
        {label: 'Slavic (Other) (1)', value: 'Slavic (Other)'},
        {label: 'Slovenian (1)', value: 'Slovenian'},
        {label: 'Sorbian (Other) (1)', value: 'Sorbian (Other)'},
        {label: 'Spanish (104)', value: 'Spanish'},
        {label: 'Spanish; Castilian (83)', value: 'Spanish; Castilian'},
        {label: 'Swahili (1)', value: 'Swahili'},
        {label: 'Swedish (4)', value: 'Swedish'},
        {label: 'Tajik (2)', value: 'Tajik'},
        {label: 'Thai (2)', value: 'Thai'},
        {label: 'Tibetan (4)', value: 'Tibetan'},
        {label: 'Turkish (6)', value: 'Turkish'},
        {label: 'Turkish, Ottoman (1)', value: 'Turkish, Ottoman'},
        {label: 'Ukrainian (19)', value: 'Ukrainian'},
        {label: 'Undetermined (7)', value: 'Undetermined'},
        {label: 'Urdu (4)', value: 'Urdu'},
        {label: 'Vietnamese (3)', value: 'Vietnamese'},
        {label: 'Wolof (1)', value: 'Wolof'},
        {label: 'Yiddish (3)', value: 'Yiddish'},
    ];

    function changeQueryTerm(newTerm, index) {
        let newQueryTerms = [...queryTerms];
        if (newTerm === "") newTerm = "*";
        newQueryTerms[index].term = newTerm;
        console.log(newQueryTerms);
        setQueryTerms(newQueryTerms);
    }

    function changeQueryField(newField, index) {
        let newQueryTerms = [...queryTerms];
        if (newField === "Any field") newField = "*";
        newQueryTerms[index].field = newField.toLowerCase();
        console.log(newQueryTerms);
        setQueryTerms(newQueryTerms);
    }

    function changeQueryOperator(newOperator, index) {
        let newQueryTerms = [...queryTerms];
        newQueryTerms[index].operator = newOperator;
        setQueryTerms(newQueryTerms);
    }

    function deleteQueryTerm(index) {
        let newQueryTerms = [...queryTerms];
        newQueryTerms = newQueryTerms.filter((_, i) => i !== index);
        setQueryTerms(newQueryTerms);
    }

    function capitalizeFirstLetter(string) {
        if (typeof string !== "string" || string.length === 0) return "";
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function validateAndSubmit() {
        const hasNullField = queryTerms.some((term) => term.field === null);
        if (hasNullField) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Missing fields.",
                life: 3000,
            });
        } else {
            const queryString = queryTerms
                .map((obj, index) => {
                    const operator = index > 0 ? `${obj.operator}` : "";
                    return `${operator}(${obj.field}:${obj.term})`;
                })
                .join("");
            navigate(`/search?q=${queryString}`);
        }
    }

    function validateAndSubmitNarrow() {
        if (!startYear && !endYear && !isbn && !selectedLanguage) {
            toast.current.show({
                severity: "error",
                summary: "Validation Error",
                detail: "At least one filter (Publication Year, ISBN, or Language) must be provided.",
                life: 3000,
            });
            return;
        }

        if (startYear && endYear && startYear > endYear) {
            toast.current.show({
                severity: "error",
                summary: "Validation Error",
                detail: "Start year cannot be greater than end year.",
                life: 3000,
            });
            return;
        }

        let queryParts = [];
        if (startYear && endYear) {
            queryParts.push(`publish_date:[${startYear} TO ${endYear}]`);
        } else if (startYear) {
            queryParts.push(`publish_date:[${startYear} TO *]`);
        } else if (endYear) {
            queryParts.push(`publish_date:[* TO ${endYear}]`);
        }
        if (isbn) {
            queryParts.push(`isbn13:${isbn}`);
        }
        if (selectedLanguage) {
            queryParts.push(`language:${selectedLanguage}`);
        }

        let queryTermsPart = [];
        const allTermsValid = queryTerms.every((term) => term.field && term.term);
        if (allTermsValid) {
            queryTermsPart = queryTerms.map((obj) => `${obj.field}:${obj.term}`);
        }

        const queryString = [
            ...queryTermsPart,
            ...queryParts,
        ]
            .filter(Boolean)
            .join(" AND ");

        window.location.href = `/search?q=${encodeURIComponent(queryString)}`;
    }


    return (
        <div className="py-10 max-w-[1080px] mx-auto">
            <Toast ref={toast} position="top-center"/>
            <h2>Construct your query</h2>

            <div className="flex flex-col gap-3 mt-5">
                {queryTerms.map((queryObject, index) => (
                    <>
                        {(queryTerms.length > 1 & index !== 0) ? (
                            <div className="mt-2 flex items-center gap-2">
                                <label>Set boolean</label>
                                <div className="flex rounded-md overflow-hidden border-outlineGray border-[1px]">
                                    <button
                                        className={`py-3 px-4 ${queryTerms[index].operator === "AND" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white border-outlineGray border-r-[1px]`}
                                        onClick={() => changeQueryOperator("AND", index)}>
                                        AND
                                    </button>
                                    <button
                                        className={`py-3 px-4 ${queryTerms[index].operator === "OR" ? "bg-royalRed" : "bg-white text-black"} transition-all duration-300 text-white`}
                                        onClick={() => changeQueryOperator("OR", index)}>
                                        OR
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" placeholder="Insert term..." className="p-3 rounded-md"
                                   onChange={(e) => changeQueryTerm(e.target.value, index)}/>
                            <Dropdown
                                className="p-1 w-[175px]"
                                value={queryObject.field === "*" ? "Any field" : capitalizeFirstLetter(queryObject.field)}
                                options={fieldOptions}
                                onChange={(e) => {
                                    changeQueryField(e.value, index)
                                }}
                                placeholder="Select Field" checkmark={true} highlightOnSelect={true}
                            />
                            {index !== 0 && (
                                <button onClick={() => deleteQueryTerm(index)}
                                        className="bg-royalRed p-2 rounded-md hover:bg-gray-200 text-white hover:text-royalRed transition-all duration-300">
                                    <FaRegTrashAlt className="h-6 w-6"/>
                                </button>
                            )}
                        </div>
                    </>
                ))}
            </div>

            <button onClick={() => setQueryTerms([...queryTerms, {field: null, term: null, operator: "AND"}])}
                    className="flex items-center gap-2 border-[1px] border-outlineGray p-3 rounded-md hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5">
                Add row <AiOutlinePlus/>
            </button>

            <button
                onClick={validateAndSubmit}
                className="border-[1px] border-outlineGray py-3 px-4 rounded-md flex gap-2 items-center hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5">
                Submit search
                <IoIosSearch className="h-5 w-5"/>
            </button>

            <hr className="my-5"/>

            <div>
                <h2>Narrow your search</h2>
                <div className="flex flex-col mt-5">
                    <label className="font-bold">Language</label>
                    <Dropdown
                        value={selectedLanguage}
                        options={languageOptions}
                        onChange={(e) => setSelectedLanguage(e.value)}
                        placeholder="Select Language" checkmark={true} highlightOnSelect={true}
                        className="w-[290px] rounded-md"
                    />
                </div>

                <div className="flex flex-col mt-5">
                    <label className="font-bold">Publication year</label>
                    <div className="flex gap-2">
                        <InputNumber
                            placeholder="Start year..."
                            value={startYear}
                            onChange={(e) => setStartYear(e.value)}
                            useGrouping={false}
                            showButtons
                            min={0}
                            className=""
                        />
                        <InputNumber
                            placeholder="End year..."
                            value={endYear}
                            onChange={(e) => setEndYear(e.value)}
                            useGrouping={false}
                            showButtons
                            min={0}
                            className="ml-2"
                        />
                    </div>
                </div>

                <div className="flex flex-col mt-5">
                    <label className="font-bold">ISBN-13</label>
                    <div className="flex gap-2">
                        <InputText
                            placeholder="ISBN number..."
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            className="w-[290px]"
                        />
                    </div>
                </div>

                <button
                    onClick={validateAndSubmitNarrow}
                    className="border-[1px] border-outlineGray py-3 px-4 rounded-md flex gap-2 items-center hover:border-royalRed hover:text-royalRed transition-all duration-300 mt-5"
                >
                    Submit search
                    <IoIosSearch className="h-5 w-5"/>
                </button>
            </div>
        </div>
    );
}
