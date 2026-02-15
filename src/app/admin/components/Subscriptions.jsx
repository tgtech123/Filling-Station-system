'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import PlansCreationModal from './subscription/PlansCreationModal'

const Subscriptions = () => {
  const [isShow, setIsShow] =useState(false)

  return (
    <div className='p-9 '>
      <div className='flex justify-between'>
        <div className=''>
          <h1 className='text-[1.5rem] font-semibold'>
            Subscription Plans
          </h1>
          <span className='text-[1.125rem] text-neutral-500 mt-[0.7rem] '>Create and manage subscription tiers for filling stations</span>
        </div>

            <button onClick={()=> setIsShow(true)} className='flex hover:bg-blue-700 gap-3 bg-blue-600 items-center justify-center px-3 text-lg font-semibold text-white rounded-2xl cursor-pointer'>
              <Plus size={24} />
              Create New Plan

            </button>
            <PlansCreationModal isOpen={isShow} onClose={()=> setIsShow(false)} />
        

      </div>
    </div>
  )
}

export default Subscriptions