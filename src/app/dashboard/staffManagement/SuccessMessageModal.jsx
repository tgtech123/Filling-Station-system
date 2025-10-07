import React from 'react'
import { X, Check } from 'lucide-react';

const SuccessMessageModal = ({isOpen, onClose, staffName}) => {
    if(!isOpen) return null;
  return (
    <div className='w-full inset-0 fixed z-50 bg-black/50 flex items-center justify-center h-auto'>
        <div className='bg-white p-4 rounded-2xl shadow-lg w-[32.0625rem] h-fit'>
            <div className='flex justify-between'>
                <span></span>
                <span onClick={onClose} className='hover:bg-neutral-100  text-neutral-400 hover:rounded-full flex items-center justify-center p-1 '>
                    <X size={25} />
                </span>
            </div>

            <div>
                <h1 className='flex gap-3 text-[1.5rem] items-center font-semibold text-[#04910C] mb-[2rem]'>
                    Wohoo! 
                    <Check />
                </h1>

                <p className='text-[1.125rem] text-neutral-800'>
                    {staffName ? `${staffName} has joined your team of staff in Flourish Station. Track and monitor staff progress on-the-go`
                    
                    : "A new staff has joined your team in FLourish Station"
                }
                </p>
            </div>

        </div>
    </div>
  )
}

export default SuccessMessageModal