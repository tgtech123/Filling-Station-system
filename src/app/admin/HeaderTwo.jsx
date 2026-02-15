import Image from 'next/image'
import React from 'react'

const HeaderTwo = () => {
  return (
    <div className='flex justify-end p-6 items-center h-[90px] w-full shadow-md'>
        <div className='flex gap-6 '>
            <div className='bg-neutral-200 rounded-md w-[50px] flex items-center justify-center relative'>
                <span className='absolute top-[-4px] right-1 bg-red-600 rounded w-[18px] h-[22px] flex items-center justify-center text-white'>8</span>
                <Image src="/notifications.png" height={24} width={24} alt='notifications' />
            </div>

            <div className="h-12 border-1 border-[#C9C9C9]"></div>

            <div className='flex gap-3'>
                <div className='relative'>
                    <Image src='/sammi.jpeg' height={36} width={40} alt='profile picture' className='rounded-md' />
                    <span className='h-[15px] w-[15px] absolute bg-[#23A149] rounded-full bottom-[-4px] right-[-2px]'></span>
                </div>

                <div className='flex flex-col gap-2 justify-center'>
                <h1 className='text-[1rem] font-semibold'>Oboh Thankgod</h1>
                <h1 className='text-[12px] text-[#1A71F6] cursor-pointer'>View profile</h1>
                </div>
            </div>

            <div className="h-12 border-1 border-[#C9C9C9]"></div>

            <div className='flex items-center justify-center cursor-pointer'>
                <div className='border-2 border-red-600 rounded-2xl p-3 flex items-center gap-5'>
                    <h1 className='text-red-600 text-[12px] font-bold leading-[140%]'>Logout</h1>
                    <Image src="/log-out-1.png" width={25} height={24} alt='logout'  />
                </div>

            </div>
        </div>
    </div>
  )
}

export default HeaderTwo