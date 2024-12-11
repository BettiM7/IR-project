import React from "react";
import "./bounce-animation.css"; // Import the custom CSS

export default function Loading() {
    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="dot w-4 h-4 bg-royalRed rounded-full"></div>
            <div className="dot w-4 h-4 bg-royalRed rounded-full"></div>
            <div className="dot w-4 h-4 bg-royalRed rounded-full"></div>
        </div>
    );
}
