import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import * as TiIcons from 'react-icons/ti'
import Button from '../componentLists/Button';


const Sidebar = () => {
  const [dropdownOpen, setDropdownOpen] = useState({});
  const toggleDropdown = (menu) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div className="w-52 h-full bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav className='px-2 h-[88vh] overflow-y-auto'>
        <ul>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/dashboard" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Dashboard</button>
              {/* <Button type={'button'} children={'Dashboard'} className={'px-4 py-2 '} /> */}

            </Link>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/fundamentals/banking" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                onClick={() => toggleDropdown('menu1')}
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <span>Fundamentals</span>
                {dropdownOpen['menu1'] ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
              </button>
            </NavLink>
            {dropdownOpen['menu1'] && (
              <div className="mt-0.5 bg-gray-700 rounded">
                <NavLink to="/dashboard/fundamentals/banking" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>Banking</NavLink>
                {/* <li><NavLink to="/dashboard/bank" className="block px-4 py-2 hover:bg-gray-600">Banking</NavLink></li> */}
                <NavLink to="/dashboard/fundamentals/it" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>IT</NavLink>
              </div>
            )}
            {/* </NavLink> */}
          </li>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/dashboard/sentimental/large-cap" className='block'>
              <button
                onClick={() => toggleDropdown('menu2')}
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <span>Sentimentals</span>
                {dropdownOpen['menu2'] ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
              </button>
            </Link>
            {dropdownOpen['menu2'] && (
              <ul className="mt-0.5 bg-gray-700 rounded">
                <li><NavLink to="/dashboard/sentimental/large-cap" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>Large Cap</NavLink></li>
                <li><NavLink to="/dashboard/sentimental/mid-cap" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>Mid Cap</NavLink></li>
                <li><NavLink to="/dashboard/sentimental/small-cap" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>Small Cap</NavLink></li>
              </ul>
            )}


          </li>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/dashboard/technical/banking" className='block'>
              <button
                onClick={() => toggleDropdown('menu3')}
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <span>Technical</span>
                {dropdownOpen['menu3'] ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
              </button>
            </Link>
            {dropdownOpen['menu3'] && (
              <ul className="mt-0.5 bg-gray-700 rounded">
                <li><NavLink to="/dashboard/technical/banking" className={({ isActive }) =>
                  `block px-4 py-2 hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-600' : ''}`
                }>Banking</NavLink></li>
                {/* <li><NavLink to="/dashboard/sentimental/mid-cap" className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-gray-600 ${isActive ? 'bg-gray-600' : ''}`
                  }>Mid Cap</NavLink></li>
                  <li><NavLink to="/dashboard/sentimental/small-cap" className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-gray-600 ${isActive ? 'bg-gray-600' : ''}`
                  }>Small Cap</NavLink></li> */}
              </ul>
            )}
          </li>
          {/* <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/delivery" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Delivery</button>
            </NavLink>
          </li> */}
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/sectorial" className={({ isActive }) =>
              `block hover:bg-gray-600 text-sm ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Sectorial</button>
            </NavLink>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/fii-data" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Fetch FII data</button>
            </NavLink>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/daily-spurt" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Fetch Daily Stocks Data</button>
            </NavLink>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/stock-price-checker" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Stock Price Checker</button>
            </NavLink>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/research" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Research</button>
            </NavLink>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/upload-video" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Upload Videos</button>
            </NavLink>
          </li>
          {/* <li className="p-2 hover:bg-gray-700">
            <NavLink to="/dashboard/master-screen" className={({ isActive }) =>
              `block hover:bg-gray-600 ${isActive ? 'bg-gray-400 rounded' : 'bg-gray-700 rounded'}`
            }>
              <button
                className="flex items-center justify-between w-full text-sm text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >Master Screen</button>
            </NavLink>
          </li> */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
