
'use client'
import React, { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { BsToggleOn, BsToggleOff } from "react-icons/bs"

const PlanCards = ({ plan, onDelete, onEdit }) => {
  const [isActive, setIsActive] = useState(plan.isActive)

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 border border-neutral-200 dark:border-gray-700 flex flex-col gap-3 shadow-sm'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h2 className='font-bold text-xl text-neutral-900 dark:text-white'>{plan.planName}</h2>
          <p className='text-neutral-500 dark:text-gray-400 text-sm mt-0.5'>{plan.billingCycle || 'Monthly'}</p>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span className={`px-3 py-1 rounded-2xl text-md font-semibold ${isActive ? "text-green-700 font-semibold bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-neutral-500 bg-neutral-200 dark:bg-gray-700 dark:text-gray-400"}`}>{isActive ? "Active" : "Inactive"}</span>
          <button onClick={() => setIsActive(p => !p)}>
            {isActive
              ? <BsToggleOn size={34} className='text-blue-600' />
              : <BsToggleOff size={34} className='text-gray-400' />
            }
          </button>
        </div>
      </div>

      {/* Price */}
      <p className='text-4xl font-bold text-neutral-900 dark:text-white'>
        ₦{plan.price}
        <span className="text-base font-normal text-neutral-500 dark:text-gray-400">{plan.billingCycle === "Monthly" ? "/mo" : "/yr"} </span>
      </p>

      {/* User Limit */}
      <div>
        <p className='text-sm text-neutral-500 dark:text-gray-400'>User Limit</p>
        <p className='font-medium text-neutral-900 dark:text-white'>{plan.userLimit || 'Unlimited'}</p>
      </div>

      {/* Features */}
      {plan.features?.length > 0 && (
        <div>
          <p className='text-sm text-neutral-500 dark:text-gray-400 mb-2'>What's included:</p>
          <ul className='flex flex-col gap-1.5'>
            {plan.features.map((feature, i) => (
              <li key={i} className='flex items-center gap-2 text-sm text-neutral-800 dark:text-gray-100'>
                <span className='text-green-500 font-bold text-base'>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-2 mt-4'>
        <button
          onClick={() => onEdit(plan)}
          className='flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className='flex items-center gap-1 px-3 py-1.5 text-sm border border-red-400 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  )
}

export default PlanCards
