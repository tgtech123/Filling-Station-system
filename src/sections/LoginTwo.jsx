import React from 'react'
import Image from 'next/image'
import TextSlider from './login/TextSlider'

const LoginTwo = () => {
  return (
    <div className=''>
        <div className=' relative'>

            <Image className=''
              src='/Onboarding.png'
              height={1024}
              width={720}
              alt='dashboard-image'
            />

            <div className='absolute bottom-[-45px]'>
              <TextSlider/>
            </div>

        </div>
    </div>
  )
}

export default LoginTwo