import React, { useState, Suspense, lazy } from 'react'
// import TechnicalBanking from './tabPages/TechnicalBanking';
import Loading from '../../../Loading';
const TechnicalBanking = lazy(() => delayForSecond(import('./tabPages/TechnicalBanking')));
// const TechnicalBanking = lazy(() => import('./tabPages/TechnicalBanking'));

const TechnicalUI = () => {

    const [activeTab, setActiveTab] = useState('technical-banking');
    const tabs = [
        {
            id: 'technical-banking', title: 'BANKING', content: 
            <Suspense fallback={<Loading msg='Please wait...' />}>
                <TechnicalBanking />
            </Suspense>
        },
        { id: 'technical-it', title: 'IT', content: 'IT Tabs' },
        { id: 'technical-fmcg', title: 'FMCG', content: 'FMCG' },
        { id: 'technical-metal', title: 'METALS', content: 'This is the content of Tab 4' },
        { id: 'technical-auto', title: 'AUTO', content: 'This is the content of Tab 5' },
        { id: 'technical-energy', title: 'ENERGY', content: 'This is the content of Tab 6' },

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
                    <div className="p-4 pr-0 h-[83vh] w-full overflow-hidden ">
                        {tabs.map((tab) =>
                            activeTab === tab.id ? <div key={tab.id}>{tab.content}</div> : null
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
const delayForSecond = async (promise) => {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    }).then(() => promise);
}
export default TechnicalUI