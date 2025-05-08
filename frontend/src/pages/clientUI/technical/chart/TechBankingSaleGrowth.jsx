import React, { useEffect, useMemo, useState } from 'react'
// import Chart from "react-apexcharts";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as chartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js/auto';
// import { bankingService } from '../../../../services/bankingService';
import Loading from '../../../../Loading';
import Button from '../../../../components/componentLists/Button';

chartJS.register(CategoryScale, LinearScale, LineElement, BarElement, Title, Tooltip, Legend)
const TechBankingSaleGrowth = ({ errorMsg, errorMsgStatus, isLoading, technicalBankName, setSelectedBanks, selectedBanks, selectedMonth_SG, noDataFoundMsg }) => {

    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    const [selectedBankName, setSelectedBankName] = useState(null)
    // console.log(chartData)
    // Generate random colors for the datasets
    // const getRandomColor = () => {
    //     const letters = '0123456789ABCDEF';
    //     let color = '#';
    //     for (let i = 0; i < 6; i++) {
    //         color += letters[Math.floor(Math.random() * 16)];
    //     }
    //     return color;
    // };
    // Process data to fit Chart.js format  "#FA3343"
    const processChartData = (data) => {

        // const labels = data.map(item => item.Bank_name);
        // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // const color = ['#4A946B', "#A6E11D", "#01757E", "orange", "#D3D8F9", "#B799DA", "#6CE338", "#A6A85F", "#FA3343", "#4A692E", "#F2ACE1", "navy"]
        // const borderColors = ['#4A946B', "#A6E11D", "#01757E", "orange", "#D3D8F9", "#B799DA", "#6CE338", "#A6A85F", "#FA3343", "#4A692E", "#F2ACE1", "navy"];
        // const datasets = months.map((month, idx) => ({
        //     label: month,
        //     data: data.map(item => item[month]),
        //     backgroundColor: color[idx],
        //     borderWidth: 1
        // }));
        // setChartData({ labels, datasets });



        //  2 METHOD

        // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // const color = ['#4A946B', "#A6E11D", "#01757E", "orange", "#D3D8F9", "#B799DA", "#6CE338", "#A6A85F", "#FA3343", "#4A692E", "#F2ACE1", "navy"]
        // const labels = technicalBankName.map(item => item.Bank_name);
        // const selectedData = data.filter(item => technicalBankName.includes(item.Bank_name));
        // console.log(selectedData)
        // const datasets = months.map((month, monthIndex) => ({
        //     label: month,
        //     data: data.map(item => item[month]),
        //     backgroundColor: color[monthIndex],
        //     //   borderColor: getColor(monthIndex, true),
        //     borderWidth: 1
        // }));

        // setChartData({ labels, datasets });

        const labels = selectedBanks.map(item => item.Bank_name);
        const selectedData = data.map(item => item[selectedMonth_SG]);
        const datasets = [
            {
                label: selectedMonth_SG,
                data: selectedData,
                backgroundColor: 'orange',
                borderColor: 'orange',
                borderWidth: 1,
            }
        ];

        setChartData({ labels, datasets });
        setSelectedBankName(selectedBanks)


    };

    // const allClearCheckedBankName = () => {
    //     setSelectedBanks([])
    //     console.log('all clear')
    // }
    // const barChartData = {
    //     labels: technicalBankName.map((bank) => bank.Bank_name),
    //     datasets: [
    //         {
    //             label: 'January',
    //             data: technicalBankName.map((bank) => bank.January),
    //             backgroundColor: ['#F44336', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'Febuarary',
    //             data: technicalBankName.map((bank) => bank.February),
    //             backgroundColor: ['#9C27B0', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'March',
    //             data: technicalBankName.map((bank) => bank.March),
    //             backgroundColor: ['yellow', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'April',
    //             data: technicalBankName.map((bank) => bank.April),
    //             backgroundColor: ['#bf2000', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'May',
    //             data: technicalBankName.map((bank) => bank.May),
    //             backgroundColor: ['#ef4367', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },
    //         {
    //             label: 'June',
    //             data: technicalBankName.map((bank) => bank.June),
    //             backgroundColor: ['#9C27B0', '#E91E63', '#9C27B0', '#bf2000', '#ef4367', 'yellow',],
    //             // backgroundColor: ['yellow',],
    //             borderWidth: 1
    //         },

    //     ],
    // }

    useEffect(() => {
        if (!selectedBanks || !selectedMonth_SG) return;
        ; (async () => {
            // if (technicalBankName.length === 0) {
            //     setChartData({ labels: [], datasets: [] });
            //     return;
            //   }
            await processChartData(technicalBankName)
        })()
    }, [technicalBankName, selectedMonth_SG, selectedBanks, setSelectedBanks , selectedBankName])

    if (isLoading) { return <div><Loading msg={'Graph loading...'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    if (noDataFoundMsg !== '') { return <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div> }

    return (
        <>
            {/* {
                selectedBankName?.length >= 2 &&
                <div className='flex items-center gap-x-1'>
                    <div className='flex gap-x-1 items-center'>{selectedBankName?.map((bank, idx) => {
                        return <p className='text-[12px] bg-red-200 px-1' key={idx}>
                            {bank.Bank_name} <span>x</span>
                        </p>
                    })}</div>
                    <Button onClick={allClearCheckedBankName} children={'Clear All'} className={'text-sm bg-gray-200 px-1'} />
                </div>
            } */}
            <div className='w-full'>
                <Bar data={chartData} options={{
                    plugins: {
                        title: {
                            display: true,
                            text: "Sale growth%"
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
        </>
    )
}
export default TechBankingSaleGrowth
