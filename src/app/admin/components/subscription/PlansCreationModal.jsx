import React from 'react'
import { X } from 'lucide-react'

const PlansCreationModal = ({isOpen, onClose}) => {
    if(!isOpen) return null

  return (
    <div className='flex fixed inset-0 px-4 lg:px-0 z-50 items-center justify-center bg-black/50'>
        <div  className='bg-white w-[43rem] p-5 rounded-2xl'>
                <div className='flex justify-end mt-[2rem]'>
                    <span onClick={onClose} className='p-2 border-[1px] cursor-pointer hover:bg-neutral-100  border-neutral-500 rounded-full'>
                        <X size={24} />
                    </span>
                </div>

            <div className='mb-[2rem]'>
                <h1 className='text-[1.5rem] font-semibold leading-[100%] text-neutral-900 mb-[0.8rem]'>
                    Create New Subscription Plan
                </h1>
                <p className='text-[1.025rem] leading-[100%] text-neutral-800 '>
                    Define a new subscription tier for filling station customers                
                </p>                
            </div>

            <div>
                <form action="" >
                    <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mb-[1rem]'>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                    Plan Name
                                </label>
                                <select type="text" placeholder='Enter plan name ' className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600' >
                                    <option value="">Choose Plan</option>
                                    <option value="">Professionals</option>
                                    <option value="">Prime</option>
                                    <option value="">Basic</option>
                                    <option value="">Enterprise</option>
                                </select>

                        </div>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                    User Limit
                                </label>
                                <select name="" id="" className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
                                    <option value="">Choose Limit</option>
                                    <option value="">2</option>
                                    <option value="">5</option>
                                    <option value="">7</option>
                                    <option value="">10</option>
                                    <option value="">15</option>
                                    <option value="">Unlimited</option>
                                </select>
                        </div>
                    </div>
                    <label className='text-[0.9rem] font-bold leading-[150%] '>Plan Features</label>
                    <textarea name="" id="" placeholder='e.g Basic Reporting' className='w-full h-[10.875rem] mt-[0.5rem] rounded-lg border-[2px] border-neutral-500 hover:border-blue-600 outline-none p-3'>
                    </textarea>

                    <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mt-[2rem]'>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                    Temporary Password
                                </label>
                                <select name="" id="" className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
                                    <option value="">Choose Limit</option>
                                    <option value="">2</option>
                                    <option value="">5</option>
                                    <option value="">7</option>
                                    <option value="">10</option>
                                    <option value="">15</option>
                                    <option value="">Unlimited</option>
                                </select>
                        </div>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                    Confirm temporary password
                                </label>
                                <select name="" id="" className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
                                    <option value="">Choose Limit</option>
                                    <option value="">2</option>
                                    <option value="">5</option>
                                    <option value="">7</option>
                                    <option value="">10</option>
                                    <option value="">15</option>
                                    <option value="">Unlimited</option>
                                </select>
                        </div>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                    Price
                                </label>
                                <input name="" id="" placeholder='$' className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'/>
                                    
                               
                        </div>
                        <div className='flex flex-col'>
                                <label className='text-[0.9rem] font-bold leading-[150%]' >
                                   Billing Cycle
                                </label>
                                <select name="" id="" className='w-[19.125rem] h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
                                    <option value="">Select Bills</option>
                                    <option value="">Monthly</option>
                                    <option value="">Yearly</option>
                                    
                                </select>
                        </div>
                    </div>
                </form>
            </div>

            

        </div>
    </div>
  )
}

export default PlansCreationModal