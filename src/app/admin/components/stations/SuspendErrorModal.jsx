import React from 'react'
import { X } from 'lucide-react'
import { FaCircleXmark, FaCircleExclamation  } from "react-icons/fa6";

const SuspendErrorModal = ({isOpen, onClose}) => {
    if(!isOpen) return null
  return (
    <>
         <div onClick={onClose} className='fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20'>
            <div onClick={(e) => e.stopPropagation()} className='bg-[#FFEBEE] flex items-center justify-evenly rounded-lg border-l-5 border-[#B71C1C] p-3 lg:w-[33.5rem] w-[12rem] h-auto relative'>
                <div className='flex gap-3 lg:text-[0.985rem] text-[0.575rem] items-center'>
                    <FaCircleExclamation className='text-[#B71C1C]' size={24} />
                    <p className='font-medium'>Error suspending “Exxon Mobile East” Station. Try again.</p>
                    <X onClick={onClose} size={24} className='cursor-pointer hover:bg-red-200 hover:rounded-full hover:text-red-600' />
                </div>
            </div>
        </div>
    </>
  )
}

export default SuspendErrorModal