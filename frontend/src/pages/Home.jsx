import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import bg2 from "../images/bg2.jpg";
import bg3 from "../images/bg3.jpg";
import bg4 from "../images/bg4.jpg";
import bg5 from "../images/bg5.jpg";

const bgs = [bg2, bg3, bg4, bg5];

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [bg, setBg] = useState(bg2);

  useEffect(() => {
    setBg(bgs[Math.floor(Math.random() * bgs.length)]);
  }, []);

  function sendSearch() {
    window.location.href = `/search?q=${searchInput === "" ? "*:*" : searchInput}`;
  }

  return (
      <div className="absolute top-0 w-full h-full">
        <div className="absolute top-[25%] translate-y-[-50%] w-full z-10">
          <div className="w-1/2 z-10 relative left-[15%]">
            <h1 className="mb-8">Discover Knowledge, Cultures, and Ideas</h1>
            <div className="relative">
              <input
                  placeholder="Search textbooks..."
                  className="w-full p-4 rounded-md"
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.code == "Enter" && sendSearch()}
              />
              <button
                  className="absolute right-3 top-[50%] translate-y-[-50%]"
                  onClick={sendSearch}
              >
                <IoIosSearch className="h-6 w-6" />
              </button>
              <a
                  href="/search/advanced"
                  className="absolute top-[-25px] right-0 underline font-bold text-sm hover:text-royalRed transition-all duration-300"
              >
                Advanced Search
              </a>
            </div>
          </div>
        </div>

        <div
            className="absolute bottom-0 left-0 w-full h-[64%] z-0"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
        ></div>
      </div>
  );
}
