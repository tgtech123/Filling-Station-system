'use client'
import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PlansCreationModal from './subscription/PlansCreationModal'
import PlanCards from './subscription/PlanCards'
import usePlansStore from '@/store/usePlansStore'

const Subscriptions = () => {
  const [isShow, setIsShow] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingPlanId, setDeletingPlanId] = useState(null)

  const { adminPlans, loading, fetchAdminPlans, deletePlan } = usePlansStore()

  useEffect(() => {
    fetchAdminPlans()
  }, [])

  // Normalize real API shape → PlanCards prop shape
  const normalizedPlans = adminPlans.map((p) => ({
    id: p._id || p.id,
    planName: p.name,
    price: p.monthlyPrice ?? p.price ?? 0,
    billingCycle: Array.isArray(p.billingCycles)
      ? p.billingCycles[0]?.charAt(0).toUpperCase() + p.billingCycles[0]?.slice(1)
      : p.billingCycle || 'Monthly',
    userLimit: p.staffLimits
      ? Object.entries(p.staffLimits)
          .map(([k, v]) => `${v === 999 ? 'Unlimited' : v} ${k}`)
          .join(', ')
      : p.userLimit || 'Unlimited',
    features: p.features || [],
    isActive: p.isActive !== false,
  }))

  return (
    <div className='p-9'>
      {/* Page Header */}
      <div className='flex justify-between items-start mb-8'>
        <div>
          <h1 className='text-[1.5rem] font-semibold text-neutral-900 dark:text-white'>
            Subscription Plans
          </h1>
          <span className='text-[1.125rem] text-neutral-500 dark:text-gray-400 mt-[0.7rem] block'>
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

      {/* Loading state */}
      {loading && normalizedPlans.length === 0 && (
        <p className='text-center text-gray-400 py-12 font-medium'>Loading plans...</p>
      )}

      {/* Plans grid */}
      {!loading && normalizedPlans.length > 0 && (
        <>
          <h2 className='text-lg font-semibold text-neutral-800 dark:text-gray-100 mb-4'>All Plans</h2>
          <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
            {normalizedPlans.map((plan) => (
              <PlanCards
                key={plan.id}
                plan={plan}
                onEdit={(normalizedPlan) => {
                  // Pass raw admin plan so modal gets monthlyPrice, yearlyPrice, staffLimits, etc.
                  const raw = adminPlans.find(
                    (p) => (p._id || p.id) === normalizedPlan.id
                  ) || normalizedPlan
                  setEditingPlan(raw)
                  setShowEditModal(true)
                }}
                onDelete={(planId) => {
                  setDeletingPlanId(planId)
                  setShowDeleteConfirm(true)
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && normalizedPlans.length === 0 && (
        <div className='flex flex-col items-center justify-center mt-24 text-center'>
          <div className='w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4'>
            <Plus size={28} className='text-blue-500' />
          </div>
          <h3 className='text-lg font-semibold text-neutral-700 dark:text-gray-200 mb-1'>No plans yet</h3>
          <p className='text-neutral-400 dark:text-gray-500 text-sm'>
            Click "Create New Plan" to add your first subscription plan.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl'>
            <h3 className='font-bold text-lg text-gray-900 dark:text-white mb-2'>
              Delete Plan?
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
              This will deactivate the plan and remove it from the pricing page. This cannot be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingPlanId(null)
                }}
                className='flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deletePlan(deletingPlanId)
                    setShowDeleteConfirm(false)
                    setDeletingPlanId(null)
                    await fetchAdminPlans()
                    toast.success('Plan deleted successfully')
                  } catch {
                    toast.error('Failed to delete plan')
                  }
                }}
                className='flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600'
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <PlansCreationModal
        isOpen={isShow}
        onClose={() => setIsShow(false)}
        onSuccess={() => {
          setIsShow(false)
          fetchAdminPlans()
        }}
      />

      {/* Edit Modal */}
      {showEditModal && editingPlan && (
        <PlansCreationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingPlan(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingPlan(null)
            fetchAdminPlans()
          }}
          isEdit={true}
          initialData={editingPlan}
        />
      )}
    </div>
  )
}

export default Subscriptions
