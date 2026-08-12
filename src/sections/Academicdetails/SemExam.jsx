import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import Pagination from '@mui/material/Pagination';
import {
  getPerformance,
  getCourseBatch,
  getUser,
  excelPerformance,
  updateTermSem,
} from "../../api/Serviceapi";
import { IoClose } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../component/loader/Loader";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PieChartIcon from "@mui/icons-material/PieChart";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const Sem = () => {
  const [performance, setPerformance] = useState([]);
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [semester, setSemester] = useState("");
  const [academic, setAcademic] = useState("");
  const [studentStatus, setStudentStatus] = useState("active");
  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inline "edit a single subject's mark" state, scoped to whichever row
  // (by index into viewRecord.Marks) is currently being edited.
  const [editingMarkIndex, setEditingMarkIndex] = useState(null);
  const [editMarkValue, setEditMarkValue] = useState("");
  const [savingMark, setSavingMark] = useState(false);

  const closeViewModal = () => {
    setViewModal(false);
    setViewRecord(null);
    setEditingMarkIndex(null);
    setEditMarkValue("");
  };

  const startEditMark = (index, currentMark) => {
    setEditingMarkIndex(index);
    setEditMarkValue(currentMark === "AA" ? "AA" : String(currentMark ?? ""));
  };

  const cancelEditMark = () => {
    setEditingMarkIndex(null);
    setEditMarkValue("");
  };

  const saveEditMark = async (index) => {
    const outOf = viewRecord.Marks[index]?.totalMarks ?? 100;
    const value = editMarkValue.trim().toUpperCase();

    if (value !== "AA") {
      if (!/^\d+$/.test(value) || Number(value) > outOf) {
        toast.error(`Enter a valid mark between 0 and ${outOf}`, {
          autoClose: 1500,
          closeButton: false,
        });
        return;
      }
    }

    const updatedMarks = viewRecord.Marks.map((m, i) =>
      i === index ? { ...m, mark: value === "AA" ? "AA" : Number(value) } : m,
    );

    const total = updatedMarks.reduce(
      (sum, m) => sum + (m.mark === "AA" ? 0 : Number(m.mark) || 0),
      0,
    );
    const maxTotal = updatedMarks.reduce((sum, m) => sum + (m.totalMarks ?? 100), 0);
    const average = maxTotal ? Number(((total / maxTotal) * 100).toFixed(2)) : 0;

    try {
      setSavingMark(true);
      await updateTermSem(viewRecord._id, { Marks: updatedMarks, total, average });

      const updatedRecord = { ...viewRecord, Marks: updatedMarks, total, average };
      setViewRecord(updatedRecord);
      setPerformance((prev) =>
        prev.map((row) => (row._id === viewRecord._id ? { ...row, Marks: updatedMarks, total, average } : row)),
      );

      toast.success("Mark updated successfully!", { autoClose: 1000, closeButton: false });
      cancelEditMark();
    } catch (err) {
      console.error("Failed to update mark:", err);
      toast.error(err?.response?.data?.message || "Failed to update mark", {
        autoClose: 1500,
        closeButton: false,
      });
    } finally {
      setSavingMark(false);
    }
  };

  // const [page, setPage] = useState(1);
  // const rowsPerPage = 5;

  const [limit, setlimit] = useState(10);
  const [totaluser, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);

  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totaluser);

  const handlePageChange = (event, value) => {
    if (value !== offset) {
      setoffset(value);
    } else {
      fetchPerformance(); // reload if same page clicked
    }
  };

  useEffect(() => {
    const totalPages = Math.ceil(totaluser / limit);
    setpage(totalPages);
  }, [totaluser, limit]);

  const handlefilterSearch = () => {
    setCourseId('');
    setBatchId('');
    setSearch('');
    setSemester('');
    setAcademic('');
    setStudentStatus('active');

  };

  useEffect(() => {
    fetchBatches();
    // fetchPerformance();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [search, courseId, batchId, semester, offset, academic, studentStatus]);

  const fetchUsers = async (value = "", cId = "", bId = "") => {
    try {
      const res = await getUser(100, 0, value, cId, "", bId, "");
      setUsers(res?.data?.data?.data || []);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await getPerformance(limit, offset - 1, courseId, batchId, semester, search, academic, studentStatus);
      const apiData = res?.data?.data?.data || [];
      settotal(res?.data?.data?.totalCount);
      setPerformance(res?.data?.data?.data || []);
      // const formatted = apiData
      //   .filter(
      //     (item) =>
      //       item.Academic &&
      //       item.Academic.toLowerCase().startsWith("sem")
      //   )
      //   .map((item) => ({
      //     id: item._id,
      //     userId: item.userDetails?._id,
      //     name: item.userDetails?.name || "-",
      //     studentId: item.userDetails?.studentId || "-",

      //     Academic: item.Academic,
      //     exam: item.exam,

      //     courseId: item.courseDetails?._id || "",
      //     courseName: item.courseDetails?.courseName || "-",

      //     batchId:
      //       item.batchDetails?.length > 0
      //         ? item.batchDetails[0]._id
      //         : "",
      //     batchName:
      //       item.batchDetails?.length > 0
      //         ? item.batchDetails[0].batchName
      //         : "-",

      //     total: item.total || 0,
      //     percentage: item.average ? `${item.average}%` : "0%",
      //     subjects: item.Marks || [],
      //   }));

      // setPerformance(formatted);
    } catch (err) {
      console.error("Semester fetch failed", err);
    } finally {
      setLoading(false);
    }
  };


  // Batch drives the filter - a batch's own `courses` array supplies the
  // course dropdown's options, matching the batch-first pattern used
  // everywhere else in the app.
  const fetchBatches = async () => {
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list);

      if (!batchId) {
        const primary = list.find((b) => b.isPrimary);
        if (primary) setBatchId(primary._id);
      }
    } catch (err) {
      console.error("Batch fetch error", err);
    }
  };

  // Re-derive course options whenever batchId or the batch list changes,
  // and drop courseId if it no longer belongs to the selected batch.
  useEffect(() => {
    if (!batchId) {
      setCourseOptions([]);
      setCourseId("");
      fetchUsers(search, "", "");
      setoffset(1);
      return;
    }

    const selectedBatch = batches.find((b) => b._id === batchId);
    const options = selectedBatch?.courses || [];
    setCourseOptions(options);
    if (courseId && !options.some((c) => c.courseId === courseId)) {
      setCourseId("");
    }

    fetchUsers(search, courseId, batchId);
    setoffset(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, batches]);

  useEffect(() => {
    fetchUsers(search, courseId, batchId);
    setoffset(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);


  const filteredData = performance.filter((row) => {
    const userMatch = users.some((u) => u._id === row.userId);
    const courseMatch = !courseId || row.courseId === courseId;
    const batchMatch = !batchId || row.batchId === batchId;
    const semMatch = !semester || row.semester === semester;

    return userMatch && courseMatch && batchMatch && semMatch;
  });



  // const startIndex = (page - 1) * rowsPerPage;
  // const paginatedData = filteredData.slice(
  //   startIndex,
  //   startIndex + rowsPerPage
  // );

  // const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  const semesterOptions = [
    ...new Set(performance.map((p) => p.semester).filter(Boolean)),
  ];


  let getExcel = async () => {
    try {
      let res = await excelPerformance(courseId, batchId, semester, search, academic);
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
      link.download = "Academicdetails.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.log("Error downloading Excel:", err);
    }
  };
  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.headerBar}>
        <h3>Semester Details</h3>

        <div className={styles.filters}>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </select>

          <select
            value={courseId}
            disabled={!batchId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setoffset(1);
            }}
          >
            <option value="">All Semesters</option>
            {/* {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))} */}
            <option value="sem1">Semester 1</option>
            <option value="sem2">Semester 2</option>
          </select>
          <select
            value={academic}
            onChange={(e) => {
              setAcademic(e.target.value);
              setoffset(1);
            }}
          >
            <option value="">All Terms</option>
            {/* {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))} */}
            <option value="Term1">Term 1</option>
            <option value="Term2">Term 2</option>
            <option value="Semester">Semester</option>
          </select>

          <select
            value={studentStatus}
            onChange={(e) => {
              setStudentStatus(e.target.value);
              setoffset(1);
            }}
          >
            <option value="active">Active Students</option>
            <option value="inactive">Inactive Students</option>
            <option value="all">All Students</option>
          </select>

          <input
            className={styles.search}
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers(e.target.value, courseId, batchId);
              setoffset(1)
            }}
          />

          {(courseId?.toString().trim() || batchId?.toString().trim() || semester?.toString().trim() || academic?.toString().trim()) && (
            <button className={styles.clear} onClick={handlefilterSearch}>
              <IoClose />
            </button>
          )}

          <button className={styles.exportBtn} onClick={getExcel}>
            Export
            <MdOutlineFileDownload />
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Semester</th>
                <th>Academic</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    <Loader />
                  </td>
                </tr>
              ) : totalpages > 0 ? (

                performance.map((row) => (
                  <tr key={row.id}>
                    <td>{row.userDetails.name}</td>
                    <td>{row.userDetails.studentId}</td>
                    <td>{row.exam}</td>
                    <td>{row.Academic}</td>
                    <td>{row.courseDetails.courseName}</td>
                    <td>{row.batchDetails[0]?.batchName}</td>
                    <td>{row.total}</td>
                    <td>{row.average}%</td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => {
                          setViewRecord(row);
                          setViewModal(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))

              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    <div className={styles.emptyState}>
                      <MenuBookOutlinedIcon sx={{ fontSize: 28 }} />
                      <p style={{ margin: 0 }}>No Data Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalpages > 0 && (
        <div className={styles.tableFooter}>
          <p className={styles.showing}>
            Showing {startIndex} – {endIndex} of {totaluser} students
          </p>

          <div className={styles.paginationWrap}>
            <Pagination
              count={totalpages}
              page={offset}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
            />
          </div>
        </div>
      )}
      {viewModal && viewRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleRow}>
                <span className={styles.iconBadge}>
                  <SchoolIcon sx={{ fontSize: 20 }} />
                </span>
                <h3>Semester Details</h3>
              </div>
              <button
                className={`${styles.closeIcon} ${styles.closeIconSquare}`}
                onClick={closeViewModal}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoIconBadge}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </span>
                    <div>
                      <span className={styles.label}>Name</span>
                      <p className={styles.value}>{viewRecord.userDetails.name || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoIconBadge}>
                      <BadgeIcon sx={{ fontSize: 20 }} />
                    </span>
                    <div>
                      <span className={styles.label}>Student ID</span>
                      <p className={styles.value}>{viewRecord.userDetails.studentId || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoIconBadge}>
                      <CalendarMonthIcon sx={{ fontSize: 20 }} />
                    </span>
                    <div>
                      <span className={styles.label}>Semester</span>
                      <p className={styles.value}>{viewRecord.exam || "-"}({viewRecord.Academic})</p>
                    </div>
                  </div>
                </div>

                <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoIconBadge}>
                      <MenuBookIcon sx={{ fontSize: 20 }} />
                    </span>
                    <div>
                      <span className={styles.label}>Course</span>
                      <p className={styles.value}>
                        {viewRecord.courseDetails?.courseName || "-"}
                        {viewRecord.batchDetails?.[0]?.batchName
                          ? ` · ${viewRecord.batchDetails[0].batchName}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MARKS TABLE */}
              <table className={styles.marksTable}>
                <thead>
                  <tr>
                    <th>
                      <span className={styles.thWithIcon}>
                        <MenuBookIcon sx={{ fontSize: 16 }} /> Subject
                      </span>
                    </th>
                    <th>
                      <span className={styles.thWithIcon}>
                        <StarIcon sx={{ fontSize: 16 }} /> Marks
                      </span>
                    </th>
                    <th>
                      <span className={styles.thWithIcon}>
                        <BookmarkIcon sx={{ fontSize: 16 }} /> Status
                      </span>
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRecord.Marks && viewRecord.Marks.length > 0 ? (
                    viewRecord.Marks.map((s, i) => {
                      const outOf = s.totalMarks ?? 100;
                      const status =
                        s.mark === "AA" ? "AA" : s.mark >= outOf * 0.4 ? "P" : "RA";
                      const isEditing = editingMarkIndex === i;
                      return (
                        <tr key={i}>
                          <td>{s.subjectName || "-"}</td>
                          <td>
                            {isEditing ? (
                              <div className={styles.markEditRow}>
                                <input
                                  type="text"
                                  className={styles.markEditInput}
                                  value={editMarkValue}
                                  autoFocus
                                  disabled={savingMark}
                                  onChange={(e) => {
                                    const value = e.target.value.toUpperCase();

                                    if (value === "" || value === "A" || value === "AA") {
                                      setEditMarkValue(value);
                                      return;
                                    }

                                    // Reject any keystroke that would push the value past
                                    // this subject's total marks.
                                    if (/^\d+$/.test(value) && Number(value) <= outOf) {
                                      setEditMarkValue(value);
                                    }
                                  }}
                                />
                                <span className={styles.label}>/ {outOf}</span>
                              </div>
                            ) : s.mark === "AA" ? (
                              "AA"
                            ) : (
                              `${s.mark ?? 0}/${outOf}`
                            )}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                status === "P" ? styles.statusPillAmber : styles.statusPillGreen
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td>
                            {isEditing ? (
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={styles.iconBtn}
                                  aria-label="Save mark"
                                  disabled={savingMark}
                                  onClick={() => saveEditMark(i)}
                                >
                                  <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                                </button>
                                <button
                                  type="button"
                                  className={styles.iconBtn}
                                  aria-label="Cancel"
                                  disabled={savingMark}
                                  onClick={cancelEditMark}
                                >
                                  <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={styles.iconBtn}
                                aria-label={`Edit mark for ${s.subjectName}`}
                                onClick={() => startEditMark(i, s.mark)}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <AssignmentOutlinedIcon sx={{ fontSize: 28 }} />
                          <p style={{ margin: 0 }}>No Subject Marks Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.footerBox}>
                <span className={styles.footerIconBadge}>
                  <PieChartIcon sx={{ fontSize: 18 }} />
                </span>
                <span>
                  Total Marks:{" "}
                  <span className={styles.footerHighlight}>
                    {viewRecord.total || 0}/
                    {(viewRecord.Marks || []).reduce((sum, s) => sum + (s.totalMarks ?? 100), 0)}
                  </span>
                  &nbsp;|&nbsp; Percentage:{" "}
                  <span className={styles.footerHighlight}>{viewRecord.average ?? 0}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sem;
