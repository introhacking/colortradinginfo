import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BACKEND_URI, apiService } from '../../../services/apiService';
import Button from '../../../components/componentLists/Button';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import Loading from '../../../Loading';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import VideoUpload_Info_Modal from '../../../components/dashboardPageModal/videoUpload/VideoUpload_Info_Modal';
import VideoUpload_videoPlayer from '../../../components/dashboardPageModal/videoUpload/VideoUpload_videoPlayer';
import VideoDeleteModal from '../../../components/dashboardPageModal/alertModal/VideoDeleteModal';
import VideoUpload_Edit_Form from '../../../components/dashboardPageModal/videoUpload/VideoUpload_Edit_Form';


// const backendURL = import.meta.env.VITE_BACKEND_URI;


const VideoUploadTable = () => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isSendVideoInfo, setIsSendVideoInfo] = useState({});


    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    // TABLE DELETING  
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    // const [selectedTableToDeletedByLabel, setSelectedTableToDeletedByLabel] = useState('Sale growth');

    // const [columnDefs] = useState([
    //     {
    //         headerName: "Action",
    //         field: 'action',
    //         pinned: 'left',
    //         maxWidth: 180,
    //         cellRenderer: (params) => (
    //             <div className="flex justify-between">
    //                 <Button
    //                     children={<RiIcons.RiVideoOnLine className="text-2xl" />}
    //                     className="button button_video"
    //                     type="button"
    //                     aria-label="Preview Video"
    //                     onClick={() => {
    //                         videoPlayerModal(params.data);
    //                     }}
    //                 />
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
    //     },
    //     {
    //         headerName: "Video name", field: 'name', maxWidth: 180, filter: true
    //     },
    //     {
    //         headerName: "Video path", field: 'videos',
    //     },
    // ]);


    const [columnDefs] = useState([
        {
            headerName: "Action",
            field: 'action',
            pinned: 'left',
            maxWidth: 180,
            cellRenderer: (params) => (
                <div className="flex justify-between">
                    <Button
                        children={<RiIcons.RiVideoOnLine className="text-2xl" />}
                        className="button button_video"
                        type="button"
                        aria-label="Preview Video"
                        // onClick={() => videoPlayerModal(params.data.fullRecord)}
                        onClick={() => videoPlayerModal({
                            id: params.data.id,
                            name: params.data.name,
                            moduleName: params.data.moduleName,
                            chapterName: params.data.chapterName,
                            videoTitle: params.data.videoTitle,
                            videoUrl: params.data.videoUrl,
                        })}
                    />
                    <Button
                        // onClick={() => updateBankInfo(params.data)}
                        onClick={() => updateVideoPlayer({
                            id: params.data.id,
                            name: params.data.name,
                            moduleName: params.data.moduleName,
                            newModuleName: params.data.moduleName,
                            chapterName: params.data.chapterName,
                            newChapterName: params.data.chapterName,
                            videoTitle: params.data.videoTitle,
                            originalTitle: params.data.videoTitle,
                            videoUrl: params.data.videoUrl,
                        })}
                        children={<BiIcons.BiEdit className="text-2xl" />}
                        className="button ag_table_edit_button"
                        type="button"
                    />
                    <Button
                        children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
                        className="button button_cancel"
                        type="button"
                        onClick={() => deleteConfirmationModal(params.data)}
                    />
                </div>
            ),
        },
        { headerName: "Video name", field: 'name', maxWidth: 180, filter: true },
        { headerName: "Module", field: 'moduleName', filter: true },
        { headerName: "Chapter", field: 'chapterName', filter: true },
        { headerName: "Title", field: 'videoTitle', filter: true },
        {
            headerName: "Video",
            field: 'videoUrl',
            flex: 1,
            cellRenderer: (params) => (
                <video width="160" height="90" controls>
                    <source src={`${BACKEND_URI}${params.value}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )
        }
    ]);


    const updateVideoPlayer = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const videoPlayerModal = (paramData) => {
        setIsSendVideoInfo({ ...paramData })
        setIsVideoModalOpen(true)
    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = 'media'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }


    // const fetchData = async () => {
    //     setIsLoading(true);
    //     setError('');
    //     setNoDataFoundMsg('');
    //     try {
    //         const response = await apiService.getInfoFromServer(`/media/all`);
    //         if (response.length > 0) {
    //             setRowData(response)
    //         } else {
    //             setNoDataFoundMsg('Oops ! No data found');
    //         }

    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');

        try {
            const response = await apiService.getInfoFromServer(`/media/all`);
            if (response.length > 0) {
                const flattenedRows = [];
                response.forEach(media => {
                    media.modules?.forEach(module => {
                        module.chapters?.forEach(chapter => {
                            chapter.videos?.forEach(video => {
                                flattenedRows.push({
                                    id: media._id,
                                    name: media.name,
                                    moduleName: module.moduleName,
                                    chapterName: chapter.chapterName,
                                    videoTitle: video.title,
                                    videoUrl: video.url,
                                    fullRecord: media, // for modals/actions
                                });
                            });
                        });
                    });
                });

                setRowData(flattenedRows);
            } else {
                setNoDataFoundMsg('Oops! No data found');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };



    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);


    useEffect(() => {
        fetchData()
    }, [])



    return (
        <>
            <div className='flex justify-between flex-col gap-3'>
                <div className='flex justify-between gap-2 items-center'>
                    <Button
                        onClick={() => setIsAlertModalOpen(true)}
                        children='Delete All Table Data'
                        className={`${rowData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                        disabled={rowData.length === 0}
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        children='Upload Video'
                        className='button hover:bg-green-400 bg-green-500 text-white'
                    />
                </div>

                {isLoading && <Loading msg='Loading... please wait' />}
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
                )}

            </div>
            <VideoDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} refresh={fetchData} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={'/media_table'} tableName={'Media'} callFunction={fetchData} />
            <VideoUpload_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} editData={isParamsData} refreshData={fetchData} />
            <VideoUpload_videoPlayer isOpen={isVideoModalOpen} isParamsData={isSendVideoInfo} onClose={() => setIsVideoModalOpen(false)} />
            <VideoUpload_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        </>
    );
};

export default VideoUploadTable;
