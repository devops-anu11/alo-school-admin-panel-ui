import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TaskManagement.module.css";
import { getCourseBatch, getDailyTaskSubjects, getGroupedTasksByStudent, getUser } from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FiChevronDown } from "react-icons/fi";
import { LuUsers, LuFileText } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";

const TaskManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [batchId, setBatchId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [roster, setRoster] = useState([]);
  const [submittedMap, setSubmittedMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [batchesLoading, setBatchesLoading] = useState(true);

  // ---- batches (batch-first filter, defaults to the primary batch) ----
  useEffect(() => {
    fetchBatches();
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getDailyTaskSubjects();
      setSubjects(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };

  const fetchBatches = async () => {
    setBatchesLoading(true);
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list);
      if (!batchId) {
        const primary = list.find((b) => b.isPrimary);
        if (primary) setBatchId(primary._id);
      }
    } catch (error) {
      console.error("error", error.response?.data || error);
    } finally {
      setBatchesLoading(false);
    }
  };

  // Re-derive course options whenever batchId or the batch list changes, and
  // drop courseId if it no longer belongs to the selected batch.
  useEffect(() => {
    if (!batchId) {
      setCourseOptions([]);
      return;
    }
    const selectedBatch = batches.find((b) => b._id === batchId);
    const options = selectedBatch?.courses || [];
    setCourseOptions(options);
    if (courseId && !options.some((c) => c.courseId === courseId)) {
      setCourseId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, batches]);

  // ---- roster + submissions ----
  useEffect(() => {
    if (!batchId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, courseId, subjectId, date]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rosterRes, subsRes] = await Promise.all([
        getUser(500, 0, "", courseId, "", batchId, "active"),
        getGroupedTasksByStudent({
          batchId,
          ...(courseId && { courseId }),
          ...(subjectId && { subjectId }),
          ...(date && { date }),
        }),
      ]);

      setRoster(Array.isArray(rosterRes?.data?.data?.data) ? rosterRes.data.data.data : []);

      const users = Array.isArray(subsRes?.data?.data?.users) ? subsRes.data.data.users : [];
      setSubmittedMap(new Map(users.map((u) => [u.userId, u])));
    } catch (error) {
      console.error("error", error.response?.data || error);
      setRoster([]);
      setSubmittedMap(new Map());
    } finally {
      setLoading(false);
    }
  };

  // Roster rolled up to one row per course - counts only, no student names.
  const courseSummaries = useMemo(() => {
    const groups = new Map();

    roster.forEach((student) => {
      const cId = student.courseDetails?._id || "unknown";
      const cName = student.courseDetails?.courseName || "Unassigned";
      if (!groups.has(cId))
        groups.set(cId, { courseId: cId, courseName: cName, total: 0, submitted: 0, tasksAdded: 0 });

      const entry = groups.get(cId);
      entry.total += 1;

      const submission = submittedMap.get(student._id);
      if (submission) {
        entry.submitted += 1;
        entry.tasksAdded += submission.total || submission.tasks?.length || 0;
      }
    });

    return [...groups.values()]
      .map((entry) => ({ ...entry, notSubmitted: entry.total - entry.submitted }))
      .sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [roster, submittedMap]);

  const viewCourseDetail = (targetCourseId) => {
    if (!targetCourseId || targetCourseId === "unknown") return;

    const params = new URLSearchParams({ batchId, ...(date && { date }) });
    navigate(`/tasks/detail/${targetCourseId}?${params.toString()}`);
  };

  const stats = useMemo(() => {
    const total = roster.length;
    const submitted = submittedMap.size;
    return { total, submitted, notSubmitted: total - submitted };
  }, [roster, submittedMap]);

  const renderSelect = (value, onChange, placeholder, options, disabled) => (
    <div className={styles.selectWrapper}>
      <select
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FiChevronDown className={styles.selectIcon} />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Task Management</h2>
          <p className={styles.subheading}>
            Who submitted their daily task, by course.
            {subjectId && ` Filtered to ${subjects.find((s) => s._id === subjectId)?.name || "a subject"}.`}
          </p>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(newValue) => setDate(newValue ? dayjs(newValue).format("YYYY-MM-DD") : "")}
            format="DD MMM YYYY"
            slotProps={{
              textField: {
                placeholder: "Select date",
                className: styles.datePicker,
                sx: {
                  "& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root": {
                    height: "46px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                  },
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                },
              },
              field: { clearable: true, onClear: () => setDate("") },
            }}
          />
        </LocalizationProvider>
      </div>

      <div className={styles.filterBar}>
        {renderSelect(
          batchId,
          (value) => { setBatchId(value); setCourseId(""); },
          "Select Batch",
          batches.map((b) => ({ value: b._id, label: b.batchName })),
          batchesLoading,
        )}
        {renderSelect(
          courseId,
          setCourseId,
          "All Courses",
          courseOptions.map((c) => ({ value: c.courseId, label: c.courseName })),
          !batchId,
        )}
        {renderSelect(
          subjectId,
          setSubjectId,
          "All Subjects",
          subjects.map((s) => ({ value: s._id, label: s.name })),
        )}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statTotal}`}>
            <LuUsers />
          </div>
          <div>
            <p className={styles.statLabel}>Total Students</p>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statHint}>Current filters</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statCompleted}`}>
            <IoCheckmarkCircle />
          </div>
          <div>
            <p className={styles.statLabel}>Submitted</p>
            <p className={styles.statValue}>{stats.submitted}</p>
            <p className={styles.statHint}>Logged a task today</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statPending}`}>
            <LuFileText />
          </div>
          <div>
            <p className={styles.statLabel}>Not Submitted</p>
            <p className={styles.statValue}>{stats.notSubmitted}</p>
            <p className={styles.statHint}>Need to follow up</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : !batchId ? (
        <div className={styles.tableCard}>
          <p className={styles.noData}>No batches available.</p>
        </div>
      ) : courseSummaries.length === 0 ? (
        <div className={styles.tableCard}>
          <p className={styles.noData}>No students found for this batch.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Total Students</th>
                  <th>Total Tasks Added</th>
                  <th>Submitted</th>
                  <th>Not Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {courseSummaries.map((course) => (
                  <tr key={course.courseId}>
                    <td className={styles.cellPrimary}>{course.courseName}</td>

                    <td>{course.total}</td>

                    <td>{course.tasksAdded}</td>

                    <td>
                      <span className={styles.attPresent}>{course.submitted}</span>
                    </td>

                    <td>
                      <span className={styles.attAbsent}>{course.notSubmitted}</span>
                    </td>

                    <td>
                      <button className={styles.viewBtn} onClick={() => viewCourseDetail(course.courseId)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
