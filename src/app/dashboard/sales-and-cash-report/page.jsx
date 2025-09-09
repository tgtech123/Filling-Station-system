import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import React from 'react'
import SalesReportMan from './SalesReportMan'

const page = () => {
  return (

    <DashboardLayout>
        <div>
            <SalesReportMan/>
        </div>

    </DashboardLayout>
  )
}

export default page