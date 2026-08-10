import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd';
import { getEnquiry } from '../../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../../assets/nodata.jpg'
import Loader from '../../../component/loader/Loader';
import '../../../App.css'

const theme = createTheme({
    components: {
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    color: '#1f2937', // text-gray-800
                    '&.Mui-selected': {
                        background: 'linear-gradient(to bottom, #144196, #061530)',
                        color: '#fff',
                        border: 'none',
                    },
                    '&:hover': {
                        backgroundColor: '#f3f4f6', // hover:bg-gray-100
                    },
                },
            },
        },
    },
});
const Enquiry = () => {

    const { TabPane } = Tabs;
    const [limit, setlimit] = useState(10);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [enroll, setEnroll] = useState('message')
    const [enquiry, setEnquiry] = useState([])
    const [loader, setloader] = useState(false)

    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);
    let getenquiry = async () => {
        setloader(true)
        try {
            let res = await getEnquiry(limit, offset - 1, enroll)
            console.log(res?.data?.data?.data, 'enquiry')
            setEnquiry(res?.data?.data?.data)
            settotal(res?.data?.data?.totalCount)
        }
        catch (err) {
            console.log(err)
        } finally {
            setloader(false)
        }
    }

    useEffect(() => {
        getenquiry()
    }, [offset, enroll])
    const handlePageChange = (event, value) => {
        if (value === offset) {
            getenquiry();
        } else {
            setoffset(value);
        }
    };
    return (
        <>
            <div className='px-4 sm:px-5 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>

                <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84]'>Enquiry</h4>

                <div className='mt-4 sm:mt-5'>
                    <Tabs defaultActiveKey="1" className="custom-tabs" onChange={(key) => {
                        setoffset(1); // reset to first page when tab changes
                        if (key === "1") setEnroll("message");
                        if (key === "2") setEnroll("request");
                        if (key === "3") setEnroll("toMessage");
                    }} >
                        <TabPane tab="Connect" key="1"  >
                            <div className='bg-white border border-[#eef0f5] rounded-xl overflow-hidden'>
                                <div className='overflow-x-auto w-full'>
                                    <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
                                        <thead>
                                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Name</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Phone Number</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Email</th>
                                            </tr>
                                        </thead>
                                        {loader ?
                                            <tbody>
                                                <tr>
                                                    <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                        <Loader />
                                                    </td>
                                                </tr>
                                            </tbody>

                                            : <tbody>

                                                {enquiry?.length > 0 ? (
                                                    enquiry.map((item, index) => (
                                                        <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors">
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.name || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">+{item?.phoneNumber || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.email || "-"}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-16 text-sm text-[#9ca3af] font-medium">
                                                            <img src={nodata} alt="" width={'160px'} height={'160px'} className='m-auto' />
                                                            <p>No Data Found</p>
                                                        </td>                                            </tr>
                                                )}

                                            </tbody>
                                        }
                                    </table>
                                </div>
                            </div>
                            {totalpages > 1 &&
                                <ThemeProvider theme={theme}>
                                    <div className="flex justify-end mt-4">
                                        <Pagination
                                            count={totalpages}
                                            page={offset}
                                            onChange={handlePageChange}
                                            showFirstButton
                                            showLastButton
                                        />
                                    </div>
                                </ThemeProvider>
                            }
                        </TabPane>
                        <TabPane tab="Faq" key="2" >
                            <div className='bg-white border border-[#eef0f5] rounded-xl overflow-hidden'>
                                <div className='overflow-x-auto w-full'>
                                    <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
                                        <thead>
                                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Name</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Email</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left w-[50%]">Question</th>
                                            </tr>
                                        </thead>
                                        {loader ?
                                            <tbody>
                                                <tr>
                                                    <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                        <Loader />
                                                    </td>
                                                </tr>
                                            </tbody>

                                            : <tbody>
                                                {enquiry?.length > 0 ? (
                                                    enquiry.map((item, index) => (
                                                        <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors">
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.name || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.email || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]"><p className=' w-[100%] break-all'>{item?.question || "-"}</p></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-10 text-sm text-[#9ca3af]">No records found</td>
                                                    </tr>
                                                )}

                                            </tbody>
                                        }
                                    </table>
                                </div>
                            </div>
                            {totalpages > 1 &&
                                <ThemeProvider theme={theme}>
                                    <div className="flex justify-end mt-4">
                                        <Pagination
                                            count={totalpages}
                                            page={offset}
                                            onChange={handlePageChange}
                                            showFirstButton
                                            showLastButton
                                        />
                                    </div>
                                </ThemeProvider>
                            }
                        </TabPane>
                        <TabPane tab="Contact" key="3" >
                            <div className='bg-white border border-[#eef0f5] rounded-xl overflow-hidden'>
                                <div className='overflow-x-auto w-full'>
                                    <table className="w-full border-collapse" style={{ minWidth: '760px' }}>
                                        <thead>
                                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">First Name</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Email</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Phone Number</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Subject</th>
                                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left w-[40%]">Message</th>

                                            </tr>
                                        </thead>
                                        {loader ?
                                            <tbody>
                                                <tr>
                                                    <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                        <Loader />
                                                    </td>
                                                </tr>
                                            </tbody>

                                            : <tbody>
                                                {enquiry?.length > 0 ? (
                                                    enquiry.map((item, index) => (
                                                        <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors">
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.firstName} {item.lastName}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.email || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">+{item?.phoneNumber || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.subject || "-"}</td>
                                                            <td className="px-4 py-3.5 text-sm text-[#374151]"><p className=' w-[100%] break-all'>{item?.message || "-"}</p></td>


                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-10 text-sm text-[#9ca3af]">No records found</td>
                                                    </tr>
                                                )}

                                            </tbody>
                                        }


                                    </table>
                                </div>
                            </div>
                            {totalpages > 1 &&
                                <ThemeProvider theme={theme}>
                                    <div className="flex justify-end mt-4">
                                        <Pagination
                                            count={totalpages}
                                            page={offset}
                                            onChange={handlePageChange}
                                            showFirstButton
                                            showLastButton
                                        />
                                    </div>
                                </ThemeProvider>
                            }
                        </TabPane>
                    </Tabs>
                </div>
            </div >


        </>

    )
}

export default Enquiry