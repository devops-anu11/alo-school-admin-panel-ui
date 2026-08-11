import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TaskSettings.module.css";
import {
  getAllCourses,
  getDailyTaskHours,
  updateDailyTaskHour,
  getDailyTaskSubjects,
  createDailyTaskSubject,
  updateDailyTaskSubject,
  deleteDailyTaskSubject,
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";
import { LuClock3, LuBookOpen, LuUserRound } from "react-icons/lu";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/* The API keeps one label per slot - "10:15 - 11:00 AM" - with a single
   meridiem at the end, taken from the end time. Match that exactly. */
const buildSlotLabel = (start, end) =>
  `${dayjs(start).format("h:mm")} - ${dayjs(end).format("h:mm A")}`;

const parseSlotLabel = (label) => {
  const [rawStart = "", rawEnd = ""] = String(label || "")
    .split("-")
    .map((part) => part.trim());

  const end = dayjs(rawEnd, ["h:mm A", "hh:mm A", "h:mm"]);
  const meridiem = /pm/i.test(rawEnd) ? "PM" : "AM";

  let start = /[ap]m/i.test(rawStart)
    ? dayjs(rawStart, ["h:mm A", "hh:mm A"])
    : dayjs(`${rawStart} ${meridiem}`, ["h:mm A", "hh:mm A"]);

  /* Slots can straddle noon ("11:45 - 12:30 PM"), where the start is really AM. */
  if (start.isValid() && end.isValid() && !start.isBefore(end)) {
    start = start.subtract(12, "hour");
  }

  return {
    startTime: start.isValid() ? start : null,
    endTime: end.isValid() ? end : null,
  };
};

/* Each tab is the same table + modal, driven entirely by this config. */
const TABS = [
  {
    key: "time",
    label: "Time",
    icon: <LuClock3 />,
    title: "Hour Slots",
    hint: "Daily hour slots a task can be scheduled into.",
    /* Slots are a fixed set - edit the timings only, no add or delete. */
    canAdd: false,
    canDelete: false,
    columns: [{ key: "label", label: "Hour Slot", primary: true }],
    fields: [
      { key: "startTime", label: "Start Time", type: "time", required: true },
      { key: "endTime", label: "End Time", type: "time", required: true },
    ],
    serialize: (form) => ({
      label: buildSlotLabel(form.startTime, form.endTime),
    }),
    deserialize: (row) => parseSlotLabel(row.label),
    seed: [
      { _id: "time-1", label: "10:15 - 11:00 AM" },
      { _id: "time-2", label: "11:00 - 11:45 AM" },
      { _id: "time-3", label: "11:45 - 12:30 PM" },
    ],
    api: {
      list: getDailyTaskHours,
      update: updateDailyTaskHour,
      normalize: (item) => ({
        _id: item._id,
        label: item.label || "",
      }),
    },
  },
  {
    key: "subject",
    label: "Subject",
    icon: <LuBookOpen />,
    title: "Subjects",
    hint: "Subjects a task can be created against.",
    addLabel: "Add Subject",
    // When adding (not editing), the Subject Name field becomes a dynamic
    // list so several subjects can be created at once, all sharing the same
    // Course/Semester selection.
    multiAddKey: "label",
    columns: [
      { key: "label", label: "Subject Name", primary: true },
      { key: "courseNames", label: "Courses" },
      { key: "semesterNames", label: "Semesters" },
    ],
    fields: [
      { key: "label", label: "Subject Name", type: "text", required: true },
      { key: "totalMarks", label: "Total Marks", type: "number", required: true },
      { key: "courseIds", label: "Course", type: "single-dropdown", required: true },
      {
        key: "semesters",
        label: "Semester",
        type: "radio",
        required: true,
        options: [
          { value: "1", label: "Semester 1" },
          { value: "2", label: "Semester 2" },
        ],
      },
    ],
    serialize: (form) => ({
      name: form.label,
      courseIds: form.courseIds || [],
      semesters: form.semesters || [],
      totalMarks: Number(form.totalMarks) || 100,
    }),
    deserialize: (row) => ({
      label: row.label,
      courseIds: row.courseIds || [],
      semesters: row.semesters || [],
      totalMarks: row.totalMarks ?? 100,
    }),
    seed: [
      { _id: "subject-1", label: "Graphic Design", courseIds: [], courseNames: "", semesters: [], semesterNames: "", totalMarks: 100 },
      { _id: "subject-2", label: "Web Development", courseIds: [], courseNames: "", semesters: [], semesterNames: "", totalMarks: 100 },
      { _id: "subject-3", label: "Branding", courseIds: [], courseNames: "", semesters: [], semesterNames: "", totalMarks: 100 },
    ],
    api: {
      list: getDailyTaskSubjects,
      create: createDailyTaskSubject,
      update: updateDailyTaskSubject,
      remove: deleteDailyTaskSubject,
      normalize: (item) => {
        const assigned = Array.isArray(item.courseIds) ? item.courseIds : [];
        const semesters = Array.isArray(item.semesters) ? item.semesters : [];
        return {
          _id: item._id,
          label: item.name || item.label || item.subject || item.title || "",
          courseIds: assigned.map((c) => (typeof c === "string" ? c : c._id)),
          courseNames:
            assigned.map((c) => (typeof c === "string" ? c : c.courseName)).filter(Boolean).join(", ") ||
            "Not assigned",
          semesters,
          semesterNames: semesters.map((s) => `Sem ${s}`).join(", ") || "Not assigned",
          totalMarks: item.totalMarks ?? 100,
        };
      },
    },
  },
  {
    key: "mentor",
    label: "Mentor",
    icon: <LuUserRound />,
    title: "Mentors",
    hint: "Mentors allowed to assign and review tasks.",
    addLabel: "Add Mentor",
    columns: [
      { key: "name", label: "Mentor", primary: true },
      { key: "email", label: "Email" },
    ],
    fields: [
      { key: "name", label: "Mentor Name", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
    ],
    seed: [
      { _id: "mentor-1", name: "Rahul Kumar", email: "rahul@aloschool.in" },
      { _id: "mentor-2", name: "Sneha Pillai", email: "sneha@aloschool.in" },
      { _id: "mentor-3", name: "Arun M", email: "arun@aloschool.in" },
    ],
    api: {
      list: getTrainers,
      create: createTrainer,
      update: updateTrainer,
      remove: deleteTrainer,
      normalize: (item) => ({
        _id: item._id || item.id,
        name: item.name || "",
        email: item.email || "",
      }),
    },
  },
];

const isMultiValueField = (field) =>
  field.type === "multiselect" || field.type === "single-dropdown" || field.type === "radio";

const emptyForm = (tab) =>
  tab.fields.reduce((acc, field) => {
    let initial = "";
    if (field.type === "time") initial = null;
    if (isMultiValueField(field)) initial = [];
    return { ...acc, [field.key]: initial };
  }, {});

const TaskSettings = () => {
  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getAllCourses()
      .then((res) => setCourses(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch((error) => console.error("error", error.response?.data || error));
  }, []);
  /* tabs whose endpoint failed - they show seed rows and skip write calls */
  const [sampleTabs, setSampleTabs] = useState({});
  /* a tab has no count badge until its endpoint has answered once */
  const [loadedTabs, setLoadedTabs] = useState({});
  const requestRef = useRef(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  // Only used when adding on a multiAddKey tab — several names (each with
  // its own total marks) sharing the rest of `form` (e.g. Course/Semester).
  const emptyMultiRow = { name: "", totalMarks: "100" };
  const [multiValues, setMultiValues] = useState([emptyMultiRow]);

  const activeTab = useMemo(
    () => TABS.find((tab) => tab.key === activeKey),
    [activeKey],
  );

  /* Each tab loads its own endpoint when it becomes active. */
  useEffect(() => {
    fetchTab(activeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  /* Responses come back as an array, {data: []} or {data: {data: []}}. */
  const readList = (response) => {
    const body = response?.data;
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.data?.data)) return body.data.data;
    return [];
  };

  const fetchTab = async (key) => {
    const tab = TABS.find((item) => item.key === key);
    if (!tab) return;

    /* Switching tabs quickly can land responses out of order - only the
       newest request is allowed to clear the spinner. */
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);

    try {
      const response = await tab.api.list();

      setRows((current) => ({
        ...current,
        [key]: readList(response).map(tab.api.normalize),
      }));
      setSampleTabs((current) => ({ ...current, [key]: false }));
    } catch (error) {
      console.log(error);

      setRows((current) => ({ ...current, [key]: tab.seed }));
      setSampleTabs((current) => ({ ...current, [key]: true }));
    } finally {
      setLoadedTabs((current) => ({ ...current, [key]: true }));

      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const currentRows = rows[activeKey] || [];
  const usingSample = Boolean(sampleTabs[activeKey]);

  // Subjects grouped Course -> Semester, for the accordion view on that tab.
  const [expandedCourses, setExpandedCourses] = useState({});
  const toggleCourse = (courseId) =>
    setExpandedCourses((current) => ({ ...current, [courseId]: current[courseId] !== true }));

  const subjectGroups = useMemo(() => {
    if (activeKey !== "subject") return [];

    const courseMap = new Map();

    (rows.subject || []).forEach((row) => {
      const courseIds = row.courseIds && row.courseIds.length ? row.courseIds : ["__unassigned__"];
      const semesters = row.semesters && row.semesters.length ? row.semesters : ["__unassigned__"];

      courseIds.forEach((courseId) => {
        if (!courseMap.has(courseId)) {
          const courseName =
            courseId === "__unassigned__"
              ? "Unassigned"
              : courses.find((c) => c._id === courseId)?.courseName || "Unknown Course";
          courseMap.set(courseId, { courseId, courseName, semesterMap: new Map() });
        }

        const courseEntry = courseMap.get(courseId);

        semesters.forEach((sem) => {
          if (!courseEntry.semesterMap.has(sem)) courseEntry.semesterMap.set(sem, []);
          courseEntry.semesterMap.get(sem).push(row);
        });
      });
    });

    return Array.from(courseMap.values())
      .sort((a, b) => a.courseName.localeCompare(b.courseName))
      .map((course) => {
        const semesters = Array.from(course.semesterMap.entries())
          .sort(([a], [b]) => String(a).localeCompare(String(b)))
          .map(([sem, subjects]) => ({ sem, subjects }));

        const subjectCount = new Set(semesters.flatMap((group) => group.subjects.map((s) => s._id))).size;

        return { ...course, semesters, subjectCount };
      });
  }, [activeKey, rows.subject, courses]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(activeTab));
    setMultiValues([emptyMultiRow]);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(
      activeTab.deserialize
        ? activeTab.deserialize(row)
        : activeTab.fields.reduce(
            (acc, field) => ({ ...acc, [field.key]: row[field.key] ?? "" }),
            {},
          ),
    );
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setMultiValues([emptyMultiRow]);
  };

  const isMultiAddMode = Boolean(activeTab.multiAddKey && !editing);
  const updateMultiValue = (index, field, value) =>
    setMultiValues((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  const addMultiRow = () => setMultiValues((current) => [...current, { ...emptyMultiRow }]);
  const removeMultiRow = (index) =>
    setMultiValues((current) =>
      current.length === 1 ? [{ ...emptyMultiRow }] : current.filter((_, i) => i !== index),
    );

  const validate = () => {
    const nextErrors = {};

    if (isMultiAddMode) {
      if (multiValues.every((row) => !row.name.trim())) {
        nextErrors[activeTab.multiAddKey] = "Enter at least one name";
      } else if (
        multiValues.some(
          (row) => row.name.trim() && (!Number(row.totalMarks) || Number(row.totalMarks) <= 0),
        )
      ) {
        nextErrors[activeTab.multiAddKey] = "Enter a valid total marks (greater than 0) for each subject";
      }
    }

    activeTab.fields.forEach((field) => {
      // In multi-add mode the name + total marks are the dynamic row list,
      // validated above instead.
      if (isMultiAddMode && (field.key === activeTab.multiAddKey || field.key === "totalMarks")) return;

      const raw = form[field.key];

      if (field.type === "time") {
        if (field.required && (!raw || !dayjs(raw).isValid())) {
          nextErrors[field.key] = `${field.label} is required`;
        }
        return;
      }

      if (isMultiValueField(field)) {
        if (field.required && (!Array.isArray(raw) || raw.length === 0)) {
          nextErrors[field.key] = `Select at least one ${field.label.toLowerCase()}`;
        }
        return;
      }

      const value = String(raw ?? "").trim();

      if (field.required && !value) {
        nextErrors[field.key] = `${field.label} is required`;
        return;
      }

      if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
        nextErrors[field.key] = "Enter a valid email";
      }
    });

    /* Only for tabs that actually have both pickers - dayjs(undefined) is
       "now" and would otherwise fail this check on every other tab. */
    if (
      form.startTime &&
      form.endTime &&
      dayjs(form.startTime).isValid() &&
      dayjs(form.endTime).isValid() &&
      !dayjs(form.endTime).isAfter(dayjs(form.startTime))
    ) {
      nextErrors.endTime = "End time must be after start time";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const setLocalRows = (updater) =>
    setRows((current) => ({
      ...current,
      [activeKey]: updater(current[activeKey] || []),
    }));

  const saveRow = (id, payload) =>
    id ? activeTab.api.update(id, payload) : activeTab.api.create(payload);

  const removeRow = (id) => activeTab.api.remove(id);

  const handleSave = async () => {
    if (!validate()) return;

    /* Adding several subjects at once — one create call per name (each with
       its own total marks), all sharing the rest of the form (e.g.
       Course/Semester). */
    if (isMultiAddMode) {
      const seenNames = new Set();
      const uniqueRows = multiValues.filter((row) => {
        const name = row.name.trim();
        if (!name || seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      });
      const payloads = uniqueRows.map((row) =>
        activeTab.serialize
          ? activeTab.serialize({
              ...form,
              [activeTab.multiAddKey]: row.name.trim(),
              totalMarks: row.totalMarks,
            })
          : { ...form, [activeTab.multiAddKey]: row.name.trim(), totalMarks: row.totalMarks },
      );

      if (usingSample) {
        setLocalRows((list) => [
          ...list,
          ...payloads.map((payload, i) => ({ ...payload, _id: `${activeKey}-${Date.now()}-${i}` })),
        ]);
        closeModal();
        return;
      }

      try {
        setSaving(true);
        await Promise.all(payloads.map((payload) => activeTab.api.create(payload)));

        toast.success(`${payloads.length} subject${payloads.length > 1 ? "s" : ""} added successfully!`, {
          autoClose: 1000,
          closeButton: false,
        });

        closeModal();
        fetchTab(activeKey);
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to add subjects.", {
          autoClose: 1000,
          closeButton: false,
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    const payload = activeTab.serialize
      ? activeTab.serialize(form)
      : { ...form };

    /* Endpoint unavailable - keep the change local so the tab stays usable. */
    if (usingSample) {
      setLocalRows((list) =>
        editing
          ? list.map((item) =>
              item._id === editing._id ? { ...item, ...payload } : item,
            )
          : [...list, { ...payload, _id: `${activeKey}-${Date.now()}` }],
      );

      closeModal();
      return;
    }

    try {
      setSaving(true);

      await saveRow(editing?._id, payload);

      toast.success(`${activeTab.label} saved successfully!`, {
        autoClose: 1000,
        closeButton: false,
      });

      closeModal();
      fetchTab(activeKey);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to save setting.", {
        autoClose: 1000,
        closeButton: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const cancelDelete = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    const row = deleteTarget;
    if (!row) return;

    setDeleteTarget(null);

    const previous = currentRows;

    setLocalRows((list) => list.filter((item) => item._id !== row._id));

    if (usingSample) return;

    try {
      await removeRow(row._id);

      toast.success("Setting deleted successfully!", {
        autoClose: 1000,
        closeButton: false,
      });
    } catch (error) {
      console.log(error);

      setLocalRows(() => previous);

      toast.error(
        error?.response?.data?.message || "Failed to delete setting.",
        {
          autoClose: 1000,
          closeButton: false,
        },
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.heading}>Task Settings</h2>

        <p className={styles.subheading}>
          Configure the hour slots, subjects and mentors used when tasks are
          created.
          {usingSample &&
            ` (${activeTab.label} tab is showing sample data - endpoint unavailable)`}
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${
              tab.key === activeKey ? styles.tabActive : ""
            }`}
            onClick={() => setActiveKey(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
            {loadedTabs[tab.key] && (
              <span className={styles.tabCount}>
                {(rows[tab.key] || []).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelTitle}>{activeTab.title}</p>
              <p className={styles.panelHint}>{activeTab.hint}</p>
            </div>

            {activeTab.canAdd !== false && (
              <button className={styles.addBtn} onClick={openAdd}>
                <FiPlus />
                {activeTab.addLabel}
              </button>
            )}
          </div>

          {activeTab.key === "subject" ? (
            <div className={styles.accordionWrap}>
              {subjectGroups.length > 0 ? (
                subjectGroups.map((course) => {
                  const isOpen = expandedCourses[course.courseId] === true;

                  return (
                    <div key={course.courseId} className={styles.accordionGroup}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => toggleCourse(course.courseId)}
                      >
                        <span className={styles.accordionHeaderLeft}>
                          <FiChevronDown
                            className={`${styles.accordionChevron} ${
                              isOpen ? styles.accordionChevronOpen : ""
                            }`}
                          />
                          <span className={styles.accordionTitle}>{course.courseName}</span>
                        </span>

                        <span className={styles.tabCount}>{course.subjectCount}</span>
                      </button>

                      {isOpen && (
                        <div className={styles.accordionBody}>
                          {course.semesters.map((semGroup) => (
                            <div key={semGroup.sem} className={styles.semesterGroup}>
                              <p className={styles.semesterLabel}>
                                {semGroup.sem === "__unassigned__"
                                  ? "Unassigned Semester"
                                  : `Semester ${semGroup.sem}`}
                              </p>

                              {semGroup.subjects.map((row) => (
                                <div key={row._id} className={styles.subjectRow}>
                                  <span className={styles.subjectName}>
                                    {row.label}
                                    <span className={styles.subjectMarks}>
                                      {row.totalMarks ?? 100} marks
                                    </span>
                                  </span>

                                  <div className={styles.rowActions}>
                                    <button
                                      className={styles.iconBtn}
                                      onClick={() => openEdit(row)}
                                      aria-label="Edit"
                                    >
                                      <FiEdit2 />
                                    </button>

                                    <button
                                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                      onClick={() => handleDelete(row)}
                                      aria-label="Delete"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>{activeTab.icon}</span>
                  <p className={styles.emptyTitle}>No Subject Settings Found</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {activeTab.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((row) => (
                      <tr key={row._id}>
                        {activeTab.columns.map((column) => (
                          <td key={column.key}>
                            <span
                              className={
                                column.primary
                                  ? styles.cellPrimary
                                  : row[column.key]
                                    ? ""
                                    : styles.cellMuted
                              }
                            >
                              {row[column.key] === 0
                                ? 0
                                : row[column.key] || "-"}
                            </span>
                          </td>
                        ))}

                        <td>
                          <div className={styles.rowActions}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => openEdit(row)}
                              aria-label="Edit"
                            >
                              <FiEdit2 />
                            </button>

                            {activeTab.canDelete !== false && (
                              <button
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDelete(row)}
                                aria-label="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeTab.columns.length + 1}
                        className={styles.noData}
                      >
                        <div className={styles.emptyState}>
                          <span className={styles.emptyIcon}>{activeTab.icon}</span>
                          <p className={styles.emptyTitle}>
                            No {activeTab.label} Settings Found
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>
                {editing ? "Edit" : "Add"} {activeTab.label}
              </p>

              <button
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className={styles.modalBody}>
              {isMultiAddMode && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Subject Names<span className={styles.required}> *</span>
                  </label>

                  <div className={styles.multiNameList}>
                    {multiValues.map((row, index) => (
                      <div key={index} className={styles.multiNameRow}>
                        <input
                          className={styles.input}
                          type="text"
                          autoComplete="off"
                          placeholder={`Subject ${index + 1} name`}
                          value={row.name}
                          onChange={(event) => updateMultiValue(index, "name", event.target.value)}
                        />
                        <input
                          className={`${styles.input} ${styles.multiMarksInput}`}
                          type="number"
                          min="1"
                          autoComplete="off"
                          placeholder="Marks"
                          title="Total marks"
                          value={row.totalMarks}
                          onChange={(event) => updateMultiValue(index, "totalMarks", event.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label="Remove"
                          onClick={() => removeMultiRow(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="button" className={styles.addAnotherBtn} onClick={addMultiRow}>
                    <FiPlus /> Add Another Subject
                  </button>

                  {errors[activeTab.multiAddKey] && (
                    <span className={styles.errorText}>{errors[activeTab.multiAddKey]}</span>
                  )}
                </div>
              )}

              {activeTab.fields
                .filter(
                  (field) =>
                    !(isMultiAddMode && (field.key === activeTab.multiAddKey || field.key === "totalMarks")),
                )
                .map((field) => (
                <div
                  key={field.key}
                  className={`${styles.field} ${
                    field.type === "time" ? styles.fieldHalf : ""
                  }`}
                >
                  <label className={styles.label} htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className={styles.required}> *</span>}
                  </label>

                  {field.type === "time" ? (
                    <TimePicker
                      value={form[field.key] || null}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: value,
                        }))
                      }
                      ampm
                      format="h:mm A"
                      minutesStep={5}
                      slotProps={{
                        textField: {
                          id: field.key,
                          fullWidth: true,
                          error: Boolean(errors[field.key]),
                          sx: {
                            "& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root":
                              {
                                height: "44px",
                                borderRadius: "10px",
                                fontFamily: "inherit",
                                fontSize: "14px",
                              },
                          },
                        },
                      }}
                    />
                  ) : field.type === "single-dropdown" ? (
                    (() => {
                      const dropdownOptions =
                        field.options || courses.map((c) => ({ value: c._id, label: c.courseName }));
                      return (
                        <select
                          id={field.key}
                          className={`${styles.input} ${
                            errors[field.key] ? styles.inputError : ""
                          }`}
                          value={(form[field.key] || [])[0] || ""}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [field.key]: event.target.value ? [event.target.value] : [],
                            }))
                          }
                        >
                          <option value="">{`Select ${field.label}`}</option>
                          {dropdownOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      );
                    })()
                  ) : field.type === "radio" ? (
                    <div
                      id={field.key}
                      className={`${styles.checkboxGroup} ${
                        errors[field.key] ? styles.inputError : ""
                      }`}
                    >
                      {(field.options || []).map((option) => {
                        const selected = (form[field.key] || [])[0] === option.value;
                        return (
                          <label key={option.value} className={styles.checkboxOption}>
                            <input
                              type="radio"
                              name={`${activeTab.key}-${field.key}`}
                              checked={selected}
                              onChange={() =>
                                setForm((current) => ({
                                  ...current,
                                  [field.key]: [option.value],
                                }))
                              }
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      id={field.key}
                      name={`${activeTab.key}-${field.key}`}
                      autoComplete="off"
                      className={`${styles.input} ${
                        errors[field.key] ? styles.inputError : ""
                      }`}
                      type={field.type}
                      min={field.min}
                      placeholder={field.placeholder || ""}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  )}

                  {errors[field.key] && (
                    <span className={styles.errorText}>
                      {errors[field.key]}
                    </span>
                  )}
                </div>
              ))}

              {activeTab.key === "time" &&
                form.startTime &&
                form.endTime &&
                dayjs(form.startTime).isValid() &&
                dayjs(form.endTime).isValid() && (
                  <p className={styles.previewText}>
                    Saved as{" "}
                    <strong>
                      {buildSlotLabel(form.startTime, form.endTime)}
                    </strong>
                  </p>
                )}
            </div>
            </LocalizationProvider>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>

              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={cancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>Delete {activeTab.label}</p>

              <button
                className={styles.closeBtn}
                onClick={cancelDelete}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Delete{" "}
                <strong>
                  {deleteTarget[
                    activeTab.columns.find((column) => column.primary)?.key
                  ] || activeTab.label.toLowerCase()}
                </strong>
                ? This can't be undone.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={cancelDelete}>
                Cancel
              </button>

              <button className={styles.dangerConfirmBtn} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSettings;
