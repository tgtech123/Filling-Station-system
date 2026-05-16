'use client'
import React, { useState } from 'react'
import { IoCloseOutline } from "react-icons/io5";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { Info } from "lucide-react";
import { useExpenseStore } from '@/store/expenseStore';

const VAT_RATE = 7.5;

const AddExpenseModal = ({ isOpen, onClose }) => {
    const [isToggleChevron, setIsToggleChevron] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [hasVAT, setHasVAT] = useState(false);
    const [vatMode, setVatMode] = useState("auto"); // "auto" | "manual"
    const [manualVAT, setManualVAT] = useState("");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const { createExpense, loading, errors } = useExpenseStore();

    if (!isOpen) return null;

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

    // Categories where VAT is typically applicable
    const vatApplicableCategories = [
        "Maintenance & Repair",
        "Operational",
        "Utilities",
        "Administrative",
        "Other Expenses",
        "Product purchase",
    ];

    const netAmount   = parseFloat(amount) || 0;
    const autoVAT     = parseFloat(((netAmount * VAT_RATE) / 100).toFixed(2));
    const vatAmount   = hasVAT ? (vatMode === "auto" ? autoVAT : (parseFloat(manualVAT) || 0)) : 0;
    const totalInvoice = netAmount + vatAmount;

    const handleSelect = (category) => {
        setSelectedCategory(category);
        setIsToggleChevron(false);
        // Auto-suggest VAT toggle for applicable categories
        if (vatApplicableCategories.includes(category)) {
            setHasVAT(true);
        } else {
            setHasVAT(false);
        }
    };

    const validateForm = () => {
        const errs = {};
        if (!selectedCategory)                    errs.category    = "Category is required";
        if (!amount || parseFloat(amount) <= 0)   errs.amount      = "Amount is required and must be greater than 0";
        if (!description.trim())                  errs.description = "Description is required";
        if (hasVAT && vatMode === "manual" && (!manualVAT || parseFloat(manualVAT) < 0))
                                                  errs.vatAmount   = "Enter a valid VAT amount (0 or more)";
        setValidationErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const expenseData = {
                category: selectedCategory,
                amount: parseFloat(amount),
                vatAmount: vatAmount,
                description,
                ...(expenseDate && { expenseDate }),
            };
            await createExpense(expenseData);
            // Reset
            setSelectedCategory(""); setAmount(""); setHasVAT(false);
            setVatMode("auto"); setManualVAT(""); setDescription("");
            setExpenseDate(""); setValidationErrors({});
            onClose();
        } catch (error) {
            console.error("Error creating expense:", error);
        }
    };

    const inputCls = (err) =>
        `w-full border-[1.5px] rounded-lg px-3 py-2 mt-1 outline-none ${err ? 'border-red-500' : 'focus:border-blue-700'}`;

    return (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
            <div onClick={onClose} className="absolute inset-0 bg-black opacity-50" />
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">

                {/* Close */}
                <button onClick={onClose} className="absolute top-3 right-6 cursor-pointer text-gray-600 hover:text-gray-900">
                    <IoCloseOutline size={32} />
                </button>

                {/* Title */}
                <span className="mb-4 flex flex-col gap-1">
                    <h1 className="font-bold text-lg text-neutral-700">Record Expense</h1>
                    <p className="text-sm text-neutral-500">Add new expense record</p>
                </span>

                {errors.create && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {errors.create}
                    </div>
                )}

                <div className="space-y-4 mt-2">

                    {/* Category */}
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={selectedCategory}
                            placeholder="Select category"
                            className={inputCls(validationErrors.category)}
                            readOnly
                            onClick={() => setIsToggleChevron(!isToggleChevron)}
                        />
                        {validationErrors.category && <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>}
                        <span onClick={() => setIsToggleChevron(!isToggleChevron)} className="absolute top-9 right-4 cursor-pointer">
                            {isToggleChevron ? <GoChevronUp size={22} /> : <GoChevronDown size={22} />}
                        </span>
                        {isToggleChevron && (
                            <div className="absolute mt-1 flex flex-col w-full bg-white border-[1.5px] border-blue-600 rounded-lg shadow-md z-10 max-h-56 overflow-y-auto">
                                {categories.map((cat, i) => (
                                    <div key={i} onClick={() => handleSelect(cat)}
                                        className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer text-sm">
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Net Amount */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700">
                            Net Amount — pre-VAT (₦) <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-0.5 mb-1">
                            Enter the amount <strong>before VAT</strong> e.g. ₦100,000 for a ₦107,500 invoice
                        </p>
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="e.g. 100000"
                            className={inputCls(validationErrors.amount)}
                            min="0" step="0.01"
                        />
                        {validationErrors.amount && <p className="text-red-500 text-xs mt-1">{validationErrors.amount}</p>}
                    </div>

                    {/* VAT Toggle */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-700">VAT on this invoice?</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Only if the supplier is VAT-registered and issued a tax invoice
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHasVAT(v => !v)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${hasVAT ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasVAT ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {hasVAT && (
                            <div className="mt-3 space-y-3">
                                {/* Auto vs Manual */}
                                <div className="flex gap-2">
                                    <button type="button"
                                        onClick={() => setVatMode("auto")}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${vatMode === "auto" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                        Auto (7.5%)
                                    </button>
                                    <button type="button"
                                        onClick={() => setVatMode("manual")}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${vatMode === "manual" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                        Enter manually
                                    </button>
                                </div>

                                {vatMode === "manual" ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">VAT Amount (₦)</label>
                                        <input
                                            type="number" value={manualVAT}
                                            onChange={e => setManualVAT(e.target.value)}
                                            placeholder="e.g. 7500"
                                            className={inputCls(validationErrors.vatAmount)}
                                            min="0" step="0.01"
                                        />
                                        {validationErrors.vatAmount && <p className="text-red-500 text-xs mt-1">{validationErrors.vatAmount}</p>}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                                        <span className="text-xs text-gray-500">VAT (7.5% of ₦{netAmount.toLocaleString()})</span>
                                        <span className="text-sm font-bold text-blue-700">₦{autoVAT.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                {/* Invoice summary */}
                                {netAmount > 0 && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-3 space-y-1.5">
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>Net amount (pre-VAT)</span>
                                            <span className="font-mono">₦{netAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>VAT (input — claimable from FIRS)</span>
                                            <span className="font-mono text-green-700">₦{vatAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-gray-800 border-t border-blue-100 pt-1.5 mt-1">
                                            <span>Total you pay to supplier</span>
                                            <span className="font-mono">₦{totalInvoice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    <Info size={13} className="shrink-0 mt-0.5" />
                                    The VAT amount is claimed back as <strong>input VAT</strong> on your FIRS monthly return — it reduces what you owe FIRS.
                                    Keep the supplier's tax invoice (showing their TIN) as proof.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Expense Date</label>
                        <input
                            type="date" value={expenseDate}
                            onChange={e => setExpenseDate(e.target.value)}
                            className="w-full border-[1.5px] rounded-lg px-3 py-2 mt-1 outline-none focus:border-blue-700"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Generator repair — paid to ABC Engineering"
                            className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:border-2 ${validationErrors.description ? 'border-red-500' : 'focus:border-blue-700'}`}
                            rows="3"
                        />
                        {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading.create}
                        className="w-full font-semibold py-2.5 bg-[#0080FF] text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading.create ? "Recording..." : "Record Expense"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
