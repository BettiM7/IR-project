import React, {useEffect} from "react";
import {IoIosSearch} from "react-icons/io";
import Logo from "../images/logo.png";

export default function Navbar() {
    const [searchInput, setSearchInput] = React.useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (query && query != "*:*") {
            setSearchInput(query);
        }
    }, []);

    function sendSearch() {
        window.location.href = "/search?q=" + encodeURIComponent(searchInput === "" ? "*:*" : searchInput);
    }

    return (
        <div className="w-full flex justify-between items-center p-3 border-b-[3px] border-gray-300 rounded-lg">
            <div className="flex items-center gap-10">
                <div onClick={() => (window.location.href = "/")} className="cursor-pointer">
                    <img src={Logo} className="w-[80px]"/>
                </div>

                {window.location.pathname != "/" && (
                    <div className="relative flex flex-col ">
                        <a href="/search/advanced"
                           className="text-right text-sm underline font-bold hover:text-royalRed transition-all duration-300 mb-1">
                            Advanced Search
                        </a>
                        <div className="relative">
                            <input placeholder="Search textbooks..." className="w-[400px] p-3 rounded-md pr-12" value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   onKeyDown={(e) => e.code == "Enter" && sendSearch()}/>
                            <button className="absolute right-3 top-[50%] translate-y-[-50%]" onClick={sendSearch}>
                                <IoIosSearch className="h-6 w-6 "/>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {window.location.pathname != "/browse" && (
                <button
                    className={"bg-royalRed text-white px-4 py-2 rounded hover:bg-gray-200 hover:text-royalRed transition-all duration-300 cursor-pointer"}
                    onClick={() => (window.location.href = "/browse")}>Browse by Subject
                </button>
            )}
        </div>
    );
}
