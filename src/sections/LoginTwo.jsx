import React from 'react'
import Image from 'next/image'
import TextSlider from './login/TextSlider'

const LoginTwo = () => {
  return (
    <div className='h-screen relative w-full'>
        <div className=' h-full w-full relative'>

            <Image className=''
              src='/Onboarding.png'
              height={1024}
              width={760}
              alt='dashboard-image'
            />


        </div>
            <div className='absolute top-[500px] w-full px-4'>
              <TextSlider/>
            </div>
    </div>
  )
}

export default LoginTwo