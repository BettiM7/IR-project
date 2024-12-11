import React, {useEffect, useState} from "react";
import {BiError} from "react-icons/bi";
import {TbError404} from "react-icons/tb";

export default function RecommendationThumb({ data }) {
    const [isImageValid, setIsImageValid] = useState(true);

    useEffect(() => {
        if (data.image && data.image.includes("placeholder")) {
            setIsImageValid(false);
        }
    }, [data.image]);

  return (
      <div className="text-center w-[300px] mt-6">
          <a href={`/details/${data.id}`} className="font-semibold hover:text-royalRed transition-all duration-300 cursor-pointer">
              <div>
                  {isImageValid && data.image ? (
                      <img
                          src={data.image}
                          className="h-[150px] w-[100px] mx-auto rounded"
                          alt={data.title}
                          onError={() => setIsImageValid(false)}
                      />
                  ) : (
                      <div className="flex flex-col h-[150px] w-[100px] items-center justify-center bg-gray-100 text-gray-500 rounded shadow-md mx-auto">
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
              <h4>{data.title}</h4>
          <p className="mt-1 text-xs">{data.authors?.join(", ")}</p>
          </a>
      </div>
  );
}
