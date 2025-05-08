import React, { useState } from 'react'
import DeliveryPage from './tabPages/DeliveryPage';
// import Banking from './tabPages/Banking';
// import IT from './tabPages/IT';
// import FMCG from './tabPages/FMCG';

const DeliveryMain = () => {
    const [activeTab, setActiveTab] = useState('delivery');
    const tabs = [
        { id: 'delivery', title: 'DELIVERY', content: <DeliveryPage/> },
        // { id: 'tab2', title: 'DELIVERY 1', content: 'delivery 1' },
        // { id: 'tab3', title: 'DELIVERY 2', content: 'delivery 2' },
        // { id: 'tab4', title: 'METALS', content: 'This is the content of Tab 4' },
        // { id: 'tab5', title: 'AUTO', content: 'This is the content of Tab 5' },
        // { id: 'tab6', title: 'ENERGY', content: 'This is the content of Tab 6' },

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
                    <div className="p-4 pr-0 h-[85vh] w-full overflow-hidden ">
                        {tabs.map((tab) =>
                            activeTab === tab.id ? <div key={tab.id}>{tab.content}</div> : null
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeliveryMain