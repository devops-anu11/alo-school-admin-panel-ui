import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import Pagination from '@mui/material/Pagination';
import {
  getPerformance,
  getCourseBatch,
  getUser,
  excelPerformance,
} from "../../api/Serviceapi";
import { IoIosCloseCircle } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

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

  };

  useEffect(() => {
    fetchBatches();
    // fetchPerformance();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [search, courseId, batchId, semester, offset, academic]);

  const fetchUsers = async (value = "", cId = "", bId = "") => {
    try {
      const res = await getUser(100, 0, value, cId, "", bId, "");
      setUsers(res?.data?.data?.data || []);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  const fetchPerformance = async () => {
    try {
      const res = await getPerformance(limit, offset - 1, courseId, batchId, semester, search, academic);
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
            <option value="">All</option>
            {/* {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))} */}
            <option value="Term1">Term 1</option>
            <option value="Term2">Term 2</option>
            <option value="Semester">Semester</option>
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
              <IoIosCloseCircle />
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
              {totalpages > 0 ? (

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
                    No Data Found
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
              <h3>Semester Details</h3>
              <button
                className={styles.closeIcon}
                onClick={() => setViewModal(false)}
              >
                ✕
              </button>
            </div>


            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <span className={styles.label}>Name</span>
                <p className={styles.value}>{viewRecord.userDetails.name || "-"}</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.label}>Student ID</span>
                <p className={styles.value}>{viewRecord.userDetails.studentId || "-"}</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.label}>Semester</span>
                <p className={styles.value}>{viewRecord.exam || "-"}({viewRecord.Academic})</p>
              </div>
            </div>

            {/* MARKS TABLE */}
            <table className={styles.marksTable}>
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Status</th>
                  {/* <th>Total</th> */}
                  {/* <th>Percentage</th> */}
                </tr>
              </thead>
              <tbody>
                {viewRecord.Marks && viewRecord.Marks.length > 0 ? (
                  viewRecord.Marks.map((s, i) => (
                    <tr key={i}>
                      <td>{s.subjectCode}</td>
                      <td>{s.subjectName || "-"}</td>
                      <td>{s.mark ?? 0}</td>
                      <td> {s.mark === "AA"
                        ? "AA"
                        : s.mark >= 40
                          ? "P"
                          : "RA"}
                      </td>
                      {/* <td>100</td> */}
                      {/* <td>{s.mark ? `${s.mark}%` : "0%"}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.noData}>
                      No Subject Marks Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.modalFooter}>
              <strong>Total Marks:</strong> {viewRecord.total || 0} &nbsp; | &nbsp;
              <strong>Percentage:</strong> {`${viewRecord.average}% ` || "0%"}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sem;
