import React from "react";

export default function Rack() {
  return (
    <>
    <div className="flex items-center justify-center gap-2 bg-neutral-800 p-4 rounded-2xl shadow-lg w-full max-w-xl mx-auto">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-12 h-16 bg-yellow-200 rounded-lg shadow-inner border-2 border-yellow-300"
        ></div>
      ))}
    </div>
        <div className="flex justify-center gap-4 mt-4 w-full max-w-xl mx-auto">
        <button className="px-4 py-2 bg-neutral-700 text-white rounded-xl shadow">Resign</button>
        <button className="px-4 py-2 bg-neutral-700 text-white rounded-xl shadow">Skip</button>
        <button className="px-4 py-2 bg-neutral-700 text-white rounded-xl shadow">Swap</button>
        <button className="px-4 py-2 bg-teal-500 text-white rounded-xl shadow">Submit</button>
      </div>
    </>
  );
}
