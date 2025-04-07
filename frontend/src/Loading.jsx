import React from 'react'

const Loading = ({ msg }) => {
  return (
    <div className='flex items-center'>
      <div className={`w-[30px] h-[30px] rounded-full border-[6px] border-gray-300 border-t-[#c92e57] border-b-[#c92e57] animate-spin m-2`}></div>
      <span className='text-xl'>{msg}</span>
    </div>
  )
}

export default Loading