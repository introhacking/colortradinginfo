import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import Loading from '../../../Loading';
import DeleteTechBankModal from '../../../components/dashboardPageModal/alertModal/DeleteTechBankModal';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import Technical_Banking_Info_Modal from '../../../components/dashboardPageModal/technicalModal/Technical_Banking_Info_Modal';
import Technical_Banking_Edit_Modal from '../../../components/dashboardPageModal/technicalModal/Technical_Banking_Edit_Modal';
import Sectorial_Info_Modal from '../../../components/dashboardPageModal/sectorialModal/Sectorial_Info_Modal';

const SectorialTable = () => {
    const [sectorData, setSectorData] = useState([]);
    // const [columnDefs, setColumnDefs] = useState([]);
    // const [selectedTableOption, setSelectedTableOption] = useState('technical-banking_sale_growth');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})


    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

    // TABLE DELETING  
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    // const [selectedTableToDeletedByLabel, setSelectedTableToDeletedByLabel] = useState('Sale growth');


    // const options = [
    //     { value: '', label: '--Choose table--' },
    //     { value: 'technical-banking_sale_growth', label: 'Sale growth' },
    //     { value: 'technical-banking_opg', label: 'Operating profit growth' },
    //     { value: 'technical-banking_npg', label: 'Net profit growth' },
    // ];

    // const handleSelectChange = (e) => {
    //     const { value } = e.target;
    //     setSelectedTableOption(value);

    //     const selectedOption = options.find(option => option.value === value);
    //     if (selectedOption) {
    //         setSelectedTableToDeletedByLabel(selectedOption.label);
    //     }
    // };

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)

    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = selectedTableOption
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }


    const fetchData1 = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const response = await bankingService.getInfoFromServer(`/sector`);
            const data = response;
            // if (data.length > 0) {
            //     const cols = Object.keys(data[0]).map(key => ({
            //         headerName: key,
            //         field: key,
            //         sortable: true,
            //         filter: true,
            //         maxWidth: 140,
            //         cellStyle: { textAlign: 'center' }
            //     }));

            //     const customColHeader = {
            //         headerName: "Action",
            //         field: 'action',
            //         maxWidth: 140,
            //         pinned: 'left',
            //         cellRenderer: (params) => (
            //             <div className="flex justify-between">
            //                 <Button
            //                     onClick={() => updateBankInfo(params.data)}
            //                     children={<BiIcons.BiEdit className="text-2xl" />}
            //                     className="button ag_table_edit_button"
            //                     type="button"
            //                 />
            //                 <Button
            //                     children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
            //                     className="button button_cancel"
            //                     type="button"
            //                     onClick={() => {
            //                         deleteConfirmationModal(params.data);
            //                     }}
            //                 />
            //             </div>
            //         ),
            //     };

            //     // cols.unshift(customColHeader);
            //     // setColumnDefs(cols);
            //     // setSectorData(data);
            // } else {
            //     setNoDataFoundMsg('No data found for the selected option.');
            // }
            if (data.length > 0) {
                setSectorData(data)
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const arrayBufferToBase64 = (buffer) => {

        const bytes = new Uint8Array(buffer);     /// Is working
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);



        // const arrayBufferToBase64 = (buffer) => {
        //     let binary = '';
        //     const bytes = new Uint8Array(buffer);
        //     const len = bytes.byteLength;
        //     for (let i = 0; i < len; i++) {
        //         binary += String.fromCharCode(bytes[i]);
        //     }
        //     return window.btoa(binary);
        // };


    };

    const handleImageData = async (imageData) => {

        return images.map((image) => (
            <div key={image.key} className='w-1/3 h-60'>
                <img alt={`${image.key}`} className='w-full h-full cover rounded-sm' src={`data:${image.contentType};base64,${arrayBufferToBase64(image.data.data)}`} />
            </div>
        ));


        // const promises = imageData.map(async (imagePath) => {
        //     const base64String = await arrayBufferToBase64(imagePath.bufferData.data);
        //     return {
        //         ...imagePath,
        //         data: base64String,
        //     };
        // });

        // return Promise.all(promises);
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const response = await bankingService.getInfoFromServer(`/sector`);
            const storeSectorsData = response;
            console.log(storeSectorsData)

            // Convert ArrayBuffer to Base64 for each image
            // const processedSectors = await Promise.all(sectorsData.map(async (sector) => {
            //     const imageData = await Promise.all(sector.imageData.map(async (imagePath) => {
            //         const base64String = await arrayBufferToBase64(imagePath.bufferData.data);
            //         return {
            //             ...imagePath,
            //             data: base64String,
            //         };
            //     }));

            //     return {
            //         ...sector,
            //         imageData,
            //     };
            // }));


            // if (sectorsData.length > 0) {
            setSectorData(storeSectorsData)
            // }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {/* <Button
            children={
                <select className='py-1 px-3' value={selectedTableOption} onChange={handleSelectChange}>
                    {options.map((option, idx) => (
                        <option key={option.value} value={option.value} disabled={idx === 0}>
                            {option.label}
                        </option>
                    ))}
                </select>
            }
            className={`${sectorData.length > 0 && "font-medium"}`}
        /> */}



            <div className='flex justify-between flex-col gap-1'>
                <div className='flex justify-between gap-2 items-center'>
                    <Button
                        onClick={() => setIsAlertModalOpen(true)}
                        children='Delete All Table Data'
                        className={`${sectorData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                        disabled={sectorData.length === 0}
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        children='Add New Sectorial'
                        className='button hover:bg-green-400 bg-green-500 text-white'
                    />
                </div>

                <div className='flex justify-between items-center font-semibold my-1'>
                    <p className='bg-gray-500/60 text-white px-4 rounded-sm'>Month</p>
                    <p className='bg-gray-500/60 text-white px-4 rounded-sm'>Week</p>
                    <p className='bg-gray-500/60 text-white px-4 rounded-sm'>Day</p>
                </div>

                {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}

                {!isLoading && !error && !noDataFoundMsg && (
                    <div className='overflow-y-auto h-[68vh] space-y-1'>
                        {sectorData.map((sector, id) => (
                            <div key={id} className='sector-card flex gap-2 w-full shadow bg-white p-2 rounded'>
                                <div className='sector-name vertical-rl'>
                                    <p className='text-left transform rotate-180 uppercase font-medium text-xl'>{sector.sectorialName}</p>
                                </div>
                                <div className='sector-images flex justify-center gap-3 items-center w-full'>
                                    {/* Render Month Image */}
                                    {sector.imageData?.find(image => image.key === 'month') && (
                                        <div className='image-container w-1/3 h-60'>
                                            <img
                                                alt='month'
                                                className='image w-full h-full cover rounded-sm border'
                                                src={`data:${sector.imageData.find(image => image.key === 'month').contentType};base64,${arrayBufferToBase64(sector.imageData.find(image => image.key === 'month').bufferData.data)}`}
                                            />
                                        </div>
                                    )}

                                    {/* Render Week Image */}
                                    {sector.imageData?.find(image => image.key === 'week') && (
                                        <div className='image-container w-1/3 h-60'>
                                            <img
                                                alt='week'
                                                className='image w-full h-full cover rounded-sm border'
                                                src={`data:${sector.imageData.find(image => image.key === 'week').contentType};base64,${arrayBufferToBase64(sector.imageData.find(image => image.key === 'week').bufferData.data)}`}
                                            />
                                        </div>
                                    )}

                                    {/* Render Day Image */}
                                    {sector.imageData?.find(image => image.key === 'day') && (
                                        <div className='image-container w-1/3 h-60'>
                                            <img
                                                alt='day'
                                                className='image w-full h-full cover rounded-sm border'
                                                src={`data:${sector.imageData.find(image => image.key === 'day').contentType};base64,${arrayBufferToBase64(sector.imageData.find(image => image.key === 'day').bufferData.data)}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>





            {/* IS WORKING */}

            {/* <div className='flex justify-between flex-col gap-1'>
                <div className='flex justify-between gap-2 items-center'>
                    <Button
                        onClick={() => setIsAlertModalOpen(true)}
                        children='Delete All Table Data'
                        className={`${sectorData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                        disabled={sectorData.length === 0}
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        children='Add New Sectorial'
                        className='button hover:bg-green-400 bg-green-500 text-white'
                    />
                </div>
                <div className='flex justify-between items-center font-semibold px-2'>
                    <p className='bg-blue-700 text-white px-4'>Month</p>
                    <p className='bg-blue-700 text-white px-4'>Week</p>
                    <p className='bg-blue-700 text-white px-4'>Day</p>
                </div>

                {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}

                {!isLoading && !error && !noDataFoundMsg && (

                    <div className='overflow-y-auto h-[68vh] space-y-1'>
                        {sectorData.map((sector, id) => (
                            <div key={id} className='sector-card flex gap-2 w-full shadow bg-white p-2 rounded'>
                                <div className='sector-name vertical-rl'>
                                    <p className='text-left transform rotate-180 uppercase font-medium text-xl'>{sector.sectorialName}</p>
                                </div>
                                <div className='sector-images flex justify-center gap-3 items-center w-full'>

                                    {sector.imageData?.map((image, index) => {
                                        if (image.key === 'month' || image.key === 'week' || image.key === 'day') {
                                            return (
                                                <div key={index} className='image-container w-1/3 h-60'>
                                                    <img
                                                        alt={`${image.key}`}
                                                        className='image w-full h-full cover rounded-sm border'
                                                        src={`data:${image.contentType};base64,${arrayBufferToBase64(image.bufferData.data)}`}
                                                    />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div> */}


            {/* {sector.imageData?.map((image, index) => (
                    <div key={index} className='image-container w-1/3 h-60'>
                        <img
                            alt={`${image.key}`}
                            className='image w-full h-full cover rounded-sm border'
                            src={`data:${image.contentType};base64,${arrayBufferToBase64(image.bufferData.data)}`}
                        />
                    </div>
                ))} */}

            {/* IS WORKING END */}





            {/* <DeleteTechBankModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} /> */}
            {/* <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={selectedTableOption} tableName={selectedTableToDeletedByLabel} callFunction={fetchData} /> */}
            <Sectorial_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {/* <Technical_Banking_Edit_Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} /> */}
        </>
    );
};

export default SectorialTable;
