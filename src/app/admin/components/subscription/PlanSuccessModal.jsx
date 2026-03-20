import React from 'react'
import { X } from 'lucide-react';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";


const PlanSuccessModal = ({isOpen, onClose, planName}) => {
    if(!isOpen) return null
  return (
    <div className='flex fixed inset-0 z-50 bg-black/50 items-center justify-center w-full'>
        <div onClick={(e) => e.stopPropagation()} className='bg-white w-[25.438rem] p-5 h-auto flex flex-col items-center justify-center rounded-2xl'>
            
            <span onClick={onClose} className='flex w-fit ml-auto border-[1.7px] border-neutral-400 cursor-pointer hover:bg-neutral-100 rounded-full p-1 '>
                <X  className='text-neutral-400 hover:text-red-300 ' size={24} />
            </span>

            <span className='flex items-center justify-center bg-[#ECFDF5] w-[60px] h-[60px] rounded-full'>
                <IoMdCheckmarkCircleOutline size={24} className='text-green-600' />
            </span>

            <div className='mt-[2rem] flex flex-col items-center'>
                <h1 className='text-[1.75rem] font-bold leading-[134%] '>Subscription Plan Created!</h1>
                <p className='text-[1rem] text-neutral-400 font-medium mt-[1rem]'>
                    “{planName}” has been successfully created
                </p>
            </div>
        </div>
    </div>
  )
}

export default PlanSuccessModal