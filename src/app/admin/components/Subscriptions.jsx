
'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import PlansCreationModal from './subscription/PlansCreationModal'
import PlanCards from './subscription/PlanCards'



const Subscriptions = () => {
  const [isShow, setIsShow] = useState(false)
  const [plans, setPlans] = useState([])

  const handleCreatePlan = (newPlan) => {
    setPlans(prev => [...prev, newPlan])
  }

  const handleDeletePlan = (id) => {
    setPlans(prev => prev.filter(plan => plan.id !== id))
  }

  return (
    <div className='p-9'>
      {/* Page Header */}
      <div className='flex justify-between items-start mb-8'>
        <div>
          <h1 className='text-[1.5rem] font-semibold text-neutral-900'>
            Subscription Plans
          </h1>
          <span className='text-[1.125rem] text-neutral-500 mt-[0.7rem] block'>
            Create and manage subscription tiers for filling stations
          </span>
        </div>

        <button
          onClick={() => setIsShow(true)}
          className='flex hover:bg-blue-700 gap-3 bg-blue-600 items-center justify-center px-5 py-3 text-base font-semibold text-white rounded-2xl cursor-pointer transition-colors'
        >
          <Plus size={20} />
          Create New Plan
        </button>
      </div>

      {/* Plans Section */}
      {plans.length > 0 && (
        <>
          <h2 className='text-lg font-semibold text-neutral-800 mb-4'>Monthly Plans</h2>
          <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
            {plans.map(plan => (
              <PlanCards key={plan.id} plan={plan} onDelete={handleDeletePlan} />
            ))}
          </div>
        </>
      )}
      
      {/* Empty State */}
      {plans.length === 0 && (
        <div className='flex flex-col items-center justify-center mt-24 text-center'>
          <div className='w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4'>
            <Plus size={28} className='text-blue-500' />
          </div>
          <h3 className='text-lg font-semibold text-neutral-700 mb-1'>No plans yet</h3>
          <p className='text-neutral-400 text-sm'>Click "Create New Plan" to add your first subscription plan.</p>
        </div>
      )}
          
      {/* Modal */}
      <PlansCreationModal 
        isOpen={isShow}
        onClose={() => setIsShow(false)}
        onSubmit={handleCreatePlan}
      />
    </div>
    
  )
}

export default Subscriptions


// const Subscriptions = () => {
//   const [isShow, setIsShow] =useState(false)

//   return (
//     <div className='p-9 '>
//       <div className='flex justify-between'>
//         <div className=''>
//           <h1 className='text-[1.5rem] font-semibold'>
//             Subscription Plans
//           </h1>
//           <span className='text-[1.125rem] text-neutral-500 mt-[0.7rem] '>Create and manage subscription tiers for filling stations</span>
//         </div>

//             <button onClick={()=> setIsShow(true)} className='flex hover:bg-blue-700 gap-3 bg-blue-600 items-center justify-center px-3 text-lg font-semibold text-white rounded-2xl cursor-pointer'>
//               <Plus size={24} />
//               Create New Plan

//             </button>
//             <PlansCreationModal isOpen={isShow} onClose={()=> setIsShow(false)} />
        
 
//       </div>
//     </div>
//   )
// }

// export default Subscriptions