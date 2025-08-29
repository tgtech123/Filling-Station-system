import React from 'react'
import { GiSplitArrows } from "react-icons/gi";


const StatusModal = ({ onClose, onApprove, onReject, row }) => {
  if (!row) return null;

  // Assuming your row is something like:
  // [ExpenseID, Date, Category, Description, Amount, SubmittedBy, Status]
  const [expenseId, date, category, description, amount, submittedBy] = row;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[400px]">
        {/* ✅ Header */}
        <p className="text-xl text-[#1A71F6] font-bold mb-4 flex gap-5 ">
            <GiSplitArrows size={26}/>
          Approve Expense
        </p>

        {/* ✅ Expense Details */}
        <div className="space-y-4 text-sm text-gray-700">
          <p className=" flex gap-10 font-medium "><span className='font-bold'>Category:</span> {category}</p>
          <p className="font-medium flex gap-6"> <span className="font-bold">Description:</span> {description}</p>
          <p className="font-medium flex gap-13"> <span className="font-bold">Amount:</span> {amount}</p>
          <p className="font-medium flex gap-4"> <span className="font-bold">Submitted By:</span> {submittedBy}</p>
           <p className="font-medium flex gap-19"><span className="font-bold" >Date:</span> {expenseId} </p>
          {/* <p><span className="font-medium">Expense ID:</span> </p>  */}
        </div>

        {/* ✅ Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onReject}
            className="w-fit p-2 border-[1.5px] border-neutral-300 font-bold rounded-xl "
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-2 bg-[#0080FF] text-white rounded-xl font-bold hover:bg-blue-600"
          >
            Approve
          </button>
        </div>

        
       
      </div>
    </div>
  );
};


export default StatusModal 