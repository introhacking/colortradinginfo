import React, { useState } from 'react'
import Banking from './tabPages/Banking';
import IT from './tabPages/IT';
import FMCG from './tabPages/FMCG';

const Fundamentals = () => {
    const [activeTab, setActiveTab] = useState('tab1');
    const tabs = [
        { id: 'tab1', title: 'BANKING', content: <Banking /> },
        { id: 'tab2', title: 'IT', content: <IT /> },
        // { id: 'tab3', title: 'FMCG', content: <FMCG/>},
        { id: 'tab3', title: 'FMCG', content: 'Data Not Found'},
        { id: 'tab4', title: 'METALS', content: 'Data Not Found' },
        { id: 'tab5', title: 'AUTO', content: 'Data Not Found' },
        { id: 'tab6', title: 'ENERGY', content: 'Data Not Found' },

    ];

    return (
        <>
            <div className="w-[98%] mx-auto mt-6 bg-gray-50">
                <div className='flex items-start bg-gray-50 px-4'>
                    <div className='shadow-md p-2 rounded mt-5 w-1/6 bg-white'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`py-2 px-4 flex items-center text-center w-full flex-col border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-white bg-blue-400 rounded' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

export default Fundamentals