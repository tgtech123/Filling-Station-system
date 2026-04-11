"use client"
import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { BsToggleOn, BsToggleOff } from "react-icons/bs"
import Multiselect from 'multiselect-react-dropdown'
import toast from 'react-hot-toast'
import PlanSuccessModal from './PlanSuccessModal'
import usePlansStore from '@/store/usePlansStore'

const PlansCreationModal = ({ isOpen, onClose, onSuccess, isEdit = false, initialData = null }) => {
  const [options] = useState([
    { id: 1,  name: "Basic Reporting" },
    { id: 2,  name: "Full Reporting" },
    { id: 3,  name: "Community Support" },
    { id: 4,  name: "Limited Reporting" },
    { id: 5,  name: "24/7 Reporting" },
    { id: 6,  name: "Advance Reporting" },
    { id: 7,  name: "Priority Support" },
    { id: 8,  name: "Email Support" },
    { id: 9,  name: "5 Admin Users" },
    { id: 10, name: "1 Admin User" },
    { id: 11, name: "2 Admin Users" },
    { id: 12, name: "Unlimited Admin Users" },
  ])
  const [selectedValue, setSelectedValue] = useState([])
  const [isSuccessOpen, setIsSuccesOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createPlan, updatePlan, fetchAdminPlans } = usePlansStore()

  // Form fields
  const [planName, setPlanName] = useState("")
  const [userLimit, setUserLimit] = useState("")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("")

  // Password fields
  const [tempPassword, setTempPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isEyeOpen, setIsEyeOpen] = useState(false)
  const [isEyeOpenTwo, setIsEyeOpenTwo] = useState(false)

  // Toggles
  const [isToggleOn, setIsToggleOn] = useState(false)
  const [isMovedOn, setIsMovedOn] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && initialData) {
      setPlanName(initialData.name || initialData.planName || "")
      setPrice(
        initialData.monthlyPrice != null
          ? String(initialData.monthlyPrice)
          : initialData.price != null
          ? String(initialData.price)
          : ""
      )
      setBillingCycle(
        Array.isArray(initialData.billingCycles) && initialData.billingCycles[0]
          ? initialData.billingCycles[0].charAt(0).toUpperCase() + initialData.billingCycles[0].slice(1)
          : initialData.billingCycle || ""
      )
      setUserLimit(initialData.userLimit || "")
      setIsToggleOn(initialData.isActive !== false)
      setIsMovedOn(initialData.freeTrial || false)
      // Match string features back to options objects
      const matched = (initialData.features || []).map(
        (f) => options.find((o) => o.name === f) || { id: f, name: f }
      )
      setSelectedValue(matched)
    }
  }, [isEdit, initialData])

  const onSelect = (selectedList) => setSelectedValue(selectedList)
  const onRemove = (selectedList) => setSelectedValue(selectedList)

  if (!isOpen) return null

  // ── Reset form ──
  const resetForm = () => {
    setPlanName("")
    setUserLimit("")
    setPrice("")
    setBillingCycle("")
    setTempPassword("")
    setConfirmPassword("")
    setIsEyeOpen(false)
    setIsEyeOpenTwo(false)
    setIsToggleOn(false)
    setIsMovedOn(false)
    setSelectedValue([])
  }

  // ── Submit handler ──
  const handleSubmit = async () => {
    if (!planName || !price) {
      alert("Please fill in at least Plan Name and Price.")
      return
    }
    setIsSubmitting(true)
    try {
      const planData = {
        name: planName,
        price: Number(price),
        monthlyPrice: billingCycle === "Yearly" ? 0 : Number(price),
        yearlyPrice: billingCycle === "Yearly" ? Number(price) : 0,
        billingCycles: [(billingCycle || "Monthly").toLowerCase()],
        userLimit,
        features: selectedValue.map((item) => item.name),
        isActive: isToggleOn,
        freeTrial: isMovedOn,
      }

      if (isEdit) {
        const planId = initialData?._id || initialData?.id
        const result = await updatePlan(planId, planData)
        if (result.success) {
          await fetchAdminPlans()
          toast.success("Plan updated!")
          resetForm()
          if (onSuccess) onSuccess()
          else onClose()
        } else {
          alert(result.error || "Failed to update plan. Please try again.")
        }
      } else {
        const result = await createPlan(planData)
        if (result.success) {
          setIsSuccesOpen(true)
        } else {
          alert(result.error || "Failed to create plan. Please try again.")
        }
      }
    } catch {
      alert(`An error occurred while ${isEdit ? "updating" : "creating"} the plan.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setIsSuccesOpen(false)
    resetForm()
    if (onSuccess) onSuccess()
    else onClose()
  }

  // ── Cancel handler ──
  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <div className='flex fixed inset-0 px-4 lg:px-0 z-50 items-center justify-center bg-black/50'>
      <div className='bg-white dark:bg-gray-800 lg:w-[43rem] lg:max-h-[90vh] max-h-[85vh] h-auto w-fit p-8 rounded-2xl overflow-y-scroll scrollbar-hide'>

        {/* Close button */}
        <div className='flex justify-end mt-[2rem]'>
          <span
            onClick={handleCancel}
            className='p-2 border-[1px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-gray-700 border-neutral-500 dark:border-gray-500 rounded-full'
          >
            <X size={24} className='dark:text-gray-200' />
          </span>
        </div>

        {/* Title */}
        <div className='mb-[2rem]'>
          <h1 className='text-[1.5rem] font-semibold leading-[100%] text-neutral-900 dark:text-white mb-[0.8rem]'>
            {isEdit ? "Edit Subscription Plan" : "Create New Subscription Plan"}
          </h1>
          <p className='text-[1.025rem] leading-[100%] text-neutral-800 dark:text-gray-300'>
            {isEdit
              ? "Update the subscription tier details below"
              : "Define a new subscription tier for filling station customers"}
          </p>
        </div>

        <div>
          {/* Row 1: Plan Name + User Limit */}
          <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mb-[1rem]'>
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Plan Name</label>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-2 outline-none hover:border-blue-600'
              >
                <option value="">Choose Plan</option>
                <option value="Professionals">Professionals</option>
                <option value="Prime">Prime</option>
                <option value="Basic">Basic</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Plus">Plus</option>
                <option value="Trial">Trial</option>
                <option value="Starter Ledger">Starter Ledger</option>
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>User Limit</label>
              <select
                value={userLimit}
                onChange={(e) => setUserLimit(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-2 outline-none hover:border-blue-600'
              >
                <option value="">Choose Limit</option>
                <option value="2 Users">2 Users</option>
                <option value="5 Users">5 Users</option>
                <option value="7 Users">7 Users</option>
                <option value="10 Users">10 Users</option>
                <option value="15 Users">15 Users</option>
                <option value="20 Users">20 Users</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>
          </div>

          {/* Plan Features */}
          <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Plan Features</label>
          <div className='w-full h-auto mt-[0.5rem] flex flex-col gap-2 rounded-lg border-[2px] border-neutral-500 dark:border-gray-600 outline-none p-3'>
            <Multiselect
              options={options}
              selectedValues={selectedValue}
              onSelect={onSelect}
              onRemove={onRemove}
              displayValue='name'
              placeholder='Select Features'
              customArrow={<ChevronDown size={26} />}
              style={{
                searchBox: {
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  fontSize: "0.875rem",
                },
                chips: {
                  backgroundColor: "black",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  fontSize: '0.875rem',
                  fontWeight: '600',
                },
              }}
            />
          </div>

          {/* Row 2: Passwords + Price + Billing */}
          <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mt-[2rem]'>
            {/* Temp Password */}
            <div className='flex flex-col relative gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Temporary Password</label>
              <input
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                type={isEyeOpen ? "text" : "password"}
                placeholder='*************'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-3 pr-10 outline-none hover:border-blue-600'
              />
              <button
                type='button'
                onClick={() => setIsEyeOpen(prev => !prev)}
                className="absolute top-9 right-3 text-neutral-600 dark:text-gray-400"
              >
                {isEyeOpen ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className='flex flex-col relative gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Confirm temporary password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={isEyeOpenTwo ? "text" : "password"}
                placeholder='*************'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-3 pr-10 outline-none hover:border-blue-600'
              />
              <button
                type='button'
                onClick={() => setIsEyeOpenTwo(prev => !prev)}
                className='absolute top-9 right-3 text-neutral-500 dark:text-gray-400'
              >
                {isEyeOpenTwo ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Price */}
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder='$'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-3 outline-none hover:border-blue-600'
              />
            </div>

            {/* Billing Cycle */}
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%] dark:text-gray-200'>Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 rounded-lg pl-2 outline-none hover:border-blue-600'
              >
                <option value="">Select Bills</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* OTHERS Section */}
          <hr className='mt-[2rem] border-1 dark:border-gray-600' />
          <div className='mt-[1.575rem]'>
            <h1 className='text-neutral-800 dark:text-gray-100 text-[1.125rem] font-semibold leading-[100%]'>OTHERS</h1>
            <hr className='mt-[1.575rem] border-1 dark:border-gray-600' />

            {/* Plan Status */}
            <div className='flex justify-between mt-[1.375rem] p-4 border border-neutral-300 dark:border-gray-600 rounded-xl'>
              <p className='flex flex-col text-[#6B6B6B] dark:text-gray-400 gap-2'>
                <span className='text-[1.125rem] text-neutral-900 dark:text-white font-semibold leading-[100%]'>
                  Plan Status
                </span>
                This plan is active and visible to customers
              </p>
              <button
                type='button'
                onClick={() => setIsToggleOn(prev => !prev)}
                className='flex items-center justify-center'
              >
                {isToggleOn
                  ? <BsToggleOn size={32} className='text-[#1A71F6]' />
                  : <BsToggleOff size={32} className='text-gray-400' />
                }
              </button>
            </div>

            {/* Allow Free Trial */}
            <div className='flex justify-between mt-[1.375rem] p-4 border border-neutral-300 dark:border-gray-600 rounded-xl'>
              <p className='flex flex-col text-[#6B6B6B] dark:text-gray-400 gap-2'>
                <span className='text-[1.125rem] text-neutral-900 dark:text-white font-semibold leading-[100%]'>
                  Allow Free Trial
                </span>
                Offer a trial period for new customers
              </p>
              <button
                type='button'
                onClick={() => setIsMovedOn(prev => !prev)}
                className='flex items-center justify-center'
              >
                {isMovedOn
                  ? <BsToggleOn size={32} className='text-[#1A71F6]' />
                  : <BsToggleOff size={32} className='text-gray-400' />
                }
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className='grid lg:grid-cols-2 mt-[1.675rem] gap-4'>
            <button
              type='button'
              onClick={handleCancel}
              className='flex-1 w-full text-blue-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold p-2 lg:p-3 items-center justify-center border-2 border-blue-600 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='flex-1 w-full font-semibold hover:bg-blue-800 p-2 lg:p-3 items-center justify-center bg-blue-600 rounded-lg text-white transition-colors disabled:opacity-60'
            >
              {isSubmitting
                ? (isEdit ? "Updating..." : "Creating...")
                : (isEdit ? "Update Plan" : "Create Plan")}
            </button>
          </div>
          <PlanSuccessModal isOpen={isSuccessOpen} onClose={handleSuccessClose} planName={planName} />
        </div>
      </div>
    </div>
  )
}

export default PlansCreationModal
