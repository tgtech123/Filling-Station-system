'use client'
import React, { useState } from 'react'
import { GoChevronDown } from "react-icons/go";
import { GoChevronUp } from "react-icons/go";
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import LoginTwo from '../LoginTwo';



const Login = () => {
    const [toggleUp, setToggleUp] = useState(false)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleToggle = () => {
        setToggleUp(!toggleUp)
    }

    const handleShowPassword = () =>{
        setShowPassword(!showPassword)
    }
  return (
    <div className='flex gap-8 justify-center items-center p-28 h-screen w-full'>
        <div>
            <div className=' leading-7 '>
                <img src="/station-logo.png" alt="#" className='h-10 w-18 mb-8 ' />

                <h1 className='text-2xl font-bold text-[#323130]'>Login to Flourish Station</h1>
                <p className='text-[14px] text-gray-500'>Login to access your customized dashboard</p>

                <form action="" className='flex flex-col leading-10'>
                    <div className='flex flex-col relative'>
                        <label className='text-[14px] font-bold text-[#323130]'>Select user type</label>
                        <input type="text" placeholder='Select user' className='pl-4  border-[1.6px] rounded-md w-[400px] h-[43px] focus:border-blue-600 outline-none' />
                        {toggleUp ? <GoChevronDown onClick={handleToggle} size={26} className='absolute top-[52px] right-3 text-gray-500 cursor-pointer' /> : <GoChevronUp onClick={handleToggle} size={26} className='absolute top-[52px] right-3 text-gray-500 cursor-pointer' />}  
                    </div>
                    
                    <div className='flex flex-col relative'>
                        <label className='text-[14px] font-bold text-[#323130]'>Email</label>
                        <input type="text" placeholder='username123@gmail.com' className='pl-4 focus:border-blue-600 outline-none border-[1.6px] rounded-md w-[400px] h-[43px]' />
                    </div>
                    
                    <div className='flex flex-col relative'>
                        <label className='text-[14px] font-bold text-[#323130]'>Password</label>
                        <input type={showPassword ? "text" : "password"} value={password} placeholder='Enter password' onChange={(e) => setPassword(e.target.value) } className='pl-4  border-[1.6px] rounded-md w-[400px] h-[43px] outline-none focus:border-blue-600' />
                        {showPassword ? <FiEye onClick={handleShowPassword} size={22} className='absolute top-[52px] right-3 text-gray-400 cursor-pointer' /> : <FiEyeOff onClick={handleShowPassword} size={22} className='absolute top-[52px] right-3 text-gray-500 cursor-pointer' />}  
                    </div>
                    
                    <div className=' flex gap-4'>
                        <input type="checkbox" className='text-blue-600 accent-blue-600 focus:ring-0'  />
                        <h1 className='font-semibold'>Remember me ?</h1>
                    </div>

                    <button className='bg-blue-600 rounded-md font-semibold text-white mt-6 h-[45px] hover:bg-blue-400 '>Sign In</button>

                    <p className='text-[14px] font-semibold text-gray-500 flex justify-items-center'>Forgotten Password ? <span className='text-blue-600 font-semibold ml-3 cursor-pointer hover:text-blue-950'>Reset Here</span></p>
                </form>
            </div>

        </div>

        <div>
            {/* <LoginTwo/> */}
        </div>
    </div>
  )
}

export default Login