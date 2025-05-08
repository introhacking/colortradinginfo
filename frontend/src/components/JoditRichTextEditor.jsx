import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';

const JoditRichTextEditor = ({ paragraph , onChange}) => {
    console.log(onChange)
    const editor = useRef(null);
    console.log(paragraph)
    const [content, setContent] = useState('');
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
        // readonly: false,
        minHeight: 250,
        toolbarAdaptive: false,
    }
    useEffect(() => {
        setContent(paragraph)
    }, [paragraph])


    return (

        <div className='mb-6 mt-4'>

            <JoditEditor
                ref={editor}
                value={content}
                tabIndex={1}
                config={config}
                // onChange={()=>setParagraph(paragraph)}
            />
        </div>
    )
}

export default JoditRichTextEditor