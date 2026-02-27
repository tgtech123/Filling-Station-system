
'use client'
import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { BsToggleOn, BsToggleOff } from "react-icons/bs"
import PlansCreationModal from './PlansCreationModal'

const PlanCards = ({ plan, onDelete }) => {
  const [isActive, setIsActive] = useState(plan.isActive)

  return (
    <div className='bg-white rounded-2xl p-6 border border-neutral-200 flex flex-col gap-3 shadow-sm'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h2 className='font-bold text-xl text-neutral-900'>{plan.planName}</h2>
          <p className='text-neutral-500 text-sm mt-0.5'>{plan.billingCycle || 'Monthly'}</p>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span className={`text-[#07834B] bg-[#F1F9F1] px-3 py-1 rounded-2xl text-md font-semibold ${isActive  ? "text-green-700 font-semibold bg-green-100" : "text-neutral-500 bg-neutral-200"}`}>{isActive ? "Active" : "Inactive"}</span>
          <button onClick={() => setIsActive(p => !p)}>
            {isActive
              ? <BsToggleOn size={34} className='text-blue-600' />
              : <BsToggleOff size={34} className='text-gray-400' />
            }
          </button>
        </div>
      </div>

      {/* Price */}
      <p className='text-4xl font-bold text-neutral-900'>
        ₦{plan.price}
        <span className='text-base font-normal text-neutral-500'> /mo</span>
      </p>

      {/* User Limit */}
      <div>
        <p className='text-sm text-neutral-500'>User Limit</p>
        <p className='font-medium text-neutral-900'>{plan.userLimit || 'Unlimited'}</p>
      </div>

      {/* Features */}
      {plan.features?.length > 0 && (
        <div>
          <p className='text-sm text-neutral-500 mb-2'>What's included:</p>
          <ul className='flex flex-col gap-1.5'>
            {plan.features.map((feature, i) => (
              <li key={i} className='flex items-center gap-2 text-sm text-neutral-800'>
                <span className='text-green-500 font-bold text-base'>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex flex-col gap-2 mt-auto pt-2'>
        <button className='w-full border border-neutral-300 rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors'>
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className='w-full border border-neutral-300 rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors'
        >
          <Trash2 size={14} /> Delete Plan
        </button>
      </div>
    </div>
  )
}

export default PlanCards