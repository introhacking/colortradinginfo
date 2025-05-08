import React from 'react'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import { Outlet } from 'react-router-dom'
// import { Toaster } from 'sonner'
import BreadCrum from '../componentLists/BreadCrum'
const AdminLayout = () => {
  return (
    <div className='flex bg-slate-100 w-full relative'>
      <div className='sidebar-bg-color h-screen'>
        <Sidebar />
      </div>
      <div className='w-full'>
        <DashboardHeader />
        {/* {breadcrum} */}
        <div className='px-2 mt-3'>
          <BreadCrum />
        </div>
        <div className='p-2 w-full overflow-y-auto mt-6 '>{<Outlet />}</div> {/* h-[91vh] */}
        {/* <Toaster richColors position="top-right" /> */}
      </div>
    </div>
  )
}

export default AdminLayout