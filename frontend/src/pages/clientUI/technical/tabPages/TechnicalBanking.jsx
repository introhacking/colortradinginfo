import React, { useEffect, lazy, Suspense, useState, useMemo, startTransition } from 'react'
import { bankingService } from '../../../../services/bankingService'
import Loading from '../../../../Loading'
import TechBankingOperatingProfitGrowth from '../chart/TechBankingOperatingProfitGrowth'
import TechBankingNetProfitGrowth from '../chart/TechBankingNetProfitGrowth'
import TechBankingSaleGrowth from '../chart/TechBankingSaleGrowth'
import { BankNameFrom_API_NPG, BankNameFrom_API_OPG, BankNameFrom_API_SG } from '../bankNameAPI/BankNameFrom_API'
import Button from '../../../../components/componentLists/Button'
// const TechBankingSaleGrowth = lazy(() => import('../chart/TechBankingSaleGrowth'))

const TechnicalBanking = () => {
    const [hideLeftGrowthStatus, setHideLeftGrowthStatus] = useState(true)
    const [technicalBankName, setTechnicalBankName] = useState([])
    const [technicalBankNameOPG, setTechnicalBankNameOPG] = useState([])
    const [technicalBankNameNPG, setTechnicalBankNameNPG] = useState([])
    const [selectedBanks, setSelectedBanks] = useState([]);
    const [selectedMonth_SG, setSelectedMonth_SG] = useState('January');
    const [selectedBanksOPG, setSelectedBanksOPG] = useState([]);
    const [selectedMonth_OPG, setSelectedMonth_OPG] = useState('January');
    const [selectedBanksNPG, setSelectedBanksNPG] = useState([]);
    const [selectedMonth_NPG, setSelectedMonth_NPG] = useState('January');

    // ERROR HANDLING
    const [errorMsg, setErrorMsg] = useState('')
    const [errorMsgOPG, setErrorMsgOPG] = useState('')
    const [errorMsgNPG, setErrorMsgNPG] = useState('')
    const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    const [errorMsgStatusOPG, setErrorMsgStatusOPG] = useState(false)
    const [errorMsgStatusNPG, setErrorMsgStatusNPG] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('')
    const [noDataFoundMsgOPG, setNoDataFoundMsgOPG] = useState('')
    const [noDataFoundMsgNPG, setNoDataFoundMsgNPG] = useState('')

    const hideLeftGrowth = () => {
        setHideLeftGrowthStatus(prev => !prev)
    }
    const months = ["--Choose months--", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    // const fetchData = async () => {
    //     setIsLoading(true)
    //     try {
    //         const technicalBanking = await bankingService.getInfoFromServer('/technical-banking',
    //             { params: { banks: selectedBanks } }
    //         )
    //         setSelectedBanks(technicalBanking)




    //         if (technicalBanking.length === 0) {
    //             setNoDataFoundMsg('No Data Found!')
    //             fetchData();
    //         }
    //         setTechnicalBankName(technicalBanking)
    //         setIsLoading(false)
    //         setErrorMsgStatus(false)
    //     } catch (err) {
    //         setErrorMsgStatus(true)
    //         setIsLoading(false)
    //         setErrorMsg(err.message)
    //     }

    // };

    const handleMonthChange = (event) => {
        setSelectedMonth_SG(event.target.value);
    };
    const handleMonthChange_OPG = (event) => {
        setSelectedMonth_OPG(event.target.value);
    };
    const handleMonthChange_NPG = (event) => {
        setSelectedMonth_NPG(event.target.value);
    };


    const fetchDataForSG = async () => {
        setIsLoading(true)
        startTransition(async () => {
            try {
                const technicalBanking = await bankingService.getInfoFromServer('/technical-banking_sale_growth')
                setTechnicalBankName(technicalBanking)

                if (technicalBanking.length === 0) {
                    setNoDataFoundMsg('No Data Found!')
                }
                // setSelectedBanks(technicalBanking)
                setErrorMsgStatus(false)
                setIsLoading(false)
            } catch (err) {
                setErrorMsgStatus(true)
                setIsLoading(false)
                setErrorMsg(err.message)
            }
        })
    };
    const fetchDataForOPG = async () => {
        setIsLoading(true)
        startTransition(async () => {
            try {
                const technicalBanking = await bankingService.getInfoFromServer('/technical-banking_opg')
                setTechnicalBankNameOPG(technicalBanking)

                if (technicalBanking.length === 0) {
                    setNoDataFoundMsgOPG('No Data Found!')
                }
                // setSelectedBanks(technicalBanking)
                setErrorMsgStatusOPG(false)
                setIsLoading(false)
            } catch (err) {
                setErrorMsgStatusOPG(true)
                setIsLoading(false)
                setErrorMsgOPG(err.message)
            }
        })
    };
    const fetchDataForNPG = async () => {
        setIsLoading(true)
        startTransition(async () => {
            try {
                const technicalBanking = await bankingService.getInfoFromServer('/technical-banking_NPG')
                setTechnicalBankNameNPG(technicalBanking)

                if (technicalBanking.length === 0) {
                    setNoDataFoundMsgNPG('No Data Found!')
                }
                // setSelectedBanks(technicalBanking)
                setErrorMsgStatusNPG(false)
                setIsLoading(false)
            } catch (err) {
                setErrorMsgStatusNPG(true)
                setIsLoading(false)
                setErrorMsgNPG(err.message)
            }
        })
    };
    useEffect(() => {
        fetchDataForSG();
        fetchDataForOPG();
        fetchDataForNPG();
    }, []);


    const handleCheckboxChange = (bank) => {
        startTransition(() => {
            setSelectedBanks((prev) => {
                if (prev.includes(bank)) {
                    return prev.filter((b) => b !== bank);
                } else {
                    return [...prev, bank];
                }
            });
        });

    };
    const handleCheckboxChangeOPG = (bank) => {
        startTransition(() => {
            setSelectedBanksOPG((prev) => {
                if (prev.includes(bank)) {
                    return prev.filter((b) => b !== bank);
                } else {
                    return [...prev, bank];
                }
            });
        });

    };
    const handleCheckboxChangeNPG = (bank) => {
        startTransition(() => {
            setSelectedBanksNPG((prev) => {
                if (prev.includes(bank)) {
                    return prev.filter((b) => b !== bank);
                } else {
                    return [...prev, bank];
                }
            });
        });

    };

    return (
        <>
            <div className='border shadow w-full relative'>
                <div className='flex'>
                    <div className={`${hideLeftGrowthStatus ? 'w-[56]' : 'w-4'} h-[80vh] overflow-y-auto no-scrollbar border-r p-2`}>
                        <div className='flex flex-col h-full'>
                            <div className='h-1/3 flex-1 flex flex-col justify-start'>
                                <p className='bg-teal-500 text-white p-1 font-medium px-2 inline-block text-sm'>Sales Growth %</p>
                                <div className='border overflow-y-auto my-0.5'>
                                    <BankNameFrom_API_SG isLoading={isLoading} errorMsg={"Bank not found"} errorMsgStatus={errorMsgStatus} noDataFoundMsg={noDataFoundMsg} technicalBankName={technicalBankName} handleCheckboxChange={handleCheckboxChange} />
                                </div>
                            </div>
                            <div className='h-1/3 flex-1 flex flex-col justify-start'>
                                <p className='bg-teal-500 p-1 text-white font-medium px-2 inline-block text-sm'>Operating Profit Growth %</p>
                                <div className='border overflow-y-auto my-0.5'>
                                    <BankNameFrom_API_OPG isLoading={isLoading} errorMsg={"Bank not found"} errorMsgStatus={errorMsgStatusOPG} noDataFoundMsgOPG={noDataFoundMsgOPG} technicalBankName={technicalBankNameOPG} handleCheckboxChange={handleCheckboxChangeOPG} />
                                </div>
                            </div>
                            <div className='h-1/3 flex-1 flex flex-col justify-start'>
                                <p className='bg-teal-500 p-1 font-medium px-2 text-white inline-block text-sm'>Net Profit Growth %</p>
                                <div className='border overflow-y-auto my-0.5'>
                                    <BankNameFrom_API_NPG isLoading={isLoading} errorMsg={"Bank not found"} errorMsgStatus={errorMsgStatusNPG} noDataFoundMsgNPG={noDataFoundMsgNPG} technicalBankName={technicalBankNameNPG} handleCheckboxChange={handleCheckboxChangeNPG} />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className='flex-1 h-[80vh] overflow-y-auto no-scrollbar p-2'>
                        <div className='flex flex-col h-full'>
                            <div className='flex-1 flex flex-col justify-start'>
                                <div className='flex gap-1 sticky -top-1.5 z-40'>
                                    <p onClick={hideLeftGrowth} className='bg-gray-300 rounded p-1 inline-block cursor-pointer text-xl font-medium'>&#8801;</p>
                                    <div className='flex items-center w-full'>
                                        <p className='bg-teal-500 text-white p-1 font-medium px-2 w-full'>Sales Growth %</p>
                                        <Button children={
                                            <select className='py-1 px-3' value={selectedMonth_SG} onChange={handleMonthChange} disabled={selectedBanks.length === 0}>
                                                {months.map((option, idx) => (
                                                    <option key={option} value={option} disabled={idx === 0} >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        } />
                                    </div>
                                </div>
                                {/* <div className='overflow-y-auto no-scrollbar my-0.5'> */}
                                <div className='my-0.5'>
                                    <Suspense fallback={<Loading msg='Please wait...' />}>
                                        <TechBankingSaleGrowth setSelectedBanks={setSelectedBanks} isLoading={isLoading} selectedMonth_SG={selectedMonth_SG} errorMsg={errorMsg} errorMsgStatus={errorMsgStatus} technicalBankName={technicalBankName} selectedBanks={selectedBanks} noDataFoundMsg={noDataFoundMsg} />
                                    </Suspense>
                                </div>

                            </div>
                            <div className='flex-1 flex flex-col justify-start border-y'>
                                <div className='flex gap-1 sticky -top-1.5 z-40 w-full'>
                                    <div className='flex items-center w-full'>
                                        <p className='bg-teal-500 p-1 text-white font-medium px-2 w-full'>Operating Profit Growth %</p>
                                        <Button children={
                                            <select className='py-1 px-3' value={selectedMonth_OPG} onChange={handleMonthChange_OPG} disabled={selectedBanksOPG.length === 0}>
                                                {months.map((option, idx) => (
                                                    <option key={option} value={option} disabled={idx === 0} >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        } />
                                    </div>
                                </div>
                                <div className='my-0.5'>
                                    <Suspense fallback={<Loading msg='Please wait...' />}>
                                        <TechBankingOperatingProfitGrowth isLoading={isLoading} errorMsg={errorMsgOPG} errorMsgStatus={errorMsgStatusOPG} selectedMonth_OPG={selectedMonth_OPG} technicalBankNameOPG={technicalBankNameOPG} selectedBanksOPG={selectedBanksOPG} noDataFoundMsg={noDataFoundMsgOPG} />
                                    </Suspense>
                                </div>
                            </div>
                            <div className='flex-1 flex flex-col justify-start'>
                                <div className='sticky -top-1.5 z-40 w-full'>
                                    <p className='bg-teal-500 p-1 font-medium px-2 text-white w-full'>Net Profit Growth %</p>
                                </div>
                                <div className='my-0.5'>
                                    <Suspense fallback={<Loading msg='Please wait...' />}>
                                        <TechBankingNetProfitGrowth isLoading={isLoading} errorMsg={errorMsgNPG} errorMsgStatus={errorMsgStatusNPG} technicalBankName={selectedBanksNPG} noDataFoundMsg={noDataFoundMsgNPG} />
                                    </Suspense>
                                </div>
                            </div>
                        </div>

                    </div>




                </div>

            </div>
        </>
    )
}

export default TechnicalBanking