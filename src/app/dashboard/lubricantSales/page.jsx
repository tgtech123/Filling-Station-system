import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import React from 'react'
import SalesPage from './SalesPage'

const page = () => {
  return (
   <DashboardLayout>
        <SalesPage/>
   </DashboardLayout>
  )
}

export default page