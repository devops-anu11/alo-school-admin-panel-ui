import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import Pagination from "@mui/material/Pagination";
import {
  getPerformance,
  getCourse,
  getCourseBatchByCourseId,
  getUser,
} from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import { IoClose } from "react-icons/io5";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

const TermExam = () => {
  const [performance, setPerformance] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [term, setTerm] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [loading, setLoading] = useState(true);


  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchCourses();
    fetchPerformance();
    fetchUsers();
  }, []);

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
    const res = await getPerformance();
    const apiData = res?.data?.data?.data || [];

    const formatted = apiData
      .filter(
        (item) =>
          item.Academic &&
          item.Academic.toLowerCase().startsWith("term")
      )
      .map((item) => ({
        id: item._id,
        userId: item.userDetails?._id,
        name: item.userDetails?.name || "-",
        studentId: item.userDetails?.studentId || "-",
        term: item.Academic,

        courseId: item.courseDetails?._id || "",
        courseName: item.courseDetails?.courseName || "-",

        batchId:
          item.batchDetails?.length > 0
            ? item.batchDetails[0]._id
            : "",
        batchName:
          item.batchDetails?.length > 0
            ? item.batchDetails[0].batchName
            : "-",

        total: item.total || 0,
        percentage: item.average ? `${item.average}%` : "0%",
        subjects: item.Marks || [],
      }));

    setPerformance(formatted);
  } catch (err) {
    console.error("Performance fetch failed", err);
  } finally {
    setLoading(false);
  }
};



  const fetchCourses = async () => {
    try {
      const res = await getCourse(100, 0);
      setCourses(res?.data?.data?.data || []);
    } catch (err) {
      console.error("Course fetch error", err);
    }
  };

  useEffect(() => {
    if (!courseId) {
      setBatches([]);
      setBatchId("");
      fetchUsers(search, "", "");
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
    fetchUsers(search, courseId, "");
    setPage(1);
  }, [courseId]);

  useEffect(() => {
    fetchUsers(search, courseId, batchId);
    setPage(1);
  }, [batchId]);

 const filteredData = performance.filter((row) => {
  const userMatch = users.some((u) => u._id === row.userId);

  const courseMatch =
    !courseId || row.courseId === courseId;

  const batchMatch =
    !batchId || row.batchId === batchId;

  const termMatch =
    !term || row.term === term;

  return userMatch && courseMatch && batchMatch && termMatch;
});



  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  const termOptions = [
    ...new Set(performance.map((p) => p.term).filter(Boolean)),
  ];

  const handleClearFilters = () => {
    setCourseId("");
    setBatchId("");
    setTerm("");
    setSearch("");
    setPage(1);
  };

  const termStartIndex = filteredData.length === 0 ? 0 : startIndex + 1;
  const termEndIndex = Math.min(page * rowsPerPage, filteredData.length);

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <h3>Academic / Term Details</h3>

        <div className={styles.filters}>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setBatchId("");
            }}
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
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </select>
<select value={term} onChange={(e) => setTerm(e.target.value)}>
  <option value="">All Terms</option>
  {termOptions.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>


          <input
            className={styles.search}
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers(e.target.value, courseId, batchId);
              setPage(1);
            }}
          />

          {(courseId?.toString().trim() || batchId?.toString().trim() || term?.toString().trim() || search?.toString().trim()) && (
            <button className={styles.clear} onClick={handleClearFilters}>
              <IoClose />
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Term</th>
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
                  <td colSpan="8" className={styles.noData}>
                    <Loader />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    <div className={styles.emptyState}>
                      <MenuBookOutlinedIcon sx={{ fontSize: 28 }} />
                      <p style={{ margin: 0 }}>No Data Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.studentId}</td>
                    <td>{row.term}</td>
                    <td>{row.courseName}</td>
                    <td>{row.batchName}</td>
                    <td>{row.total}</td>
                    <td>{row.percentage}</td>
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
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length > 0 && (
        <div className={styles.tableFooter}>
          <p className={styles.showing}>
            Showing {termStartIndex} – {termEndIndex} of {filteredData.length} students
          </p>

          <div className={styles.paginationWrap}>
            <Pagination
              count={pageCount || 1}
              page={page}
              onChange={(e, value) => setPage(value)}
            />
          </div>
        </div>
      )}


      {viewModal && viewRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Term / Semester Details</h3>
              <button
                className={styles.closeIcon}
                onClick={() => setViewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Name</span>
                  <p className={styles.value}>{viewRecord.name}</p>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.label}>Student ID</span>
                  <p className={styles.value}>{viewRecord.studentId}</p>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.label}>Term / Semester</span>
                  <p className={styles.value}>{viewRecord.term}</p>
                </div>
              </div>

              <table className={styles.marksTable}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Total</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRecord.subjects && viewRecord.subjects.length > 0 ? (
                    viewRecord.subjects.map((s, i) => {
                      const outOf = s.totalMarks ?? 100;
                      const percentage =
                        s.mark === "AA" ? "AA" : ((Number(s.mark) / outOf) * 100).toFixed(1);
                      return (
                        <tr key={i}>
                          <td>{s.subjectName}</td>
                          <td>{s.mark}</td>
                          <td>{outOf}</td>
                          <td>{percentage === "AA" ? "AA" : `${percentage}%`}</td>
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
              <strong>Total Marks:</strong>{" "}
              {viewRecord.total}/
              {(viewRecord.subjects || []).reduce((sum, s) => sum + (s.totalMarks ?? 100), 0)}
              &nbsp; | &nbsp;
              <strong>Percentage:</strong> {viewRecord.percentage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermExam;
