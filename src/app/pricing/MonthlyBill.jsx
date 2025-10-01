    "use client"
import React, { useState } from 'react'
import { Check } from 'lucide-react'

const MonthlyBill = () => {
    const [showBlue, setShowBlue] = useState("linkOne")
    // const [showBlue, setShowBlue] = useState("linkOne")

  return (
    <div className='w-full flex items-center justify-center' >
        {/* the cards section */}
            <div className=' max-w-[70.0625rem] ml-2.5 w-full grid lg:grid-cols-3 grid-cols-1 gap-4 p-4'>
                <div id='linkOne' onClick={()=> setShowBlue("linkOne")} className={`flex flex-col ${showBlue === "linkOne" ? "bg-[#1A71F6] text-white" :"bg-white"} rounded-xl p-4 max-w-[22.438rem] border border-neutral-100 `}>
                    <h1 className='text-[1.5rem] font-semibold mb-[1rem]'>Basic</h1>
                    <h3 className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkOne" ?"text-white" : "text-[#000]"} `}>$10 /mo</h3>
                    <p className={` ${showBlue === "linkOne" ?"text-white" : "text-[#6B6B6B]"} font-semibold text-[1rem] leading-[125%] flex gap-2`}>
                        Billed every month 
                      {/* <span className={` ${showBlue === "linkOne" ?"text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}>$108 for 12 months</span> */}
                    </p>
                    <span className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkOne" ?"text-white" : "text-[#6B6B6B]"}`}>VAT may apply</span>
                    
                    <button className={` rounded-full ${showBlue === "linkOne" ?"text-[#0080FF] bg-white" : "text-[#0080FF] border-[2px] border-[#0080FF]"}   font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}>
                        Get Basic
                    </button>

                    <h1 className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkOne" ?"text-white" : "text-[#6B6B6B]"} `}>What’s included:</h1>
                    <span className='flex gap-8 mb-[16.563rem]'>
                      <Check size={28} className="text-[#26DA95]" /> 
                      
                      <span>Feature 1</span>
                    </span>
                </div>


                {/* the second card */}
                <div id='linkTwo' onClick={()=> setShowBlue("linkTwo")} className={`flex flex-col ${showBlue === "linkTwo" ? "bg-[#1A71F6] text-white" :"bg-white"} rounded-xl p-4 max-w-[22.438rem] border border-neutral-100 `}>
                    <div className='flex justify-between'>
                      <h1 className='text-[1.5rem] font-semibold mb-[1rem]'>Plus
                      </h1>
                        <button className='w-[6.875rem] h-[2.3125rem] text-[#0080FF] flex items-center justify-center bg-white font-semibold text-[0.875rem] border-1 border-neutral-400 rounded-full'>Most popular</button>
                    </div>

                    <h3 className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkTwo" ?"text-white" : "text-[#000]"} `}>$25 /mo</h3>
                    <p className={` ${showBlue === "linkTwo" ?"text-white" : "text-[#6B6B6B]"} font-semibold text-[1rem] leading-[125%] flex gap-2 `}>
                         Billed every month
                      {/* <span className={` ${showBlue === "linkTwo" ?"text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}>$270 for 12 months</span> */}
                    </p>
                    <span className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkTwo" ?"text-white" : "text-[#6B6B6B]"}`}>VAT may apply</span>
                    
                    <button className={` rounded-full ${showBlue === "linkTwo" ?"text-[#0080FF] bg-white " : "text-[#0080FF] border-[2px] border-[#0080FF]"} font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}>
                        Get Plus
                    </button>

                    <h1 className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkTwo" ?"text-white" : "text-[#6B6B6B]"} `}>What’s included:</h1>
                    <span className='flex flex-col gap-5 mb-[6.375rem]'>
                        <p className='flex gap-6'>
                          <Check size={28} className="text-[#26DA95]" /> 
                          <span>Feature 1</span>
                        </p>
                        <p className='flex gap-6'>
                          <Check size={28} className="text-[#26DA95]" /> 
                          <span>Feature 2</span>
                        </p>
                        <p className='flex gap-6'>
                          <Check size={28} className="text-[#26DA95]" /> 
                          <span>Feature 3</span>
                        </p>
                        <p className='flex gap-6'>
                          <Check size={28} className="text-[#26DA95]" /> 
                          <span>Feature 4</span>
                        </p>
                      
                    </span>
                </div>
                
                {/* the third card */}
                <div id='linkThree' onClick={()=> setShowBlue("linkThree")} className={`flex flex-col ${showBlue === "linkThree" ? "bg-[#1A71F6] text-white" :"bg-white"} rounded-xl p-4 max-w-[22.438rem] border border-neutral-100 `}>
                    <h1 className='text-[1.5rem] font-semibold mb-[1rem]'>Prime</h1>
                    <h3 className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkThree" ?"text-white" : "text-[#000]"} `}>$30 /mo</h3>
                    <p className={` ${showBlue === "linkThree" ?"text-white" : "text-[#6B6B6B]"} font-semibold text-[1rem] leading-[125%] flex gap-2`}>
                        Billed every month
                      {/* <span className={` ${showBlue === "linkThree" ?"text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}>$324 for 12 months</span> */}
                    </p>
                    <span className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkThree" ?"text-white" : "text-[#6B6B6B]"}`}>VAT may apply</span>
                    
                    <button className={` rounded-full ${showBlue === "linkThree" ?"text-[#0080FF] bg-white" : "text-[#0080FF] border-[#0080FF] border-[2px]"}   font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}>
                        Get Prime
                    </button>

                    <h1 className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkThree" ?"text-white" : "text-[#6B6B6B]"} `}>What’s included:</h1>
                      <span className='flex flex-col gap-5 mb-[10.0625rem]'>
                        <p className='flex gap-6'>
                            <Check size={28} className="text-[#26DA95]" /> 
                            <span>Feature 1</span>
                          </p>
                          <p className='flex gap-6'>
                            <Check size={28} className="text-[#26DA95]" /> 
                            <span>Feature 2</span>
                          </p>
                          <p className='flex gap-6'>
                            <Check size={28} className="text-[#26DA95]" /> 
                            <span>Feature 3</span>
                          </p>
                      </span>
                </div>
            
            </div>
        
    </div>
    
  )
}

export default MonthlyBill