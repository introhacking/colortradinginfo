import React, { useState } from 'react'
// import AgTable from './dashboardContent/AgTable'
// import Add_Column_Row_Modal from '../../components/dashboardPageModal/Add_Column_Row_Modal'
import DeliveryDashboard from './dashboardContent/DeliveryDashboard'

const DashboardPage = () => {
  // const [createModalStatus, setCreateModalStatus] = useState(false)

  // const createTableModal = () => {
  //   setCreateModalStatus(prev => !prev)
  // }
  return (
    <>

      <div className='h-[80vh] w-full'>
        <DeliveryDashboard />
      </div>

      {/* <div className='flex justify-between flex-col gap-6'> */}
      {/* <div>
          DashboardPage
        </div> */}
      {/* <div className='flex justify-end'>
          <button onClick={() => createTableModal()} className='px-2 py-1 hover:bg-green-400 bg-green-500 font-medium rounded text-white'>Add Row & Column</button>
        </div> */}
      {/* <div className='overflow-y-auto h-[70vh] w-full'>
          <AgTable />
        </div> */}


      {/* <div className='h-[80vh] w-full'>
          <DeliveryDashboard />
        </div> */}


      {/* </div> */}

      {/* {createModalStatus && <div>
        <Add_Column_Row_Modal createTableModal={createTableModal} />
      </div>
      } */}
    </>
  )
}

export default DashboardPage