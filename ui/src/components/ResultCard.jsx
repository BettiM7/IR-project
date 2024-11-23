import React from "react";

export default function ResultCard({ data }) {
  return (
    <div className="grid grid-cols-[200px,auto] gap-4 bg-gray-50 p-3">
      <div>
        <img src={data.image} className="h-[200px] mx-auto" />
      </div>
      <div className="flex flex-col">
        <p className="uppercase text-sm text-secondaryGray font-bold">{data.subjects?.join(" • ")} </p>
        <h2 className="text-3xl">{data.title}</h2>
        <p className="mt-3">
          {data.authors?.join(", ")} - {data.publish_date}
        </p>
        <p>{data.description}</p>
      </div>
    </div>
  );
}
