import React from "react";
import { Message } from "primereact/message";

export default function NoResults({text}) {
  return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 text-center">
        <Message
            severity="error"
            text={`No results found for "${text}". Please try again with different keywords.`}
            className="text-xl"
        />
      </div>
  );
}
