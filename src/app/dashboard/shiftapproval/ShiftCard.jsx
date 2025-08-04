import React from "react";
import {TriangleAlert, Check }  from 'lucide-react'

const ShiftCard = ({ data }) => {
  return (
    <div className="bg-white border-[1px] rounded-lg grid gap-8 p-4 mb-2">
        <div className="flex justify-between mb-2">
            <div className="w-[60px] h-[60px] bg-[#D9D9D9] rounded-full flex items-center justify-center">img</div>
          <div>
            <p className="font-semibold">{data.name}</p>
            <p className="text-gray-500">{data.shift}</p>
          </div>
          <p className="text-gray-500">{data.date}</p>
        </div>

        <div className=" sm:grid-cols-2 flex flex-col gap-2 mb-3 font-medium text-neutral-800 text-sm">
          <p className="grid grid-cols-2">Pump no: <span className="font-medium">{data.pumpNo}</span></p>
          <p className="grid grid-cols-2">Fuel type: <span className="font-medium">{data.fuelType}</span></p>
          <p className="grid grid-cols-2">Price/litre: <span className="font-medium">{data.pricePerLitre}</span></p>
          <p className="grid grid-cols-2">Litres sold: <span className="font-medium">{data.litresSold}</span></p>
          <p className="grid grid-cols-2">No of transactions: <span className="font-medium">{data.transactions}</span></p>
          <p className="grid grid-cols-2">Amount: <span className="font-medium">{data.amount}</span></p>
          <p className="grid grid-cols-2">Reconciled cash: <span className="font-medium">{data.reconciledCash}</span></p>
          <p className="grid grid-cols-2">
            Status:{" "}
            <span
              className={`inline-flex gap-1 items-center w-fit px-2 py-1 rounded text-xs ${
                data.status === "Flagged"
                  ? "bg-[#FFDCDC] font-semibold text-red-600"
                  : "bg-[#DCD2FF] font-semibold text-[#7F27FF]"
              }`}
              
            >
              {data.status} 
              {data.status === "Flagged" ? <TriangleAlert size={16} className="" /> : <Check  size={16}/> }
              
            </span>
          </p>
        </div>

        <div className="grid gap-2">
          <h1 className="font-semibold text-neutral-800">Add comment</h1>
          <textarea
            placeholder="Enter comment here"
            className="w-full h-26 border-2 border-neutral-200 rounded-md  p-2 mb-2 text-sm"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-300 text-white py-2 rounded-xl">
            Approve
          </button>
        </div>
      </div>
    
  );
};

export default ShiftCard;
