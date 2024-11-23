import React, { useEffect, useState } from "react";
import ResultCard from "../components/ResultCard";
import SideFilterSelect from "../components/SideFilterSelect";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";

export default function Results() {
  const [results, setResults] = useState({ docs: [] });
  const [page, setPage] = useState(0);
  const rowsPerPage = 40;

  async function fetchResults(query) {
    const response = await fetch(`http://localhost:8983/solr/textbooks/select?q=${query}&defType=edismax&qf=title^2 description subjects authors publisher&start=${page * rowsPerPage}&rows=${rowsPerPage}&wt=json`);

    if (!response.ok) {
      throw new Error("Failed to fetch data from Solr");
    }

    const data = await response.json();
    setResults(data.response);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    fetchResults(query);
  }, [page]);

  return (
    <div className="grid grid-cols-[auto,1fr]">
      {/* filter sidebar */}
      <div className="px-10 py-5 text-left min-w-[300px] border-r-[1px] border-outlineGray flex flex-col gap-4">
        <h5 className="text-xl">Refine Results</h5>
        <SideFilterSelect />
      </div>

      <div className="px-20 py-5">
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
                setPage(page + 1 > parseInt(results.numFound / rowsPerPage) ? parseInt(results.numFound / rowsPerPage) : page + 1);
              }}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
          {/* TBD */}
          <div>
            {page * rowsPerPage}-{page * rowsPerPage + rowsPerPage} of {results.numFound} result{results.numFound != 1 && "s"}
          </div>
        </h4>
        <div className="flex flex-col gap-4 mt-4">
          {results.docs.map((result, index) => (
            <ResultCard key={result.id} data={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
