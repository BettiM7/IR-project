import React, { useState, useEffect } from "react";
import { TbError404 } from "react-icons/tb";
import { BiError } from "react-icons/bi";

export default function ResultCard({ data }) {
    const [isImageValid, setIsImageValid] = useState(true);

    useEffect(() => {
        if (data.image && data.image.includes("placeholder")) {
            setIsImageValid(false);
        }
    }, [data.image]);

    return (
        <div className="grid grid-cols-[200px,auto] gap-4 bg-gray-50 p-3 rounded-lg">
            <div>
                {isImageValid && data.image ? (
                    <img
                        src={data.image}
                        className="h-[200px] w-[150px] mx-auto rounded-lg"
                        alt={data.title}
                        onError={() => setIsImageValid(false)}
                    />
                ) : (
                    <div className="flex flex-col h-[200px] w-[150px] items-center justify-center bg-gray-100 text-gray-500 rounded-lg shadow-md mx-auto">
                        {isImageValid ? (
                            <>
                                <BiError className="text-2xl" />
                                <span className="text-sm">Could not load source</span>
                            </>
                        ) : (
                            <>
                                <TbError404 className="text-2xl" />
                                <span className="text-sm">No image available</span>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <p className="uppercase text-sm text-secondaryGray font-bold">
                    {data.subjects?.join(" • ")}
                </p>
                <a href={`/details/${data.id}`}>
                    <h2 className="text-3xl hover:text-royalRed transition-all duration-300 cursor-pointer">
                        {data.title}
                    </h2>
                </a>
                <h3 className="italic mt-[-5px] text-sm text-secondaryGray">
                    {data.subtitle}
                </h3>
                <p className="mt-3">
                    {data.authors?.join(", ")} - {data.publish_date}
                </p>
            </div>
        </div>
    );
}
