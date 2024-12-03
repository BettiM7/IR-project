import React, { useEffect } from "react";
import { IoIosSearch } from "react-icons/io";

export default function Navbar() {
  const [searchInput, setSearchInput] = React.useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    setSearchInput(query);
  }, []);

  function sendSearch() {
    window.location.href = "/search?q=" + encodeURIComponent(searchInput === "" ? "*:*" : searchInput);
  }

  return (
    <div className="w-full flex justify-between items-center p-3 border-b-[1px] border-outlineGray">
      <div className="flex items-center gap-10">
        <div onClick={() => (window.location.href = "/")} className="cursor-pointer">
          Lib
        </div>

        {window.location.pathname != "/" && (
          <div className="relative flex flex-col ">
            <a href="/search/advanced" className="text-right text-sm underline font-bold hover:text-royalRed transition-all duration-300 mb-1">
              Advanced Search
            </a>
            <div className="relative">
              <input placeholder="Search textbooks..." className="w-[400px] p-3" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.code == "Enter" && sendSearch()} />
              <button className="absolute right-3 top-[50%] translate-y-[-50%]" onClick={sendSearch}>
                <IoIosSearch className="h-6 w-6 " />
              </button>
            </div>
          </div>
        )}
      </div>

      <button1>Browse</button1>
    </div>
  );
}
