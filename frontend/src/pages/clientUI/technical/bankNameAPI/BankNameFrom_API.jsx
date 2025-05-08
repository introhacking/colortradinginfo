import React from 'react'
import Loading from '../../../../Loading'

export const BankNameFrom_API_SG = ({ isLoading, errorMsg, errorMsgStatus, noDataFoundMsg, technicalBankName, handleCheckboxChange }) => {
  if (isLoading) { return <div><Loading msg={'Bank name loading...'} /></div> }
  if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
  if (noDataFoundMsg !== '') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div> }

  return (
    <>
      {technicalBankName && technicalBankName?.map((bank, id) => {
        return (
          <div key={id} className='flex items-center gap-2 justify-start px-2'>
            <input type='checkbox' className='w-auto' onChange={() => handleCheckboxChange(bank)} />
            <p className='text-sm'>{bank.Bank_name}</p>
          </div>

        )
      })}
    </>
  )
}
export const BankNameFrom_API_OPG = ({ isLoading, errorMsg, errorMsgStatus, noDataFoundMsgOPG, technicalBankName, handleCheckboxChange }) => {
  if (isLoading) { return <div><Loading msg={'Bank name loading...'} /></div> }
  if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
  if (noDataFoundMsgOPG !== '') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsgOPG}</span></div> }

  return (
    <>
      {technicalBankName && technicalBankName?.map((bank, id) => {
        return (
          <div key={id} className='flex items-center gap-2 justify-start px-2'>
            <input type='checkbox' className='w-auto' onChange={() => handleCheckboxChange(bank)} />
            <p className='text-sm'>{bank.Bank_name}</p>
          </div>

        )
      })}</>
  )
}
export const BankNameFrom_API_NPG = ({ isLoading, errorMsg, errorMsgStatus, noDataFoundMsgNPG, technicalBankName, handleCheckboxChange }) => {
  if (isLoading) { return <div><Loading msg={'Bank name loading...'} /></div> }
  if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
  if (noDataFoundMsgNPG !== '') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsgNPG}</span></div> }
  return (
    <>
      {technicalBankName && technicalBankName?.map((bank, id) => {
        return (
          <div key={id} className='flex items-center gap-2 justify-start px-2'>
            <input type='checkbox' className='w-auto' onChange={() => handleCheckboxChange(bank)} />
            <p className='text-sm'>{bank.Bank_name}</p>
          </div>

        )
      })}</>
  )
}

