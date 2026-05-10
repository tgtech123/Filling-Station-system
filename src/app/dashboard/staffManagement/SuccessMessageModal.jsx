import React from 'react'
import { X, Check } from 'lucide-react';

const SuccessMessageModal = ({isOpen, onClose, staffName}) => {
    if(!isOpen) return null;
  return (
    <div className='w-full inset-0 fixed z-50 bg-black/50 flex items-center justify-center h-auto'>
        <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[32.0625rem] h-fit'>
            <div className='flex justify-between'>
                <span></span>
                <span onClick={onClose} className='bg-green-100 dark:bg-green-900/40 rounded-md text-green-600 dark:text-green-400 cursor-pointer flex items-center justify-center px-4 py-1'>
                    Done
                </span>
            </div>

            <div className='mt-4'>
                <h1 className='flex gap-3 text-[2.5rem] justify-center items-center font-semibold text-[#04910C] dark:text-green-400 mb-[1.5rem]'>
                    Wohoo!
                    <Check />
                </h1>

                <p className="text-[1.125rem] text-center text-neutral-700 dark:text-gray-300">
                    {staffName ? (
                        <>
                        <strong className="font-bold text-[1.25rem] text-gray-900 dark:text-white">{staffName}</strong> has joined your team of staff in Flourish Station.
                        Track and monitor staff progress on-the-go.
                        </>
                    ) : (
                        "A new staff has joined your team in Flourish Station."
                    )}
                </p>
            </div>
        </div>
    </div>
  )
}

export default SuccessMessageModal