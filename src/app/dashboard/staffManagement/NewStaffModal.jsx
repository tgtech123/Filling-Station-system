
import React from 'react'

const NewStaffModal = ({isOpen, onClose, children}) => {
    if(!isOpen) return null;
  return (
    <div onClick={onClose} className='bg-black/50 w-full flex justify-center items-center  fixed inset-0 z-50 h-auto'>
        <div onClick={(e) => e.stopPropagation()} className='bg-white lg:w-[60.1875rem] w-fit rounded-2xl max-h-[90vh] overflow-hidden'>
            <div className='overflow-y-auto max-h-[90vh] p-5'>

                <p className='mb-[2rem]'>
                    <span className=''>
                        <h1 className='text-[1.5rem] font-semibold leading-[100%] mb-[0.75rem]'>Add New Staff Member</h1>
                        <h3 className='text-[1.125rem] leading-[100%]'>Enter details of the new staff</h3>
                    </span>
                </p>

                <div>
                    <h1 className='text-[1.125rem] mb-[0.5rem] text-neutral-800'>
                        PERSONAL INFORMATION
                    </h1>

                    <hr className='border-[1px] border-neutral-100' />

                    <form action="" className='mt-[1.5rem] grid grid-cols-1 lg:grid-cols-2 gap-3'>
                        <span className='flex flex-col gap-2'>
                            <label className='text-[0.875rem] font-bold leading-[150%] text-[#323130]'>First name</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='text-[0.875rem] font-bold leading-[150%] text-[#323130]'>Last name</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='text-[0.875rem] font-bold leading-[150%] text-[#323130]'>Email</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='text-[0.875rem] font-bold leading-[150%] text-[#323130]'>Phone</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='text-[0.875rem] font-bold leading-[150%] text-[#323130]'>Temporary password</label>
                            <input type="password" placeholder='Sam' className='text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='password-[0.875rem] font-bold leading-[150%] text-[#323130]'>Confirm temporary password</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 pl-3  w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500' />
                        </span>
                    </form>

                    <hr className='border-[1px] border-neutral-100 mt-[1rem]' />

                    <h1 className='text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]'>
                        JOB INFORMATION
                    </h1>

                    <hr className='border-[1px] border-neutral-100' />
                </div>

                <div>
                    <p className='grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]'>
                        <span className='flex flex-col gap-2'>
                            <label className='font-bold text-[0.875rem]' >Role</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='font-bold text-[0.875rem]'>Shift type</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl' />
                        </span>
                    </p>

                    <span className='flex flex-col gap-2'>
                        <h1 className='font-bold text-[0.875rem]'>Responsibilities</h1>
                        <input type="text" placeholder='Overseas operations of other staffs, approves reconciled  shifts and give report to manager' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl' />
                    </span>
                </div>
                

                <div>
                    <hr className='border-[1px] border-neutral-100 mt-[1rem]' />

                    <h1 className='text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]'>
                        PAY INFORMATION
                    </h1>

                    <hr className='border-[1px] border-neutral-100 mb-[0.75rem]' />

                    <p className='grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]'>
                        <span className='flex flex-col gap-2'>
                            <label className='font-bold text-[0.875rem]' >Pay type</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl' />
                        </span>
                        <span className='flex flex-col gap-2'>
                            <label className='font-bold text-[0.875rem]'>Amount</label>
                            <input type="text" placeholder='Sam' className='text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl' />
                        </span>
                    </p>

                    <hr className='border-[1px] border-neutral-100 mb-[1.5rem] mt-[1rem]' />

                    <p className='lg:grid-cols-2 grid grid-cols-1 gap-2 w-full '>
                        <button className='bg-white border-2 cursor-pointer h-[3rem] font-bold text-blue-600 border-blue-600 rounded-2xl'>
                            Cancel
                        </button>

                        <button className='bg-blue-600 outline-none cursor-pointer h-[3rem] rounded-2xl font-bold text-white '>Add Staff Member</button>
                    </p>

                </div>
            </div>
        
        </div>
        
    </div>
  )
}

export default NewStaffModal