import React, { useMemo, useRef, useState } from 'react';
import Button from '../../componentLists/Button';
import html2canvas from 'html2canvas';
import * as ImIcons from 'react-icons/im'
import { jsPDF } from "jspdf";
import logo from '../../../assets/images/appliedTradingAcademyLogo.png'
import mktResearch from '../../../assets/images/mktResearch.png'

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

    const [pdfGeneratingStatus, setPdfGeneratingStatus] = useState(false)

    const printRef = useRef(null)
    const handleGeneratePdf1 = async () => {
        setPdfGeneratingStatus(true)
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
        pdf.save(`${stockName}-stock-preview.pdf`)

        setTimeout(() => {
            setPdfGeneratingStatus(false)
        }, 1500);
    }

    const handleGeneratePdf = async () => {
        setPdfGeneratingStatus(true);
        const element = printRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Additional pages
        while (heightLeft > 0) {
            position = position - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${stockName}-stock-preview.pdf`);

        setTimeout(() => {
            setPdfGeneratingStatus(false);
        }, 1500);
    };


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
                    <div ref={printRef} className="w-full h-auto mx-auto pt-4 pb-10 bg-white shadow-md text-sm text-gray-900 font-sans">
                        <div className="mb-2.5">
                            <div className='p-2 bg-gradient-to-r from-blue-100 to-blue-100  flex justify-between items-center border-b-8 border-b-sky-300'>
                                <p className='text-3xl font-bold italic'>Research</p>
                                <div className='w-[25%] h-[20%]'>
                                    <img className='w-full h-[20%]' src={logo} alt="applied-trading-academyLogo" srcset="" />
                                </div>
                                {/* <div className='p-4'>
                                    <p className='text-2xl uppercase font-bold'>Applied Trading Academy</p>
                                    <span className='text-xl capitalize font-medium italic'>Research</span>
                                </div> */}
                            </div>
                        </div>

                        <div className='px-3'>
                            <div className='w-full h-[70vh] mb-3'>
                                <img className='w-full h-full' src={mktResearch} alt="mktResearch" />
                            </div>
                            <div className='p-2 flex justify-between items-center bg-gradient-to-l from-blue-100 to-blue-400 text-white'>
                                <div>
                                    <p className='text-3xl font-bold'>{stockName}</p>
                                </div>
                                <div className='w-[30%] h-[20%]'>
                                    <img className='w-full h-[20%]' src={logo} alt="applied-trading-academyLogo" srcset="" />
                                </div>
                            </div>
                            <div className='mb-6 p-2 flex justify-between items-center bg-gradient-to-l from-blue-50 to-blue-100 text-blue-500'>
                                <div className='font-bold tracking-wider capitalize'><strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}</div>
                                <div className='font-bold tracking-wider capitalize'><strong>Action:</strong> {buy_sell}</div>
                                {/* <p className="text-gray-600 capitalize">Action: {buy_sell}</p> */}
                                <div className='font-bold tracking-wider'><strong>Trigger Price:</strong> ₹{trigger_price}</div>
                                <div className='font-bold tracking-wider'><strong>Target Price:</strong> ₹{target_price}</div>
                                <div className='font-bold tracking-wider'><strong>Stop Loss:</strong> ₹{stop_loss}</div>
                            </div>

                            {/* <p className="text-gray-600">Date: {new Date(createdAt).toLocaleDateString()}</p> */}

                            <div className='mb-6'>
                                {rationale && (
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold mb-2">Rationale</h2>
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
                            </div>
                            <div>
                                <p className='font-bold uppercase mb-3'>
                                    📌 DISCLAIMER
                                </p>
                                <p className='text-[12px]'>
                                    We would like to explicitly state that we are not registered with the Securities and Exchange Board of India (SEBI) as an investment advisor or research analyst. Any content, including stock recommendations, market research, opinions, technical analyses, or investment strategies shared by us are strictly for educational and informational purposes only.

                                    The information provided should not be construed as investment advice, financial advice, trading recommendation, or solicitation to buy, sell, or hold any security. We do not make any representations or warranties, expressed or implied, as to the accuracy, completeness, or suitability of this content. All investment decisions must be made at your own discretion and risk.

                                    Markets are inherently volatile, and investing in equities or any other financial instrument involves a significant risk of loss. Past performance is not indicative of future results. Viewers/readers are strongly encouraged to perform their own independent due diligence and/or consult with a SEBI-registered financial advisor before making any investment decisions based on the information shared.

                                    We shall not be held liable or responsible for any direct, indirect, incidental, or consequential loss or damage incurred by anyone as a result of using or relying on the information provided herein.

                                    By accessing our content, you acknowledge and agree to this disclaimer and assume full responsibility for your investment decisions.

                                    This stock recommendation report is issued solely for informational and educational purposes and does not constitute investment advice under any circumstances. The views, analyses, charts, projections, and recommendations presented herein are based on publicly available information, our interpretation of market trends, and internal research. We are not registered with the Securities and Exchange Board of India (SEBI) as investment advisors or research analysts under the SEBI (Investment Advisers) Regulations, 2013.

                                    The information contained in this report is not intended as a solicitation or offer to buy or sell any security or financial instrument. All recommendations are of a general nature and do not take into account the specific investment objectives, financial situations, or risk profiles of any individual or entity. Investors are strongly advised to consult with a SEBI-registered investment advisor or conduct their own independent research before making any investment decisions.

                                    While we strive to provide accurate and timely information, we make no representations or warranties, express or implied, regarding the completeness, accuracy, or reliability of the data, projections, or views contained in this report. Investing in the stock market is subject to market risks, including the potential loss of principal. Past performance of any stock or strategy discussed does not guarantee future results.

                                    The authors, publishers, or distributors of this report shall not be held responsible for any loss or damage, direct or indirect, arising from the use of this material or any actions taken based on it.

                                    By reading this report, you acknowledge and agree to the terms of this disclaimer.
                                </p>
                            </div>
                            <div className="mt-10 text-xs text-center text-gray-400">
                                Generated on {new Date().toLocaleString()}
                            </div>
                        </div>

                        {/* Footer */}
                        {/* <div className="mt-16 text-center text-xs text-gray-500">
                            Thank you for your business!
                        </div> */}
                    </div>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={handleGeneratePdf} disabled={pdfGeneratingStatus} className={`${pdfGeneratingStatus && 'cursor-not-allowed opacity-45'} button button_pdf`} type={'button'}>
                        {pdfGeneratingStatus ? (
                            <div className="flex justify-center items-center">
                                <ImIcons.ImSpinner9 className="mx-2 text-xl animate-spin" />
                                Generating PDF
                            </div>
                        ) : (
                            'Generate PDF'
                        )}
                    </Button>
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Preview