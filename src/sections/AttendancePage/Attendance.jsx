import React, { useEffect, useRef, useState } from "react";
import styles from "./Attendance.module.css";
import { FaArrowRight } from "react-icons/fa";
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { BiSearchAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { excelAttendance, getAttendance, getAttendancerate, getCourseBatch } from "../../api/Serviceapi";
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import nodata from '../../assets/nodata.jpg'
import Loader from "../../component/loader/Loader";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { IoClose } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';


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
const Attandance = () => {
  const [limit, setlimit] = useState(10);
  const [totallist, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const [showtable, setshowtable] = useState(false);
  const [showreq, setshowreq] = useState(false);
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [rate, setRate] = useState()
  const [batches, setBatches] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  // const [batchId, setBatchId] = useState('')
  // const [courseId, setCourseId] = useState('')
  // const [date, setDate] = useState('')
  const [open, setOpen] = useState(false)
  const [deleteevent, setDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [status, setStatus] = useState('');
  // Not persisted (unlike the fields below) — the primary batch should win
  // as the default on every fresh visit, not whatever was last picked.
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  // See fetchBatches' finally block for why the list/rate fetches wait on this.
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  const [status, setStatus] = useState(() => localStorage.getItem('att_status') || 'false');
  // Always defaults to today - never restored from localStorage, so a
  // stale saved date can't leave the filter pointed at an old day.
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [searchText, setSearchText] = useState(() => localStorage.getItem('att_searchText') || '');



  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totallist);

  function handleClick(date, courseId, batchId, searchText) {
    const params = new URLSearchParams();

    // if (date) params.append("date", date);
    if (courseId) params.append("courseId", courseId);
    if (batchId) params.append("batchId", batchId);
    if (searchText) params.append("search", searchText);

    navigate(`/attendence/leaverequest?${params.toString()}`);
  }

  useEffect(() => {
    const totalPages = Math.ceil(totallist / limit);
    setpage(totalPages);
  }, [totallist, limit]);


  const handlePageChange = (event, value) => {
    setList([]);
    if (value === offset) {
      // same page clicked -> call API again
      getAttendanceList()
    } else {
      setoffset(value); // triggers useEffect when page changes
    }
  };

  // const [searchText, setSearchText] = useState('');


  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);
    setList([])

  };

  useEffect(() => {
    localStorage.setItem('att_status', status);
    localStorage.setItem('att_searchText', searchText);
  }, [status, searchText]);


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

  // useEffect(() => {
  //   setDate(dayjs().format("YYYY-MM-DD"));
  // }, []);


  useEffect(() => {
    fetchBatches()
  }, []);

  // Batch drives the filter now — a batch's own `courses` array supplies
  // the course dropdown's options, so no separate per-batch fetch is needed.
  let fetchBatches = async () => {
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list);

      // Default the filter to the primary batch on first load — batchId
      // isn't persisted, so this is the only thing that sets it initially.
      if (!batchId) {
        const primary = list.find((b) => b.isPrimary);
        if (primary) setBatchId(primary._id);
      }
    } catch (error) {
      console.error("error", error.response?.data || error);
    } finally {
      // Gate the list/rate fetches on this instead of firing on mount with
      // batchId still '' — that fired an unfiltered request racing the
      // later batchId-filtered one, and whichever resolved last won,
      // sometimes leaving the table showing every batch while the stat
      // cards (which raced independently) showed the correct batch's count.
      setBatchesLoaded(true);
    }
  };

  // Re-derive course options whenever batchId or the batch list changes
  // (covers the primary-batch default kicking in once batches finish
  // loading), and drop courseId if it no longer belongs to this batch.
  useEffect(() => {
    if (!batchId) {
      setCourseOptions([]);
      return;
    }
    const selectedBatch = batches.find((b) => b._id === batchId);
    const options = selectedBatch?.courses || [];
    setCourseOptions(options);
    if (courseId && !options.some((c) => c.courseId === courseId)) {
      setCourseId('');
    }
  }, [batchId, batches]);


  useEffect(() => {
    if (!date || !batchesLoaded) return;
    getAttendanceList()
  }, [offset, searchText, courseId, batchId, date, status, batchesLoaded])
  // Filters can change faster than a request resolves (e.g. switching
  // batches while the previous batch's fetch is still in flight). Without
  // this, whichever response lands last wins the state update - even if
  // it's the stale one - showing the wrong batch's students. This token
  // makes only the most recently *issued* request's response get applied.
  const listRequestRef = useRef(0);
  let getAttendanceList = async () => {
    const requestId = ++listRequestRef.current;
    setLoading(true);
    try {
      let res = await getAttendance(limit, offset - 1, searchText, courseId, batchId, date, status)
      if (requestId !== listRequestRef.current) return;
      setList(res.data?.data?.data)
      settotal(res.data?.data?.totalCount)
    } catch (err) {
      console.log(err)
    } finally {
      if (requestId === listRequestRef.current) setLoading(false);
    }
  }

  const handleClearSearch = () => {
    setList([])
    setSearchText('');
    setoffset(1);
  };
  useEffect(() => {
    if (!date || !batchesLoaded) return;

    getattendancerate(date, courseId, batchId)
  }, [date, courseId, batchId, batchesLoaded])

  const [rateLoading, setRateLoading] = useState(false)
  // Same stale-response race as getAttendanceList, for the stat cards.
  const rateRequestRef = useRef(0);
  let getattendancerate = async () => {
    const requestId = ++rateRequestRef.current;
    setRateLoading(true)
    try {
      let res = await getAttendancerate(date, courseId, batchId)
      if (requestId !== rateRequestRef.current) return;
      console.log(res.data?.data, 'j')
      setRate(res.data?.data)
    } catch (err) {
      console.log(err)
    } finally {
      if (requestId === rateRequestRef.current) setRateLoading(false);
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




  const statusChange = (event) => {
    setStatus(event.target.value);
    setoffset(1)
  }
  const handlefilterSearch = () => {
    setCourseId('');
    setBatchId('');
    setCourseOptions([]);
    setStatus(false);
    setDate(dayjs().format('YYYY-MM-DD'));
    setSearchText('');

    localStorage.removeItem('att_status');
    localStorage.removeItem('att_searchText');
  };

  let getExcel = async () => {
    try {
      let res = await excelAttendance(searchText, courseId, batchId, date, status);
      console.log("Axios response:", res);

      // The Base64 string is here
      let base64String = res.data.data;

      if (!base64String) {
        toast.error("No Excel file data found");
        return;
      }

      // Clean (just in case)
      base64String = base64String.replace(/\s/g, "");

      // Convert Base64 → Blob
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "userDetails.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.log("Error downloading Excel:", err);
    }
  };
  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.attendancetop}>
        <div className={styles.attendanceleft}>
          <p>Attendance</p>
        </div>
        <div className={styles.attendanceright}>
          <div className={styles.attendancerightdiv}>

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
                  onChange={statusChange}
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
                  <MenuItem value={"all"}>All Status</MenuItem>
                  <MenuItem value={false}>Present</MenuItem>
                  <MenuItem value={true}>Absent</MenuItem>
                  <MenuItem value={"noLeave"}>Not Checked In</MenuItem>

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
                  <MenuItem value="">All Batches</MenuItem>
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
                  <MenuItem value="">All Courses</MenuItem>
                  {courseOptions.map((item, index) => {
                    return (
                      <MenuItem value={item.courseId} key={index}>{item.courseName}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </div>

            <div className={styles.dateWrapper}>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={date ? dayjs(date, "YYYY-MM-DD") : null}   // keep ISO date format for binding
                  onChange={(newValue) => {
                    if (newValue) {
                      const formatted = dayjs(newValue).format("YYYY-MM-DD"); // match <input type="date">
                      setDate(formatted);
                    } else {
                      setDate("");
                    }
                  }}
                  maxDate={dayjs()}
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
              {(status?.toString().trim() || courseId?.toString().trim() || batchId?.toString().trim() || date || searchText) && (
                <button className={styles.clear} onClick={handlefilterSearch}>
                  <IoClose />
                </button>
              )}


            </div>
            <button className={styles.exportBtn} onClick={getExcel}>
              Export<MdOutlineFileDownload />
            </button>
          </div>
        </div>
      </div>
      {rateLoading ?
        <div className={styles.attendancemiddle}>
          <div className={styles.attendancemiddlediv}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={80} height={40} />
          </div>

          <div className={`${styles.attendancemiddlediv} ${styles.statGreen}`}>
            <Skeleton variant="text" width={160} height={20} />
            <Skeleton variant="text" width={100} height={40} />
          </div>

          <div className={`${styles.attendancemiddlediv} ${styles.statRed}`}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={60} height={40} />
          </div>

          <div className={`${styles.attendancemiddlediv} ${styles.statAmber}`}>
            <Skeleton variant="text" width={130} height={20} />
            <Skeleton variant="text" width={60} height={40} />
          </div>

          <div className={`${styles.attendancemiddlediv} ${styles.statRed}`}>
            <div className={styles.attendancemiddlediv1}>
              <div>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={50} height={30} />
              </div>
              <div>
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </div>
          </div>
        </div> :
        rate &&
        <div className={styles.attendancemiddle}>
          <div className={styles.attendancemiddlediv}>
            <GroupsOutlinedIcon sx={{ fontSize: 20, color: '#123d84' }} />
            <p>Total No of Students</p>
            <p>{rate.studentCount}</p>
          </div>
          <div className={`${styles.attendancemiddlediv} ${styles.statGreen}`}>
            <TrendingUpOutlinedIcon sx={{ fontSize: 20, color: '#12805c' }} />
            <p>Today Attendance Rate</p>
            <p>{rate.attendanceRate}</p>
          </div>
          <div className={`${styles.attendancemiddlediv} ${styles.statRed}`}>
            <PersonOffOutlinedIcon sx={{ fontSize: 20, color: '#d92d20' }} />
            <p>Absent</p>
            <p>{rate.absentCount}</p>
          </div>
          <div className={`${styles.attendancemiddlediv} ${styles.statAmber}`}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: '#b45309' }} />
            <p>Not Checked In</p>
            <p>{rate.notCheckedInCount}</p>
          </div>
          <div className={`${styles.attendancemiddlediv} ${styles.statRed}`}>
            <div className={styles.attendancemiddlediv1}>
              <div>
                <EventBusyOutlinedIcon sx={{ fontSize: 20, color: '#d92d20' }} />
                <p>Leave Requests</p>
                <p>{rate.leaveRequestCount}</p>
              </div>
              <div>
                <div className={styles.leaveReqIcon} onClick={() => {

                  handleClick(date, courseId, batchId, searchText);
                }}>
                  <FaArrowRight />
                </div>
              </div>
            </div>
          </div>
        </div>

      }

      <div className={styles.attendancebottom}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Profile Info</th>
              <th>Course</th>
              <th>Date</th>
              <th>In-Time</th>
              <th>Break Out</th>
              <th>Break In</th>
              <th>Out Time</th>
              <th>Remarks</th>
            </tr>
          </thead>
          {loading ?
            <tr>
              <td colSpan="8" className="text-center py-20 text-lg text-gray-500 font-semibold" style={{ border: "none" }}>
                <Loader />
              </td>
            </tr>
            : <tbody>
              {Array.isArray(list) && list.length > 0 ?

                list.map((item) => (


                  <tr key={item._id}>
                    <td style={{ color: item?.onLeave && "#d92d20" }}>
                      <div style={{ textTransform: "capitalize" }}>{item.userDetails?.name || item.name}</div>
                      <div style={{ fontSize: 12, color: item?.onLeave ? "#d92d20" : "#6b7280" }}>{item.userDetails?.studentId || item.studentId}</div>
                      <div style={{ fontSize: 12, color: item?.onLeave ? "#d92d20" : "#6b7280" }}>{item.userDetails?.mobileNo || item.mobileNo}</div>
                    </td>
                    <td style={{ color: item?.onLeave && "#d92d20" }}>{item.courseDetails?.courseName}</td>
                    {item.date ?
                      <td style={{ color: item?.onLeave && "#d92d20", textTransform: "capitalize" }}>{item.date?.split("T")[0]}</td>
                      :
                      <td style={{ color: item?.onLeave && "#d92d20", textTransform: "capitalize" }}>   {date}
                      </td>
                    }
                                        <td>{item?.onLeave ? <p style={{ color: "#d92d20" }}>Leave</p> : item?.notCheckedIn ? <span className={styles.notCheckedInBadge}>Not Checked In</span> : item.inTime ? formatTime(item?.inTime) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td style={{ color: item?.onLeave && "#d92d20" }}>{item.breakTime?.length > 0 ? item?.breakTime[0] ? formatTime(item?.breakTime[0]) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p> : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td style={{ color: item?.onLeave && "#d92d20" }}>{item.breakTime?.length > 0 ? item?.breakTime[1] ? formatTime(item?.breakTime[1]) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p> : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td >
                      {item?.onLeave ? '' : item.outTime ? formatTime(item?.outTime) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>
                      }
                    </td>
                    <td style={{ color: item?.onLeave && "#d92d20" }}>{item.remarks || '-'}</td>
                  </tr>
                ))

                :
                <tr >
                  <td colSpan="8" className="text-center py-20 text-lg text-gray-500 font-semibold " style={{ border: "none" }}>
                    <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                    <p className="text-center text-gray-500">No Data Found</p>
                  </td>
                </tr>

              }
            </tbody>
          }
        </table>
      </div>


      <div className='flex flex-wrap justify-between items-center gap-3 w-full mt-4'>

        {totalpages > 0 &&
          <ThemeProvider theme={theme}>
            <div className="flex justify-end">
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
  );
};

export default Attandance;
