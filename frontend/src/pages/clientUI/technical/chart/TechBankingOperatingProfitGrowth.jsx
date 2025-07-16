import React, { useEffect, useMemo, useState } from 'react'
// import Chart from "react-apexcharts";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as chartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js/auto';
// import { apiService } from '../../../../services/apiService';
import Loading from '../../../../Loading';

chartJS.register(CategoryScale, LinearScale, LineElement, BarElement, Title, Tooltip, Legend)
const TechBankingOperatingProfitGrowth = ({ errorMsg, errorMsgStatus, isLoading, technicalBankNameOPG, selectedBanksOPG, selectedMonth_OPG, noDataFoundMsg }) => {

    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const processChartData = (data) => {
        const labels = selectedBanksOPG.map(item => item.Bank_name);
        const selectedData = data.map(item => item[selectedMonth_OPG]);
        const datasets = [
            {
                label: selectedMonth_OPG,
                data: selectedData,
                backgroundColor: 'green',
                borderColor: 'green',
                borderWidth: 1,
            }
        ];

        setChartData({ labels, datasets });


    };
    useEffect(() => {
        if (!selectedBanksOPG || !selectedMonth_OPG) return;
        ; (async () => {
            // if (technicalBankName.length === 0) {
            //     setChartData({ labels: [], datasets: [] });
            //     return;
            //   }
            await processChartData(technicalBankNameOPG)
        })()
    }, [technicalBankNameOPG, selectedMonth_OPG, selectedBanksOPG])

    // const barChartData = {
    //     labels: technicalBankName.map((bank) => bank.Bank_name),
    //     datasets: [
    //         // technicalBankName.map((bank) => {
    //         //     return {
    //         //         label: bank.Bank_name,
    //         //         data: bank.Bank_name,
    //         //         backgroundColor: ['yellow', '#E91E63', '#9C27B0', '#bf2000', '#ef4367'],
    //         //         borderWidth: 1
    //         //     }
    //         // })


    //         {
    //             label: 'January',
    //             data: technicalBankName.map((bank) => bank.January),
    //             backgroundColor: ['green'],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'Febuarary',
    //             data: technicalBankName.map((bank) => bank.February),
    //             backgroundColor: ['#9C27B0'],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'March',
    //             data: technicalBankName.map((bank) => bank.March),
    //             backgroundColor: ['skyblue'],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'April',
    //             data: technicalBankName.map((bank) => bank.April),
    //             backgroundColor: ['#bf2000'],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'May',
    //             data: technicalBankName.map((bank) => bank.May),
    //             backgroundColor: ['orange',],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'June',
    //             data: technicalBankName.map((bank) => bank.June),
    //             backgroundColor: ['pink',],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'July',
    //             data: technicalBankName.map((bank) => bank.July),
    //             backgroundColor: ['navy'],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },

    //     ],
    // }
    if (isLoading) { return <div><Loading msg={'Graph loading...'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    if (noDataFoundMsg !== '') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div> }
    return (
        <div className='w-full'>
            <Bar data={chartData} options={{
                plugins: {
                    title: {
                        display: true,
                        text: "Operating Profit Growth %"
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
export default TechBankingOperatingProfitGrowth
