import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Browse() {
  const [subjectsDictionary, setSubjectsDictionary] = useState({});
  const navigate = useNavigate();

  async function fetchAllTextbooksResults() {
    const query = "http://localhost:8983/solr/textbooks/select?q=*:*&rows=100000";
    const response = await fetch(query);

    if (!response.ok) {
      throw new Error("Failed to fetch data from Solr");
    }

    const data = await response.json();

    // count the number of documents for each subject
    const categoryCounts = data.response.docs.reduce((acc, doc) => {
      !doc.subjects && console.log(doc);
      doc.subjects.forEach((subject) => {
        acc[subject] = (acc[subject] || 0) + 1;
      });
      return acc;
    }, {});

    setSubjectsDictionary(categoryCounts);

    console.log(categoryCounts);
  }

  useEffect(() => {
    fetchAllTextbooksResults();
  }, []);

  return (
    <div>
      <h1 className="text-center">Browse</h1>
      <div className="grid grid-cols-3 gap-10 p-10">
        {Object.entries(subjectsDictionary)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value], index) => (
            <a onClick={() => navigate(`/search?q=${key}`, { state: { query: `http://localhost:8983/solr/textbooks/select?q=subjects:${key}&rows=100000` } })} key={index} className="gap-2 hover:text-royalRed transition-all duration-300 cursor-pointer underline font-semibold">
              {key} ({value})
            </a>
          ))}
      </div>
    </div>
  );
}
