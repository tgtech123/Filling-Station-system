    'use client'
import React, { useState } from 'react'
import { IoCloseOutline } from "react-icons/io5";
import { GoChevronDown, GoChevronUp  } from "react-icons/go";



const AddExpenseModal = ({isOpen, onClose,}) => {
    if(!isOpen) return null
    
    const [isToggleChevron, setIsToggleChevron] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Maintenance & Repair",
    "Operational",
    "Utilities",
    "Administrative",
    "Depreciation",
  ];

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsToggleChevron(false); // close dropdown
  };


    //  const handleSubmit = (e) => {
    //     e.preventDefault();
    //     // Handle form submit here
    //     console.log("Expense added ✅");
    //     setIsModOpen(false);
    // };
  return (
    <div>
        <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
            <div onClick={onClose} className='absolute inset-0 bg-black opacity-50'></div>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                {/* Close button */}
                <button
                onClick={onClose}
                className="absolute top-3 right-6 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                <IoCloseOutline size={32} />

                </button>

                {/* Modal title */}
                <span className="mb-4 flex flex-col gap-1">
                    <h1 className='font-bold text-lg text-neutral-700'>Record Expense</h1>
                    <p className='text-neutral-700 '>Add new expense record</p>
                </span>

                {/* Modal content */}
                <div>
                    <form  className="space-y-4 mt-5">
                       

                        <div className='relative'>
                            <label className="block text-md font-bold text-gray-700">
                                Category
                            </label>
                            <input
                            type="text"
                            value={selectedCategory}
                            placeholder="Select option e.g., Maintenance & Repair"
                            className="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:border-2 focus:border-blue-600"
                            readOnly
                            onClick={() => setIsToggleChevron(!isToggleChevron)}
                            />
                           <span onClick={() => setIsToggleChevron(!isToggleChevron)} className='absolute top-9 right-4 cursor-pointer'>
                               {isToggleChevron ? <GoChevronUp size={26} /> : <GoChevronDown size={26} />} 
                            </span> 
                            {isToggleChevron && (
                                <div className='absolute mt-1 flex flex-col gap-2 w-full bg-white border-[1.5px] border-blue-600 rounded-lg shadow-md z-10 max-h-60 overflow-y-auto'>
                                    {categories.map((category, index) => (
                                        <div
                                        key={index}
                                        onClick={() => handleSelect(category)}
                                        className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer text-sm sm:text-base"
                                        >
                                        {category}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        <div>
                            <label className="block text-md font-bold text-gray-700">
                            Amount (Naira)
                            </label>
                            <input
                            type="number"
                            placeholder="₦0.00"
                            className="w-full border-[1.5px] rounded-lg px-3 py-2 mt-1 outline-none  focus:border-blue-700"
                            required
                            />
                        </div>

                        <div>
                            <label className="block text-md font-bold text-gray-700">
                            Description
                            </label>
                            <textarea
                            placeholder="Payment of staff salaries for the month of July"
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-blue-700"
                            rows="3"
                            required
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                           
                            <button
                                onClick={onClose}
                                type="submit"
                                className="w-full font-semibold py-2 bg-[#0080FF] text-white rounded-lg hover:bg-blue-700">
                                Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AddExpenseModal