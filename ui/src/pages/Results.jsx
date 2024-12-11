import React, { useEffect, useState } from "react";
import ResultCard from "../components/ResultCard";
import SideFilterSelect from "../components/SideFilterSelect";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import NoResults from "../components/NoResults";
import { IoFilterSharp } from "react-icons/io5";
import Loading from "../components/Loading";
import { Splitter, SplitterPanel } from 'primereact/splitter';


export default function Results() {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("currentPage");
    return savedPage ? parseInt(savedPage, 10) : 0;
  });
  const rowsPerPage = 30;
  const [search, setSearch] = useState("");
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [noResults, setNoResults] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  async function fetchResults(query) {
    const response = await fetch(query);

    if (!response.ok) {
      throw new Error("Failed to fetch data from Solr");
    }

    const data = await response.json();
    setResults(data.response.docs);
    setFilteredResultsCount(data.response.numFound);
    setDisplayedResults(data.response.docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
    setNoResults(data.response.numFound == 0);

    // count the number of documents for each subject
    const categoryCounts = data.response.docs.reduce((acc, doc) => {
      // !doc.subjects && console.log(doc);
      doc.subjects.forEach((subject) => {
        acc[subject] = (acc[subject] || 0) + 1;
      });
      return acc;
    }, {});

    setCategoryCounts(categoryCounts);

    // get object of subjects that have count == 1, for archive cleaning
    // const singleCountSubjects = Object.keys(categoryCounts).filter((key) => categoryCounts[key] == 1);
    // console.log("count == 1", singleCountSubjects);

    // const singleCountSubjects = Object.keys(categoryCounts).filter((key) => categoryCounts[key] <= 10);
    // console.log("count <= 10", singleCountSubjects);
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
    let newFilteredResults = results.filter((doc) => includesAll(doc[attribute], filters));

    setFilteredResultsCount(newFilteredResults.length);

    newFilteredResults = newFilteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setDisplayedResults(newFilteredResults);
    setPage(0)
  }

  return (
    <>
      {results.length ? (
          <div className="grid grid-cols-1">
            {!isDrawerOpen && (
                <button
                    className="absolute top-[8px] border-[3px] border-gray-300 p-2 z-10"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                  <IoFilterSharp className="w-6 h-6"/>
                </button>
            )}
            <Splitter style={{height: '100%'}}>
              <SplitterPanel size={30} minSize={5}
                             className={`relative border-r-[3px]  border-gray-300 rounded-lg ${!isDrawerOpen ? 'hidden' : ''}`}>
                {/* filter sidebar */}
                <div className="flex flex-col gap-4 overflow-hidden px-10 py-5 text-left">
                  <h3 className="text-xl">Filter by Subject</h3>
                  <SideFilterSelect filterChange={filterChange} title="subjects" dict={categoryCounts}/>
                </div>
                <button
                    className="absolute top-[7px] right-0 translate-x-[100%] border-[3px] border-gray-300 p-2"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                  <IoFilterSharp className="w-6 h-6"/>
                </button>
              </SplitterPanel>

              <SplitterPanel size={70} className="px-20 py-5">
                <h2 className="text-center mb-4">{search === "*:*" ? "All textbooks" : `Results for \"${search}\"`}</h2>
                <h4 className="text-2xl flex items-center">
                  <div className="flex">
                    <button
                        onClick={() => {
                          setPage(page - 1 < 0 ? 0 : page - 1);
                        }}
                    >
                      <MdKeyboardArrowLeft/>
                    </button>
                    <button
                        onClick={() => {
                          setPage(page + 1 > parseInt(filteredResultsCount / rowsPerPage) ? parseInt(filteredResultsCount / rowsPerPage) : page + 1);
                        }}
                    >
                      <MdKeyboardArrowRight/>
                    </button>
                  </div>
                  <div>
                    {filteredResultsCount
                        ? page * rowsPerPage + 1
                        : 0}-{page * rowsPerPage + rowsPerPage > filteredResultsCount
                      ? filteredResultsCount
                      : page * rowsPerPage + rowsPerPage} of {filteredResultsCount} result{filteredResultsCount !== 1 && "s"}
                  </div>
                </h4>
                <div className="flex flex-col gap-4 mt-4">
                  {displayedResults.map((result) => (
                      <ResultCard key={result.id} data={result}/>
                  ))}
                </div>
              </SplitterPanel>
            </Splitter>
          </div>
      ) : noResults ? (
          <NoResults/>
      ) : (
          <div className="mt-[40vh]">
            <Loading></Loading>
          </div>
      )}
    </>
  );
}
