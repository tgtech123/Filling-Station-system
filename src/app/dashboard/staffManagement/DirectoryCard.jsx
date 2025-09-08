    'use client'
import EmployeeCard from '@/components/EmployeeCard'
import React, { useState } from 'react'
import employeesData from './employeesData'

const DirectoryCard = () => {
    const [duty, setDuty] = useState(true)

    const [employees, setEmployees] = useState(employeesData);

  const toggleDuty = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, dutyStatus: !emp.dutyStatus } : emp
      )
    );
  };
  return (
    <div className='mt-5 bg-white p-4 rounded-2xl'>

        <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-5'>

            {employees.map((item, index) => 
            <EmployeeCard
                key={item.id}
                name={item.name}
                role={item.role}
                dutyStatus={item.dutyStatus}
                shift={item.shift}
                phone={item.phone}
                email={item.email}
                earnings={item.earnings}
                salesTarget={item.salesTarget}
                responsibilities={item.responsibilities}
                onToggleDuty={()=> toggleDuty(item.id)}
                onEdit={() => console.log("Edit", item.name)}
                onDelete={()=> console.log("Delete", item.name)}
            />
            
            )}

        </div>

    </div>
  )
}

export default DirectoryCard