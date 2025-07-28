import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import * as TiIcons from 'react-icons/ti'
import Button from '../componentLists/Button';


const Sidebar = () => {
  const [dropdownOpen, setDropdownOpen] = useState({});

  const toggleDropdown = (menu) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // const menuItemClass = ({ isActive }) =>
  //   `block w-full text-sm px-4 py-2 rounded ${isActive ? 'bg-gray-400' : 'bg-gray-700 hover:bg-gray-600'
  //   }`;

  const menuItemClass = ({ isActive }) =>
    `relative block w-full text-sm px-4 py-2 rounded pl-5 transition-all duration-300 ease-in-out
   ${isActive ? 'bg-gray-400 before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-red-500 before:rounded-r-md'
      : 'bg-gray-700 hover:bg-gray-600'}`;


  const dropdownItemClass = ({ isActive }) =>
    `block px-4 py-2 text-sm rounded hover:bg-gray-600 ${isActive ? 'bg-gray-600' : ''
    }`;

  return (
    <div className="w-52 h-full bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav className="px-2 h-[88vh] overflow-y-auto">
        <ul className="space-y-2">
          {/* Single Link */}
          <li>
            <NavLink to="/dashboard" end className={menuItemClass}>
              Dashboard
            </NavLink>
          </li>

          {/* Dropdown - Fundamentals */}
          <li>
            <div
              onClick={() => toggleDropdown('menu1')}
              className="flex items-center justify-between w-full text-sm px-4 py-2 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded"
            >
              <span>Fundamentals</span>
              {dropdownOpen.menu1 ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
            </div>
            {dropdownOpen.menu1 && (
              <ul className="mt-0.5 bg-gray-700 rounded">
                <li>
                  <NavLink to="/dashboard/fundamentals/banking" className={dropdownItemClass}>
                    Banking
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/fundamentals/it" className={dropdownItemClass}>
                    IT
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Dropdown - Sentimentals */}
          <li>
            <div
              onClick={() => toggleDropdown('menu2')}
              className="flex items-center justify-between w-full text-sm px-4 py-2 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded"
            >
              <span>Sentimentals</span>
              {dropdownOpen.menu2 ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
            </div>
            {dropdownOpen.menu2 && (
              <ul className="mt-0.5 bg-gray-700 rounded">
                <li>
                  <NavLink to="/dashboard/sentimental/large-cap" className={dropdownItemClass}>
                    Large Cap
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/sentimental/mid-cap" className={dropdownItemClass}>
                    Mid Cap
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/sentimental/small-cap" className={dropdownItemClass}>
                    Small Cap
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Dropdown - Technical */}
          <li>
            <div
              onClick={() => toggleDropdown('menu3')}
              className="flex items-center justify-between w-full text-sm px-4 py-2 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded"
            >
              <span>Technical</span>
              {dropdownOpen.menu3 ? <TiIcons.TiArrowSortedUp /> : <TiIcons.TiArrowSortedDown />}
            </div>
            {dropdownOpen.menu3 && (
              <ul className="mt-0.5 bg-gray-700 rounded">
                <li>
                  <NavLink to="/dashboard/technical/banking" className={dropdownItemClass}>
                    Banking
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* More Single Items */}
          <li>
            <NavLink to="/dashboard/sectorial" className={menuItemClass}>
              Sectorial
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/fii-data" className={menuItemClass}>
              Fetch FII Data
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/daily-spurt" className={menuItemClass}>
              Fetch Daily Stocks Data
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/stock-price-checker" className={menuItemClass}>
              Stock Price Checker
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/research" className={menuItemClass}>
              Research
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/upload-video" className={menuItemClass}>
              Upload Videos
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/users-list" className={menuItemClass}>
              Users
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
