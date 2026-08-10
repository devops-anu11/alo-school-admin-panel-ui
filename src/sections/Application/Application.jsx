import React, { use, useEffect, useState } from 'react'
import { getApplication } from '../../api/Serviceapi';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';


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

const Application = () => {
    const [limit, setlimit] = useState(10);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [student, setstudent] = useState([])
    const [loading, setloading] = useState(false)
    const navigate = useNavigate()


    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);

    useEffect(() => {
        getstudent()
    }, [offset])



    let getstudent = async () => {
        setloading(true)
        try {
            let res = await getApplication(limit, offset - 1);
            setstudent(res?.data?.data?.data);
            settotal(res?.data?.data?.totalCount);
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    }

    const handlePageChange = (event, value) => {
        if (value === offset) {
            getstudent();
        } else {
            setoffset(value);
        }
    };
    return (
        <>
            <div className='px-4 sm:px-5 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>
                <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84]'>Applications</h4>
                <div className='bg-white border border-[#eef0f5] rounded-xl overflow-hidden mt-4 sm:mt-5'>
                    <div className='overflow-x-auto w-full'>
                        <table className="w-full border-collapse" style={{ minWidth: '760px' }}>
                            <thead>
                                <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Name</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Phone Number</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Email</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Blood Group</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Gender</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Action</th>

                                </tr>
                            </thead>
                            {loading ?
                                <tbody>
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                            <Loader />
                                        </td>
                                    </tr>
                                </tbody>

                                : <tbody>

                                    {student?.length > 0 ? (
                                        student.map((item, index) => (
                                            <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors">
                                                <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.firstName || "-"}</td>
                                                <td className="px-4 py-3.5 text-sm text-[#374151]">+{item?.phoneNo || "-"}</td>
                                                <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.email || "-"}</td>
                                                <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.bloodgroup || "-"}</td>
                                                <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.gender || "-"}</td>
                                                <td className="px-4 py-3.5 text-sm"> <button className='text-[#123d84] border border-[#123d84] rounded-lg px-3 py-1.5 flex items-center gap-1 cursor-pointer text-xs font-medium hover:bg-[#123d84] hover:text-white transition-colors' onClick={() => navigate(`/application/details/${item._id}`)}> <VisibilityIcon style={{ fontSize: '16px' }} />view</button></td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-16 text-sm text-[#9ca3af] font-medium">
                                                <img src={nodata} alt="" width={'160px'} height={'160px'} className='m-auto' />
                                                <p>No Data Found</p>
                                            </td>
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
            </div>

        </>
    )
}

export default Application