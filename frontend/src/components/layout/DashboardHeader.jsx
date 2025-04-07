import React, { useState } from 'react'
import Button from '../componentLists/Button';
import * as IoIcons from 'react-icons/io'
import * as CgIcons from 'react-icons/cg'
import HeaderSetting from '../../pages/dashboardPages/headerSetting/HeaderSetting';

const DashboardHeader = () => {
  const [globalModalStatus, setGlobalModalStatus] = useState(false)
  const GlobalModalOpen = () => {
    setGlobalModalStatus(true)
  }
  return (
    <>

      <div className='relative'>
        <div className="bg-gray-100 h-12 left-64 right-0 top-0 flex items-center px-2 shadow-md">
          <div className='flex justify-between items-center w-full'>
            <h1 className="text-xl font-medium">Dashboard</h1>
            <div className='flex items-center gap-3'>
              <Button onClick={GlobalModalOpen} children={<IoIcons.IoIosSettings fontSize={24} />} type={'button'} />
              <Button children={<CgIcons.CgLogOff fontSize={24} />} type={'button'} className={'text-red-600'} />
            </div>
          </div>
        </div>
        <HeaderSetting isOpen={globalModalStatus} onClose={() => setGlobalModalStatus(false)}/>
      </div>

    </>
  );
}

export default DashboardHeader