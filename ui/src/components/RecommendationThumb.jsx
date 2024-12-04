import React from "react";

export default function RecommendationThumb({ data }) {
  return (
    <div className="text-center w-[250px]">
      <img src={data.image} className="h-[200px] mx-auto" />
      <a href={`/details/${data.id}`}>
        <h2 className="text-xl font-medium hover:text-royalRed transition-all duration-300 cursor-pointer">{data.title}</h2>
      </a>
      <p className="mt-1 text-xs">{data.authors?.join(", ")}</p>
    </div>
  );
}
