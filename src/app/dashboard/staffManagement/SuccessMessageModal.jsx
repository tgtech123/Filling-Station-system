'use client'
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const SuccessMessageModal = ({ isOpen, onClose, staffName }) => {
  const [stationName] = useState(() => {
    if (typeof window === 'undefined') return 'your station';
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.station?.name || 'your station';
    } catch {
      return 'your station';
    }
  });

  if (!isOpen) return null;

  return (
    <div className='w-full inset-0 fixed z-50 bg-black/50 flex items-center justify-center'>
      <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-[32rem] mx-4'>
        <div className='flex justify-end'>
          <span
            onClick={onClose}
            className='bg-green-100 dark:bg-green-900/40 rounded-md text-green-600 dark:text-green-400 cursor-pointer flex items-center justify-center px-4 py-1'
          >
            Done
          </span>
        </div>

        <div className='mt-4'>
          <h1 className='flex gap-3 text-[2.5rem] justify-center items-center font-semibold text-[#04910C] dark:text-green-400 mb-[1.5rem]'>
            Wohoo!
            <Check />
          </h1>

          <p className='text-[1.125rem] text-center text-neutral-700 dark:text-gray-300'>
            {staffName ? (
              <>
                <strong className='font-bold text-[1.25rem] text-gray-900 dark:text-white'>
                  {staffName}
                </strong>{' '}
                has joined the team at{' '}
                <strong className='font-bold text-[1.25rem] text-gray-900 dark:text-white'>
                  {stationName}
                </strong>
                . Track and monitor staff progress on-the-go.
              </>
            ) : (
              <>
                A new staff member has joined the team at{' '}
                <strong className='font-bold text-gray-900 dark:text-white'>
                  {stationName}
                </strong>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessageModal;
