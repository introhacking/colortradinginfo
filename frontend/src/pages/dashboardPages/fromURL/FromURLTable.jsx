import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import Loading from '../../../Loading';
// import Delivery_Info_Modal from '../../../components/dashboardPageModal/deliveryModal/Delivery_Info_Modal';
import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import FromURL_Info_Modal from '../../../components/dashboardPageModal/fromURLModal/FromURL_Info_Modal';
import FromURL_Edit_Form from '../../../components/dashboardPageModal/fromURLModal/FromURL_Edit_Form';
// import Delivery_Edit_Form from '../../../components/dashboardPageModal/deliveryModal/Delivery_Edit_Form';

const FromURLTable = () => {
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('latest');

    const tableHeadings = [
        "Client Type", "Future Index Long", "Future Index Short", "Future Stock Long", "Future Stock Short",
        "Option Index Call Long", "Option Index Put Long", "Option Index Call Short", "Option Index Put Short",
        "Option Stock Call Long", "Option Stock Put Long", "Option Stock Call Short", "Option Stock Put Short",
        "Total Long Contracts", "Total Short Contracts"
    ];
    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    // TABLE DELETING  
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    // const [selectedTableToDeletedByLabel, setSelectedTableToDeletedByLabel] = useState('Sale growth');

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = 'delivery'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }


    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const response = await bankingService.getInfoFromServer(`/delivery`);
            const data = response;

            //  1 METHOD

            const maxVolumnDeliveryLength = Math.max(...data.map(stock => stock.volumnDeliveryData.length));
            if (data.length > 0) {
                const dynamicCols = [];
                const customColHeader = {
                    headerName: "Action",
                    field: 'action',
                    pinned: 'left',
                    maxWidth: 140,
                    cellRenderer: (params) => (
                        <div className="flex justify-between">
                            <Button
                                onClick={() => updateBankInfo(params.data)}
                                children={<BiIcons.BiEdit className="text-2xl" />}
                                className="button ag_table_edit_button"
                                type="button"
                            />
                            <Button
                                children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
                                className="button button_cancel"
                                type="button"
                                onClick={() => {
                                    deleteConfirmationModal(params.data);
                                }}
                            />
                        </div>
                    ),
                }
                for (let i = 0; i < maxVolumnDeliveryLength; i += 2) {
                    dynamicCols.push({
                        headerName: `Volume V${i / 2 + 1} , Del % D${i / 2 + 1}`,
                        field: `vol_v${i / 2 + 1} & del_d${i / 2 + 1}`,
                        sortable: true,
                        filter: true,
                        maxWidth: 250,
                        cellClass: 'custom-cell-style',
                        valueGetter: (params) => {
                            const volValue = params.data.volumnDeliveryData[i];
                            const delValue = params.data.volumnDeliveryData[i + 1];
                            return volValue !== undefined || delValue !== undefined ? `${volValue} , ${delValue}` : '-';
                        },
                    });
                }

                const cols = [
                    { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 150 },
                    ...dynamicCols,
                    { headerName: '_id', field: '_id', sortable: true, filter: true, maxWidth: 250 }, // Add _id column at the end
                ];

                cols.unshift(customColHeader)
                setColumnDefs(cols);
                setRowData(data);
            }
            else {
                setNoDataFoundMsg('No data found for the selected option.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // fetchData();
    }, []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);



    const [data, setData] = useState([]);
    const [oldData, setOldData] = useState([]);
    const [diffRow, setDiffRow] = useState([]);
    // Calculate Row-wise Difference (Today - Previous)
    const calculateDifference = (storedData) => {
        // if (storedData.length >= 2) {
        //     const todayData = storedData[0].data;
        //     const prevData = storedData[1].data == '' && storedData[2].data;

        //     const diffData = todayData?.results.map((row, index) => {
        //         const diffRow = {};
        //         Object.keys(row).forEach((key) => {
        //             const value1 = parseFloat(row[key]) || 0;
        //             const value2 = parseFloat(prevData[index]?.[key]) || 0;
        //             diffRow[key] = value1 - value2;
        //         });
        //         return diffRow;
        //     });
        // }


        if (storedData.length < 2) {
            console.warn("Not enough data to calculate differences.");
            return;
        }

        const allDiffTables = [];

        for (let i = 1; i < storedData.length; i++) {
            const todayData = storedData[i]?.data?.results || [];

            if (!todayData.length) {
                console.warn(`Skipping comparison for index ${i} due to missing current data.`);
                continue;
            }

            // Find the most recent previous valid dataset
            let prevIndex = i - 1;
            while (prevIndex >= 0 && (!storedData[prevIndex]?.data?.results?.length)) {
                prevIndex--;
            }

            if (prevIndex < 0) {
                console.warn(`No previous valid data found for index ${i}.`);
                continue;
            }

            const prevData = storedData[prevIndex].data.results;

            const diffData = todayData.map((row, index) => {
                const diffRow = {};
                Object.keys(row).forEach((key) => {
                    if (key !== "Client Type") {
                        const value1 = parseFloat(row[key]) || 0;
                        const value2 = parseFloat(prevData[index]?.[key]) || 0;
                        diffRow[key] = value1 - value2;
                    } else {
                        diffRow[key] = row[key];
                    }
                });
                return diffRow;
            });

            allDiffTables.push({
                date: `${storedData[prevIndex].data.date} → ${storedData[i].data.date}`,
                diffData,
            });
        }


        // =============  working ======
        // if (storedData.length < 2) {
        //     console.warn("Not enough data to calculate differences.");
        //     return;
        // }

        // const allDiffTables = [];

        // for (let i = 1; i < storedData.length; i++) {
        //     const todayData = storedData[i]?.data?.results || [];
        //     const prevData = storedData[i - 1]?.data?.results || [];

        //     if (!todayData.length || !prevData.length) {
        //         console.warn(`Skipping comparison for index ${i} due to missing data.`);
        //         continue;
        //     }

        //     const diffData = todayData.map((row, index) => {
        //         const diffRow = {};
        //         Object.keys(row).forEach((key) => {
        //             if (key !== "Client Type") { // Keep non-numeric fields untouched
        //                 const value1 = parseFloat(row[key]) || 0;
        //                 const value2 = parseFloat(prevData[index]?.[key]) || 0;
        //                 diffRow[key] = value1 - value2;
        //             } else {
        //                 diffRow[key] = row[key]; // Retain category names
        //             }
        //         });
        //         return diffRow;
        //     });

        //     allDiffTables.push({
        //         date: `${storedData[i - 1].data.date} → ${storedData[i].data.date}`,
        //         diffData,
        //     });
        // }

        setDiffRow(allDiffTables); // Store differences in state
    };


    const getDataFromLCLSRG = () => {
        const localData = JSON.parse(localStorage.getItem('csvData')) || [];
        // Get last 5 days data
        const fiveDaysAgo = new Date();
        // fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 20);

        const filteredData = localData?.filter(
            (item) => new Date(item.createdAt) >= fiveDaysAgo
        );

        if (filteredData.length >= 2) {
            calculateDifference(filteredData);
        }
        setOldData(filteredData);
    };

    useEffect(() => {

        getDataFromLCLSRG();
    }, []);


    // Handle Tab Switch
    const switchTab = (tab) => {
        setActiveTab(tab);
    };


    return (
        <>
            <div className='flex justify-between flex-col gap-3'>
                <div className='flex justify-between gap-2 items-center'>
                    <div className='flex justify-start'>
                        <Button
                            onClick={() => setIsAlertModalOpen(true)}
                            children='Delete All Table Data'
                            className={`${rowData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                            disabled={rowData.length === 0}
                        />
                        {/* Tab Buttons */}
                        <div className="flex ml-3">
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                                    } rounded-l`}
                                onClick={() => switchTab('latest')}
                                children={'Latest Data'}
                            />
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'diff' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                                    } rounded-r`}
                                onClick={() => switchTab('diff')}
                                children={'Difference'}
                            />

                            {/* <input type="date" className='ml-4 w-1/6' onChange={(e) => { dateChange(e) }} /> */}
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        children='Get Data From Date'
                        className='button hover:bg-green-400 bg-green-500 text-white'
                    />
                </div>

                {/* {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}

                {!isLoading && !error && !noDataFoundMsg && (
                    <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            pagination={true}
                            paginationPageSize={100}
                        />
                    </div>
                )} */}


                {/* <div className='overflow-y-auto h-[75vh] w-full '>

               </div> */}

            </div >

            <div className="overflow-auto h-[75vh] w-[175vh] bg-gray-50 p-4 shadow-lg rounded-xl my-4">
                {activeTab === 'latest' && oldData?.length > 0 && (
                    <div className="relative overflow-x-auto rounded-lg">
                        {oldData.map((entry, index) => {
                            // Check if data is valid (not empty or invalid format)
                            if (!entry.data || (Array.isArray(entry.data) && entry.data.length === 0)) {
                                return (
                                    <div
                                        key={index}
                                        className="mb-4 text-center text-red-500 font-medium"
                                    >
                                        ⚠️ No data available for the entry created on:{" "}
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </div>
                                );
                            }

                            // Handle valid data
                            return (
                                <div key={index} className="mb-6">
                                    {/* Heading Section */}
                                    <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
                                        {entry.data.results[0]?.[""] || "No Description Available"}
                                    </h2>

                                    {/* Date Info */}
                                    <p className="text-sm text-gray-500 text-center mb-4">
                                        Data created on: {new Date(entry.createdAt).toLocaleDateString()}
                                    </p>

                                    {/* Table Section */}
                                    <p className='text-sm font-semibold'>Date: {entry?.data?.date}</p>
                                    <div className="relative overflow-x-auto rounded-lg shadow">
                                        <table className="w-full text-sm text-left text-gray-700 border-collapse">
                                            <thead className="bg-gray-800 text-white uppercase text-xs">
                                                <tr>
                                                    {Object.values(entry.data.results[0] || {}).map((key) => (
                                                        <th
                                                            key={key}
                                                            className="w-full whitespace-nowrap px-4 py-3 text-center border border-gray-700"
                                                        >
                                                            {key}
                                                        </th>


                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {entry?.data.results.slice(1).map((row, i) => (
                                                    <tr
                                                        key={i}
                                                        className={`${i % 2 === 0 ? "bg-gray-100" : "bg-white"
                                                            } hover:bg-gray-200 transition duration-200`}
                                                    >
                                                        {Object.values(row).map((value, j) => (
                                                            <td
                                                                key={j}
                                                                className="px-4 py-2 text-center border border-gray-300"
                                                            >
                                                                {value}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === "diff" && diffRow?.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-red-700">Sequential Differences (Day-to-Day)</h2>
                        {diffRow.map((table, tableIndex) => (
                            <div key={tableIndex} className="mb-6">
                                <h3 className="text-lg font-bold mb-2 text-blue-600">
                                    Difference Table ({table.date})
                                </h3>
                                <div className="relative overflow-x-auto rounded-lg">
                                    <table className="w-full text-sm text-left text-gray-700 border-collapse">
                                        <thead className="bg-red-800 text-white uppercase text-xs">
                                            <tr>

                                                {tableHeadings.map((heading, i) => (
                                                    <th key={i} className="px-4 whitespace-nowrap py-3 text-center border border-gray-700">
                                                        {heading}
                                                    </th>
                                                ))}


                                                {/* {Object.keys(table.diffData[0]).map((key) => (
                                                        <th key={key} className="px-4 py-3 text-center border border-gray-700">
                                                            {key}
                                                        </th>
                                                    ))} */}
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {/* Remaining columns: Data values */}
                                            {table.diffData.map((row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className={`${rowIndex % 2 === 0 ? "bg-yellow-50" : "bg-yellow-200"
                                                        } hover:bg-yellow-300 transition duration-200`}
                                                >

                                                    {Object.values(row).map((value, i) => (
                                                        <td key={i} className="px-4 py-2 text-center border border-gray-300">
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={'/delivery_table'} tableName={'Delivery'} callFunction={fetchData} />
            <FromURL_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData}  fetchData={fetchData} /> */}
            < FromURL_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refresh={getDataFromLCLSRG} />





            {/* <div className="overflow-auto h-[65vh] w-[180vh] bg-gray-50 p-4 shadow-lg rounded-xl my-4">
                {data?.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-lg">
                        <table className="w-full text-sm text-left text-gray-700 border-collapse">
                            <thead className="bg-gray-800 text-white uppercase text-xs">
                                <tr>
                                    {Object.keys(data[0]).map((key) => (
                                        <th
                                            key={key}
                                            className="px-4 py-3 text-center border border-gray-700"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                                            } hover:bg-gray-200 transition duration-200`}
                                    >
                                        {Object.values(row).map((value, i) => (
                                            <td
                                                key={i}
                                                className="px-4 py-2 text-center border border-gray-300"
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-4">
                        No data available to display.
                    </p>
                )}
            </div> */}
        </>
    );
};

export default FromURLTable;
