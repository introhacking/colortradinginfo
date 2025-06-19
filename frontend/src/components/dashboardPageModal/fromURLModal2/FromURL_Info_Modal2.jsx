import React, { useState } from 'react'
import { bankingService } from '../../../services/bankingService';
import { toast } from 'sonner';
import Button from '../../componentLists/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FromURL_Info_Modal2 = ({ isOpen, onClose, fetchFileLists }) => {
    if (!isOpen) return null;

    // const [selectedFiles, setSelectedFiles] = useState(null);
    // const [progress, setProgress] = useState(0);

    // const [url, setUrl] = useState('');
    // const [data, setData] = useState([]);
    const [error, setError] = useState('');

    const [dateRange, setDateRange] = useState([null, null]);
    // const [datesArray, setDatesArray] = useState([]);
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
        try {
            setError("");

            try {
                const serverResponse = await bankingService.fetchCSV2('/csv/fetch-url-data', result);
                fetchFileLists()

                if (serverResponse.errors.length > 0) {
                    for (let err of serverResponse.errors) {
                        return toast.error(err.error)
                    }
                }
                if (serverResponse.data.length > 0) {
                    for (let data of serverResponse.data) {
                        return toast.success(`Data successfully fetched for ${data.date}`);
                    }
                }
                // console.log(serverResponse)

            } catch (err) {
                // console.error(`Error fetching CSV for`, error);
                setError(`Error fetching CSV data for`);
            }

        } catch (error) {
            console.error("Unexpected error in handleUpload:", error);
            setError("An unexpected error occurred.");
        }


        // for (const date of result) {

        // const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`;

        // try {
        //     const csvData = await bankingService.fetchCSV(url, '/csv/fetch-url-data');

        //     // Add timestamp to CSV data
        //     const newEntry = {
        //         data: csvData,
        //         createdAt: new Date().toISOString(),
        //     };

        //     fetchFileLists()
        //     toast.success(`Data successfully fetched for ${date}.`);
        // } catch (error) {
        //     console.error(`Error fetching CSV for ${date}:`, error);
        //     setError(`Error fetching CSV data for ${date}.`);
        // }
        // }
    };


    // const handleUpload = async () => {
    //     if (!startDate || !endDate) return;

    //     let tempDate = new Date(startDate);
    //     let end = new Date(endDate);
    //     let result = [];

    //     while (tempDate <= end) {
    //         // Generate DDMMYYYY format
    //         let day = String(tempDate.getDate()).padStart(2, "0");
    //         let month = String(tempDate.getMonth() + 1).padStart(2, "0");
    //         let year = tempDate.getFullYear();

    //         let formattedDate = `${day}${month}${year}`;
    //         result.push(formattedDate);

    //         tempDate.setDate(tempDate.getDate() + 1); // Increment by 1 day
    //     }

    //     // setDatesArray(result);

    //     try {
    //         setError("");

    //         https://archives.nseindia.com/products/content/sec_bhavdata_full_14032021.csv

    //         for (const date of result) {
    //             const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`;

    //             try {
    //                 const csvData = await bankingService.fetchCSV(url, '/csv/fetch-url-data');

    //                 // Add timestamp to CSV data
    //                 const newEntry = {
    //                     data: csvData,
    //                     createdAt: new Date().toISOString(),
    //                 };

    //                 fetchFileLists()
    //                 toast.success(`Data successfully fetched for ${date}.`);
    //             } catch (error) {
    //                 console.error(`Error fetching CSV for ${date}:`, error);
    //                 setError(`Error fetching CSV data for ${date}.`);
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Unexpected error in handleUpload:", error);
    //         setError("An unexpected error occurred.");
    //     }
    // };



    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-1/3 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>From URL</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='min-h-[15vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2 flex-col'>

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

export default FromURL_Info_Modal2