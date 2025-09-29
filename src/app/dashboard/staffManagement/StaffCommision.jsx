import React, { useState } from 'react'
import TableWithoutBorder from '@/components/TableWithoutBorder'
import { commissionStructure, bonusStructure } from './commissionBonusData'
import { FiEdit, FiSave  } from "react-icons/fi"

const StaffCommision = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Initialize editable data from the imported data
  const [commissionData, setCommissionData] = useState({
    headers: commissionStructure.headers,
    bodyRows: commissionStructure.bodyRows
  })
  
  const [bonusData, setBonusData] = useState({
    headers: bonusStructure.headers,
    rowsBody: bonusStructure.rowsBody
  })

  // Temporary state for editing
  const [editableCommission, setEditableCommission] = useState(commissionData.bodyRows)
  const [editableBonus, setEditableBonus] = useState(bonusData.rowsBody)

  const handleEdit = () => {
    setEditableCommission([...commissionData.bodyRows])
    setEditableBonus([...bonusData.rowsBody])
    setIsEditMode(true)
  }

  const handleSave = () => {
    setCommissionData({
      ...commissionData,
      bodyRows: editableCommission
    })
    setBonusData({
      ...bonusData,
      rowsBody: editableBonus
    })
    setIsEditMode(false)
  }

  const handleCancel = () => {
    setEditableCommission([...commissionData.bodyRows])
    setEditableBonus([...bonusData.rowsBody])
    setIsEditMode(false)
  }

  const updateCommissionCell = (rowIndex, cellIndex, value) => {
    const newData = [...editableCommission]
    newData[rowIndex][cellIndex] = value
    setEditableCommission(newData)
  }

  const updateBonusCell = (rowIndex, cellIndex, value) => {
    const newData = [...editableBonus]
    newData[rowIndex][cellIndex] = value
    setEditableBonus(newData)
  }

  return (
    <div>
      {/* Commission Structure Table */}
      <div className='mt-4 bg-white rounded-2xl p-5'>
        <div className='flex justify-between'>
          <span className='flex flex-col sm:flex-row lg:flex-col gap-1.5'>
            <h1 className='text-xl font-semibold text-neutral-800'>Commission Structure</h1>
            <h3 className='font-normal text-neutral-800 mb-4'>Staff commission rate by roles</h3>
          </span>
          
          {!isEditMode ? (
            <FiEdit 
              className='text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg p-1' 
              size={38}
              onClick={handleEdit}
            />
          ) : (
            <div className='flex gap-4'>
                <button onClick={handleCancel} className='text-[1rem] px-3 py-1 h-[2.5rem] w-[5.75rem] rounded-md font-semibold bg-red-500 hover:scale-105 text-white'>
                    Cancel
                </button>
                <button
                onClick={handleSave}
                className="h-[2.5rem] w-[10.75rem] bg-[#0080FF] text-white text-[0.875rem] font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"
                >
                Save changes
                <FiSave  size={24} />
                </button>
            </div>
          )}
        </div>

        {!isEditMode ? (
          <TableWithoutBorder 
            columns={commissionData.headers} 
            data={commissionData.bodyRows}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {commissionData.headers.map((header, index) => (
                    <th key={index} className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableCommission.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-4 px-4">
                        {cellIndex === 0 ? (
                          <span className="text-sm text-gray-700">{cell}</span>
                        ) : (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCommissionCell(rowIndex, cellIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bonus Structure Table */}
      <div className='mt-4 bg-white rounded-2xl p-5'>
        <div className='flex justify-between'>
          <span className='flex flex-col sm:flex-row lg:flex-col mb-4'>
            <h1 className='text-xl font-semibold text-neutral-800'>Bonus structure</h1>
          </span>
          
          {!isEditMode ? (
            <FiEdit 
              className='text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg p-1' 
              size={38}
              onClick={handleEdit}
            />
          ) : (
            <div className='flex gap-4'>
                <button onClick={handleCancel} className='bg-red-500 text-white px-3 py-1 font-semibold rounded-md hover:scale-105'>Cancel</button>
                <button
                onClick={handleSave}
                className="h-[2.5rem] w-[10.75rem] bg-[#0080FF] text-white text-[0.875rem] font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"
                >
                Save changes
                <FiSave  size={24} />
                </button>

            </div>
          )}
        </div>

        {!isEditMode ? (
          <TableWithoutBorder 
            columns={bonusData.headers} 
            data={bonusData.rowsBody}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {bonusData.headers.map((header, index) => (
                    <th key={index} className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableBonus.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-4 px-4">
                        {cellIndex === 0 ? (
                          <span className="text-sm text-gray-700">{cell}</span>
                        ) : cellIndex === 2 ? (
                          <select
                            value={cell}
                            onChange={(e) => updateBonusCell(rowIndex, cellIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateBonusCell(rowIndex, cellIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffCommision