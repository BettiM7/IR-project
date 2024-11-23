import React, { useEffect, useState } from "react";
import ResultCard from "../components/ResultCard";

export default function Results() {
  const [results, setResults] = useState({ docs: [] });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    fetch(`http://localhost:8983/solr/textbooks/select?q=${query}&defType=edismax&qf=title^2 description subjects authors publisher&wt=json`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Search Results:", data);
        setResults(data.response);
      })
      .catch((error) => console.error("Error querying Solr:", error));
  }, []);

  return (
    <div className="px-20 py-5">
      <h4 className="text-2xl">
        {results.numFound} result{results.numFound != 1 && "s"}
      </h4>
      <div className="flex flex-col gap-4 mt-4">
        {results.docs.map((result) => (
          <ResultCard key={result.id} data={result} />
        ))}
      </div>
    </div>
  );
}
