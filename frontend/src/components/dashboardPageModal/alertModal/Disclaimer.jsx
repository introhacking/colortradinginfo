import React from 'react'
import Button from '../../componentLists/Button'

const message = `
📌 We would like to explicitly state that we are not registered with the Securities and Exchange Board of India (SEBI) as an investment advisor or research analyst. Any content, including stock recommendations, market research, opinions, technical analyses, or investment strategies shared by us are strictly for educational and informational purposes only.
The information provided should not be construed as investment advice, financial advice, trading recommendation, or solicitation to buy, sell, or hold any security. We do not make any representations or warranties, expressed or implied, as to the accuracy, completeness, or suitability of this content. All investment decisions must be made at your own discretion and risk.
Markets are inherently volatile, and investing in equities or any other financial instrument involves a significant risk of loss. Past performance is not indicative of future results. Viewers/readers are strongly encouraged to perform their own independent due diligence and/or consult with a SEBI-registered financial advisor before making any investment decisions based on the information shared.
We shall not be held liable or responsible for any direct, indirect, incidental, or consequential loss or damage incurred by anyone as a result of using or relying on the information provided herein.
By accessing our content, you acknowledge and agree to this disclaimer and assume full responsibility for your investment decisions.`

const Disclaimer = ({onClose, onAccept }) => {
    // if (!isOpen) return null;
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-1/2 rounded mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl bg-gradient-to-r from-blue-500 to-red-100 rounded-t px-2 py-1'>
                    <p className='font-medium text-white '>Disclaimer</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <div className='bg-blue-100 px-4 py-2 rounded'>
                        <p className='text-[12px]'>{message}</p>
                    </div>
                </div>
                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={onAccept} className={'button button_ac'} type="button" children={'I Accept'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Disclaimer