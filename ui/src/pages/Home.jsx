import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import bg from "../images/landscape.png";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");

  function sendSearch() {
    // GET http://<solr-server>:8983/solr/<collection_name>/select?q=<user_input>&wt=json

    // fetch(`http://localhost:8983/solr/textbooks/select?q=${encodeURIComponent(searchInput === "" ? "*:*" : searchInput)}&wt=json`);

    // -- uses searchInput for fields like title description and genre (^2 boosts matches in the respective field) !! --
    fetch(`http://localhost:8983/solr/textbooks/select?q=${encodeURIComponent(searchInput === "" ? "*:*" : searchInput)}&defType=edismax&qf=title^2 description genres authors publisher&wt=json`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Search Results:", data.response.docs);
        // Process and display results
      })
      .catch((error) => console.error("Error querying Solr:", error));
  }

  return (
    <div className="absolute top-[25%] translate-y-[-50%] w-full">
      <div className="w-1/2 z-10 relative left-[15%]">
        <h1 className="mb-8">Discover Knowledge, Cultures, and Ideas</h1>
        <div className="relative">
          <input placeholder="Search textbooks..." className="w-full p-4" onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.code == "Enter" && sendSearch()} />
          <IoIosSearch className="h-6 w-6 absolute right-3 top-[50%] translate-y-[-50%]" onClick={sendSearch} />
          <a href="/advanced-search" className="absolute top-[-25px] right-0 underline font-bold text-sm">
            Advanced Search
          </a>
        </div>
      </div>

      <div className="absolute top-[90%] h-[500px] w-full left-0 z-0" style={{ backgroundImage: `url(${bg})`, backgroundPosition: "center", backgroundSize: "cover" }}></div>
    </div>
  );
}
