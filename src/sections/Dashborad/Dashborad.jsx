import React, { useEffect, useState } from 'react'
import dashboradcss from './Dashborad.module.css'
import profile from '../../assets/dashboardimgs/profile.png'
import profile1 from '../../assets/dashboardimgs/profile1.png'
import profile2 from '../../assets/dashboardimgs/profile2.png'
import profile3 from '../../assets/dashboardimgs/profile3.png'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    CircularProgressbarWithChildren,
    buildStyles
} from 'react-circular-progressbar';
import nodata from '../../assets/trans.png'
import 'react-circular-progressbar/dist/styles.css';
import { Link, Links } from 'react-router-dom'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getAttendancerate, getCourse, getCourseBatch, getCourseBatchByCourseId, getDashboardAttendencerate, getDashboardEvents, getDashboardLeave, getDashboardUser, getTodayrate, studentCount } from '../../api/Serviceapi'
import {
    getDashboardTermToppers,
    getDashboardSemesterToppers,
} from "../../api/Serviceapi";
import { LuGraduationCap, LuUsers, LuCalendarCheck, LuCalendar, LuArrowRight } from "react-icons/lu";

export const Dashboard = () => {
    const [days, setdays] = useState('this_week');
    const [studentList, setStudentList] = useState([])
    const [eventList, setEventList] = useState([])
    const [leaveList, setLeaveList] = useState([])
    const [todayAttendance, setToday] = useState()
    const [date, setDate] = useState('')
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState('');
    const [leavestatus, setLeaveStatus] = useState('');

    // Page-level batch filter - drives every widget below (except Events,
    // which isn't batch-scoped), defaulting to the primary batch.
    const [pageBatches, setPageBatches] = useState([]);
    const [pageBatchId, setPageBatchId] = useState('');

    useEffect(() => {
        const fetchPageBatches = async () => {
            try {
                const res = await getCourseBatch();
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                setPageBatches(list);
                const primary = list.find((b) => b.isPrimary);
                if (primary) setPageBatchId(primary._id);
            } catch (err) {
                console.error('error', err.response?.data || err);
            }
        };
        fetchPageBatches();
    }, []);

    const todayDate = new Date().toLocaleDateString("en-CA");


    const [Attendance, setAttendance] = useState([])
    const [termToppers, setTermToppers] = useState([]);
    const [semesterToppers, setSemesterToppers] = useState([]);
    const [academic, setAcademic] = useState("Term1");
    const [semester, setSemester] = useState("sem1");
    const [courseId, setCourseId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const fetchCourses = async () => {
        try {
            const res = await getCourse(100, 0);
            setCourses(res?.data?.data?.data || []);
        } catch (err) {
            console.error("Course fetch error", err);
        }
    };
    useEffect(() => {
        fetchCourses();
        // fetchPerformance();
        // fetchUsers();
    }, []);
    useEffect(() => {
        if (!courseId) {
            setBatches([]);
            setBatchId("");
            // fetchUsers(search, "", "");
            // setoffset(1);
            return;
        }

        const fetchBatches = async () => {
            try {
                const res = await getCourseBatchByCourseId(courseId, 100, 0);
                setBatches(res?.data?.data?.data || []);
            } catch {
                setBatches([]);
            }
        };

        fetchBatches();
        // fetchUsers(search, courseId, "");
        // setoffset(1);
    }, [courseId]);

    useEffect(() => {
        getTermToppers();
    }, [academic, semester, courseId, batchId]);

    // useEffect(() => {
    //     getSemesterToppers();
    // }, [semester]);
    const getTermToppers = async () => {
        const res = await getDashboardTermToppers(academic, semester, courseId, batchId);
        setTermToppers(res?.data?.data || []);
    };

    // const getSemesterToppers = async () => {
    //     const res = await getDashboardSemesterToppers(semester);

    //     const filtered = (res?.data?.data || [])
    //         .filter(item =>
    //             item.Academic === semester ||
    //             (semester === "Semester 2" && item.Academic === "Sem 2")
    //         )
    //         .sort((a, b) => b.average - a.average);

    //     setSemesterToppers(filtered);
    // };


    useEffect(() => {
        studentlist()
    }, [pageBatchId])
    useEffect(() => {
        eventlist()
    }, [status])
    useEffect(() => {
        leavelist()
    }, [leavestatus, pageBatchId])
    useEffect(() => {
        countStudent()
    }, [pageBatchId])
    let studentlist = async () => {
        try {
            let res = await getDashboardUser(pageBatchId)
            setStudentList(res?.data?.data?.data)

        } catch (err) {
            console.log(err)
        }
    }
    const [studentData, setStudentData] = useState(null);


    let countStudent = async () => {
        try {
            let res = await studentCount(pageBatchId);
            setStudentData(res?.data?.data?.[0]); // since your API returns array inside data
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        const formattedDate = new Date().toLocaleDateString("en-CA");
        setDate(formattedDate);
    }, []);

    useEffect(() => {
        attendanceRate();
    }, [pageBatchId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0"); // ensures 03 instead of 3
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase(); // "SEP"
        const year = date.getFullYear();
        return { day, month, year };
    };

    const statusChange = (event) => {
        setStatus(event.target.value);
    }

    let eventlist = async () => {
        try {
            let res = await getDashboardEvents(status)
            setEventList(res?.data?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }

    let leavelist = async () => {
        try {
            let res = await getDashboardLeave(leavestatus, pageBatchId)
            setLeaveList(res?.data?.data?.result)
        } catch (err) {
            console.log(err)
        }
    }

    let attendanceRate = async () => {
        try {
            let res = await getTodayrate(pageBatchId)
            setToday(res?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (!date) return;

        attendanceDashboradRate()
    }, [date, pageBatchId])

    let attendanceDashboradRate = async () => {
        try {
            let res = await getDashboardAttendencerate(date, pageBatchId)
            setAttendance(res?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const weekday = today.toLocaleDateString("en-GB", { weekday: "long" });
    const displayDate = `${formattedDate}, ${weekday}`;

    const handleLeaveStatusChange = (e) => {
        setLeaveStatus(e.target.value)
    }


    return (
        <>
            <div className={dashboradcss.dashboradcontainer}>
                <div className={dashboradcss.pageHeader}>
                    <div>
                        <h4 className={dashboradcss.pageTitle}>
                            Welcome Back, {localStorage.getItem('username') || 'Admin'}! <span className={dashboradcss.wave}>👋</span>
                        </h4>
                        <p className={dashboradcss.pageSubtitle}>Here's what's happening in your institute today.</p>
                    </div>
                    <div className={dashboradcss.headerActions}>
                        <select
                            value={pageBatchId}
                            onChange={(e) => setPageBatchId(e.target.value)}
                            className={dashboradcss.filterSelect}
                        >
                            <option value="">All Batches</option>
                            {pageBatches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.batchName}
                                </option>
                            ))}
                        </select>
                        <div className={dashboradcss.dateBadge}>
                            <LuCalendar />
                            <div>
                                <p>{formattedDate}</p>
                                <span>{weekday}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={dashboradcss.statsGrid}>
                    <div className={dashboradcss.dashcard}>
                        <div className="flex justify-between items-center">
                            <div><p className={dashboradcss.cardTitle}>Total Students</p></div>
                            <div className={`${dashboradcss.profileicon} ${dashboradcss.iconBlue}`}><LuGraduationCap /></div>
                        </div>
                        <div className={dashboradcss.dashcount}>{studentData?.totalStudents ?? 0}</div>
                        <div className="flex justify-between items-center">

                            <div className={dashboradcss.avatars}>
                                {studentData?.userDetails?.slice(0, 3).map((user, i) => (
                                    <img key={i} src={user.profileURL} alt={user.name} width={'100%'} />
                                ))}
                            </div>

                            <div className={dashboradcss.avatar_text}>
                                {studentData?.userDetails?.slice(0, 2).map((s, i) => (
                                    <Link to="/students" key={i}> <span key={i}>
                                        {s.name}
                                        {i < Math.min(studentData?.userDetails?.length, 3) - 1 && ", "}
                                    </span></Link>
                                ))}

                                {studentData?.totalStudents > 2 && (
                                    <>
                                        <Link to="/students">  +{studentData?.totalStudents - 2} <span>others</span></Link>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                    <div className={dashboradcss.dashcard}>
                        <div className="flex justify-between items-center">
                            <div><p className={dashboradcss.cardTitle}>Active Students</p></div>
                            <div className={`${dashboradcss.profileicon} ${dashboradcss.iconGreen}`}><LuUsers /></div>
                        </div>
                        <div className={dashboradcss.dashcount}>      {studentData?.activeStudents ?? 0}
                        </div>
                        <div className="flex justify-between items-center">

                            <div className={dashboradcss.avatars}>
                                {studentData?.userDetails?.slice(0, 3).map((user, i) => (
                                    <img key={i} src={user.profileURL} alt={user.name} width={'100%'} />
                                ))}
                            </div>

                            <div className={dashboradcss.avatar_text}>
                                {studentData?.userDetails?.slice(0, 2).map((s, i) => (
                                    <Link to="/students" key={i}> <span key={i}>
                                        {s.name}
                                        {i < Math.min(studentData?.userDetails?.length, 3) - 1 && ", "}
                                    </span></Link>
                                ))}

                                {studentData?.totalStudents > 2 && (
                                    <>
                                        <Link to="/students">   +{studentData?.totalStudents - 2} <span>others</span></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={dashboradcss.dashcard} >
                        <div className="flex justify-between items-center">
                            <div><p className={dashboradcss.cardTitle}>Attendance rate</p><p className={dashboradcss.dashdate}>{displayDate}</p></div>
                            <div className={`${dashboradcss.profileicon} ${dashboradcss.iconPurple}`}><LuCalendarCheck /></div>
                        </div>
                        <div className="flex justify-between items-center pt-[20px]">
                            <div className={dashboradcss.dashcount}>{todayAttendance?.attendanceRate}</div>
                            <Link to='/attendence'><div className={dashboradcss.viewDetailsLink}>View Details</div></Link>
                        </div>
                    </div>

                </div>
                <div className={dashboradcss.widgetsGrid}>
                    <div className={`${dashboradcss.dashcard} ${dashboradcss.panelLg}`} >
                        <div className={dashboradcss.panelHead}>
                            <div><h4 className={dashboradcss.panelTitle}>Leave Request</h4></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        minWidth: 120,
                                        backgroundColor: '#ffffff',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <Select
                                        value={leavestatus}
                                        onChange={handleLeaveStatusChange}
                                        displayEmpty
                                        IconComponent={KeyboardArrowDownIcon}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            fontSize: '14px',
                                            padding: '4px 10px',
                                            height: '38px',
                                            border: 'none'
                                        }}
                                    >
                                        <MenuItem value="">All</MenuItem>

                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>

                                    </Select>
                                </FormControl>
                                <Link to={`/attendence/leaverequest/${todayDate}//`} className={dashboradcss.viewAllLink}>
                                    View All <LuArrowRight />
                                </Link>

                            </div>
                        </div>
                        <div className={dashboradcss.scrollLeave} >
                            {leaveList?.length > 0 ? (
                                leaveList.map((leave) => (
                                    <div
                                        key={leave._id}
                                        className={`flex justify-between items-center ${dashboradcss.listRow}`}
                                    >
                                        {/* Left section */}
                                        <div className="flex items-center">
                                            <div className="w-[50px] h-[50px] rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#fff] border-solid">
                                                <img
                                                    src={leave?.userDetails?.profileURL || "/default-avatar.png"}
                                                    alt="profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="mx-2">
                                                <h6 className="text-[14px]">{leave?.userDetails?.name || "Unknown User"}</h6>
                                                <p className="text-[12px] font-[400] text-[#888484]">
                                                    ID: {leave?.userDetails?.studentId || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status button */}
                                        <div>
                                            <button
                                                className={`${dashboradcss.pill} ${leave?.status === "Rejected"
                                                    ? dashboradcss.pillRejected
                                                    : leave?.status === "Created"
                                                        ? dashboradcss.pillPending
                                                        : leave?.status === "Approved"
                                                            ? dashboradcss.pillApproved
                                                            : ""
                                                    }`}
                                                style={{ minWidth: '90px' }}
                                            >
                                                {leave?.status}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={dashboradcss.noData}>
                                    <img src={nodata} alt="" width={'160px'} height={'160px'} className='m-auto' />
                                    <p className={dashboradcss.noDataText}>No Data Found</p>
                                </div>
                            )}


                        </div>
                    </div>
                    <div className={dashboradcss.dashcard}>
                        <div className='flex justify-between flex-col h-100'>
                            <div className={dashboradcss.panelHead}>
                                <div><h4 className={dashboradcss.panelTitle}>Attendance Rate</h4></div>
                                <div style={{ width: '150px', }}>
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
                                            format="DD/MM/YYYY"
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    placeholder: 'DD/MM/YYYY',
                                                    onClick: () => setOpen(true),
                                                    error: Boolean(Error?.DateofBrith),
                                                    sx: {
                                                        '& .MuiPickersOutlinedInput-root': {
                                                            height: '35px',
                                                            outline: 'none',
                                                            backgroundColor: ' #f2f2f2'
                                                        },
                                                        '& fieldset': {
                                                            border: 'none', // removes the default outline
                                                        },
                                                        '&:hover fieldset': {
                                                            border: 'none',
                                                            outline: 'none'
                                                        },
                                                        '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                                                            border: 'none'
                                                        }
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>

                            <div className={dashboradcss.donutRow}>
                                <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                                    <CircularProgressbarWithChildren
                                        value={parseFloat(Attendance.attendanceRate) || 0}
                                        styles={buildStyles({
                                            pathColor: 'url(#gradient)',
                                            trailColor: '#eef0f5',
                                            strokeLinecap: 'butt',
                                        })}
                                    >

                                        <svg style={{ height: 0 }}>
                                            <defs>
                                                <linearGradient id="gradient" gradientTransform="rotate(90)">
                                                    <stop offset="0%" stopColor="#144196" />
                                                    <stop offset="100%" stopColor="#0b2456" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className={dashboradcss.donutCenter}>
                                            <strong>{Attendance.attendanceRate}</strong>
                                            <span>Attendance Rate</span>
                                        </div>
                                    </CircularProgressbarWithChildren>
                                </div>

                                <div className={dashboradcss.donutLegend}>
                                    <div className={dashboradcss.legendRow}>
                                        <span className={`${dashboradcss.legendDot} ${dashboradcss.legendDotBlue}`} />
                                        <span className={dashboradcss.legendLabel}>Present</span>
                                        <span className={dashboradcss.legendValue}>{Attendance.fetchCount ?? 0}</span>
                                    </div>
                                    <div className={dashboradcss.legendRow}>
                                        <span className={`${dashboradcss.legendDot} ${dashboradcss.legendDotGray}`} />
                                        <span className={dashboradcss.legendLabel}>Absent</span>
                                        <span className={dashboradcss.legendValue}>{Attendance.leaveApproved ?? 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={dashboradcss.donutFooter}>
                                <span className={dashboradcss.presentText}>No of student present: {Attendance.fetchCount ?? 0}</span>
                                <span className={dashboradcss.absentText}>No of student absent: {Attendance.leaveApproved ?? 0}</span>
                            </div>
                        </div>

                    </div>
                    <div className={`${dashboradcss.dashcard} ${dashboradcss.panelLg}`}>
                        <div className={dashboradcss.panelHead}>
                            <div><h4 className={dashboradcss.panelTitle}>Events</h4></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        minWidth: 120,
                                        backgroundColor: '#ffffff',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb'
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
                                            height: '38px',
                                            border: 'none'
                                        }}
                                    >
                                        <MenuItem value="">All</MenuItem>

                                        <MenuItem value="upcoming">Upcoming</MenuItem>
                                        <MenuItem value="ongoing">Ongoing</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>

                                    </Select>
                                </FormControl>
                                <Link to='/events' className={dashboradcss.viewAllLink}>View All <LuArrowRight /></Link>

                            </div>

                        </div>
                        <div className={dashboradcss.scrollEvents}>
                            {eventList?.length > 0 ? (
                                eventList.map((item) => {
                                    const { day, month, year } = formatDate(item.date);
                                    return (
                                        <div key={item._id} className={dashboradcss.eventCard}>
                                            <div className="flex items-center w-[70%]">

                                                <div>
                                                    <h6 className={dashboradcss.eventTitle}>{item?.title}</h6>
                                                    <p className={dashboradcss.eventDesc}>
                                                        {item?.description}
                                                    </p>
                                                    <div className={dashboradcss.pill} style={{
                                                        background: item.status === 'upcoming' && '#fff3e0' || item.status === 'ongoing' && '#e8eefc' || item.status === 'completed' && '#e7f7ee',
                                                        color: item.status === 'upcoming' && '#f59e0b' || item.status === 'ongoing' && '#2563eb' || item.status === 'completed' && '#12805c',

                                                    }}>{item?.status}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className={dashboradcss.eventDateBox}>
                                                    <h5 className={dashboradcss.eventDay}>{day}</h5>
                                                    <p className={dashboradcss.eventMonth}>{month} {year}</p>
                                                    <p className={dashboradcss.eventTime}>{item?.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className={dashboradcss.noData}>
                                    <img src={nodata} alt="" width={'160px'} height={'160px'} className='m-auto' />
                                    <p className={dashboradcss.noDataText}>No Data Found</p>
                                </div>

                            )}
                        </div>

                    </div>
                    <div className={`${dashboradcss.dashcard} ${dashboradcss.panelMd}`}>
                        <div className={dashboradcss.panelHead}>
                            <div><h4 className={dashboradcss.panelTitle}>Student List</h4></div>
                            <Link to='/students' className={dashboradcss.viewAllLink}>View All <LuArrowRight /></Link>
                        </div>

                        <div className={`${dashboradcss.tableWrap} ${dashboradcss.scrollStudents}`}>
                            <table className={dashboradcss.table}>
                                <thead>
                                    <tr >
                                        <th>Profile</th>
                                        <th>ID No</th>
                                        <th>Name</th>
                                        <th>Mobile</th>
                                        <th>Course</th>
                                        <th>Batch</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.map((item) => (
                                        <tr key={item?._id}>
                                            <td>
                                                <img src={item?.profileURL} alt="Profile" className="rounded-full w-10 h-10" />                                           </td>
                                            <td>{item?.studentId}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{item?.name}</td>
                                            <td>{item?.mobileNo}</td>
                                            <td>{item?.courseDetails?.courseName}</td>
                                            <td>{item?.batchDetails?.batchName}</td>
                                            <td className={item?.inStatus === 'ongoing' ? dashboradcss.statusOngoing : dashboradcss.statusDefault}>{item.inStatus}</td>
                                        </tr>
                                    ))}


                                </tbody>
                            </table>
                        </div>


                    </div>
                    <div className="lg:col-span-2 md:col-span-2 col-span-1  ">

                        <div className={`${dashboradcss.dashcard} ${dashboradcss.panelAuto}`}>
                            <div className={dashboradcss.panelHead}>
                                <h4 className={dashboradcss.panelTitle}>Toppers</h4>






                                <div className={dashboradcss.toppersFilters}>
                                    <select
                                        value={courseId}
                                        onChange={(e) => {
                                            setCourseId(e.target.value);
                                            setBatchId("");
                                        }}
                                        className={dashboradcss.filterSelect}
                                    >
                                        <option value="">All Courses</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.courseName}
                                            </option>
                                        ))}
                                    </select>


                                    <select
                                        value={batchId}
                                        disabled={!courseId}
                                        onChange={(e) => setBatchId(e.target.value)}
                                        className={dashboradcss.filterSelect}

                                    >
                                        <option value="">All Batches</option>
                                        {batches.map((b) => (
                                            <option key={b._id} value={b._id}>
                                                {b.batchName}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className={dashboradcss.filterSelect}

                                    >
                                        <option value="sem1">Semester 1</option>
                                        <option value="sem2">Semester 2</option>
                                    </select>

                                    {/* <FormControl size="small"> */}
                                    <select
                                        value={academic}
                                        onChange={(e) => setAcademic(e.target.value)}
                                        className={dashboradcss.filterSelect}
                                    >
                                        <option value="Term1">Term 1</option>
                                        <option value="Term2">Term 2</option>
                                        <option value="Semester">Semester</option>
                                    </select>
                                    {/* </FormControl> */}
                                </div>
                            </div>
                            {termToppers.length > 0 ? (
                                termToppers.map((s, i) => (
                                    <div
                                        key={s._id}
                                        className={dashboradcss.topperRow}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={dashboradcss.topperRank}>{i + 1}</span>

                                            <img
                                                src={s.userDetails?.profileURL}
                                                className="w-10 h-10 rounded-full"
                                                alt="profile"
                                            />

                                            <div>
                                                <p className={dashboradcss.topperName}>
                                                    {s.userDetails?.name}
                                                </p>
                                                <p className={dashboradcss.topperMeta}>
                                                    {s.courseDetails?.courseName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={dashboradcss.topperScore}>
                                            {s.average}%
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={dashboradcss.noDataText} style={{ marginTop: '40px' }}>
                                    No Data Found
                                </p>
                            )}

                        </div>


                        {/* <div className={dashboradcss.dashcard} style={{ height: "320px",overflow:'auto' }}>
                        <div className="flex justify-between items-center mx-2 mb-3">
                            <h4 className="text-lg font-normal"> Semester Wise Toppers</h4>

                            <FormControl size="small">
                                <Select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{ height: "32px" }}
                                >
                                    <MenuItem value="Semester 1">Semester 1</MenuItem>
                                    <MenuItem value="Semester 2">Semester 2</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {semesterToppers.length > 0 ? (
                            semesterToppers.map((s, i) => (
                                <div
                                    key={s._id}
                                    className="flex justify-between items-center px-3 py-2 border-b"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{i + 1}</span>

                                        <img
                                            src={s.userDetails?.profileURL}
                                            className="w-10 h-10 rounded-full"
                                            alt="profile"
                                        />

                                        <div>
                                            <p className="text-sm">
                                                {s.userDetails?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {s.courseDetails?.courseName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="font-semibold">
                                        {s.average}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 mt-10">
                                No Data Found
                            </p>
                        )}

                    </div> */}

                    </div>
                </div>


            </div>
        </>

    )
}

export default Dashboard;
