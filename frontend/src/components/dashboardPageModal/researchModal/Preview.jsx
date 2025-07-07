import React, { useMemo, useRef } from 'react';
import Button from '../../componentLists/Button';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

const Preview = ({ isOpen, onClose, isPreviewData }) => {
    if (!isOpen) return null;

    const { stockName, buy_sell, trigger_price, target_price, stop_loss, rationale, chart, createdAt } = isPreviewData

    // Helper to convert buffer to base64 image
    const bufferToBase64 = (buffer) => {
        const binary = Uint8Array.from(buffer)
            .reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        return `data:image/png;base64,${btoa(binary)}`;
    };

    const base64Image = useMemo(() => bufferToBase64(chart.data?.data), [chart]);

    const printRef = useRef(null)
    const handleGeneratePdf = async () => {
        const element = printRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            logging: false
        })

        const data = canvas.toDataURL('image/png')

        // Portrait export
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save('preview.pdf')
    }
    // const imgProperties = pdf.getImageProperties(data)
    // const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>PDF Preview</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <div ref={printRef} className="w-full h-auto mx-auto py-10 px-5 bg-white shadow-md text-sm text-gray-900 font-sans">
                        {/* Header 794 1123*/}
                        {/* <div className="mb-8">
                            <h1 className="text-2xl font-bold">Invoice</h1>
                            <p className="text-gray-600">Date: 2025-07-06</p>
                            <p className="text-gray-600">Customer: Manish Gupta</p>
                        </div> */}
                        {/* Items Table */}
                        {/* <div className="border border-gray-300 rounded-md mb-6">
                            <div className="grid grid-cols-4 bg-gray-100 font-bold px-4 py-2">
                                <div>Item</div>
                                <div>Quantity</div>
                                <div>Price</div>
                                <div>Total</div>
                            </div>

                            <div className="grid grid-cols-4 border-t border-gray-200 px-4 py-2">
                                <div>Item A</div>
                                <div>2</div>
                                <div>₹150</div>
                                <div>₹300</div>
                            </div>

                            <div className="grid grid-cols-4 border-t border-gray-200 px-4 py-2">
                                <div>Item B</div>
                                <div>1</div>
                                <div>₹200</div>
                                <div>₹200</div>
                            </div>
                        </div> */}

                        <div className="mb-8">
                            <h1 className="text-2xl font-bold mb-2">Stock Recommendation</h1>
                            <p className="text-gray-600">Date: {new Date(createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-600">Stock Name: {stockName}</p>
                            <p className="text-gray-600 capitalize">Action: {buy_sell}</p>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-2">Trade Info</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div><strong>Trigger Price:</strong> ₹{trigger_price}</div>
                                <div><strong>Target Price:</strong> ₹{target_price}</div>
                                <div><strong>Stop Loss:</strong> ₹{stop_loss}</div>
                            </div>
                        </div>

                        {rationale && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Rationale</h2>
                                <div dangerouslySetInnerHTML={{ __html: rationale }} />
                            </div>
                        )}

                        <div className='w-full'>
                            <h2 className="text-lg font-semibold mb-2">Chart</h2>
                            <img
                                src={base64Image}
                                alt="Stock Chart"
                                className="w-full h-[300px] object-contain border border-gray-300 rounded"
                            />
                        </div>

                        <div className="mt-10 text-xs text-center text-gray-400">
                            Generated on {new Date().toLocaleString()}
                        </div>

                        {/* Footer */}
                        {/* <div className="mt-16 text-center text-xs text-gray-500">
                            Thank you for your business!
                        </div> */}
                    </div>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={handleGeneratePdf} className={'button button_pdf'} type={'button'} children={'Generate PDF'} />
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Preview