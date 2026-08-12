import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./TaskCourseDetail.module.css";
import {
  getAllCourses,
  getDailyTaskSubjects,
  getGroupedTasksByStudent,
  getUser,
  updateTaskStatus,
} from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import { toast } from "react-toastify";
import { FiArrowLeft, FiX, FiBookOpen, FiUsers } from "react-icons/fi";
import dayjs from "dayjs";

// Course-level drill-down: subjects as tabs, and for the active subject, a
// single table of every roster student with their submission status.
const TaskCourseDetail = () => {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const batchId = searchParams.get("batchId") || "";
  const date = searchParams.get("date") || "";

  const [courseName, setCourseName] = useState("");
  const [roster, setRoster] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submittedMap, setSubmittedMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [viewingStudent, setViewingStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  // "all" | "submitted" | "notSubmitted" - scoped to whichever subject tab
  // is active, reset whenever the subject changes.
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!courseId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, batchId, date]);

  // Default to today only once, on first load - if the user later clears
  // the filter it should stay cleared (all dates), not snap back to today.
  useEffect(() => {
    if (!searchParams.get("date")) {
      const next = new URLSearchParams(searchParams);
      next.set("date", dayjs().format("YYYY-MM-DD"));
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (event) => {
    const next = new URLSearchParams(searchParams);
    if (event.target.value) next.set("date", event.target.value);
    else next.delete("date");
    setSearchParams(next);
  };

  const clearDateFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("date");
    setSearchParams(next);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [coursesRes, rosterRes, subjectsRes, tasksRes] = await Promise.all([
        getAllCourses(),
        getUser(500, 0, "", courseId, "", batchId, "active"),
        getDailyTaskSubjects({ courseId }),
        getGroupedTasksByStudent({ batchId, courseId, date }),
      ]);

      const courses = Array.isArray(coursesRes?.data?.data) ? coursesRes.data.data : [];
      setCourseName(courses.find((c) => c._id === courseId)?.courseName || "Course");

      setRoster(Array.isArray(rosterRes?.data?.data?.data) ? rosterRes.data.data.data : []);

      const subjectList = Array.isArray(subjectsRes?.data?.data) ? subjectsRes.data.data : [];
      setSubjects(subjectList);
      setActiveSubjectId((current) => (current && subjectList.some((s) => s._id === current) ? current : subjectList[0]?._id || ""));

      const users = Array.isArray(tasksRes?.data?.data?.users) ? tasksRes.data.data.users : [];
      setSubmittedMap(new Map(users.map((u) => [u.userId, u])));
    } catch (error) {
      console.error("error", error.response?.data || error);
      setRoster([]);
      setSubjects([]);
      setSubmittedMap(new Map());
    } finally {
      setLoading(false);
    }
  };

  // Subject -> which roster students logged a task under it today, and which didn't.
  const subjectGroups = useMemo(() => {
    return subjects.map((subject) => {
      const submitted = [];
      const notSubmittedIds = new Set(roster.map((s) => s._id));

      roster.forEach((student) => {
        const submission = submittedMap.get(student._id);
        const tasksForSubject = (submission?.tasks || []).filter((t) => t.subject?._id === subject._id);

        if (tasksForSubject.length > 0) {
          submitted.push({ student, tasks: tasksForSubject });
          notSubmittedIds.delete(student._id);
        }
      });

      const notSubmitted = roster.filter((student) => notSubmittedIds.has(student._id));

      return { subject, submitted, notSubmitted };
    });
  }, [subjects, roster, submittedMap]);

  const activeGroup = subjectGroups.find((group) => group.subject._id === activeSubjectId);

  // One row per student for the active subject (not one per task) - each
  // submitted student's full task list is viewed via the popup instead.
  const activeRows = useMemo(() => {
    if (!activeGroup) return [];

    const rows = [
      ...activeGroup.submitted.map(({ student, tasks }) => ({ student, tasks })),
      ...activeGroup.notSubmitted.map((student) => ({ student, tasks: [] })),
    ];

    return rows.sort((a, b) => (a.student.name || "").localeCompare(b.student.name || ""));
  }, [activeGroup]);

  // Selection and the status filter only make sense scoped to the subject
  // currently on screen.
  useEffect(() => {
    setSelectedIds(new Set());
    setStatusFilter("all");
  }, [activeSubjectId]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "submitted") return activeRows.filter((row) => row.tasks.length > 0);
    if (statusFilter === "notSubmitted") return activeRows.filter((row) => row.tasks.length === 0);
    return activeRows;
  }, [activeRows, statusFilter]);

  const selectableRows = filteredRows.filter((row) => row.tasks.length > 0);
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedIds.has(row.student._id));

  const toggleRow = (studentId) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(selectableRows.map((row) => row.student._id)));

  const markSelectedCompleted = async () => {
    const taskIds = selectableRows
      .filter((row) => selectedIds.has(row.student._id))
      .flatMap((row) => row.tasks.map((task) => task._id));

    if (taskIds.length === 0) return;

    try {
      setBulkSaving(true);
      await Promise.all(taskIds.map((taskId) => updateTaskStatus(taskId, "Completed")));

      toast.success(`Marked ${taskIds.length} task${taskIds.length > 1 ? "s" : ""} as completed!`, {
        autoClose: 1000,
        closeButton: false,
      });

      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("error", error.response?.data || error);
      toast.error("Failed to update some tasks.", { autoClose: 1000, closeButton: false });
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div>
          <h2 className={styles.heading}>{courseName}</h2>
          <p className={styles.subheading}>
            Subject-wise task summary · {date ? dayjs(date).format("DD MMM YYYY") : "All Dates"} ·{" "}
            {roster.length} student
            {roster.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : subjectGroups.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <FiBookOpen />
            </span>
            <p className={styles.emptyTitle}>No subjects assigned to this course yet</p>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.tabs}>
            {subjectGroups.map(({ subject, submitted, notSubmitted }) => (
              <button
                key={subject._id}
                className={`${styles.tab} ${subject._id === activeSubjectId ? styles.tabActive : ""}`}
                onClick={() => setActiveSubjectId(subject._id)}
              >
                {subject.name}
                <span className={styles.tabCount}>
                  {submitted.length}/{submitted.length + notSubmitted.length}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.filterBar}>
            <div className={styles.statusFilters}>
              {[
                { key: "all", label: "All", count: activeRows.length },
                {
                  key: "submitted",
                  label: "Submitted",
                  count: activeGroup?.submitted.length || 0,
                },
                {
                  key: "notSubmitted",
                  label: "Not Submitted",
                  count: activeGroup?.notSubmitted.length || 0,
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.statusFilterBtn} ${
                    statusFilter === option.key ? styles.statusFilterBtnActive : ""
                  }`}
                  onClick={() => setStatusFilter(option.key)}
                >
                  {option.label} <span className={styles.statusFilterCount}>{option.count}</span>
                </button>
              ))}
            </div>

            <div className={styles.dateFilterWrap}>
              <input
                type="date"
                className={styles.dateInput}
                value={date}
                max={dayjs().format("YYYY-MM-DD")}
                onChange={handleDateChange}
                aria-label="Filter by date"
              />
              {date && (
                <button
                  type="button"
                  className={styles.dateClearBtn}
                  onClick={clearDateFilter}
                  aria-label="Clear date filter"
                  title="Clear date filter (show all dates)"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className={styles.bulkBar}>
              <span>{selectedIds.size} student{selectedIds.size > 1 ? "s" : ""} selected</span>
              <button className={styles.bulkBtn} onClick={markSelectedCompleted} disabled={bulkSaving}>
                {bulkSaving ? "Updating..." : "Mark as Completed"}
              </button>
            </div>
          )}

          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={selectableRows.length === 0}
                        aria-label="Select all"
                      />
                    </th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Tasks Logged</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map(({ student, tasks }) => (
                      <tr key={student._id}>
                        <td className={styles.checkboxCell}>
                          {tasks.length > 0 && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(student._id)}
                              onChange={() => toggleRow(student._id)}
                              aria-label={`Select ${student.name}`}
                            />
                          )}
                        </td>

                        <td>
                          <p className={styles.studentName}>{student.name}</p>
                          <p className={styles.studentMeta}>{student.studentId}</p>
                        </td>

                        <td>
                          <span className={tasks.length > 0 ? styles.badgeSuccess : styles.badgeDanger}>
                            {tasks.length > 0 ? "Submitted" : "Not Submitted"}
                          </span>
                        </td>

                        <td>{tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}` : "-"}</td>

                        <td>
                          {tasks.length > 0 ? (
                            <button className={styles.viewBtn} onClick={() => setViewingStudent({ student, tasks })}>
                              View
                            </button>
                          ) : (
                            <span className={styles.studentMeta}>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.noData}>
                        <div className={styles.emptyState}>
                          <span className={styles.emptyIcon}>
                            <FiUsers />
                          </span>
                          <p className={styles.emptyTitle}>No students found for this course</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewingStudent && (
        <div className={styles.overlay} onClick={() => setViewingStudent(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalTitle}>{viewingStudent.student.name}</p>
                <p className={styles.modalSubtitle}>
                  {viewingStudent.student.studentId} · {dayjs(date).format("DD MMM YYYY")}
                </p>
              </div>

              <button className={styles.closeBtn} onClick={() => setViewingStudent(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {viewingStudent.tasks.map((task) => (
                <div key={task._id} className={styles.taskCard}>
                  <div className={styles.taskCardHeader}>
                    <p className={styles.taskTitle}>{task.title}</p>
                    <span className={task.status === "Completed" ? styles.badgeSuccess : styles.badgeDanger}>
                      {task.status}
                    </span>
                  </div>

                  <div className={styles.taskMetaGrid}>
                    <div>
                      <span className={styles.taskMetaLabel}>Class Hour</span>
                      <p>{task.hour?.label || "-"}</p>
                    </div>
                    <div>
                      <span className={styles.taskMetaLabel}>Subject</span>
                      <p>{task.subject?.name || "-"}</p>
                    </div>
                    <div>
                      <span className={styles.taskMetaLabel}>Trainer</span>
                      <p>{task.trainer?.name || "-"}</p>
                    </div>
                  </div>

                  {task.notes && (
                    <div className={styles.taskNotes}>
                      <span className={styles.taskMetaLabel}>Update / Notes</span>
                      <p>{task.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCourseDetail;
