import React, { useState } from 'react'
import LargeCapStock from './capStock/LargeCapStock';
import MidCapStock from './capStock/MidCapStock';
import SmallCapStock from './capStock/SmallCapStock';
import MasterScreen from '../../dashboardPages/masterScreenCAPS/MasterScreen';
import { useEffect } from 'react';

const Sentimental = () => {
    const [activeTab, setActiveTab] = useState('tab1');
    const [useWeight, setUseWeight] = useState(true);

    // const [capData, setCapData] = useState(null);


    // ERROR HANDLING
    // const [errorMsg, setErrorMsg] = useState('')
    // const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    // const [isLoading, setIsLoading] = useState(false)

    const tabs = [
        { id: 'tab1', title: 'Large Cap', content: <LargeCapStock useWeight={useWeight} /> },
        { id: 'tab2', title: 'Mid Cap', content: <MidCapStock useWeight={useWeight} /> },
        { id: 'tab3', title: 'Small Cap', content: <SmallCapStock useWeight={useWeight} /> },
        // { id: 'tab4', title: 'Master Screen', content: <MasterScreen /> },

    ];

    const handleToggleWeight = () => {
        setUseWeight(prev => {
            const newWeight = !prev;
            return newWeight;
        });
    };

    return (
        <>
            <div className="w-[98%] mx-auto mt-6 bg-gray-50">
                <div className='flex items-start px-4'>
                    <div className='flex flex-col gap-2 w-1/6'>
                        <div className='shadow-md p-2 rounded mt-5 bg-white'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`py-2 px-4 flex items-center w-full flex-col border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-white bg-blue-400 rounded' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <label className="mb-1 relative space-y-2 bg-gray-100 rounded p-1 cursor-pointer">
                            <span className='ml-1 font-semibold'>{useWeight ? 'No Weight Mode' : 'Weight Mode'}</span>
                            <input
                                type="checkbox"
                                checked={!useWeight}
                                onChange={handleToggleWeight}
                                className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>
                            <div className="absolute left-[6px] top-[29px] w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
                        </label>
                    </div>

                    <div className="p-4 pr-0 h-[85vh] w-full overflow-hidden">
                        {/* <label className="max-w-[20%] mb-1 relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!useWeight}
                                onChange={handleToggleWeight}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
                            <span className='ml-3 font-semibold'>{useWeight ? 'No Weight Mode' : 'Weight Mode'}</span>
                        </label> */}

                        {tabs.map((tab) =>
                            activeTab === tab.id ? <div key={tab.id}>{tab.content}</div> : null
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sentimental