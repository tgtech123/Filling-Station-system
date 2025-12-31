// import React from "react";
// import {TriangleAlert, Check }  from 'lucide-react'

// const ShiftCard = ({ data }) => {
//   return (
//     <div className="bg-white border-[1px] rounded-lg grid gap-8 p-4 mb-2">
//         <div className="flex justify-between mb-2">
//             <div className="w-[60px] h-[60px] bg-[#D9D9D9] rounded-full flex items-center justify-center">img</div>
//           <div>
//             <p className="font-semibold">{data.name}</p>
//             <p className="text-gray-500">{data.shift}</p>
//           </div>
//           <p className="text-gray-500">{data.date}</p>
//         </div>

//         <div className=" sm:grid-cols-2 flex flex-col gap-2 mb-3 font-medium text-neutral-800 text-sm">
//           <p className="grid grid-cols-2">Pump no: <span className="font-medium">{data.pumpNo}</span></p>
//           <p className="grid grid-cols-2">Fuel type: <span className="font-medium">{data.fuelType}</span></p>
//           <p className="grid grid-cols-2">Price/litre: <span className="font-medium">{data.pricePerLitre}</span></p>
//           <p className="grid grid-cols-2">Litres sold: <span className="font-medium">{data.litresSold}</span></p>
//           <p className="grid grid-cols-2">No of transactions: <span className="font-medium">{data.transactions}</span></p>
//           <p className="grid grid-cols-2">Amount: <span className="font-medium">{data.amount}</span></p>
//           <p className="grid grid-cols-2">Reconciled cash: <span className="font-medium">{data.reconciledCash}</span></p>
//           <p className="grid grid-cols-2">
//             Status:{" "}
//             <span
//               className={`inline-flex gap-1 items-center w-fit px-2 py-1 rounded text-xs ${
//                 data.status === "Flagged"
//                   ? "bg-[#FFDCDC] font-semibold text-red-600"
//                   : "bg-[#DCD2FF] font-semibold text-[#7F27FF]"
//               }`}
              
//             >
//               {data.status} 
//               {data.status === "Flagged" ? <TriangleAlert size={16} className="" /> : <Check  size={16}/> }
              
//             </span>
//           </p>
//         </div>

//         <div className="grid gap-2">
//           <h1 className="font-semibold text-neutral-800">Add comment</h1>
//           <textarea
//             placeholder="Enter comment here"
//             className="w-full h-26 border-2 border-neutral-200 rounded-md  p-2 mb-2 text-sm"
//           />
//           <button className="w-full bg-blue-600 hover:bg-blue-300 text-white py-2 rounded-xl">
//             Approve
//           </button>
//         </div>
//       </div>
    
//   );
// };

// export default ShiftCard;

"use client";
import Image from "next/image";
import { User } from "lucide-react";
import { useState } from "react";
import { useImageStore } from "@/store/useImageStore";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function ShiftCard({ data }) {
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  
  const { getUserImage } = useImageStore();
  const { approveShift, loading } = useSupervisorStore();
  
  // Get Cloudinary image using attendant ID
  const profileImage = getUserImage(data.attendantId) || data.image;

  const handleApprove = async () => {
    if (showCommentBox && !comment.trim() && data.discrepancy !== 0) {
      alert("Please add a comment for flagged shifts");
      return;
    }

    try {
      await approveShift(data.shiftId, { comment });
      alert("Shift approved successfully!");
      setShowCommentBox(false);
      setComment("");
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve shift. Please try again.");
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-4">
        {/* Profile Image from Cloudinary */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center shrink-0">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={data.name}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized={profileImage.includes('cloudinary.com')}
            />
          ) : (
            <User size={24} className="text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{data.name}</h3>
          <p className="text-xs text-gray-500 truncate">{data.email || "No email"}</p>
        </div>
      </div>

      {/* Shift Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shift:</span>
          <span className="font-medium text-xs">{data.shift}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pump:</span>
          <span className="font-medium">{data.pumpNo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Fuel Type:</span>
          <span className="font-medium">{data.fuelType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Litres Sold:</span>
          <span className="font-medium">{data.litresSold}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium text-green-600">{data.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reconciled Cash:</span>
          <span className="font-medium">{data.reconciledCash}</span>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            data.status === "Matched" 
              ? "bg-green-100 text-green-700" 
              : data.status === "Flagged"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {data.status}
          </span>
        </div>

        {/* Discrepancy if any */}
        {data.discrepancy !== 0 && (
          <div className="flex justify-between text-red-600 font-medium">
            <span>Discrepancy:</span>
            <span>₦{Math.abs(data.discrepancy).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Comment Box (shows when flagged or button clicked) */}
      {showCommentBox && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Comment {data.discrepancy !== 0 && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add notes about this approval..."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        {!showCommentBox ? (
          <button 
            onClick={() => setShowCommentBox(true)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Approve
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setShowCommentBox(false);
                setComment("");
              }}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Approving..." : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}