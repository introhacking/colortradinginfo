import React, { useEffect, useMemo, useState } from 'react'
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as chartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js/auto';
import Loading from '../../../../Loading';

chartJS.register(CategoryScale, LinearScale, LineElement, BarElement, Title, Tooltip, Legend)
const TechBankingNetProfitGrowth = ({ errorMsg, errorMsgStatus, isLoading, technicalBankName, noDataFoundMsg }) => {
    const barChartData = {
        labels: technicalBankName.map((bank) => bank.Bank_name),
        datasets: [
            {
                label: 'January',
                data: technicalBankName.map((bank) => bank.January),
                backgroundColor: ['#F44336', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                borderWidth: 1
            },
            {
                label: 'Febuarary',
                data: technicalBankName.map((bank) => bank.February),
                backgroundColor: ['#9C27B0', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                borderWidth: 1
            },
            {
                label: 'March',
                data: technicalBankName.map((bank) => bank.March),
                backgroundColor: ['yellow', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                borderWidth: 1
            },
            {
                label: 'April',
                data: technicalBankName.map((bank) => bank.April),
                backgroundColor: ['#bf2000', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                // backgroundColor: ['yellow',],
                borderWidth: 1
            },
            {
                label: 'May',
                data: technicalBankName.map((bank) => bank.May),
                backgroundColor: ['#ef4367', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                // backgroundColor: ['yellow',],
                borderWidth: 1
            },
            {
                label: 'June',
                data: technicalBankName.map((bank) => bank.June),
                backgroundColor: ['#9C27B0', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
                // backgroundColor: ['yellow',],
                borderWidth: 1
            },

        ],
    }
    if (isLoading) { return <div><Loading msg={'Graph loading...'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    if (noDataFoundMsg!=='') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div> }
    return (
        <div className='w-full'>
            <Bar data={barChartData} options={{
                plugins: {
                    title: {
                        display: true,
                        text: "Net Profit Growth %"
                    }
                },
                scales: {
                    x: { // defining min and max so hiding the dataset does not change scale range
                        barThickness: 6,  // number (pixels) or 'flex'
                        maxBarThickness: 8
                    }
                },
                width: '100%',
                responsive: true,
                maintainAspectRatio: false,
            }}

            />

        </div>
    )
}
export default TechBankingNetProfitGrowth
