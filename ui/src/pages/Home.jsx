import React from "react";
import { IoIosSearch } from "react-icons/io";
import bg from "../images/landscape.png";

export default function Home() {
  return (
    <div>
      <div className="absolute top-[30%] left-[40%] translate-y-[-50%] translate-x-[-50%] w-1/2 z-10">
        <h1 className="mb-8">Discover Knowledge, Cultures, and Ideas</h1>
        <div className="relative">
          <input placeholder="Search textbooks..." className="w-full p-4" />
          <IoIosSearch className="h-6 w-6 absolute right-3 top-[50%] translate-y-[-50%]" />
          <a href="/advanced-search" className="absolute top-[-25px] right-0 underline font-bold text-sm">
            Advanced Search
          </a>
        </div>
      </div>

      <div className="absolute top-[50%] translate-y-[-50%] h-[500px] w-full" style={{ backgroundImage: `url(${bg})`, backgroundPosition: "bottom", backgroundSize: "cover" }}></div>
    </div>
  );
}
