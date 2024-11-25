import React from "react";

export default function ResultCard({ data }) {
  return (
    <div className="grid grid-cols-[200px,auto] gap-4 bg-gray-50 p-3">
      <div>
        <img src={data.image} className="h-[200px] mx-auto" />
      </div>
      <div className="flex flex-col">
        <p className="uppercase text-sm text-secondaryGray font-bold">{data.subjects?.join(" • ")} </p>
        <a href={`/details/${data.id}`}>
          <h2 className="text-3xl hover:text-royalRed transition-all duration-300 cursor-pointer">{data.title}</h2>
        </a>
        <h3 className="italic mt-[-5px] text-sm text-secondaryGray">{data.subtitle}</h3>
        <p className="mt-3">
          {data.authors?.join(", ")} - {data.publish_date}
        </p>
        <p className="mt-3 line-clamp-4 text-[#666]">{data.description}</p>
      </div>
    </div>
  );
}
