"use client"
import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { BsToggleOn, BsToggleOff } from "react-icons/bs"

const PlansCreationModal = ({ isOpen, onClose, onSubmit }) => {
  // Form fields
  const [planName, setPlanName] = useState("")
  const [userLimit, setUserLimit] = useState("")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("")

  // Features tag input
  const [myArray, setMyArray] = useState([])
  const [planInput, setPlanInput] = useState("")

  // Password fields
  const [tempPassword, setTempPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isEyeOpen, setIsEyeOpen] = useState(false)
  const [isEyeOpenTwo, setIsEyeOpenTwo] = useState(false)

  // Toggles
  const [isToggleOn, setIsToggleOn] = useState(false)
  const [isMovedOn, setIsMovedOn] = useState(false)

  if (!isOpen) return null

  // ── Feature tag handlers ──
  const handleAddPlan = () => {
    if (planInput.trim() === "") return
    setMyArray(prev => [...prev, planInput.trim()])
    setPlanInput("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddPlan()
    }
  }

  const handleDelete = (index) => {
    setMyArray(prev => prev.filter((_, i) => i !== index))
  }

  // ── Reset form ──
  const resetForm = () => {
    setPlanName("")
    setUserLimit("")
    setPrice("")
    setBillingCycle("")
    setMyArray([])
    setPlanInput("")
    setTempPassword("")
    setConfirmPassword("")
    setIsEyeOpen(false)
    setIsEyeOpenTwo(false)
    setIsToggleOn(false)
    setIsMovedOn(false)
  }

  // ── Submit handler ──
  const handleSubmit = () => {
    if (!planName || !price) {
      alert("Please fill in at least Plan Name and Price.")
      return
    }

    onSubmit({
      id: Date.now(),
      planName,
      userLimit,
      features: myArray,
      price,
      billingCycle: billingCycle || "Monthly",
      isActive: isToggleOn,
      freeTrial: isMovedOn,
    })

    resetForm()
    onClose()
  }

  // ── Cancel handler ──
  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <div className='flex fixed inset-0 px-4 lg:px-0 z-50 items-center justify-center bg-black/50'>
      <div className='bg-white lg:w-[43rem] lg:max-h-[90vh] max-h-[85vh] h-auto w-fit p-8 rounded-2xl overflow-y-scroll scrollbar-hide'>

        {/* Close button */}
        <div className='flex justify-end mt-[2rem]'>
          <span
            onClick={handleCancel}
            className='p-2 border-[1px] cursor-pointer hover:bg-neutral-100 border-neutral-500 rounded-full'
          >
            <X size={24} />
          </span>
        </div>

        {/* Title */}
        <div className='mb-[2rem]'>
          <h1 className='text-[1.5rem] font-semibold leading-[100%] text-neutral-900 mb-[0.8rem]'>
            Create New Subscription Plan
          </h1>
          <p className='text-[1.025rem] leading-[100%] text-neutral-800'>
            Define a new subscription tier for filling station customers
          </p>
        </div>

        <div>
          {/* Row 1: Plan Name + User Limit */}
          <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mb-[1rem]'>
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%]'>Plan Name</label>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'
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
              <label className='text-[0.9rem] font-bold leading-[150%]'>User Limit</label>
              <select
                value={userLimit}
                onChange={(e) => setUserLimit(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'
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
          <label className='text-[0.9rem] font-bold leading-[150%]'>Plan Features</label>
          <div className='w-full h-auto mt-[0.5rem] flex flex-col gap-2 rounded-lg border-[2px] border-neutral-500 outline-none p-3'>
            <span className='flex gap-3'>
              <input
                value={planInput}
                onChange={(e) => setPlanInput(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder='e.g Basic Reporting'
                className='pl-3 px-5 py-3 rounded-lg border-2 focus:border-2 focus:border-blue-600 outline-none flex-1'
              />
              <button
                type='button'
                onClick={handleAddPlan}
                className='flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-400'
              >
                + Add
              </button>
            </span>

            {/* Feature Tags */}
            {myArray.length > 0 && (
              <ul className='flex flex-wrap gap-2'>
                {myArray.map((item, index) => (
                  <li
                    key={index}
                    className='text-sm flex items-center gap-2 font-semibold bg-blue-50 px-3 py-1 rounded-md text-blue-700'
                  >
                    <p>{item}</p>
                    <button
                      type='button'
                      onClick={() => handleDelete(index)}
                      className='bg-gray-300 text-xs px-1.5 py-0.5 rounded-full text-red-600 hover:bg-gray-400 leading-none'
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Row 2: Passwords + Price + Billing */}
          <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mt-[2rem]'>
            {/* Temp Password */}
            <div className='flex flex-col relative gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%]'>Temporary Password</label>
              <input
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                type={isEyeOpen ? "text" : "password"}
                placeholder='*************'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-3 pr-10 outline-none hover:border-blue-600'
              />
              <button
                type='button'
                onClick={() => setIsEyeOpen(prev => !prev)}
                className="absolute top-9 right-3 text-neutral-600"
              >
                {isEyeOpen ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className='flex flex-col relative gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%]'>Confirm temporary password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={isEyeOpenTwo ? "text" : "password"}
                placeholder='*************'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-3 pr-10 outline-none hover:border-blue-600'
              />
              <button
                type='button'
                onClick={() => setIsEyeOpenTwo(prev => !prev)}
                className='absolute top-9 right-3 text-neutral-500'
              >
                {isEyeOpenTwo ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Price */}
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%]'>Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder='$'
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-3 outline-none hover:border-blue-600'
              />
            </div>

            {/* Billing Cycle */}
            <div className='flex flex-col gap-1'>
              <label className='text-[0.9rem] font-bold leading-[150%]'>Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'
              >
                <option value="">Select Bills</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* OTHERS Section */}
          <hr className='mt-[2rem] border-1' />
          <div className='mt-[1.575rem]'>
            <h1 className='text-neutral-800 text-[1.125rem] font-semibold leading-[100%]'>OTHERS</h1>
            <hr className='mt-[1.575rem] border-1' />

            {/* Plan Status */}
            <div className='flex justify-between mt-[1.375rem] p-4 border border-neutral-300 rounded-xl'>
              <p className='flex flex-col text-[#6B6B6B] gap-2'>
                <span className='text-[1.125rem] text-neutral-900 font-semibold leading-[100%]'>
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
            <div className='flex justify-between mt-[1.375rem] p-4 border border-neutral-300 rounded-xl'>
              <p className='flex flex-col text-[#6B6B6B] gap-2'>
                <span className='text-[1.125rem] text-neutral-900 font-semibold leading-[100%]'>
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
              className='flex-1 w-full text-blue-600 hover:bg-red-50 font-semibold p-2 lg:p-3 items-center justify-center border-2 border-blue-600 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              className='flex-1 w-full font-semibold hover:bg-blue-800 p-2 lg:p-3 items-center justify-center bg-blue-600 rounded-lg text-white transition-colors'
            >
              Create Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlansCreationModal

//     "use client"
// import React, { useState } from 'react'
// import { X, Eye, EyeOff } from 'lucide-react'
// import { BsToggleOn, BsToggleOff  } from "react-icons/bs";


// const PlansCreationModal = ({isOpen, onClose, onCreate}) => {
//     const [isToggleOn, setIsToggleOn] = useState(false)
//     const [isMovedOn, setIsMovedOn] = useState(false)
//     const [myArray, setMyArray] = useState([])
//     const [planInput, setPlanInput] = useState("")

//     const [isEyeOpen, setIsEyeOpen] = useState(false)
//     const [isToggleEye, setIsToggleEye] = useState("")

//     const [isEyeOpenTwo, setIsEyeOpenTwo] = useState(false)
//     const [isToggleEyeTwo, setIsToggleEyeTwo] = useState('')
    
    
//     if(!isOpen) return null

//     const handleAddPlan = () => {
//         if(planInput.trim() === "") return
//         setMyArray(prev => [... prev, planInput])
//         setPlanInput("")
//     }

//     const handleDelete = (index) =>{
//         setMyArray(prev => prev.filter((_, i) => i !== index))
//     }


//   return (
//     <div className='flex fixed inset-0 px-4 lg:px-0 z-50 items-center justify-center bg-black/50'>
//         <div  className='bg-white lg:w-[43rem] lg:max-h-[90vh] max-h-[85vh] h-auto w-fit  p-8 rounded-2xl overflow-y-scroll scrollbar-hide'>
//                 <div className='flex justify-end mt-[2rem]'>
//                     <span onClick={onClose} className='p-2 border-[1px] cursor-pointer hover:bg-neutral-100  border-neutral-500 rounded-full'>
//                         <X size={24} />
//                     </span>
//                 </div>

//             <div className='mb-[2rem]'>
//                 <h1 className='text-[1.5rem] font-semibold leading-[100%] text-neutral-900 mb-[0.8rem]'>
//                     Create New Subscription Plan
//                 </h1>
//                 <p className='text-[1.025rem] leading-[100%] text-neutral-800 '>
//                     Define a new subscription tier for filling station customers                
//                 </p>                
//             </div>

//             <div>
               
//                     <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mb-[1rem]'>
//                         <div className='flex flex-col'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                     Plan Name
//                                 </label>
//                                 <select type="text" placeholder='Enter plan name ' className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600' >
//                                     <option value="">Choose Plan</option>
//                                     <option value="">Professionals</option>
//                                     <option value="">Prime</option>
//                                     <option value="">Basic</option>
//                                     <option value="">Enterprise</option>
//                                 </select>

//                         </div>
//                         <div className='flex flex-col'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                     User Limit
//                                 </label>
//                                 <select name="" id="" className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
//                                     <option value="">Choose Limit</option>
//                                     <option value="">2</option>
//                                     <option value="">5</option>
//                                     <option value="">7</option>
//                                     <option value="">10</option>
//                                     <option value="">15</option>
//                                     <option value="">Unlimited</option>
//                                 </select>
//                         </div>
//                     </div>

//                     <label className='text-[0.9rem] font-bold leading-[150%] '>Plan Features</label>
//                     <div className='w-full h-auto mt-[0.5rem] flex flex-col gap-2 rounded-lg border-[2px] border-neutral-500  outline-none p-3'>
//                       <span className='flex gap-3 '>
//                         <input value={planInput} onChange={(e) => setPlanInput(e.target.value)} type="text" placeholder='Enter Plans' className='pl-3 px-5 py-3 rounded-lg border-2 focus:border-2 focus:border-blue-600 outline-none' />
//                         <button onClick={handleAddPlan} className='flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-400 '>+ Add</button>
//                       </span> 
                        
//                         {/* List Display */}
//                         <ul className='grid lg:grid-cols-4 grid-cols-2 gap-3 '>
//                             {myArray.filter(item => item !== "").map((item, index) =>(
//                                 <li key={index} className='text-sm flex justify-between items-center font-semibold bg-blue-50 px-3 py-1 rounded-md text-blue-700'>
                                   
//                                    <p className=''>
//                                         {item}
//                                    </p>
//                                    <button onClick={() => handleDelete(index)} className='bg-gray-300 text-md  px-2 py-0.5 rounded-full text-red-600'>X</button>
//                                 </li>
//                             )) }
//                         </ul>

                        
//                     </div>

//                     <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 mt-[2rem]'>
//                         <div className='flex flex-col relative'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                     Temporary Password
//                                 </label>
//                                 <input value={isToggleEye} onChange={(e) => setIsToggleEye(e.target.value)} type={isEyeOpen ? "text" : "password"} placeholder='*************' className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-3 outline-none hover:border-blue-600' />
//                                 <button type='button' onClick={() => setIsEyeOpen(prev => !prev)} className="absolute top-9 right-3 text-neutral-600">
//                                     {isEyeOpen ? <EyeOff /> : <Eye />}
//                                 </button>
//                         </div>
//                         <div className='flex flex-col relative'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                     Confirm temporary password
//                                 </label>
//                                 <input value={isToggleEyeTwo} type={isEyeOpenTwo ? "text" : "password"} onChange={(e) => setIsToggleEyeTwo(e.target.value)} placeholder='*************' className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-3 outline-none hover:border-blue-600' />
//                                 <button onClick={() => setIsEyeOpenTwo(prev => !prev)} type='button' className='absolute top-9 right-3 text-neutral-500'>
//                                     {isEyeOpenTwo ? <EyeOff /> : <Eye />}
//                                 </button>
//                         </div>
//                         <div className='flex flex-col'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                     Price
//                                 </label>
//                                 <input name="" id="" placeholder='$' className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'/>
                                    
                               
//                         </div>
//                         <div className='flex flex-col'>
//                                 <label className='text-[0.9rem] font-bold leading-[150%]' >
//                                    Billing Cycle
//                                 </label>
//                                 <select name="" id="" className='lg:w-[19.125rem] w-full h-[3.25rem] border-[2px] border-neutral-500 rounded-lg pl-2 outline-none hover:border-blue-600'>
//                                     <option value="">Select Bills</option>
//                                     <option value="">Monthly</option>
//                                     <option value="">Yearly</option>
                                    
//                                 </select>
//                         </div>

//                     </div>
//                         <hr  className='mt-[2rem] border-1'/>
                        
//                         <div className='mt-[1.575rem]'>
//                             <h1 className='text-neutral-800 text-[1.125rem] leading-[100%] mt-[0.875rem]'>
//                                 OTHERS
//                             </h1>
//                             <hr className='mt-[1.575rem] border-1' />

//                             <div className='flex justify-between mt-[1.375rem] p-4 border-1 border-neutral-300 rounded-xl'>
//                                 <p className='flex flex-col text-[#6B6B6B] gap-2'>
//                                     <span className='text-[1.125rem] text-neutral-900 font-semibold leading-[100%]'>
//                                         Plan Status
//                                     </span>
//                                     This plan is active and visible to customers
//                                 </p>

//                                 <button type='button' onClick={() => setIsToggleOn(prev => !prev)} className={`flex items-center justify-center `} >
//                                     {isToggleOn ? (
//                                         <BsToggleOn size={32} className='text-[#1A71F6]'/>
//                                     ): (

//                                         <BsToggleOff size={32} className='text-gray-400' />
//                                     )
//                                     }
//                                 </button>

//                             </div>
//                             <div className='flex justify-between mt-[1.375rem] p-4 border-1 border-neutral-300 rounded-xl'>
//                                 <p className='flex flex-col text-[#6B6B6B] gap-2'>
//                                     <span className='text-[1.125rem] text-neutral-900 font-semibold leading-[100%]'>
//                                         Allow Free Trial
//                                     </span>
//                                     Offer a trial period for new customers
//                                 </p>

//                                 <button type='button' onClick={() => setIsMovedOn(prev => !prev)} className={`flex items-center justify-center `} >
//                                     {isMovedOn ? (
//                                         <BsToggleOn size={32} className='text-[#1A71F6]'/>
//                                     ): (

//                                         <BsToggleOff size={32} className='text-gray-400' />
//                                     )
//                                     }
//                                 </button>

//                             </div>
//                         </div>

                
//                         <div className='grid lg:grid-cols-2   mt-[1.675rem] gap-4'>
//                             <button className='flex-1 w-full text-blue-600 hover:bg-red-200 font-semibold p-2 lg:p-3 items-center justify-center border-2 border-blue-600 rounded-lg '>
//                                 Cancel
//                             </button>
//                             <button className='flex-1 w-full font-semibold hover:bg-blue-800 p-2 lg:p-3 items-center justify-center  bg-blue-600 rounded-lg text-white '>
//                                 Create Plan
//                             </button>
//                         </div>
//             </div>

            

//         </div>
//     </div>
//   )
// }

// export default PlansCreationModal