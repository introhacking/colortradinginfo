import React, { useState } from 'react'
import { bankingService } from '../../../services/bankingService';
import { toast } from 'sonner';
import Button from '../../componentLists/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FromURL_Info_Modal = ({ isOpen, onClose, refresh }) => {
    if (!isOpen) return null;

    // const [selectedFiles, setSelectedFiles] = useState(null);
    // const [progress, setProgress] = useState(0);

    const [url, setUrl] = useState('');
    // const [data, setData] = useState([]);
    const [error, setError] = useState('');

    const [dateRange, setDateRange] = useState([null, null]);
    const [datesArray, setDatesArray] = useState([]);
    const [startDate, endDate] = dateRange;


    const handleUpload = async () => {
        if (!startDate || !endDate) return;

        let tempDate = new Date(startDate);
        let end = new Date(endDate);
        let result = [];

        while (tempDate <= end) {
            // Generate DDMMYYYY format
            let day = String(tempDate.getDate()).padStart(2, "0");
            let month = String(tempDate.getMonth() + 1).padStart(2, "0");
            let year = tempDate.getFullYear();

            let formattedDate = `${day}${month}${year}`;
            result.push(formattedDate);

            tempDate.setDate(tempDate.getDate() + 1); // Increment by 1 day
        }

        setDatesArray(result);

        try {
            setError("");

            for (const date of result) {
                const url = `https://archives.nseindia.com/content/nsccl/fao_participant_oi_${date}.csv`;

                try {
                    const csvData = await bankingService.fetchCSV(url, '/csv/fetch-url');

                    // Add timestamp to CSV data
                    const newEntry = {
                        data: csvData,
                        createdAt: new Date().toISOString(),
                    };

                    // Retrieve previous data and append new entry
                    let previousData = JSON.parse(localStorage.getItem("csvData")) || [];
                    previousData.unshift(newEntry); // Add new entry at the beginning

                    // ✅ Keep only the last 5 entries
                    if (previousData.length > 5) {
                        previousData = previousData.slice(0, 5);
                    }

                    localStorage.setItem("csvData", JSON.stringify(previousData));

                    toast.success(`Data successfully fetched for ${date}.`);
                    refresh();
                } catch (error) {
                    console.error(`Error fetching CSV for ${date}:`, error);
                    setError(`Error fetching CSV data for ${date}.`);
                }
            }
        } catch (error) {
            console.error("Unexpected error in handleUpload:", error);
            setError("An unexpected error occurred.");
        }
    };




    // Handle Upload or Create New Record
    // const handleUpload = async () => {
    //     if (!url) {
    //         toast.error('Please paste URL.');
    //         return;
    //     }
    //     try {
    //         setError('');
    //         const csvData = await bankingService.fetchCSV(url);
    //         const newRecord = {
    //             data: csvData,
    //             createdAt: new Date().toISOString(),
    //         };

    //         // Get existing records from localStorage
    //         let storedData = JSON.parse(localStorage.getItem('csvData')) || [];

    //         // Add new record and limit to 5 records
    //         storedData.unshift(newRecord);
    //         if (storedData.length > 5) {
    //             storedData.pop();
    //         }

    //         // Save updated records to localStorage
    //         localStorage.setItem('csvData', JSON.stringify(storedData));
    //         setData(csvData);

    //         // If there are 2 or more records, calculate difference
    //         if (storedData.length >= 2) {
    //             calculateDifference(storedData);
    //         }

    //         toast.success('Data successfully fetched and stored');
    //     } catch (error) {
    //         setError('Error fetching CSV data. Please try again.');
    //     }
    // };

    // Calculate Row-wise Difference (Today - Previous)
    // const calculateDifference = (storedData) => {
    //     if (storedData.length >= 2) {
    //         const todayData = storedData[0].data;
    //         const prevData = storedData[1].data;

    //         const diffData = todayData.map((row, index) => {
    //             const diffRow = {};
    //             Object.keys(row).forEach((key) => {
    //                 const value1 = parseFloat(row[key]) || 0;
    //                 const value2 = parseFloat(prevData[index]?.[key]) || 0;
    //                 diffRow[key] = value1 - value2;
    //             });
    //             return diffRow;
    //         });

    //         setDiffData(diffData); // Store differences in state
    //     }
    // };

    // Load Data and Calculate Difference on Page Load
    // useEffect(() => {
    //     const loadStoredData = () => {
    //         const localData = JSON.parse(localStorage.getItem('csvData')) || [];
    //         if (localData.length >= 2) {
    //             calculateDifference(localData);
    //         }
    //     };
    //     loadStoredData();
    // }, []);




    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>Fetch Data from URL</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='max-h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>

                            <div className='flex gap-2'>
                                <DatePicker
                                    selectsRange
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(update) => setDateRange(update)}
                                    isClearable
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText='Choose date'
                                    className='w-[40vh]'
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"

                                />
                                <Button
                                    onClick={() => handleUpload()}
                                    className={`button ${(!startDate || !endDate) ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={`Fetch Data`}
                                    type={'button'}
                                    disabled={!startDate || !endDate}
                                />
                            </div>

                            {/* <div className='flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="csvURL" className='font-medium'>Paste URL to Fetch Data</label>
                                    <input
                                        className='w-full'
                                        type="text"
                                        id='csvURL'
                                        name='csvURL'
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                </div>
                                <Button
                                    onClick={() => handleUpload()}
                                    className={`button ${!url ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={'Fetch Data'}
                                    type={'button'}
                                    disabled={!url}
                                />
                            </div> */}

                        </div>

                    </form>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default FromURL_Info_Modal