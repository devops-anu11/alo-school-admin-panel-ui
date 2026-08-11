import React, { useEffect, useState } from 'react'
import styles from "./LeaveRequest.module.css";
import { BiSearchAlt } from "react-icons/bi";
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getCourseBatch, getLeaveRequest, getLeaveRequestById, updateLeaveRequest } from '../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Modal from 'react-modal';
import { MdClose } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye } from "react-icons/fa";


const theme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          color: '#1f2937', // text-gray-800
          '&.Mui-selected': {
            background: 'linear-gradient(to bottom, #144196, #0b2456)',
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


const LeaveRequest = () => {
  const useQuery = () => new URLSearchParams(useLocation().search);

  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState('')
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const [limit, setlimit] = useState(10);
  const [totallist, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  // Defaults to "Created" (pending) so the page opens on requests awaiting
  // action rather than the full history; "Clear filters" still resets this
  // to '' (all statuses) since that's an explicit user choice.
  const [status, setStatus] = useState('Created')
  const [update, setUpdate] = useState(false)
  const [data, setData] = useState([])
  const [updatestatus, setUpdatestatus] = useState('')
  const [loading, setLoading] = useState(false)
  const adminId = localStorage.getItem('userId')
  const [reason, setReason] = useState('')
  const [batches, setBatches] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [batchId, setBatchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [leaveType, setLeaveType] = useState('')

  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totallist);

  useEffect(() => {
    const totalPages = Math.ceil(totallist / limit);
    setpage(totalPages);
  }, [totallist, limit]);

  const handlePageChange = (event, value) => {
    setList([]);
    if (value === offset) {

      getleavelist()
    } else {
      setoffset(value);
    }
  };

  const query = useQuery();

  const dates = query.get("date");
  const courseIds = query.get("courseId");
  const batchIds = query.get("batchId");
  const searchTexts = query.get("search");

  // useEffect(() => {
  //   if (dates) setDate(dates);
  // }, [dates]);

  // courseId is applied once the selected batch's course options are known
  // (see the batchId/batches effect below) — it depends on batchId now.
  useEffect(() => {
    if (batchIds) setBatchId(batchIds);
  }, [batchIds]);

  useEffect(() => {
    if (searchTexts) setSearchText(searchTexts);
  }, [searchTexts]);

  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);

    setList([])

  };


  const handleClearSearch = () => {
    setList([])
    setSearchText('');
    setoffset(1);
  };

  useEffect(() => {
    // if (!date) return;
    getleavelist()
  }, [offset, date, status, searchText, courseId, batchId, leaveType])

  let getleavelist = async () => {
    setLoading(true)
    try {
      let res = await getLeaveRequest(limit, offset - 1, date, status, searchText, courseId, batchId, leaveType)
      setList(res.data?.data?.result)
      settotal(res.data?.data?.totalCount)

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setoffset(1)
    setList([])
  }

  const handleLeaveChange = (e) => {
    setLeaveType(e.target.value)
    setoffset(1)
    setList([])
  }
  const handlegetbyClick = async (id) => {
    setUpdate(true)
    try {
      let res = await getLeaveRequestById(id)
      setData(res.data?.data?.result[0])
    } catch (err) {
      console.log(err)
    }

  }

  const handleBatchChange = (event) => {
    // courseOptions are re-derived reactively (see the batchId/batches effect below)
    setBatchId(event.target.value);
    setCourseId("");
    setoffset(1);
  };

  const handlecourseChange = (event) => {
    setCourseId(event.target.value);
    setoffset(1);
  };

  useEffect(() => {
    fetchBatches()
  }, []);

  // Batch drives the filter now — a batch's own `courses` array supplies
  // the course dropdown's options, so no separate per-batch fetch is needed.
  // Defaults to "All" batches - unlike other pages, this one doesn't
  // pre-select the primary batch, since leave requests should be visible
  // across every batch by default.
  let fetchBatches = async () => {
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list);
    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };

  // Re-derive course options whenever batchId or the batch list changes
  // (covers the batchId arriving from the URL before batches finish
  // loading), apply courseId from the URL if it belongs to this batch, and
  // drop courseId if it no longer belongs to the selected batch.
  useEffect(() => {
    if (!batchId) {
      setCourseOptions([]);
      return;
    }
    const selectedBatch = batches.find((b) => b._id === batchId);
    const options = selectedBatch?.courses || [];
    setCourseOptions(options);
    if (courseIds && options.some((c) => c.courseId === courseIds)) {
      setCourseId(courseIds);
    } else if (courseId && !options.some((c) => c.courseId === courseId)) {
      setCourseId('');
    }
  }, [batchId, batches]);

  const [reasonerror, setReasonerror] = useState('')

  // const validation = () => {
  //   if (reason.trim() === '') {
  //     setReasonerror('Reason is required');
  //     return false;
  //   }
  //   setReasonerror('');
  //   return true;
  // };

  const [idloading, setIdlloading] = useState(false)

  const handleUpdateClick = async (id, status, adminId, reason) => {
    // if (!validation()) {
    //   return;
    // }
    setIdlloading(true)
    try {
      let res = await updateLeaveRequest(id, status, adminId, reason)
      setUpdatestatus(status)
      setUpdate(false)
      getleavelist()
      setReason('')
      if (status === 'Rejected') {
        toast.error('Leave Rejected')
      } else if (status === 'Approved') {
        toast.success('Leave Approved')
      }

    }
    catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message)
    } finally {
      setIdlloading(false)
    }
  }
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  };



  const formatTimehours = (decimalHours) => {
    if (!decimalHours) return "0 mins"; // handle null/undefined/0 safely

    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let parts = [];

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
    }

    return parts.join(" ") || "0 mins";
  };


  const handlefilterSearch = () => {
    setStatus('');
    setCourseId('');
    setBatchId('');
    setCourseOptions([]);
    setLeaveType('');
    setSearchText('');
    setDate('')
  }

  const [resonModel, setReasonModel] = useState(false)
const [leaveReson,setLeaveReason]= useState('')
  const handleReasonModel = async(id) => {
    setReasonModel(true)
    try {
      let res = await getLeaveRequestById(id)
      // setData(res.data?.data?.result[0])
      setLeaveReason(res?.data?.data?.result[0]?.discription)
    } catch (err) {
      console.log(err)
    }

  }

  return (
    <>
      <ToastContainer />
      <div className={styles.container}>
        <div className={styles.attendance_container}>
          <div className={styles.header_container}>
            <div className={styles.header_container1}>
              <div >
                <IoMdArrowRoundBack style={{ cursor: 'pointer', fontSize: '20px', marginTop: '2px' }} onClick={() => window.history.back()} />

              </div>
              <h3 className={styles.attendance_h3}>Leave Request</h3>
            </div>
            <div className={styles.header_container2}>

              <div className={styles.selectWrapper}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 150,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Select
                    value={leaveType}
                    onChange={handleLeaveChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      color: '#374151',
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none',
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Sick">Sick</MenuItem>
                    <MenuItem value="permission">Permission</MenuItem>
                    <MenuItem value="earlyPermission">Early Permission</MenuItem>
                    <MenuItem value="other">Others</MenuItem>


                  </Select>

                </FormControl>
              </div>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 150,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                >

                  <Select
                    value={batchId}
                    onChange={handleBatchChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      color: '#374151',
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none'
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {batches.map((item, index) => (
                      <MenuItem value={item._id} key={index}>
                        {item.batchName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 150,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Select
                    value={courseId}
                    onChange={handlecourseChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      color: '#374151',
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none'
                    }}
                    disabled={!batchId}
                  >
                    <MenuItem value="">All</MenuItem>
                    {courseOptions.map((item, index) => {
                      return (
                        <MenuItem value={item.courseId} key={index}>{item.courseName}</MenuItem>
                      )
                    })}
                  </Select>

                </FormControl>
              </div>
              <div className={styles.dropdown}>
                <div className={styles.dropdownWrapper}>

                  <div className={styles.selectWrapper}>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 150,
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <Select
                        value={status}
                        onChange={handleStatusChange}
                        displayEmpty
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#374151',
                          padding: '4px 10px',
                          height: '42px',
                          border: 'none',
                        }}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Created">Created</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>

                    </FormControl>
                  </div>
                </div>
              </div>
              <div className={styles.dateWrapper}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={date ? dayjs(date, "YYYY-MM-DD") : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const formatted = dayjs(newValue).format("YYYY-MM-DD");
                        setDate(formatted);
                      } else {
                        setDate("");
                      }
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: 'DD/MM/YYYY',
                        onClick: () => setOpen(true),
                        error: Boolean(Error?.DateofBrith),
                        sx: {
                          '& .MuiPickersOutlinedInput-root': {
                            height: '42px',
                            outline: 'none',
                            width: '100%',
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                          },
                          '& fieldset': {
                            border: '1px solid #e5e7eb',
                          },
                          '&:hover fieldset': {
                            border: '1px solid #123d84',
                            outline: 'none'
                          },
                          '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                            border: '1px solid #123d84'
                          }
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className={styles.searchWrapper}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search here"
                  value={searchText}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BiSearchAlt style={{ fontSize: 18, color: '#6b7280' }} />

                      </InputAdornment>
                    ),
                    endAdornment: searchText && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearSearch} edge="end">
                          <CloseIcon style={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: {
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      height: '42px',
                      fontSize: '14px',
                      padding: '4px 10px',
                      border: '1px solid #e5e7eb',
                      fontFamily: 'inherit',
                    },
                    notched: false
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    width: '100%',
                  }}
                />
              </div>
              <div>
                {(status?.toString().trim() || courseId?.toString().trim() || batchId?.toString().trim() || leaveType?.toString().trim() || searchText || date) && (
                  <button className={styles.clear} onClick={handlefilterSearch}>
                    <IoClose />
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>


        <div>
          <div className={styles.table_container}>
            <table className={styles.table}>
              <tr className={styles.tr}>
                <th>Profile Info</th>
                <th>Batch &amp; Course</th>
                <th>Leave Type &amp; Duration</th>
                <th>From &amp; To</th>
                <th>Submitted Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
              {loading ?
                <tr>
                  <td colSpan="7" className="text-center py-20 text-lg text-gray-500 font-semibold border-0">
                    <Loader />
                  </td>
                </tr>
                : <tbody>
                  {
                    Array.isArray(list) && list.length > 0 ?
                      list.map((item) => (
                        <tr key={item._id} className={styles.trtd}>
                          <td style={{ textTransform: 'capitalize' }}>
                            <div className={styles.profileInfo}>
                              <span className={styles.profileName}>{item?.userDetails?.name}</span>
                              <span className={styles.profileMeta}>{item?.userDetails?.studentId}</span>
                              <span className={styles.profileMeta} style={{ textTransform: 'none' }}>{item?.userDetails?.mobileNo}</span>
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <div className={styles.stackCell}>
                              <span className={styles.stackPrimary}>{item?.batchDetails?.batchName || '-'}</span>
                              <span className={styles.stackSecondary}>{item?.courseDetails?.courseName || '-'}</span>
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <div className={styles.stackCell}>
                              <span className={styles.stackPrimary}>{item?.leaveType}</span>
                              <span className={styles.stackSecondary} style={{ textTransform: 'none' }}>
                                {item.isPermission || item?.isEarlyPermission
                                  ? formatTimehours(item?.permissionTime)
                                  : `${item?.noOfDays} ${item?.noOfDays > 1 ? 'days' : 'day'}`}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.stackCell} style={{ textTransform: 'none' }}>
                              <span className={styles.stackPrimary}>
                                {item.isPermission || item?.isEarlyPermission
                                  ? formatTime(item?.startTime)
                                  : item?.fromDate?.split("T")[0]}
                              </span>
                              <span className={styles.stackSecondary}>
                                {'→ '}
                                {item.isPermission || item?.isEarlyPermission
                                  ? formatTime(item?.endTime)
                                  : item?.toDate?.split("T")[0]}
                              </span>
                            </div>
                          </td>
                          <td>{item?.createdAt?.split("T")[0]}</td>
                          <td onClick={() => handleReasonModel(item._id)} style={{cursor:'pointer'}}><FaEye />
</td>

                          <td className={styles.green} style={{
                            color: item.status === 'Approved' && '#12805c' || item.status === 'Created' && '#123d84' || item.status === 'Rejected' && '#d92d20',
                            cursor: item?.status == 'Created' && 'pointer'
                          }} onClick={() => item?.status == 'Created' && handlegetbyClick(item?._id)}>{item?.status == 'Created' ? <div><FontAwesomeIcon
                            icon={faEye}
                            style={{ marginRight: "5px" }}
                            className={styles.viewIcon}
                          />
                            <span>View</span></div> : item.status} </td>
                        </tr>
                      ))
                      :
                      <tr >
                        <td colSpan="7" className="text-center py-20 text-lg text-gray-500 font-semibold " style={{ border: "none" }}>
                          <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                          <p className="text-center ">No Data Found</p>
                        </td>
                      </tr>


                  }

                </tbody>
              }
            </table>
          </div>
        </div>

        <div className='flex flex-wrap justify-between items-center gap-3 w-full mt-4'>

          {totalpages > 0 &&
            <ThemeProvider theme={theme}>
              <div>
                <Pagination

                  count={totalpages}
                  page={offset}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                />
              </div>
            </ThemeProvider>
          }
          {totalpages > 0 &&
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">
                Showing {startIndex} – {endIndex} of {totallist} students
              </p>
            </div>
          }
        </div>

      </div>

      <Modal
        isOpen={update}
        onRequestClose={() => setUpdate(true)}
        contentLabel="Delete Student"
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(21, 21, 21, 0.6)',
            zIndex: 1000,
          },
          content: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 0,
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: 'max-content',
            height: 'max-content',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(15, 27, 51, 0.25)',
            border: 'none',
            zIndex: 1001,
          },
        }}
      >
        <div

        >
          <div className={styles.leavereq}>
            <div className={styles.reqhead}>
              <p>Leave Request</p>
              <MdClose className={styles.closeIcon} onClick={() => { setUpdate(false), setData({}), setReason(''), setReasonerror('') }} />
            </div>
            <div className={styles.div}>
              <div className={styles.profile}>
                <p>Profile</p>
                <div className={styles.profilediv}>
                  <img src={data?.userDetails?.profileURL} alt="" />
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.grid1}>
                  <label for="">Student Name</label>
                  <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="Enter student name" value={data?.userDetails?.name} disabled />
                </div>
                <div className={styles.grid1}>
                  <label for="">Phone Number</label>
                  <input type="tel" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="Enter phone number" value={data?.userDetails?.mobileNo} disabled />
                </div>
              </div>
              <div className={styles.grids}>
                <div className={styles.grid2}>
                  <label for="">
                    Duration
                  </label>
                  {data?.isPermission || data?.isEarlyPermission ?
                    <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="no of days" value={formatTimehours(data?.permissionTime)} disabled /> :
                    <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="no of days" value={data?.noOfDays} disabled />}
                </div>
                <div className={styles.grid2}>
                  <label for="">From</label>
                  {data?.isPermission || data?.isEarlyPermission ? <input disabled className={styles.dateinput} value={formatTime(data?.startTime)}
                  /> :
                    <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={data?.fromDate ? data.fromDate.slice(0, 10) : ""}
                    />}

                </div>
                <div className={styles.grid2}>
                  <label for="">To</label>
                  {data?.isPermission || data?.isEarlyPermission ? <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={formatTime(data?.endTime)}
                  /> :
                    <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={data?.toDate ? data.toDate.slice(0, 10) : ""}
                    />
                  }
                </div>
              </div>
              <div className={styles.gridss}>
                <div className={styles.grid3}>
                  <label>Description</label>
                  <textarea
                    disabled
                    style={{ color: 'grey', cursor: 'auto' }}
                    placeholder="Enter description"
                    className={styles.description}
                    value={data?.discription}
                  ></textarea>
                </div>
              </div>
              <div className={styles.gridss}>
                <div className={styles.grid3}>
                  <label>Reason</label>
                  <textarea
                    placeholder="Enter Reason"
                    className={styles.description2}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value), setReasonerror('') }}
                  ></textarea>
                  {/* {reasonerror && <p style={{ color: "red", fontSize: "12px" }}>{reasonerror}</p>} */}

                </div>
              </div>
            </div>
            <div className={styles.gridsss}>
              <button className={styles.rejectBtn} onClick={() => handleUpdateClick(data?._id, 'Rejected', adminId, reason)} disabled={idloading}>{idloading ? "Rejecting..." : "Reject"}</button>
              <button className={styles.acceptBtn} onClick={() => handleUpdateClick(data?._id, 'Approved', adminId, reason)} disabled={idloading}>{idloading ? "Accepting..." : "Accept"}</button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={resonModel}
        onRequestClose={() => {setReasonModel(false),setLeaveReason('')}}
        contentLabel="Delete Student"
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(21, 21, 21, 0.6)',
            zIndex: 1000,
          },
          content: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: 'min(500px, 92vw)',
            height: 'max-content',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 12px 32px rgba(15, 27, 51, 0.25)',
            border: 'none',
            zIndex: 1001,
          },
        }}
      >
        <div className={styles.reasonHeader}>
          <p className='font-[600] text-[18px]' style={{ color: '#123d84', margin: 0 }}>Reason</p>
          <MdClose className={styles.closeIcon} onClick={() => { setReasonModel(false), setLeaveReason('') }} />
        </div>
        <p className='mt-[18px] text-center text-[#374151]' style={{textTransform:'capitalize'}}>{leaveReson}</p>
      </Modal>
    </>
  )
}

export default LeaveRequest
