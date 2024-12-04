import React, { useEffect, useState } from "react";
import ResultCard from "../components/ResultCard";
import SideFilterSelect from "../components/SideFilterSelect";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import NoResults from "../components/NoResults";

export default function Results() {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 30;
  const [search, setSearch] = useState("");
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [noResults, setNoResults] = useState(false);

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
      !doc.subjects && console.log(doc);
      doc.subjects.forEach((subject) => {
        acc[subject] = (acc[subject] || 0) + 1;
      });
      return acc;
    }, {});

    setCategoryCounts(categoryCounts);

    // get object of subjects that have count == 1, for archive cleaning
    // const singleCountSubjects = Object.keys(categoryCounts).filter((key) => categoryCounts[key] == 1);
    // console.log("count == 1", singleCountSubjects);

    const singleCountSubjects = Object.keys(categoryCounts).filter((key) => categoryCounts[key] <= 10);
    console.log("count <= 10", singleCountSubjects);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    // const fullQuery = `http://localhost:8983/solr/textbooks/select?q=${query}&defType=edismax&qf=title^2 description subtitle subjects authors publisher&start=${page * rowsPerPage}&rows=${rowsPerPage}&wt=json`;
    const fullQuery = `http://localhost:8983/solr/textbooks/select?q=${query}&defType=edismax&qf=title^2 description subtitle subjects authors publisher&rows=100000`;

    setSearch(query);

    fetchResults(fullQuery);
  }, []);

  // update results when page changes
  useEffect(() => {
    let newDisplayedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setDisplayedResults(newDisplayedResults);
  }, [page]);

  function includesAll(arr, target) {
    return target.every((v) => arr.includes(v));
  }

  function filterChange(attribute, filters) {
    let newFilteredResults = results.filter((doc) => includesAll(doc[attribute], filters));

    setFilteredResultsCount(newFilteredResults.length);

    newFilteredResults = newFilteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setDisplayedResults(newFilteredResults);
  }

  return (
    <>
      {results.length ? (
        <div className="grid grid-cols-[auto,1fr]">
          {/* filter sidebar */}
          <div className="px-10 py-5 text-left border-r-[1px] border-outlineGray flex flex-col gap-4 min-w-[300px] max-w-[400px]">
            <h5 className="text-xl">Refine Results</h5>
            <SideFilterSelect filterChange={filterChange} title="subjects" dict={categoryCounts} />
          </div>

          <div className="px-20 py-5">
            <h1 className="text-center mb-4">{search == "*:*" ? "All textbooks" : `Results for "${search}"`}</h1>
            <h4 className="text-2xl flex items-center">
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
                {filteredResultsCount ? page * rowsPerPage + 1 : 0}-{page * rowsPerPage + rowsPerPage > filteredResultsCount ? filteredResultsCount : page * rowsPerPage + rowsPerPage} of {filteredResultsCount} result{filteredResultsCount != 1 && "s"}
              </div>
            </h4>
            <div className="flex flex-col gap-4 mt-4">
              {displayedResults.map((result, index) => (
                <>
                  {index + 1}
                  <ResultCard key={result.id} data={result} />
                </>
              ))}
            </div>
          </div>
        </div>
      ) : noResults ? (
        <NoResults />
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
