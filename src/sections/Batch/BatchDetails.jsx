import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Modal from "react-modal";
import styles from "./BatchDetails.module.css";
import CreateBatchModal from "./CreateBatchModal";
import Addstudent from "../Addstudent/Addstudent";
import { getUser, getBatchById } from "../../api/Serviceapi";
import {
  ArrowLeftIcon,
  CapIcon,
  CalendarIcon,
  ClockIcon,
  BookIcon,
  UsersIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../components/icons/Icons";

const PAGE_SIZE = 5;

const formatDate = (date, opts) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(
    "en-GB",
    opts || { day: "2-digit", month: "short", year: "numeric" },
  );
};

const formatShortDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
};

const formatMoney = (n) => Number(n).toLocaleString("en-IN");

const BatchDetailsView = ({ batch, courses, onBack, onEdit, onSaveBatch }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Student's own active/inactive status - independent of the batch's own
  // active/inactive status shown in the hero card.
  const [studentStatus, setStudentStatus] = useState("active");

  const courseName = (id) =>
    courses.find((c) => c.id === id)?.courseName || "Unknown course";

  // Per-course student counts (and the totals derived from them) come from
  // the server pre-computed for whichever status is selected — courseId,
  // sem1Amount, sem2Amount etc. don't change with status, only studentCount
  // does, so we fetch a status-scoped batch below and use its courses here.
  const [statusBatch, setStatusBatch] = useState(null);
  const rows = statusBatch?.courses ?? batch.courses ?? [];

  // Admission fee is a one-time, per-student charge, not a per-course one —
  // keep it out of each course row's total and report it on its own.
  const admissionFee = Number(batch.admissionFee) || 0;
  const courseRowTotal = (c) => Number(c.sem1Amount || 0) + Number(c.sem2Amount || 0);
  const totalCourseFees = rows.reduce((sum, c) => sum + courseRowTotal(c), 0);
  // Real expected revenue: each course's price × how many students are
  // actually enrolled in it (not the price list, not the whole-batch count).
  const totalCourseRevenue = rows.reduce(
    (sum, c) => sum + courseRowTotal(c) * (c.studentCount || 0),
    0,
  );

  useEffect(() => {
    let cancelled = false;
    getBatchById(batch.id, studentStatus)
      .then((res) => {
        if (!cancelled) setStatusBatch(res?.data?.data || null);
      })
      .catch((error) => {
        console.error("Failed to fetch batch status details:", error.response?.data || error);
        if (!cancelled) setStatusBatch(null);
      });
    return () => {
      cancelled = true;
    };
    // `batch` (not just batch.id) so saving new course fees/admission fee
    // re-fetches the status-scoped totals instead of leaving stale numbers
    // on screen until the status dropdown is touched.
  }, [batch, studentStatus]);

  const isActive = batch.active !== false;

  const durationLabel = useMemo(() => {
    const ms = new Date(batch.endDate) - new Date(batch.startDate);
    const months = Math.max(1, Math.round(ms / (30.44 * 24 * 3600 * 1000)));
    if (months >= 12) {
      const years = Math.round(months / 12);
      return `${years} ${years === 1 ? "Year" : "Years"}`;
    }
    return `${months} ${months === 1 ? "Month" : "Months"}`;
  }, [batch.startDate, batch.endDate]);

  // Real students enrolled in this batch, fetched from the server - one
  // page at a time, search included, rather than the generated placeholder
  // roster this view used to render.
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // Admission fee total tracks whichever student status is currently
  // selected, so it always matches the "Students" count and the table below.
  const totalAdmissionFees = totalCount * admissionFee;

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await getUser(
        PAGE_SIZE,
        safePage - 1,
        search,
        "",
        "",
        batch.id,
        studentStatus,
      );
      setStudents(Array.isArray(res?.data?.data?.data) ? res.data.data.data : []);
      setTotalCount(res?.data?.data?.totalCount || 0);
    } catch (error) {
      console.error("error", error.response?.data || error);
      setStudents([]);
      setTotalCount(0);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.id, search, studentStatus, safePage]);

  const pageRows = students;
  const showingFrom = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, totalCount);

  const removeCourse = (courseId) => {
    onSaveBatch({
      ...batch,
      courses: rows.filter((c) => c.courseId !== courseId),
    });
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowLeftIcon width={18} height={18} />
        Back to Batch List
      </button>

      {/* --- Page head --- */}
      <div className={styles.headRow}>
        <div>
          <h2 className={styles.title}>Batch Details</h2>
          <p className={styles.subtitle}>View and manage batch information</p>
        </div>
        <div className={styles.headActions}>
          <select
            className={styles.filterSelect}
            aria-label="Filter students list by status"
            value={studentStatus}
            onChange={(e) => {
              setStudentStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Active Students</option>
            <option value="inactive">Inactive Students</option>
          </select>
          <button type="button" className={styles.outlineBtn} onClick={onEdit}>
            <EditIcon width={16} height={16} />
            Edit Batch
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setAddStudentOpen(true)}
          >
            <PlusIcon width={16} height={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* --- Summary row --- */}
      <div className={styles.summaryGrid}>
        <article className={`${styles.card} ${styles.hero}`}>
          <span className={styles.heroIcon}>
            <CapIcon width={30} height={30} />
          </span>
          <div className={styles.heroBody}>
            <div className={styles.heroTitle}>
              <h3>{batch.batchName}</h3>
              <span
                className={`${styles.status} ${
                  isActive ? styles.active : styles.done
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <ul className={styles.heroMeta}>
              <li>
                <CalendarIcon width={15} height={15} />
                {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
              </li>
              <li>
                <ClockIcon width={15} height={15} />
                {batch.classStartIn} – {batch.classEndIn}
              </li>
              <li>
                <BookIcon width={15} height={15} />
                Semester 1 &amp; Semester 2
              </li>
            </ul>
          </div>
        </article>

        <article className={styles.card}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}>
            <UsersIcon width={20} height={20} />
          </span>
          <small>Students</small>
          <strong>{totalCount}</strong>
          <span className={styles.statFoot}>
            {studentStatus === "active" ? "Total Active Students" : "Total Inactive Students"}
          </span>
        </article>

        <article className={styles.card}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}>
            <BookIcon width={20} height={20} />
          </span>
          <small>Courses</small>
          <strong>{rows.length}</strong>
          <span className={styles.statFoot}>Total Courses</span>
        </article>

        <article className={styles.card}>
          <span className={`${styles.statIcon} ${styles.tonePurple}`}>
            <span className={styles.rupee}>₹</span>
          </span>
          <small>Overall Total Amount</small>
          <strong>₹ {formatMoney(totalCourseRevenue)}</strong>
          <span className={styles.statFoot}>
            {studentStatus === "active" ? "Active" : "Inactive"} students per course × course fee
          </span>
        </article>

        <article className={styles.card}>
          <span className={`${styles.statIcon} ${styles.toneOrange}`}>
            <span className={styles.rupee}>₹</span>
          </span>
          <small>Total Admission Fee</small>
          <strong>₹ {formatMoney(totalAdmissionFees)}</strong>
          <span className={styles.statFoot}>
            {totalCount} students × ₹{formatMoney(admissionFee)}
          </span>
        </article>

        <article className={styles.card}>
          <span className={`${styles.statIcon} ${styles.toneRed}`}>
            <CalendarIcon width={20} height={20} />
          </span>
          <small>Batch Duration</small>
          <strong>{durationLabel}</strong>
          <span className={styles.statFoot}>Duration</span>
        </article>
      </div>

      {/* --- Course list --- */}
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h3>Course List</h3>
          <button type="button" className={styles.outlineBtn} onClick={onEdit}>
            <PlusIcon width={15} height={15} />
            Add Course
          </button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Course Name</th>
                <th>Students</th>
                <th>Semester 1 Amount (₹)</th>
                <th>Semester 2 Amount (₹)</th>
                <th>Total (₹)</th>
                <th className={styles.actionsCol}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.courseId}>
                  <td>{i + 1}</td>
                  <td className={styles.strongCell}>
                    {courseName(c.courseId)}
                  </td>
                  <td>{c.studentCount ?? 0}</td>
                  <td>{formatMoney(c.sem1Amount)}</td>
                  <td>{formatMoney(c.sem2Amount)}</td>
                  <td className={styles.strongCell}>
                    {formatMoney(courseRowTotal(c))}
                  </td>
                  <td className={styles.actionsCol}>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={`View subjects for ${courseName(c.courseId)}`}
                        title="View Subjects"
                        onClick={() =>
                          navigate(`/course/Subjects/${c.courseId}/${batch.id}`)
                        }
                      >
                        <BookIcon width={15} height={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={`Edit ${courseName(c.courseId)}`}
                        onClick={onEdit}
                      >
                        <EditIcon width={15} height={15} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        aria-label={`Remove ${courseName(c.courseId)}`}
                        onClick={() => removeCourse(c.courseId)}
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className={styles.totalLabel}>
                  Total Course Fees (price list):
                </td>
                <td colSpan={2} className={styles.totalValue}>
                  ₹ {formatMoney(totalCourseFees)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* --- Students list --- */}
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h3>
            {studentStatus === "active" ? "Active" : "Inactive"} Students List (
            {totalCount})
          </h3>
          <div className={styles.search}>
            <SearchIcon width={16} height={16} />
            <input
              type="search"
              placeholder="Search students..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </header>

        {pageRows.length === 0 ? (
          <p className={styles.noStudents}>
            {studentsLoading
              ? "Loading students..."
              : totalCount === 0
                ? `No ${studentStatus} students in this batch.`
                : "No students match your search."}
          </p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th className={styles.actionsCol}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s, index) => (
                  <tr key={s._id}>
                    <td>{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                    <td className={styles.strongCell}>{s.name}</td>
                    <td>{s.studentId}</td>
                    <td>{s.email}</td>
                    <td>{s.mobileNo}</td>
                    <td>{formatShortDate(batch.startDate)}</td>
                    <td className={styles.actionsCol}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={`View ${s.name}`}
                        onClick={() => navigate(`/students/studentview/${s._id}`)}
                      >
                        <EyeIcon width={15} height={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className={styles.panelFoot}>
          <span>
            Showing {showingFrom} to {showingTo} of {totalCount} students
          </span>
          <div className={styles.pager}>
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeftIcon width={15} height={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={safePage === i + 1 ? styles.pageActive : ""}
                aria-current={safePage === i + 1 ? "page" : undefined}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRightIcon width={15} height={15} />
            </button>
          </div>
        </footer>
      </section>

      <Modal
        isOpen={addStudentOpen}
        onRequestClose={() => setAddStudentOpen(false)}
        contentLabel="Add Student"
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgb(21 21 21 / 81%)",
            zIndex: 1000,
          },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "800px",
            height: "600px",
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 1001,
          },
        }}
      >
        <Addstudent
          closeModal={() => setAddStudentOpen(false)}
          onStudentAdded={fetchStudents}
        />
      </Modal>
    </div>
  );
};

const BatchDetails = ({ batches, courses, loading, onSaveBatch }) => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const batch = batches.find((b) => b.id === batchId);

  // Batches load asynchronously now; don't bounce a valid deep link back to
  // the list just because the fetch hasn't resolved yet.
  if (!batch) return loading ? null : <Navigate to="/batch" replace />;

  return (
    <>
      <BatchDetailsView
        batch={batch}
        courses={courses}
        onBack={() => navigate("/batch")}
        onEdit={() => setEditOpen(true)}
        onSaveBatch={onSaveBatch}
      />
      <CreateBatchModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={onSaveBatch}
        courses={courses}
        batchData={batch}
      />
    </>
  );
};

export default BatchDetails;
