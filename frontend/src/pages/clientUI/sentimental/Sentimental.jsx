import React, { useState } from 'react'
import LargeCapStock from './capStock/LargeCapStock';
import MidCapStock from './capStock/MidCapStock';
import SmallCapStock from './capStock/SmallCapStock';
import MasterScreen from '../../dashboardPages/masterScreenCAPS/MasterScreen';

const Sentimental = () => {
    const [activeTab, setActiveTab] = useState('tab1');
    const tabs = [
        { id: 'tab1', title: 'Large Cap', content: <LargeCapStock /> },
        { id: 'tab2', title: 'Mid Cap', content: <MidCapStock /> },
        { id: 'tab3', title: 'Small Cap', content: <SmallCapStock /> },
        { id: 'tab4', title: 'Master Screen', content: <MasterScreen /> },

    ];
    return (
        <>
            <div className="w-[98%] mx-auto mt-6 bg-gray-50">
                <div className='flex items-start px-4'>
                    <div className='shadow-md p-2 rounded mt-5 w-1/6 bg-white'>
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
                    <div className="p-4 pr-0 h-[85vh] w-full overflow-hidden">
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