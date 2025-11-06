'use client'
import React, { useEffect } from 'react'
import EmployeeCard from '@/components/EmployeeCard'
import useStaffStore from '@/store/useStaffStore'

const DirectoryCard = () => {
  const { staff, getAllStaff, loading } = useStaffStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const {deleteStaff} = useStaffStore()

  // ✅ Fetch all staff when component mounts
  useEffect(() => {
    if (token) getAllStaff(token)
  }, [token, getAllStaff])

  const toggleDuty = (id) => {
    // Optional: You can call updateStaff() from store if duty status should persist to backend
    console.log(`Toggled duty for staff with ID: ${id}`)
  }

  const handleEdit = (staff) => {
    console.log("Edit", staff.firstName)
  }

  const handleDelete = (staff) => {
    console.log("Delete", staff.firstName)
  }

  if (loading.fetching) return <p>Loading staff...</p>

  return (
    <div className='mt-5 bg-white p-4 rounded-2xl'>
      <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-5'>
        {staff.length === 0 ? (
          <p className="text-gray-500">No staff yet. Add your first one!</p>
        ) : (
          staff.map((item) => (
            <EmployeeCard
              key={item._id}
              name={`${item.firstName} ${item.lastName}`}
              role={item.role}
              dutyStatus={item.dutyStatus}
              shift={item.shiftType}
              phone={item.phone}
              email={item.email}
              earnings =  {item.amount}
              salesTarget={item.salesTarget}
              responsibilities={item.responsibility?.join(', ') || 'None'}
              onToggleDuty={() => toggleDuty(item._id)}
              onEdit={() => handleEdit(item)}
              onDelete={deleteStaff}
              staff={item}
              userToken={token}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DirectoryCard


