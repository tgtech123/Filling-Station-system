import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const FrequentlyQuestions = () => {
    const [isShown, setIsShown] = useState(false)
    const [isShownTwo, setIsShownTwo] = useState(false)
    const [isShownThree, setIsShownThree] = useState(false)
    const [isShownFour, setIsShownFour] = useState(false)
    const [isShownFive, setIsShownFive] = useState(false)
  return (
    <div>
        <div className='max-w-[51.25rem] mt-[5.375rem] w-full p-2 flex flex-col items-center justify-center'>
            <h1 className='mb-[2rem] leading-[110%] text-neutral-800 font-semibold text-center text-[2rem] sm:text-[1.5rem] md:text-[2rem] lg:text-[3rem]'>Frequently Asked Questions</h1>

            <div className='flex flex-col mb-[6.625rem] gap-4'>
                <div className='bg-white p-3 rounded-md h-auto '>
                    <p  className='flex justify-between '>
                        <span className='lg:text-[1.2rem] text-[1rem] font-medium'>What makes Flourish one of the best station management  in the markets?</span>
                        <button onClick={() => setIsShown(!isShown)}>
                            {isShown ? <ChevronUp  className='text-neutral-500 mb-10' size={28}/> : <ChevronDown  className='text-neutral-500 mb-10' size={28}/> } 
                        </button>
                    </p>

                    {isShown &&(
                        <div className='flex flex-col'>
                            <span className='mt-[0.5rem] text-[1.125rem] text-neutral-500'>
                                This is flourish station  This is flourish stationThis is flourish station This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                            <span className='mt-[1rem] text-[1.125rem] text-neutral-500'>
                                This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                        </div>
                    )}
                    
                </div>
                
                <div className='bg-white p-3 rounded-md h-auto '>
                    <p  className='flex justify-between '>
                        <span className='lg:text-[1.2rem] text-[1rem] font-medium'>What makes Flourish one of the best station management  in the markets?</span>
                        <button onClick={() => setIsShownTwo(!isShownTwo)}>
                            {isShownTwo ? <ChevronUp  className='text-neutral-500 mb-10' size={28}/> : <ChevronDown  className='text-neutral-500 mb-10' size={28}/> } 
                        </button>
                    </p>

                    {isShownTwo &&(
                        <div className='flex flex-col'>
                            <span className='mt-[0.5rem] text-[1.125rem] text-neutral-500'>
                                This is flourish station  This is flourish stationThis is flourish station This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                            <span className='mt-[1rem] text-[1.125rem] text-neutral-500'>
                                This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                        </div>
                    )}
                    
                </div>
                
                <div className='bg-white p-3 rounded-md h-auto '>
                    <p  className='flex justify-between '>
                        <span className='lg:text-[1.2rem] text-[1rem] font-medium'>What makes Flourish one of the best station management  in the markets?</span>
                        <button onClick={() => setIsShownThree(!isShownThree)}>
                            {isShownThree ? <ChevronUp className='text-neutral-500 mb-10' size={28}/> : <ChevronDown  className='text-neutral-500 mb-10' size={28}/> } 
                        </button>
                    </p>

                    {isShownThree &&(
                        <div className='flex flex-col'>
                            <span className='mt-[0.5rem] text-[1.125rem] text-neutral-500'>
                                This is flourish station  This is flourish stationThis is flourish station This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                            <span className='mt-[1rem] text-[1.125rem] text-neutral-500'>
                                This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                        </div>
                    )}
                    
                </div>
                
                <div className='bg-white p-3 rounded-md h-auto '>
                    <p  className='flex justify-between '>
                        <span className='lg:text-[1.2rem] text-[1rem] font-medium'>What makes Flourish one of the best station management  in the markets?</span>
                        <button onClick={() => setIsShownFour(!isShownFour)}>
                            {isShownFour ? <ChevronUp  className='text-neutral-500 mb-10' size={28}/> : <ChevronDown  className='text-neutral-500 mb-10' size={28}/> } 
                        </button>
                    </p>

                    {isShownFour &&(
                        <div className='flex flex-col'>
                            <span className='mt-[0.5rem] text-[1.125rem] text-neutral-500'>
                                This is flourish station  This is flourish stationThis is flourish station This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                            <span className='mt-[1rem] text-[1.125rem] text-neutral-500'>
                                This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                        </div>
                    )}
                    
                </div>
                
                <div className='bg-white p-3 rounded-md h-auto '>
                    <p  className='flex justify-between '>
                        <span className='lg:text-[1.2rem] text-[1rem] font-medium'>What makes Flourish one of the best station management  in the markets?</span>
                        <button onClick={() => setIsShownFive(!isShownFive)}>
                            {isShownFive ? <ChevronUp  className='text-neutral-500 mb-10' size={28}/> : <ChevronDown  className='text-neutral-500 mb-10' size={28}/> } 
                        </button>
                    </p>

                    {isShownFive &&(
                        <div className='flex flex-col'>
                            <span className='mt-[0.5rem] text-[1.125rem] text-neutral-500'>
                                This is flourish station  This is flourish stationThis is flourish station This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                            <span className='mt-[1rem] text-[1.125rem] text-neutral-500'>
                                This is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish stationThis is flourish station
                            </span>

                        </div>
                    )}
                    
                </div>

                

            </div>
        </div>
    </div>
  )
}

export default FrequentlyQuestions