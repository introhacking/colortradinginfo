import axios from 'axios';
import JoditEditor from 'jodit-react';
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { bankingService } from '../../../services/bankingService.js'
import Button from '../../componentLists/Button';
import { toast } from 'sonner'



const IT_Info_Form = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [ITInfo, setITInfo] = useState({
        name: '',
        it_type: '',
        description: '',
        color: '#000000'
    })
    console.log(ITInfo)


    const infoOnchangeHandler = (e) => {
        const { name, value } = e.target;
        // setITInfo({ ...ITInfo, [name]: value })
        setITInfo(prevState => ({ ...prevState, [name]: value }))

        const options = name === 'name' ? optionss : optionsss;

        if (value && !options.includes(value)) {
            if (name === 'name' && ITInfo.name === '') {
                setIsNotFound(prevState => ({ ...prevState, name: true }));
            } else if (name === 'it_type' && ITInfo.it_type === '') {
                setIsNotFound(prevState => ({ ...prevState, it_type: true }));
            } else {
                setErrors({});
            }
        } else {
            setIsNotFound(prevState => ({ ...prevState, [name]: false }));
            setErrors({});
        }
        // if(ITInfo.name) return setBankFormError('')
    }

    const paragraphFieldChanged = (data) => {
        // console.log(data)
        ITInfo.description = data
        setITInfo({ ...ITInfo })
    }

    const editor = useRef(null);
    // const [paragraph, setParagraph] = useState('');
    // const bankDataUpload = async () => {
    //     const formData = new FormData();
    //     formData.append('bankexcel', fileRead);
    //     try {
    //         const response = await axios.post('/api/v1/bank/upload', formData, {
    //             onUploadProgress: (progressEvent) => {
    //                 const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    //                 setProgress(percentage);
    //             },
    //         })
    //         setProgress(0)
    //         // localStorage.setItem(fileName, JSON.stringify(response.data))
    //         setUploadedDataFromServer(response.data)
    //         console.log(response.data)
    //     } catch (error) {
    //         console.error('Error uploading file:', error.message);
    //     }
    // }
    const options = ['bold', 'italic', '|', 'ul', 'ol', '|', 'font', 'fontsize', '|', 'outdent', 'indent', 'align', '|', 'hr', '|', 'image', 'fullsize', 'brush', '|', 'table', 'link', '|', 'undo', 'redo',];

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: '',
            defaultActionOnPaste: 'insert_as_html',
            defaultLineHeight: 1.5,
            enter: 'div',
            // options that we defined in above step.
            buttons: options,
            buttonsMD: options,
            buttonsSM: options,
            buttonsXS: options,
            statusbar: false,
            sizeLG: 900,
            sizeMD: 700,
            sizeSM: 400,
            toolbarAdaptive: false,
        }),
        [],
    );
    const [errors, setErrors] = useState({});
    const submitBankInfo = async () => {
        // const { name, it_type, description } = ITInfo

        // if (!name) return setBankFormError('Bank name is required!')
        // Validate the form
        const newErrors = {};
        Object.keys(ITInfo).forEach((field) => {
            if (!ITInfo[field]) {
                newErrors[field] = `Required*`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const customModifiedData = {
                it_name: ITInfo.name,
                it_type: ITInfo.it_type,
                description: ITInfo.description,
                bg_color: ITInfo.color
            }
            try {
                const ITInfoResp = await bankingService.postFormInfoToServer('/itCreate', customModifiedData)
                toast.success('Create Successfully')
                setITInfo({
                    name: '',
                    it_type: '',
                    description: '',
                    color: '#000000'
                })
                setErrors({});
            } catch (error) {

            }
            // Add your form submission logic here
        }
    }
    const [isNotFound, setIsNotFound] = useState({ name: false, it_type: false });
    // const [isNotFoundType, setIsNotFoundType] = useState(false);
    const [optionss] = useState([
        "3M India Ltd",
        "ABB India Ltd",
        "Abbott India Ltd",
        "ACC Ltd",
        "Aditya Vision Ltd",
        'Apple',
        'Banana',
        'Cherry'

    ]);
    const [optionsss] = useState([
        "3M India Ltd",
        "ABB India Ltd",
        "Abbott India Ltd",
        "ACC Ltd",
        "Aditya Vision Ltd",
        'Apple',
        'Banana',
        'Cherry'

    ]);
    return (

        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex w-full items-center justify-end font-medium text-xl mb-2 p-2'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar p-2'>
                    <form action="POST" className='space-y-6'>
                        <div className='flex justify-center items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    {/* <label htmlFor="name" className='mb-1 inline-block'>Choose Bank name</label> */}
                                    {/* <select name="name" id="name" onChange={(e) => { infoOnchangeHandler(e) }}>
                                        <option value="">--Choose Bank name--</option>
                                        <option value="Axis">Axis bank</option>
                                        <option value="Canera">Canera bank</option>
                                        <option value="IDFC">IDFC bank</option>
                                        <option value="HDFC">HDFC bank</option>
                                        <option value="Allahbad">Allahbad bank</option>

                                    </select> */}


                                    <div className='relative'>
                                        <input
                                            list="data-options"
                                            value={ITInfo.name}
                                            onChange={infoOnchangeHandler}
                                            placeholder="--Search IT Name--"
                                            name='name'
                                            className='placeholder:text-black'
                                        />
                                        <datalist id="data-options">
                                            {optionss
                                                .filter(option => option.toLowerCase().includes(ITInfo.name.toLowerCase()))
                                                .map((option, index) => (
                                                    <option key={index} value={option} />
                                                ))}
                                        </datalist>
                                        {isNotFound.name && <div className='text-[12px] text-red-600 font-medium absolute'>Not Found 🤐</div>}
                                    </div>

                                    {/* 
                                    <div className="searchable-dropdown">
                                        <input
                                            list="data-options"
                                            onChange={handleInputChange}
                                            placeholder="Search..."
                                            className="input-field"
                                        />
                                        <datalist id="data-options">
                                            {filteredOptions.map((option, index) => (
                                                <option key={index} value={option} />
                                            ))}
                                        </datalist>
                                    </div> */}




                                    {errors.name && <p className='text-[13px] text-red-500 font-medium'>{errors.name}</p>}
                                    {/* <input className='' type="select" id='name' name='name' onChange={fileOnchange} /> */}
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    {/* <select name="it_type" id="it_type" onChange={(e) => { infoOnchangeHandler(e) }}>
                                        <option value="">--Choose Management type--</option>
                                        <option value="state backing">State backing</option>
                                        <option value="Deposite growth">Deposite growth</option>
                                        <option value="Partner backing">Partner backing</option>
                                        <option value="Fixed deposite">Fixed deposite</option>
                                        <option value="Nim">Net of interest margin(NIM)</option>
                                        <option value="Regulatory">Regulatory</option>
                                        <option value="Provisions">Provisions</option>
                                        <option value="ABCD">ABCD</option>

                                    </select> */}
                                    <div className='relative'>
                                        <input
                                            list="data-options1"
                                            value={ITInfo.it_type}
                                            onChange={infoOnchangeHandler}
                                            placeholder="--Choose IT type--"
                                            name='it_type'
                                            className='placeholder:text-black'
                                        />
                                        <datalist id="data-options1">
                                            {optionsss
                                                .filter(option => option.toLowerCase().includes(ITInfo.it_type.toLowerCase()))
                                                .map((option, index) => (
                                                    <option key={index} value={option} />
                                                ))}
                                        </datalist>
                                        {isNotFound.it_type && <div className='text-[12px] text-red-600 font-medium absolute'>Not Found 🤐</div>}
                                    </div>
                                    {errors.it_type && <p className='text-[13px] text-red-500 font-medium'>{errors.it_type}</p>}

                                </div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full flex items-center gap-1'>
                                    <input type="text" value={ITInfo.color} disabled />
                                    <input type="color" name='color' onChange={(e) => { infoOnchangeHandler(e) }} className='w-10 h-10 p-1' />
                                </div>
                            </div>
                        </div>
                        <div className='my-6'>
                            <JoditEditor
                                ref={editor}
                                value={ITInfo.description}
                                tabIndex={1}
                                config={config}
                                // readonly={false}
                                minHeight={350}
                                // toolbarAdaptive={false}
                                onChange={paragraphFieldChanged} />
                        </div>

                    </form>
                    {/* {JSON.stringify(uploadedDataFromServer)} */}
                </div>
                <div className='flex justify-end items-center gap-2 mt-4 p-2'>
                    <Button onClick={() => { submitBankInfo() }} className={'button button_ac'} type="button" children={'Submit'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>

    )
}

export default IT_Info_Form