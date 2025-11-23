'use client'
import React, { useState } from 'react'
import { IoCloseOutline } from "react-icons/io5";
import { GoChevronDown, GoChevronUp  } from "react-icons/go";
import { useExpenseStore } from '@/store/expenseStore';

const AddExpenseModalPage = ({isOpen, onClose}) => {
    if(!isOpen) return null
    
    const [isToggleChevron, setIsToggleChevron] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    
    const { createExpense, loading, errors } = useExpenseStore();

    const categories = [
      "Product purchase",
      "Maintenance & Repair",
      "Salaries",
      "Operational",
      "Utilities",
      "Administrative",
      "Depreciation",
      "Other Expenses",
    ];

    const handleSelect = (category) => {
        setSelectedCategory(category);
        setIsToggleChevron(false);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!selectedCategory) {
            errors.category = "Category is required";
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            errors.amount = "Amount is required and must be greater than 0";
        }
        
        if (!description.trim()) {
            errors.description = "Description is required";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        try {
            const expenseData = {
                category: selectedCategory,
                amount: parseFloat(amount),
                description: description,
                ...(expenseDate && { expenseDate: expenseDate })
            };

            await createExpense(expenseData);
            
            // Reset form
            setSelectedCategory("");
            setAmount("");
            setDescription("");
            setExpenseDate("");
            setValidationErrors({});
            
            // Close modal on success
            onClose();
        } catch (error) {
            console.error("Error creating expense:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
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
                    <p className='text-neutral-700'>Add new expense record</p>
                </span>

                {/* Error message */}
                {errors.create && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errors.create}
                    </div>
                )}

                {/* Modal content */}
                <div>
                    <div className="space-y-4 mt-5">
                        <div className='relative'>
                            <label className="block text-md font-bold text-gray-700">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={selectedCategory}
                                placeholder="Select option e.g., Maintenance & Repair"
                                className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:border-2 ${
                                    validationErrors.category ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-600'
                                }`}
                                readOnly
                                onClick={() => setIsToggleChevron(!isToggleChevron)}
                            />
                            {validationErrors.category && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                            )}
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
                                Amount (Naira) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="₦0.00"
                                className={`w-full border-[1.5px] rounded-lg px-3 py-2 mt-1 outline-none ${
                                    validationErrors.amount ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-700'
                                }`}
                                min="0"
                                step="0.01"
                            />
                            {validationErrors.amount && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-md font-bold text-gray-700">
                                Expense Date
                            </label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full border-[1.5px] rounded-lg px-3 py-2 mt-1 outline-none focus:border-blue-700"
                            />
                        </div>

                        <div>
                            <label className="block text-md font-bold text-gray-700">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Payment of staff salaries for the month of July"
                                className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:border-2 ${
                                    validationErrors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-700'
                                }`}
                                rows="3"
                            ></textarea>
                            {validationErrors.description && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading.create}
                                className="w-full font-semibold py-2 bg-[#0080FF] text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading.create ? "Recording..." : "Record"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddExpenseModalPage