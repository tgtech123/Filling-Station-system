'use client'
import React, { useEffect, useState } from 'react'
import EmployeeCard from '@/components/EmployeeCard'
import useStaffStore from '@/store/useStaffStore'

const DirectoryCard = ({searchQuery = ""}) => {
  const { staff, getAllStaff, loading, deleteStaff } = useStaffStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // const {} = useStaffStore()


  // Fetch all staff when component mounts
  useEffect(() => {
    if (token) getAllStaff(token)
  }, [token, getAllStaff])

  //Filter Staff by name or role
  const filteredStaff = staff.filter((item) => {
    const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
    const role =  item.role?.toLowerCase()
    const query = searchQuery?.toLowerCase()

    return fullName.includes(query) || role.includes(query)
  })

  

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
    <div className='mt-5 bg-white p-8 rounded-2xl '>
      <div className='grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-5 items-center justify-center'>
        {filteredStaff.length === 0 ? (
          <p className="text-gray-500">
            {searchQuery ? `No staff found for ${searchQuery}` : "No staff yet. Add your first one!" }
          </p>
        ) : (
          filteredStaff.map((item) => (
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


