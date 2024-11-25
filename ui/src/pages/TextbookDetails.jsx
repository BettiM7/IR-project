import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TextbookDetails() {
  const { id } = useParams();
  const [data, setData] = useState({});

  async function fetchData() {
    const response = await fetch(`http://localhost:8983/solr/textbooks/select?q=id:${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data from Solr");
    }

    const data = await response.json();
    // console.log(data.response.docs);
    setData(data.response.docs[0]);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return <div>{data.title}</div>;
}
