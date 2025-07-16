import React, { useState, useRef, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import JoditRichTextEditor from '../JoditRichTextEditor';
import JoditEditor from 'jodit-react';
import Button from '../componentLists/Button';
import { apiService } from '../../services/apiService';



const Add_Content_Related_Row_Column = ({ updateModalData, setUpdateModalStatus }) => {
    const [color, setColor] = useState('#000000');
    const [imageUrl, setImageUrl] = useState('')
    const [paragraph, setParagraph] = useState('');
    const [title, setPostTitle] = useState('')
    const [cellTitle, setCellTitle] = useState('')
    const editor = useRef(null);
    const config = {
        buttons: [
            'source', '|',
            'bold',
            'strikethrough',
            'underline',
            'italic', '|',
            'ul',
            'ol', '|',
            'outdent', 'indent', '|',
            'font',
            'fontsize',
            'brush',
            'paragraph', '|',
            'image',
            'video',
            'table',
            'link', '|',
            'align', 'undo', 'redo', '|',
            'hr',
            'eraser',
            'copyformat', '|',
            'print',
            'about'
        ],
        readonly: false,
        minHeight: 250,
        toolbarAdaptive: false,

    }

    const saveData = () => {
        // Retrieve existing data from local storage
        let existingData = localStorage.getItem('tableData');

        // Parse the existing data if it's not null, otherwise start with an empty array
        let updatingDataArray = existingData ? JSON.parse(existingData) : [];

        // Create the new record
        let updatingData = {
            row_column: updateModalData.row_column,
            imgUrl: imageUrl,
            paragraph: paragraph,
            backgroundColor: color,
            postTitle: title,
            cellTitle: cellTitle
        };

        let isUpdated = false;
        // Traverse through the nested arrays
        updatingDataArray.forEach(innerArray => {
            innerArray.forEach(item => {
                // Check if the row_column matches
                if (JSON.stringify(item.row_column) === JSON.stringify(updatingData.row_column)) {
                    // Update the backgroundColor
                    item.backgroundColor = updatingData.backgroundColor;
                    item.imageUrl = updatingData.imgUrl,
                        item.paragraph = updatingData.paragraph,
                        item.postTitle = updatingData.postTitle,
                        item.cellTitle = updatingData.cellTitle
                    isUpdated = true;
                }
            });
        });

        // If not updated, add the new data
        if (!isUpdated) {
            if (existingData.length > 0) {
                existingData[0].push(updatingData); // Assuming you want to add to the first inner array
            } else {
                existingData.push([updatingData]); // If no inner arrays exist, create one
            }
        }
        // Save the updated array back to local storage
        console.log(updatingDataArray)
        localStorage.setItem('tableData', JSON.stringify(updatingDataArray));
        toast.success('Update Successfully!')
    }

    const paragraphFieldChanged = (data) => {
        setParagraph(data)
    }

    useEffect(() => {
        setColor(updateModalData.backgroundColor)
        setImageUrl(updateModalData.imageUrl)
        setParagraph(updateModalData.paragraph)
        setPostTitle(updateModalData.postTitle)
        setCellTitle(updateModalData.cellTitle)

        // apiService.getInfoFromServer('/itCreate')
    }, [])

    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white p-4'>
                <div className='flex w-full justify-between font-medium text-xl mb-2'>
                    <p>Row & Column :  [{updateModalData.row_column_0} , {updateModalData.row_column_1}]</p>
                    <p onClick={() => setUpdateModalStatus(false)} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[50vh] overflow-y-auto'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-1/2'>
                                <label htmlFor="title">Post Title</label>
                                <input type="text" id='title' placeholder='Post title' name='title' value={title} onChange={(e) => setPostTitle(e.target.value)} />
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="">Cell Title</label>
                                <input type="text" name='cell_title' value={cellTitle} onChange={(e) => setCellTitle(e.target.value)} />
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <div className='w-1/2'>
                                {/* <label htmlFor="">About Image</label>
                                <textarea rows={3} cols={50} type="text" name='paragraph' value={paragraph} onChange={(e) => setParagraph(e.target.value)} /> */}
                                <label htmlFor="">Choose Colour</label>
                                <div className=' flex'>
                                    <input type="text" value={color} disabled />
                                    <input type="color" name='color' className='w-10 h-10 p-1' onChange={(e) => setColor(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        {/* <div className=''>
                            <JoditRichTextEditor paragraph={paragraph} onChange={(e) => {setParagraph(e.target.value)}}/>
                        </div> */}
                        <div className='mb-6 mt-4'>
                            <JoditEditor
                                ref={editor}
                                value={paragraph ? paragraph : ' '}
                                tabIndex={1}
                                // config={config}
                                readonly={false}
                                minHeight={250}
                                toolbarAdaptive={false}
                                onChange={paragraphFieldChanged}
                            />
                        </div>
                    </form>
                </div>
                <div className='flex gap-2 justify-end mt-4'>
                    <Button onClick={saveData} className={'button button_ac'} type={'button'} children={'Update'} />
                    <Button onClick={() => setUpdateModalStatus(false)} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Add_Content_Related_Row_Column