import React, { useEffect, useState } from 'react';
import Loading from '../../../Loading';
import { apiService } from '../../../services/apiService';
import Button from '../../../components/componentLists/Button';

const DeliveryDashboard = () => {
    const [higher, setHigher] = useState([]);
    const [lower, setLower] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeTab, setActiveTab] = useState('card1');




    const filtered = (list) =>
        list.filter((item) =>
            item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );


    // Handle Tab Switch
    const switchTab = (tab) => {
        setActiveTab(tab);
    };


    const renderCard = (items, title, color) => (
        <div className="bg-white shadow-md rounded-2xl p-6">
            <h2 className={`text-xl font-semibold mb-4 ${color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                {color === 'green' ? '📈 Higher than Avg' : '📉 Lower than Avg'}
            </h2>
            {items.length === 0 ? (
                <p className="text-gray-500 text-sm">No symbols in this category.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-xl border ${color === 'green'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div>
                                <p className={`font-semibold text-${color}-700 text-lg`}>{item.symbol}</p>
                                <p className="text-xs text-gray-500">Current: {item.current} | Avg: {item.average}</p>
                            </div>
                            <div
                                className={`text-sm px-3 py-1 rounded-full font-semibold bg-opacity-20 ${color === 'green'
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-red-200 text-red-800'
                                    }`}
                            >
                                {item.change} {title}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );


    useEffect(() => {
        const fetchDeliveryData = async () => {
            try {
                const serverResponse = await apiService.getInfoFromServer('/delivery/cards')
                const data = serverResponse
                // console.log(data)
                if (data.status) {
                    setHigher(data.higher);
                    setLower(data.lower);
                }
                // console.log(data.whichFile)
                
                // window.alert('FileCompared to ' + data.fileCompared)
            } catch (err) {
                console.error('Failed to fetch delivery data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeliveryData();
    }, []);

    if (loading) {
        return <div className="text-center mt-10 text-lg font-medium"><Loading msg={'Please wait...'} /></div>;
    }

    const renderSymbolCards = (items, color) => (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className={`rounded-xl shadow-md p-4 border-l-4 ${color === 'green'
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                        }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-gray-800">{item.symbol}</h3>
                        <span
                            className={`text-sm font-semibold px-2 py-1 rounded ${color === 'green'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {item.change}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                        Current: {item.current} | Avg: {item.average}
                    </p>
                    <p className="text-xs italic text-gray-500">
                        {color === 'green' ? 'Above average' : 'Below average'}
                    </p>
                </div>
            ))}
        </div>
    );


    return (
        <>
            <div className='flex gap-4 items-center mb-2'>
                {/* <div className="flex">
                    <Button
                        className={`px-3 py-1 font-semibold ${activeTab === 'card1' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                            } rounded-l`}
                        onClick={() => switchTab('card1')}
                        children={'CARD 1'}
                    />
                    <Button
                        className={`px-3 py-1 font-semibold ${activeTab === 'card2' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                            } rounded-r`}
                        onClick={() => switchTab('card2')}
                        children={'CARD 2'}
                    />
                </div> */}
                <div className='px-6'>
                    {/* Search Filter */}
                    <div className="">
                        <input
                            type="text"
                            className="w-full sm:w-96 border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="🔍 Search by symbol name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {activeTab === 'card1' && (
                <div className="h-full overflow-y-auto px-6 py-8 space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold text-green-700 mb-4">📈 Higher than Average</h2>
                        {higher.length === 0 ? (
                            <p className="text-gray-400">No symbols in this category.</p>
                        ) : (
                            renderSymbolCards(filtered(higher), 'green')
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-red-700 mb-4">📉 Lower than Average</h2>
                        {lower.length === 0 ? (
                            <p className="text-gray-400">No symbols in this category.</p>
                        ) : (
                            renderSymbolCards(filtered(lower), 'red')
                        )}
                    </section>
                </div>
            )}
            {/* {activeTab === 'card2' && (
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {renderCard(higher, '↑', 'green')}
                    {renderCard(lower, '↓', 'red')}
                </div>
            )} */}

        </>
    );
};

export default DeliveryDashboard;
