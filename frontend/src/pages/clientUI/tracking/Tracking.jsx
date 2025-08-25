import React, { useEffect } from 'react'
import { useTrackingStore } from '../../../store/allStore'
import Loading from '../../../Loading'

const Tracking = () => {
    const { loading, trackingData, removeTrackingRecord, getTrackingDatabasedUponId } = useTrackingStore()
    useEffect(() => {
        getTrackingDatabasedUponId()
    }, [])
    if (loading) { return <div><Loading msg='Fetching... please wait' /></div> }
    return (
        <>
            <div className="overflow-y-auto max-h-[50vh] mt-2">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-100 border-b-2 sticky -top-0.5">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">STOCKNAME</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">CMP</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trackingData.length > 0 ? (
                            trackingData.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-2 border-b">{item.stockName}</td>
                                    <td className="px-4 py-2 border-b">
                                        {item.cmp !== undefined && item.cmp !== null ? (
                                            item.cmp
                                        ) : (
                                            <span className="text-gray-400 animate-pulse">Loading...</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-2 border-b text-center">
                                        <button
                                            onClick={() => removeTrackingRecord(item._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-4 py-4 text-center text-gray-500 italic"
                                >
                                    No stocks tracked yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Tracking
