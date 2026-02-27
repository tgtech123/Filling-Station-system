import React from 'react'
import StatGrid from '../StatGrid'
import CardData from './CardData'
import PaymentInfo from './PaymentInfo'

const GeneralPage = () => {
  return (
    <div>

        <div>
            <StatGrid data={CardData} />
        </div>

        <div className='mt-[1.375rem]'>
            <PaymentInfo />
        </div>
    </div>
  )
}

export default GeneralPage