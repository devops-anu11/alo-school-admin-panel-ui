import { React, useState, useEffect, useRef } from 'react'
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { BiSearchAlt } from "react-icons/bi";
import { PlusIcon } from '@heroicons/react/24/solid';
// generic placeholder avatar - profile.png was an actual person's photo,
// not a real "no photo" icon, so students without a picture got shown
// someone else's face instead of a neutral silhouette.
const profile =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23cbd5e1'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23f8fafc'/%3E%3Cpath d='M6 35c1.8-8.5 8.2-13 14-13s12.2 4.5 14 13' fill='%23f8fafc'/%3E%3C/svg%3E";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet, useNavigate } from 'react-router-dom';
import { excelStudents, getUser } from '../../api/Serviceapi';
import CloseIcon from '@mui/icons-material/Close';
import { deleteUserId, getCourseBatch } from '../../api/Serviceapi';
import Addstudent from '../Addstudent/Addstudent';
import Modal from 'react-modal';
import styles from './Studentlist.module.css'
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineFileDownload } from "react-icons/md";

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

const Studentlist = () => {
  const [limit, setlimit] = useState(10);
  const [totaluser, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const navigate = useNavigate()
  const [users, setUser] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [batches, setBatches] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [activestatus, setActiveStatus] = useState(() => localStorage.getItem('activestatus') || '');
  const [status, setStatus] = useState(() => localStorage.getItem('status') || '');
  // Not persisted (unlike the fields above) — the primary batch should win
  // as the default on every fresh visit, not whatever was last picked.
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  // See fetchBatches' finally block for why the list fetch waits on this.
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  const [searchText, setSearchText] = useState(() => localStorage.getItem('searchText') || '');

  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totaluser);

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

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setoffset(1);
  };

  const [deleteOpen, setDeleteOpen] = useState(false)

 useEffect(() => {
  localStorage.setItem('activestatus', activestatus);
  localStorage.setItem('status', status);
  localStorage.setItem('searchText', searchText);
}, [activestatus, status, searchText]);

  const handlefilterSearch = () => {
    setActiveStatus('');
    setStatus('');
    setCourseId('');
    setBatchId('');
    setSearchText('');
    setCourseOptions([]);
    localStorage.removeItem('activestatus');
    localStorage.removeItem('status');
    localStorage.removeItem('searchText');
  };

  useEffect(() => {
    fetchBatches()
  }, []);

  // Batch drives the filter now — a batch's own `courses` array supplies the
  // course dropdown's options, so no separate per-batch fetch is needed.
  let fetchBatches = async () => {
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list);

      // Default the filter to the primary batch on first load only — don't
      // override a batch already restored from localStorage.
      if (!batchId) {
        const primary = list.find((b) => b.isPrimary);
        if (primary) setBatchId(primary._id);
      }
    } catch (error) {
      console.error("error", error.response?.data || error);
    } finally {
      // Gate the list fetch on this instead of firing on mount with
      // batchId still '' — that fired an unfiltered request racing the
      // later batchId-filtered one, and whichever resolved last won,
      // sometimes leaving the table showing every batch's students.
      setBatchesLoaded(true);
    }
  };
  // const [searchText, setSearchText] = useState('');


  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);
    setUser([])
  };


  useEffect(() => {
    const totalPages = Math.ceil(totaluser / limit);
    setpage(totalPages);
  }, [totaluser, limit]);



  const handlePageChange = (event, value) => {
    if (value !== offset) {
      setoffset(value);
    } else {
      getuserlist(); // reload if same page clicked
    }
  };


  useEffect(() => {
    if (!batchesLoaded) return;
    getuserlist()
    // getBatchname()
  }, [offset, searchText, courseId, status, batchId, activestatus, batchesLoaded]);



  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  // Filters can change faster than a request resolves (e.g. switching
  // batches while the previous batch's fetch is still in flight). Without
  // this, whichever response lands last wins the state update - even if
  // it's the stale one - showing the wrong batch's students. This token
  // makes only the most recently *issued* request's response get applied.
  const listRequestRef = useRef(0);
  let getuserlist = async () => {
    const requestId = ++listRequestRef.current;
    setLoading(true); // start loading
    await getUser(limit, offset - 1, searchText, courseId, status, batchId, activestatus)
      .then((res) => {
        if (requestId !== listRequestRef.current) return;
        setUser(res?.data?.data?.data);
        settotal(res?.data?.data?.totalCount);
        setActiveCount(res?.data?.data?.activeCount || 0);
        setInactiveCount(res?.data?.data?.inactiveCount || 0);
      })
      .catch((err) => console.error('Error fetching user:', err))
      .finally(() => { if (requestId === listRequestRef.current) setLoading(false); }); // stop loading
  };




  const handleClearSearch = () => {
    setUser([])
    setSearchText('');
    setoffset(1);
  };

  const statusChange = (event) => {
    setActiveStatus(event.target.value);
    setoffset(1)
  }

  const handleDelete = async (id) => {
    try {
      await deleteUserId(id);
      getuserlist(); // refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const [id, setId] = useState('')

  // const handlefilterSearch = () => {
  //   setActiveStatus('');
  //   setCourseId('');
  //   setBatchId('');
  //   setStatusName('')
  // }

  let getExcel = async () => {
    try {
      let res = await excelStudents(courseId, batchId, status, activestatus, searchText);
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

  // 👇 Re-derive course options whenever batchId or the batch list changes
  // (e.g. the primary batch default kicking in once batches finish
  // loading) — and drop courseId if it no longer belongs to the batch.
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



  return (

    <>
      <ToastContainer

      />

      <div style={{ paddingBottom: '60px' }}>
        <div className={styles.container} >
          <div className={styles.pageHeader}>
            <h4 className={styles.heading}>Student Management</h4>
            <div className={styles.headerActions}>
              <button onClick={() => setIsOpen(true)} className={styles.primaryBtn}><PlusIcon className='w-4 h-4' />Add Student</button>
              <button className={styles.exportBtn} onClick={getExcel}>Export<MdOutlineFileDownload />
              </button>
            </div>
          </div>

          <div className={styles.filterBar}>

              <div>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <Select
                    value={activestatus}
                    onChange={statusChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none'
                    }}
                  >

                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>

                  </Select>
                </FormControl>
              </div>
              <div >

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    // minWidth: 120,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
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
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none'
                    }}
                  >
                    <MenuItem value="">All Course Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="placed">Placed</MenuItem>
                    {/* <MenuItem value="dropout">Dropout</MenuItem> */}

                    {/* {course.map((item, index) => {
                    return (
                      <MenuItem value={item.courseName} key={index}>{item.courseName}</MenuItem>
                    )
                  })} */}
                  </Select>

                </FormControl>
              </div>
              <div >

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
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
                      padding: '4px 10px',
                      height: '42px',
                      border: 'none'
                    }}
                  >
                    <MenuItem value="">All Batches</MenuItem>
                    {batches.map((item, index) => {
                      return (
                        <MenuItem value={item._id} key={index}>{item.batchName}</MenuItem>
                      )
                    })}
                  </Select>

                </FormControl>
              </div>

              <div >

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
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
              <div className={styles.searchBox}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search here"
                  value={searchText}
                  onChange={handleSearchChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BiSearchAlt style={{ fontSize: 18, color: '#555' }} />
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
                      padding: '4px 10px'
                    },
                    notched: false
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #e5e7eb',
                    },
                    minWidth: 120,
                    width: '100%',
                  }}
                />
              </div>
              <div>
                {(activestatus?.toString().trim() || status || courseId?.toString().trim() || batchId?.toString().trim()) && (
                  <button className={styles.clear} onClick={handlefilterSearch} title="Clear filters">
                    <IoClose />
                  </button>
                )}

              </div>

          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <p>Total Students</p>
              {/* Active + inactive always adds up to the total matching every
                  other filter, since status only ever has those two values -
                  see the enum on userModel.status. */}
              <p>{activeCount + inactiveCount}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <p>Active Students</p>
              <p>{activeCount}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statRed}`}>
              <p>Inactive Students</p>
              <p>{inactiveCount}</p>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Profile Info</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Active</th>
                    <th>Status</th>
                    <th className="text-center" colSpan={2}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-20 text-lg text-gray-500 font-semibold">
                        <Loader />
                      </td>
                    </tr>
                  ) : Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className={styles.profileInfo}>
                            <img
                              src={user.profileURL || profile}
                              alt="Profile"
                              className={styles.avatar}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = profile;
                              }}
                            />
                            <div>
                              <p className={styles.cellPrimary} style={{ margin: 0 }}>{user.name}</p>
                              <p className={styles.profileMeta}>{user.studentId}</p>
                              <p className={styles.profileMeta}>{user.mobileNo}</p>
                            </div>
                          </div>
                        </td>
                        <td>{user?.courseDetails?.courseName}</td>
                        <td>{user?.batchDetails?.batchName || '-'}</td>
                        <td>
                          <span className={`${styles.pill} ${user.status === 'active' ? styles.pillActive : styles.pillInactive}`}>
                            {user?.status || '-'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.pill} ${user.inStatus === 'completed'
                              ? styles.pillCompleted
                              : user.inStatus === 'placed'
                                ? styles.pillPlaced
                                : user.inStatus === 'ongoing'
                                  ? styles.pillOngoing
                                  : styles.pillNeutral
                              }`}
                          >
                            {user.inStatus || '-'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.viewBtn}
                            onClick={() => navigate(`/students/studentview/${user._id}`)}
                          >
                            <VisibilityIcon fontSize="small" /> View
                          </button>
                        </td>

                        {/* <td className="px-4 py-2 space-x-2 text-sm">
            <button
              className="text-red-600 flex items-center gap-1 cursor-pointer"
              onClick={() => { setDeleteOpen(true); setId(user._id) }}
            >
              <DeleteOutlineIcon /> Delete
            </button>
          </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.emptyState}>
                        <img src={nodata} alt="" width="160" height="160" className="m-auto" />
                        <p>No Data Found</p>
                      </td>
                    </tr>
                )}
              </tbody>

            </table>

            </div>

          </div>

          <div className={styles.footerRow}>

            {totalpages > 0 &&

              <ThemeProvider theme={theme}>
                <div className="flex justify-center ">
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
              <p className={styles.pageInfo}>
                Showing {startIndex} – {endIndex} of {totaluser} students
              </p>
            }
          </div>
        </div>

        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(true)}
          contentLabel="Add Student"
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
              padding: '2rem',
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: 'min(800px, 94vw)',
              height: 'min(600px, 90vh)',
              overflow: 'auto',
              boxShadow: '0 20px 45px rgba(15, 27, 51, 0.25)',
              zIndex: 1001,
              fontFamily: '"Poppins", sans-serif',
            },
          }}
        >
          <Addstudent closeModal={() => setIsOpen(false)} onStudentAdded={getuserlist} />
        </Modal>


        <Modal
          isOpen={deleteOpen}
          onRequestClose={() => setDeleteOpen(true)}
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
              padding: '2.5rem',
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: 'min(360px, 92vw)',
              height: 'max-content',
              overflow: 'auto',
              boxShadow: '0 20px 45px rgba(15, 27, 51, 0.25)',
              zIndex: 1001,
              fontFamily: '"Poppins", sans-serif',
            },
          }}
        >
          {/* <Addstudent closeModal={() => setIsOpen(false)} onStudentAdded={getuserlist} /> */}
          <p className={styles.popmessage}>Are you sure you want to delete this student</p>
          <div className='flex gap-4 justify-center mt-10'>
            <button onClick={() => { setDeleteOpen(false); handleDelete(id) }}
              className={styles.popyes} >Yes</button>
            <button className={styles.popno} onClick={() => setDeleteOpen(false)}>No</button>
          </div>
        </Modal>

      </div>
    </>
  )
}

export default Studentlist