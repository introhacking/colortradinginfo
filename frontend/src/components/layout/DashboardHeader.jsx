import React, { useEffect, useState } from 'react'
import Button from '../componentLists/Button';
import * as IoIcons from 'react-icons/io'
import * as CgIcons from 'react-icons/cg'
import HeaderSetting from '../../pages/dashboardPages/headerSetting/HeaderSetting';
import LogoutModal from '../dashboardPageModal/alertModal/LogoutModal';

import { io } from 'socket.io-client';
import { BACKEND_URI } from '../../services/apiService';

// const backendURL = import.meta.env.VITE_BACKEND_URI;


const DashboardHeader = () => {
  const [announcement, setAnnouncement] = useState('');

  const isLogin = window.localStorage.getItem('loginInfo')
  const parseIslogin = isLogin && JSON.parse(isLogin);
  const { username, role } = parseIslogin?.user

  const [globalModalStatus, setGlobalModalStatus] = useState(false)
  const [logoutModalStatus, setLogoutModalStatus] = useState(false)
  const GlobalModalOpen = () => {
    setGlobalModalStatus(true)
  }

  const logoutHandler = () => {
    setLogoutModalStatus(true)
  }


  // Load announcement from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('announcement');

    if (stored) {
      const { message, expiry } = JSON.parse(stored);

      if (expiry > Date.now()) {
        setAnnouncement(message);
      } else {
        localStorage.removeItem('announcement');
      }
    }
  }, []);

  // Setup socket connection and save announcements
  useEffect(() => {
    const socket = io(BACKEND_URI, { withCredentials: true });

    socket.on('connect', () => {
      // console.log('🟢 Connected to WebSocket server');
    });

    socket.on('scrape-announcement', (message) => {
      console.log('📩 Received announcement:', message);

      const expiry = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days in ms
      localStorage.setItem('announcement', JSON.stringify({ message, expiry }));

      setAnnouncement(message);
    });

    socket.on('disconnect', () => {
      // console.log('🔴 Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div className='relative'>
        <div className="bg-gray-100 h-12 left-64 right-0 top-0 flex items-center px-2 shadow-md">
          <div className='flex justify-between items-center w-full'>
            <h1 className="text-xl font-medium">Dashboard</h1>
            {announcement && (
              <marquee className='w-[70vh] p-0.5 bg-blue-100 rounded text-blue-800'>
                {announcement}
              </marquee>
            )}
            <div className='flex items-center gap-3'>
              <a className="hover:text-gray-900 capitalize font-medium">Welcome, {role === 'admin' && username}</a>
              <Button onClick={GlobalModalOpen} children={<IoIcons.IoIosSettings fontSize={24} />} type={'button'} />
              <Button onClick={logoutHandler} children={<CgIcons.CgLogOff fontSize={24} />} type={'button'} className={'text-red-600'} />
            </div>
          </div>
        </div>
        <HeaderSetting isOpen={globalModalStatus} onClose={() => setGlobalModalStatus(false)} />
      </div>
      <LogoutModal isOpen={logoutModalStatus} onClose={() => setLogoutModalStatus(false)} />
    </>
  );
}

export default DashboardHeader