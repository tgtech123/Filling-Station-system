import React from 'react'
import GeneralPage from './PaymentAndBilling/GeneralPage'

const PaymentAndBilling = () => {
  return (
    <div className='p-10'>
      <div className='mb-[1.375rem]'>
        <h1 className='text-[1.75rem] font-semibold leading-[100%]'>
            Payments & Billing
        </h1>
        <p className='mt-[0.685rem] text-[1.125rem] text-neutral-500 leading-[100%]'>
          Track subscription payments and billing history from all filling stations
        </p>
      </div>

      <div>
          <GeneralPage />
      </div>
    </div>
  )
}

export default PaymentAndBilling