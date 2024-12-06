import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {TbError404} from "react-icons/tb";
import {BiError} from "react-icons/bi";
import ResultCard from "../components/ResultCard";
import RecommendationThumb from "../components/RecommendationThumb";

export default function TextbookDetails() {
    const {id} = useParams();
    const [data, setData] = useState(null);
    const [isImageValid, setIsImageValid] = useState(true);
    const [recommendations, setRecommendations] = useState([]);

    async function fetchData() {
        try {
            const response = await fetch(`http://localhost:8983/solr/textbooks/select?q=id:${id}`);

            if (!response.ok) {
                throw new Error("Failed to fetch data from Solr");
            }

            const jsonData = await response.json();
            setData(jsonData.response.docs[0]);

            console.log(jsonData.response.docs[0]);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }


    useEffect(() => {
        if (data && data.image && data.image.includes("placeholder")) {
            setIsImageValid(false);
        }
    }, [data]);

    function extractWebsiteName(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace("www.", "");
        } catch {
            return "View Source";
        }
    }

    async function fetchRecommendations() {
        // with weights, but error on
        // http://localhost:8983/solr/textbooks/mlt?q=id:{id}&mlt.fl=title,authors,subjects,publisher&mlt.qf=title^2 authors^1.5 subjects^2 publisher^0.5&mlt.mindf=1&mlt.mintf=1&rows=5

        const response = await fetch(`http://localhost:8983/solr/textbooks/mlt?q=id:${id}&mlt.fl=title,authors,subjects,publisher&mlt.qf=title^2 authors^1.5 subjects^2 publisher^0.5&mlt.mindf=1&mlt.mintf=1&rows=5`);

        if (!response.ok) {
            throw new Error("Failed to fetch data from Solr");
        }

        const data = await response.json();

        console.log("recommendations", data.response.docs);

        setRecommendations(data.response.docs);
    }

    useEffect(() => {
        fetchData();
        fetchRecommendations();
    }, []);

    if (!data) {
        return <div className="text-center text-lg font-medium mt-10">Loading book details...</div>;
    }

    const {
        title = [""],
        subtitle = [""],
        publish_date,
        authors = [],
        subjects = [],
        image,
        description = [],
        publisher = [],
        language,
        isbn13,
        source
    } = data;

    return (
        <>
            <div className="max-w-[60vw] mx-auto bg-white shadow-lg rounded-lg p-6 mt-2 mb-2">
                <div className="flex items-start gap-6">
                    {isImageValid && image ? (
                        <img className="w-40 h-auto rounded-lg shadow-md" src={image} alt={title[0]}
                             onError={() => setIsImageValid(false)}/>
                    ) : (
                        <div>
                            {isImageValid ? (
                                <div
                                    className="flex flex-col w-40 h-40 items-center justify-center bg-gray-100 text-gray-500 rounded-lg shadow-md">
                                    <BiError className={"text-2xl"}/>
                                    <span className="text-sm">Could not load source</span>
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col w-40 h-40 items-center justify-center bg-gray-100 text-gray-500 rounded-lg shadow-md">
                                    <TbError404 className={"text-2xl"}/>
                                    <span className="text-sm">No image available</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800">{title[0]}</h1>
                        {subtitle && <p className="text-base text-gray-600 mt-1">{subtitle}</p>}
                        <p className="text-gray-700 font-bold text-lg mt-2">{publish_date}</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold text-gray-700">Description</h2>
                            {description.length > 0 ?
                                <p className=" text-justify text-gray-600 mt-2">{description.join(" ")}</p> :
                                <p className="text-gray-500">No description available</p>}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-[1fr,1fr,1fr] gap-y-8 gap-x-2 mt-8 text-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Authors</h2>
                        {authors.length > 0 ? (
                            <div className="text-gray-600 mt-2">
                                {authors.map((author, index) => (
                                    <div className={"mb-1"} key={index}>
                                        {author}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No authors listed</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Subjects</h2>
                        <div className=" text-gray-600 mt-2 pl-4 border-gray-300">
                            {subjects.map((subject, index) => (
                                <div className={"mb-1"} key={index}>
                                    {subject}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Publisher</h2>
                        {publisher.length > 0 ? (
                            <div className="text-gray-600 mt-2">
                                {publisher.map((pub, index) => (
                                    <div key={index}>{pub}</div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No publisher listed</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Language</h2>
                        <p className="text-gray-600 mt-2">{language || "Not specified"}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">ISBN-13</h2>
                        <p className="text-gray-600 mt-2">{isbn13 || "Not specified"}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Source</h2>
                        {source ? (
                            <a href={source} target="_blank" rel="noopener noreferrer"
                               className="text-blue-600 hover:underline">
                                {extractWebsiteName(source)}
                            </a>
                        ) : (
                            <p className="text-gray-500">No source available</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-center mt-20">More like this</h3>

                <div className="flex gap-10 m-10 mx-auto w-fit">
                    {recommendations.map((recommendation, index) => (
                        <RecommendationThumb key={recommendation.id} data={recommendation}/>
                    ))}
                </div>
            </div>
        </>
    );
}
