import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import React from 'react'
import StaffManagement from './StaffManagement'

const page = () => {
  return (
    <DashboardLayout>
        <div>

            <StaffManagement/>
        </div>

    </DashboardLayout>
  )
}

export default page