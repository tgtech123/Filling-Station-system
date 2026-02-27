import React from 'react'
import { X  } from 'lucide-react'
import { FaCircleCheck } from "react-icons/fa6";

const ResetModal = ({isOpen, onClose}) => {
    if(!isOpen) return null

  return (
    <>
        <div onClick={onClose} className='fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20  '>
        <div onClick={(e) => e.stopPropagation()} className='bg-[#E8F5E9] flex items-center justify-center rounded-lg border-l-5 border-[#07834B] p-3 lg:w-[54.875rem] w-[12rem]  h-auto relative '>
            <div className='flex gap-3 text-[1.537rem] items-center '>
                <FaCircleCheck  className='text-[#07834B]' size={24} />
                <p className='font-medium'>“Exxon Mobile East” Station  password has been reset successfully. </p>
                
                <X onClick={onClose} size={28} className='cursor-pointer' />
            </div>
        </div>
    </div>
    </>
  )
}

export default ResetModal