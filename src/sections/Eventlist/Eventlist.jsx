import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import { PlusIcon } from '@heroicons/react/24/solid';
import AddEventModal from './AddEventModal';
import { getEvents, deleteEvent } from '../../api/Serviceapi';
import styles from './Eventlist.module.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Modal from 'react-modal';
import Updateevent from '../../component/updateevent/Updateevent';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { toast, ToastContainer } from 'react-toastify';

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

const Eventlist = () => {
    const [limit, setlimit] = useState(8);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    // Calculate visible range
    const startIndex = (offset - 1) * limit + 1;
    const endIndex = Math.min(offset * limit, totaluser);
    const statusChange = (event) => {
        setStatus(event.target.value);
        setoffset(1)
    }
    const handlePageChange = (event, value) => {
        setEvents([]);
        if (value === offset) {
            getevents();
        } else {
            setoffset(value); 
        }
    };

    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);

    let getevents = async () => {
        setLoading(true); 
        try {
            const res = await getEvents(limit, offset - 1, status);
            console.log(res?.data?.data?.totalCount, 'events')
            setEvents(res?.data?.data?.data || [])
            settotal(res?.data?.data?.totalCount);

        } catch (error) {
            console.error("error", error.response?.data || error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getevents()
    }, [offset, status])

    const [deleteevent, setDelete] = useState(false)
    const [updateevent, setUpdate] = useState(false)

    const [id, setId] = useState('')

    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await deleteEvent(id);
            getevents(); // refresh the list
            setDelete(false);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setDeleting(false);
        }
    };


    return (
        <>
              <ToastContainer />
        
            {showModal && <AddEventModal closeModal={() => setShowModal(false)} onevent={getevents} />}
            {updateevent && <Updateevent closeModal={() => setUpdate(false)} onevent={getevents} id={id} />}

            <div className='px-4 sm:px-5 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>
                <div className="flex justify-between items-center lg:flex-row md:flex-row flex-col gap-3">
                    <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84]'>Events</h4>
                    <div className='flex items-end md:justify-around flex-wrap gap-2'>
                        <div style={{ width: '150px', }}>

                            <FormControl
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: 120,
                                    width: '100%',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                }}
                            >
                                <Select
                                    value={status}
                                    onChange={statusChange}
                                    displayEmpty
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        fontSize: '14px',
                                        padding: '4px 10px',
                                        height: '40px',
                                        border: 'none'
                                    }}
                                >
                                    <MenuItem value="">All Status</MenuItem>

                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                    <MenuItem value="ongoing">Ongoing</MenuItem>


                                </Select>
                            </FormControl>
                        </div>

                        <div className={styles.button}>
                            <button onClick={() => setShowModal(true)} className='text-[#FFFFFF] bg-gradient-to-b from-[#144196] to-[#0b2456] px-5 w-fit py-[11px] rounded-[10px] flex items-center gap-1.5 justify-center cursor-pointer text-sm font-medium shadow-sm hover:opacity-90 transition-opacity'><PlusIcon className='w-4 h-4' />Add Events</button>
                        </div>

                    </div>
                </div>
                <div className='mt-4 sm:mt-5'>
                    <div className='overflow-x-auto py-[0px]'>
                        {loading ? (
                            <div className='text-center'><Loader /></div>
                        ) : (
                            <>
                                {events.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {events.map((item, index) => (
                                            <div
                                                className={`bg-white border border-[#eef0f5] p-4 sm:p-5 rounded-xl transition-shadow hover:shadow-[0_6px_18px_rgba(18,61,132,0.08)]`}
                                                key={item._id}
                                            >
                                                <div className="flex justify-between items-center gap-2">
                                                    <div className="text-[14px] font-semibold text-[#111827]">Event Title</div>
                                                    <div className="font-semibold text-[12.5px] px-3 py-1 rounded-full" style={{
                                                        background: item.status === 'upcoming' && '#FFCA96' || item.status === 'ongoing' && '#D7E9FF' || item.status === 'completed' && '#D1FFC2',
                                                        color: item.status === 'upcoming' && '#8D4600' || item.status === 'ongoing' && '#2274D4' || item.status === 'completed' && '#06752B',

                                                    }}>
                                                        {item.status}

                                                    </div>
                                                </div>
                                                <p className="font-semibold text-[17px] text-[#111827] my-2">{item.title?.replace(/\b\w/g, (char) => char.toUpperCase())}</p>
                                                <p
                                                    title={item.description} className={`text-[13.5px] text-[#6b7280] h-[41px] font-normal my-3 ${styles['ellipsis-2']}`}
                                                >
                                                    {item.description?.replace(/\b\w/g, (char) => char.toUpperCase())}
                                                </p>
                                                <p className="text-[13.5px] text-[#374151] font-medium pb-2">
                                                    Date : {item.date.split('T')[0]}, {item.day}
                                                </p>
                                                <p className="text-[13.5px] text-[#374151] font-medium pb-2">
                                                    Time : {item.time}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f1f5]">
                                                    <div>
                                                        {/* <p className="text-[14px] text-[#000] font-[400] ">
                                                            Time: {item.time}
                                                        </p> */}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <FaEdit
                                                            className={styles.edit}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setUpdate(true), setId(item._id);
                                                            }}
                                                        />
                                                        <MdDelete
                                                            className={styles.delete}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setDelete(true), setId(item._id);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center h-[400px] items-center w-full my-auto flex-col text-[#9ca3af] font-medium">
                                        <img src={nodata} alt="No Data" className="w-[160px] h-[160px]" />
                                        <p>No Data Found</p>

                                    </div>
                                )}
                            </>
                        )}


                    </div>
                </div>


                <div className='flex flex-wrap justify-between items-center gap-3 mt-2'>

                    {totalpages > 0 &&
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
                    {totalpages > 0 &&
                        <div className="flex justify-end items-center">
                            <p className="text-[#6b7280] text-[13px]">
                                Showing {startIndex} – {endIndex} of {totaluser} Events
                            </p>
                        </div>
                    }
                </div>
            </div>

            <Modal
                isOpen={deleteevent}
                onRequestClose={() => !deleting && setDelete(false)}
                contentLabel="Delete Student"
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(21,21,21,.6)',
                        zIndex: 1000,
                    },
                    content: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '2.5rem',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        width: 'max-content',
                        maxWidth: '90vw',
                        height: 'max-content',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(15, 27, 51, 0.25)',
                        border: '1px solid #eef0f5',
                        zIndex: 1001,
                    },
                }}
            >
                {/* <Addstudent closeModal={() => setIsOpen(false)} onStudentAdded={getuserlist} /> */}
                <p className={styles.popmessage}>Are you sure you want to delete this event</p>
                <div className='flex gap-4 justify-center mt-10'>
                    <button onClick={() => handleDelete(id)}
                        className={styles.popyes} disabled={deleting}>{deleting ? "Deleting..." : "Yes"}</button>
                    <button className={styles.popno} onClick={() => setDelete(false)} disabled={deleting}>No</button>
                </div>
            </Modal>


        </>
    )
}

export default Eventlist