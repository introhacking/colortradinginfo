import React, { useState } from 'react'

const HeaderSetting = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('tab1');
    const [titleName, setTitleName] = useState('Large Cap')
    const handleTabChange = (tab, title_name) => {
        setActiveTab(tab);
        setTitleName(title_name)
    };
    const tabs = [
        { id: 'tab1', title: 'Large Cap', content: <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repudiandae expedita vel neque facere aut voluptates ipsum est numquam itaque eius magnam temporibus ut quasi, architecto explicabo at? Eius iusto sit eligendi dicta impedit voluptate modi quae eaque. Sit totam nulla adipisci ullam? Mollitia, quaerat iusto facilis temporibus iure voluptas ea autem iste exercitationem, laboriosam vero adipisci illo corrupti, illum assumenda quo sint dolores deleniti enim earum. Culpa amet quas, harum animi incidunt cumque iste architecto! Quas quaerat iusto modi suscipit rem sit consequuntur eligendi corporis fuga officiis commodi amet, possimus dignissimos exercitationem ex labore vel expedita quibusdam perferendis? Iste libero repudiandae voluptate laboriosam obcaecati dolores doloremque praesentium saepe modi dolore vel omnis quia distinctio rem sit aliquam eaque, temporibus suscipit dolor quas quasi quae fugiat. Impedit error sed atque facilis qui, aspernatur, ad, labore magnam sunt pariatur sequi placeat quod earum quia sint laborum exercitationem fugit illum? Quasi, doloribus quas? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorum saepe et assumenda modi repudiandae deleniti rerum hic iusto soluta quas magni cumque, qui vitae aliquam provident quia odio maiores, possimus rem facilis dignissimos? Autem pariatur placeat officia nihil veritatis quo adipisci debitis aliquam vitae praesentium, ad quae doloremque, eos dolorem nobis quibusdam dicta vel, id fugit. Distinctio laborum quas, corrupti eveniet asperiores blanditiis, fugit expedita consequuntur saepe quibusdam, sit esse. Totam quasi dolorem enim amet provident iure, rem magni tempore explicabo. Quod delectus facere perspiciatis, culpa dolore illo optio explicabo doloribus fuga veritatis? Dolorum asperiores ea ipsam dicta facere eveniet qui, molestias, nam itaque perferendis odio. Sed magni obcaecati cumque nulla minus sequi fugiat! Recusandae placeat cupiditate possimus magnam blanditiis, est id animi. Voluptas quia aut in facere delectus dolore eum minus iusto? Corrupti maiores porro, possimus cum natus nam aspernatur dignissimos illum sit voluptatibus assumenda beatae, facere asperiores odit!Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorum saepe et assumenda modi repudiandae deleniti rerum hic iusto soluta quas magni cumque, qui vitae aliquam provident quia odio maiores, possimus rem facilis dignissimos? Autem pariatur placeat officia nihil veritatis quo adipisci debitis aliquam vitae praesentium, ad quae doloremque, eos dolorem nobis quibusdam dicta vel, id fugit. Distinctio laborum quas, corrupti eveniet asperiores blanditiis, fugit expedita consequuntur saepe quibusdam, sit esse. Totam quasi dolorem enim amet provident iure, rem magni tempore explicabo. Quod delectus facere perspiciatis, culpa dolore illo optio explicabo doloribus fuga veritatis? Dolorum asperiores ea ipsam dicta facere eveniet qui, molestias, nam itaque perferendis odio. Sed magni obcaecati cumque nulla minus sequi fugiat! Recusandae placeat cupiditate possimus magnam blanditiis, est id animi. Voluptas quia aut in facere delectus dolore eum minus iusto? Corrupti maiores porro, possimus cum natus nam aspernatur dignissimos illum sit voluptatibus assumenda beatae, facere asperiores odit! Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum excepturi nostrum possimus delectus fugit? Beatae consectetur officiis laudantium id, enim fuga quibusdam unde. Voluptatum dolor suscipit debitis officia libero quam earum neque tenetur aspernatur nobis totam ullam cupiditate magnam dignissimos amet est, quod quae placeat voluptates fugiat? Reprehenderit, autem quae similique voluptatum repellat ex, eius voluptate libero modi cum tempore recusandae itaque iste nihil quod animi non, officia incidunt reiciendis molestias! Magnam, esse, iure culpa perspiciatis ex eaque iste cum praesentium optio deleniti veritatis. Maxime ipsa aperiam maiores excepturi consectetur alias magni voluptatem illum voluptates? Animi veniam facilis dicta pariatur distinctio. Velit nobis aliquid voluptatum laborum, necessitatibus omnis expedita commodi ea totam sunt, in facilis consequatur? Perferendis hic, ipsa blanditiis sunt repudiandae repellendus esse obcaecati beatae ducimus ad exercitationem, quidem ab dolorum voluptatum impedit saepe, cumque qui a dolor accusamus molestiae facere soluta animi. Sequi vel tenetur molestiae nam nesciunt! Debitis fugiat libero explicabo iusto, iste quidem quas enim dolores veniam sequi recusandae suscipit eaque cupiditate laboriosam vero inventore consectetur excepturi quo optio! Mollitia facere neque molestias debitis voluptate repudiandae voluptatum perspiciatis, ex nisi eligendi perferendis esse totam facilis. Distinctio numquam officiis ipsum libero nisi incidunt iure aliquam reprehenderit nam.</p> },
        { id: 'tab2', title: 'Global setup', content: '2' },
        { id: 'tab3', title: 'Preference', content: 'Preferences Content in Tab 3' },

    ];
    return (
        <div className='absolute z-[20] w-full h-[82vh] top-14 rounded px-2'>
            <div className='bg-white h-full'>
                <div className='flex justify-between px-4 py-2 border-b'>
                    <p className='font-semibold'>{titleName ? `${titleName}` : `${titleName}`}</p>
                    <span onClick={onClose} className='cursor-pointer font-semibold text-xl'>X</span>
                </div>
                <div className='flex items-start bg-gray-50 h-full'>
                    <div className='shadow-md rounded w-1/6 bg-white'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`py-2 px-4 rounded font-semibold flex items-center text-center w-full flex-col border-b-2 ${activeTab === tab.id ? 'bg-[#176b82] text-white font-semibold' : 'hover:bg-gray-100'}'
                                    }`}
                                onClick={() => handleTabChange(tab.id, tab.title)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                    <div className="px-2 h-[81vh] w-full overflow-y-auto">
                        {tabs.map((tab) =>
                            activeTab === tab.id ? <div className='bg-white p-2 shadow-[inset_0px_15px_40px_#d3e9ef] w-full overflow-auto' key={tab.id}>{tab.content}</div> : null
                        )}
                    </div>
                </div>
            </div>
        </div>


        // <div className='bg-white absolute z-[50] top-16 w-full'>
        //     <div className='px-2'>
        //         <div className='w-full shadow-xl rounded'>
        //             <div className='flex justify-between text-xl px-4 py-3 border-b'>
        //                 <p className='font-semibold'>{titleName ? `${titleName}` : 'Profile'}</p>
        //                 <span onClick={() => setSettingModelStatus(false)} className='cursor-pointer font-semibold text-xl'>X</span>
        //             </div>

        //             {/* TABS */}
        //             <div className="w-full shadow h-full flex justify-center items-start">
        //                 {/* Tab Buttons */}
        //                 <div className="shadow-lg h-[76vh] overflow-y-auto w-1/4 flex space-y-1 flex-col p-2">
        //                     <button onClick={() => handleTabChange('tab1', 'Profile')}
        //                         className={`py-2 px-4 rounded ${activeTab === 'tab1' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                         Profile
        //                     </button>
        //                     <button onClick={() => handleTabChange('tab2', 'Utilities')}
        //                         className={`py-2 px-4 rounded ${activeTab === 'tab2' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`} >
        //                         Utilities {utilitiesStatus ? <span>&#11165;</span> : <span>&#11167;</span>}
        //                     </button>
        //                     {
        //                         utilitiesStatus &&
        //                         <div className='space-y-1 w-full bg-black/10 p-1'>
        //                             <button onClick={() => handleTabChange('tab2.1', 'Utilities / Import')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab2.1' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Import
        //                             </button>
        //                             <button onClick={() => handleTabChange('tab2.2', 'Utilities / Export')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab2.2' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Export
        //                             </button>
        //                             <button onClick={() => handleTabChange('financials', 'Utilities / Integrations / Financials ')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab !== nestedActiveTab ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Integrations
        //                             </button>
        //                         </div>
        //                     }
        //                     <button onClick={() => handleTabChange('tab3', 'Global setup')}
        //                         className={`py-2 px-4 rounded ${activeTab === 'tab3' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`} >
        //                         Global setup {globalStatus ? <span>&#11165;</span> : <span>&#11167;</span>}
        //                     </button>
        //                     {
        //                         globalStatus &&
        //                         <div className='space-y-1 w-full bg-black/10 p-1'>
        //                             <button onClick={() => handleTabChange('tab3.1', 'Global setup / General Settings')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab3.1' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 General Info
        //                             </button>
        //                             <button onClick={() => handleTabChange('tab3.2', 'Global setup / Default Settings')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab3.2' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Default Settings
        //                             </button>
        //                             <button onClick={() => handleTabChange('tab3.3', 'Global setup / Tax Settings')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab3.3' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Tax Settings
        //                             </button>
        //                             <button onClick={() => handleTabChange('tab3.4', 'Global setup /  Default Terms & Condition')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab3.4' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Default Terms & Condition
        //                             </button>
        //                             <button onClick={() => handleTabChange('tab3.5', 'Global setup / Bantai Billing & Subscription')}
        //                                 className={`py-2 w-full px-4 rounded ${activeTab === 'tab3.5' ? 'bg-pink-800 text-white font-semibold' : 'hover:bg-gray-100'}`} >
        //                                 Bantai Billing & Subscription
        //                             </button>
        //                         </div>
        //                     }
        //                     <button onClick={() => handleTabChange('tab4', 'Preference')}
        //                         className={`py-2 px-4 rounded ${activeTab === 'tab4' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`} >
        //                         Preference
        //                     </button>
        //                 </div>


        //                 {/* Tab Content */}
        //                 <div className='bg-white shadow-[inset_0px_15px_40px_#e3b6aa] w-full h-[75vh] overflow-auto px-4 py-2'>
        //                     {activeTab === 'tab1' && <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repudiandae expedita vel neque facere aut voluptates ipsum est numquam itaque eius magnam temporibus ut quasi, architecto explicabo at? Eius iusto sit eligendi dicta impedit voluptate modi quae eaque. Sit totam nulla adipisci ullam? Mollitia, quaerat iusto facilis temporibus iure voluptas ea autem iste exercitationem, laboriosam vero adipisci illo corrupti, illum assumenda quo sint dolores deleniti enim earum. Culpa amet quas, harum animi incidunt cumque iste architecto! Quas quaerat iusto modi suscipit rem sit consequuntur eligendi corporis fuga officiis commodi amet, possimus dignissimos exercitationem ex labore vel expedita quibusdam perferendis? Iste libero repudiandae voluptate laboriosam obcaecati dolores doloremque praesentium saepe modi dolore vel omnis quia distinctio rem sit aliquam eaque, temporibus suscipit dolor quas quasi quae fugiat. Impedit error sed atque facilis qui, aspernatur, ad, labore magnam sunt pariatur sequi placeat quod earum quia sint laborum exercitationem fugit illum? Quasi, doloribus quas? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorum saepe et assumenda modi repudiandae deleniti rerum hic iusto soluta quas magni cumque, qui vitae aliquam provident quia odio maiores, possimus rem facilis dignissimos? Autem pariatur placeat officia nihil veritatis quo adipisci debitis aliquam vitae praesentium, ad quae doloremque, eos dolorem nobis quibusdam dicta vel, id fugit. Distinctio laborum quas, corrupti eveniet asperiores blanditiis, fugit expedita consequuntur saepe quibusdam, sit esse. Totam quasi dolorem enim amet provident iure, rem magni tempore explicabo. Quod delectus facere perspiciatis, culpa dolore illo optio explicabo doloribus fuga veritatis? Dolorum asperiores ea ipsam dicta facere eveniet qui, molestias, nam itaque perferendis odio. Sed magni obcaecati cumque nulla minus sequi fugiat! Recusandae placeat cupiditate possimus magnam blanditiis, est id animi. Voluptas quia aut in facere delectus dolore eum minus iusto? Corrupti maiores porro, possimus cum natus nam aspernatur dignissimos illum sit voluptatibus assumenda beatae, facere asperiores odit!Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorum saepe et assumenda modi repudiandae deleniti rerum hic iusto soluta quas magni cumque, qui vitae aliquam provident quia odio maiores, possimus rem facilis dignissimos? Autem pariatur placeat officia nihil veritatis quo adipisci debitis aliquam vitae praesentium, ad quae doloremque, eos dolorem nobis quibusdam dicta vel, id fugit. Distinctio laborum quas, corrupti eveniet asperiores blanditiis, fugit expedita consequuntur saepe quibusdam, sit esse. Totam quasi dolorem enim amet provident iure, rem magni tempore explicabo. Quod delectus facere perspiciatis, culpa dolore illo optio explicabo doloribus fuga veritatis? Dolorum asperiores ea ipsam dicta facere eveniet qui, molestias, nam itaque perferendis odio. Sed magni obcaecati cumque nulla minus sequi fugiat! Recusandae placeat cupiditate possimus magnam blanditiis, est id animi. Voluptas quia aut in facere delectus dolore eum minus iusto? Corrupti maiores porro, possimus cum natus nam aspernatur dignissimos illum sit voluptatibus assumenda beatae, facere asperiores odit! Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum excepturi nostrum possimus delectus fugit? Beatae consectetur officiis laudantium id, enim fuga quibusdam unde. Voluptatum dolor suscipit debitis officia libero quam earum neque tenetur aspernatur nobis totam ullam cupiditate magnam dignissimos amet est, quod quae placeat voluptates fugiat? Reprehenderit, autem quae similique voluptatum repellat ex, eius voluptate libero modi cum tempore recusandae itaque iste nihil quod animi non, officia incidunt reiciendis molestias! Magnam, esse, iure culpa perspiciatis ex eaque iste cum praesentium optio deleniti veritatis. Maxime ipsa aperiam maiores excepturi consectetur alias magni voluptatem illum voluptates? Animi veniam facilis dicta pariatur distinctio. Velit nobis aliquid voluptatum laborum, necessitatibus omnis expedita commodi ea totam sunt, in facilis consequatur? Perferendis hic, ipsa blanditiis sunt repudiandae repellendus esse obcaecati beatae ducimus ad exercitationem, quidem ab dolorum voluptatum impedit saepe, cumque qui a dolor accusamus molestiae facere soluta animi. Sequi vel tenetur molestiae nam nesciunt! Debitis fugiat libero explicabo iusto, iste quidem quas enim dolores veniam sequi recusandae suscipit eaque cupiditate laboriosam vero inventore consectetur excepturi quo optio! Mollitia facere neque molestias debitis voluptate repudiandae voluptatum perspiciatis, ex nisi eligendi perferendis esse totam facilis. Distinctio numquam officiis ipsum libero nisi incidunt iure aliquam reprehenderit nam.</p>}
        //                     {activeTab === 'tab2' && <p>Content for Tab 2</p>}
        //                     {/* {activeTab === 'tab2.1' && <UtilitiesImport />} */}
        //                     {activeTab === 'tab2.2' && <p>Content for Tab 2.2</p>}
        //                     {activeTab === 'financials' &&

        //                         <div className='flex gap-3 shadow-sm p-2 mb-2'>
        //                             <button onClick={() => handleNestedTabChange('financials', 'Utilities / Integrations / Financials')}
        //                                 className={`py-2 px-4 rounded ${nestedActiveTab === 'financials' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                                 Financials
        //                             </button>
        //                             <button onClick={() => handleNestedTabChange('out_look', 'Utilities / Integrations / Outlook')}
        //                                 className={`py-2 px-4 rounded ${nestedActiveTab === 'out_look' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                                 Outlook
        //                             </button>
        //                             <button onClick={() => handleNestedTabChange('zapier', 'Utilities / Integrations / Zapier')}
        //                                 className={`py-2 px-4 rounded ${nestedActiveTab === 'zapier' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                                 Zapier
        //                             </button>
        //                             <button onClick={() => handleNestedTabChange('text_sms', 'Utilities / Integrations / Text-SMS')}
        //                                 className={`py-2 px-4 rounded ${nestedActiveTab === 'text_sms' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                                 Text / SMS
        //                             </button>
        //                             <button onClick={() => handleNestedTabChange('whatApps', 'Utilities / Integrations / WhatApps')}
        //                                 className={`py-2 px-4 rounded ${nestedActiveTab === 'whatApps' ? 'bg-pink-800 text-white font-semibold' : 'bg-gray-100'}`}>
        //                                 WhatApps
        //                             </button>
        //                         </div>

        //                     }
        //                     {activeTab === 'tab3' && <p>Content for Tab 3</p>}
        //                     {/* {activeTab === 'tab3.1' && <GlobalGeneral />}
        //                         {activeTab === 'tab3.2' && <DefaultSetting />}
        //                         {activeTab === 'tab3.3' && <TaxSetting />}
        //                         {activeTab === 'tab3.4' && <DefaultTermsConditions />}
        //                         {activeTab === 'tab3.5' && <ApplicationBIlling />} */}

        //                     {activeTab === 'tab4' && <p>Preferences Content in Tab 4</p>}



        //                     {/* Nested tabs */}
        //                     {nestedActiveTab === 'financials' && <p>Financials content</p>}
        //                     {nestedActiveTab === 'out_look' && <p>Outlook content</p>}
        //                     {nestedActiveTab === 'zapier' && <p>Zapier content</p>}
        //                     {nestedActiveTab === 'text_sms' && <p>Text / Sms Content</p>}
        //                     {nestedActiveTab === 'whatApps' && <p>WhatApps content</p>}


        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        // <div className="absolute w-full top-16 z-20 bg-gray-50">
        //     <div className='flex items-start'>
        //         <div className='shadow-md p-2 rounded mt-5 w-1/6 bg-white'>
        //             {tabs.map((tab) => (
        //                 <button
        //                     key={tab.id}
        //                     className={`py-2 px-4 flex items-center w-full flex-col border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-white bg-blue-400 rounded' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        //                         }`}
        //                     onClick={() => setActiveTab(tab.id)}
        //                 >
        //                     {tab.title}
        //                 </button>
        //             ))}
        //         </div>
        //         <div className="p-4 h-[89vh] w-full overflow-y-auto">
        //             {tabs.map((tab) =>
        //                 activeTab === tab.id ? <div key={tab.id}>{tab.content}</div> : null
        //             )}
        //         </div>
        //     </div>
        // </div>
    )
}

export default HeaderSetting