import React, { useEffect, useState } from "react";
import ResultCard from "../components/ResultCard";
import SideFilterSelect from "../components/SideFilterSelect";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import NoResults from "../components/NoResults";
import { IoFilterSharp } from "react-icons/io5";
import Loading from "../components/Loading";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Dropdown } from "primereact/dropdown";

export default function Results() {
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(() => {
        const savedPage = sessionStorage.getItem("currentPage");
        return savedPage ? parseInt(savedPage, 10) : 0;
    });
    const [rowsPerPage, setRowsPerPage] = useState(30);
    const [search, setSearch] = useState("");
    const [filteredResultsCount, setFilteredResultsCount] = useState(0);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});
    const [noResults, setNoResults] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [filteredResults, setFilteredResults] = useState([]);
    const options = [
        { label: "10", value: 10 },
        { label: "20", value: 20 },
        { label: "30", value: 30 },
        { label: "50", value: 50 },
        { label: "100", value: 100 },
    ];

    async function fetchResults(query) {
        const response = await fetch(query);

        if (!response.ok) {
            throw new Error("Failed to fetch data from Solr");
        }

        const data = await response.json();
        setResults(data.response.docs);
        setFilteredResults(data.response.docs);
        setFilteredResultsCount(data.response.numFound);
        setDisplayedResults(data.response.docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
        setNoResults(data.response.numFound == 0);

        //console.log(data.response.docs);

        // count the number of documents for each subject
        const categoryCounts = data.response.docs.reduce((acc, doc) => {
            try {
                if (!Array.isArray(doc.subjects)) {
                    throw new Error(`Invalid subjects format: ${JSON.stringify(doc.subjects)}`);
                }
                doc.subjects.forEach((subject) => {
                    acc[subject] = (acc[subject] || 0) + 1;
                });
            } catch (error) {
                console.error("Error processing document:", doc, error.message);
            }
            return acc;
        }, {});

        setCategoryCounts(categoryCounts);
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        const fullQuery = `/api/solr/textbooks/select?q=${query}&defType=edismax&qf=title^2 description subtitle subjects authors publisher&rows=100000`;
        setSearch(query);
        setPage(0);
        fetchResults(fullQuery);
    }, []);

    useEffect(() => {
        let newDisplayedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        setDisplayedResults(newDisplayedResults);
    }, [page]);

    useEffect(() => {
        sessionStorage.setItem("currentPage", page);
    }, [page]);

    function includesAll(arr, target) {
        return target.every((v) => arr.includes(v));
    }

    function filterChange(attribute, filters) {
        const includeFilters = filters.filter(f => f.state === 'include').map(f => f.key);
        const excludeFilters = filters.filter(f => f.state === 'exclude').map(f => f.key);

        let newFilteredResults = results.filter((doc) => {
            const includes = includeFilters.length === 0 || includesAll(doc[attribute], includeFilters);
            const excludes = excludeFilters.every(filter => !doc[attribute]?.includes(filter));
            return includes && excludes;
        });
        setFilteredResultsCount(newFilteredResults.length);

        setFilteredResults(newFilteredResults);
        newFilteredResults = newFilteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        setDisplayedResults(newFilteredResults);
        setPage(0);
    }

    function changeDisplayedResultsNum(newRowsPerPage) {
        setRowsPerPage(newRowsPerPage);

        let newDisplayedResults = [...displayedResults];
        newDisplayedResults = filteredResults.slice(page * newRowsPerPage, page * newRowsPerPage + newRowsPerPage);
        setDisplayedResults(newDisplayedResults);
    }

    return (
        <>
            {results.length ? (
                <div className="grid grid-cols-1">
                    {!isDrawerOpen && (
                        <button className="absolute top-[8px] border-[3px] border-gray-300 p-2 z-10" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                            <IoFilterSharp className="w-6 h-6" />
                        </button>
                    )}
                    <Splitter style={{ height: "100%", minHeight: "calc(100vh - 107px)" }}>
                        <SplitterPanel size={30} minSize={5} className={`relative border-r-[3px]  border-gray-300 rounded-lg ${!isDrawerOpen ? "hidden" : ""}`}>
                            {/* filter sidebar */}
                            <div className="flex flex-col gap-4 overflow-hidden px-5 py-5 text-left">
                                <h3 className="text-xl">Filter by Subject</h3>
                                <SideFilterSelect filterChange={filterChange} title="subjects" dict={categoryCounts} />
                            </div>
                            <button className="absolute top-[7px] right-0 translate-x-[100%] border-[3px] border-gray-300 p-2" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                                <IoFilterSharp className="w-6 h-6" />
                            </button>
                        </SplitterPanel>

                        <SplitterPanel size={70} className="px-20 py-5 flex flex-col">
                            <h2 className="text-center mb-4">{search.includes("*") ? (new RegExp(`^[*:* ]*$`).test(search) ? "All textbooks" : `Textbooks with ${search}`) : `Results for \"${search}\"`}</h2>
                            <h4 className="text-2xl flex flex-row items-center">
                                <div className="flex">
                                    <button
                                        onClick={() => {
                                            setPage(page - 1 < 0 ? 0 : page - 1);
                                        }}
                                    >
                                        <MdKeyboardArrowLeft />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPage(page + 1 > parseInt(filteredResultsCount / rowsPerPage) ? parseInt(filteredResultsCount / rowsPerPage) : page + 1);
                                        }}
                                    >
                                        <MdKeyboardArrowRight />
                                    </button>
                                </div>
                                <div>
                                    <Dropdown
                                        className="mr-3 ml-1"
                                        value={rowsPerPage}
                                        options={options}
                                        onChange={(e) => {
                                            changeDisplayedResultsNum(parseInt(e.value));
                                        }}
                                        placeholder="Select Number of Results" checkmark={true}  highlightOnSelect={true}
                                    />
                                    {filteredResultsCount ? page * rowsPerPage + 1 : 0}-{page * rowsPerPage + rowsPerPage > filteredResultsCount ? filteredResultsCount : page * rowsPerPage + rowsPerPage} of {filteredResultsCount} result{filteredResultsCount !== 1 && "s"}
                                </div>
                            </h4>
                            <div className="flex flex-col">
                            <div className="flex flex-col gap-4 mt-4">
                                {displayedResults.map((result) => (
                                    <ResultCard key={result.id} data={result}/>
                                ))}
                            </div>
                            <button
                                className="bg-royalRed text-white px-4 mt-4 py-2 rounded hover:bg-darkRed transition-all self-end"
                                onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                            >
                                Go Back to Top
                            </button>
                            </div>
                        </SplitterPanel>
                    </Splitter>
                </div>
            ) : noResults ? (
                <NoResults text={search}/>
            ) : (
                <div className="mt-[40vh]">
                    <Loading></Loading>
                </div>
            )}
        </>
    );
}
