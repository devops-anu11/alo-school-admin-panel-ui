import { useEffect, useState } from "react";
import Modal from "../../components/modal/Modal";
import styles from "../CourseDetails/courseForms.module.css";
import { PlusIcon, TrashIcon } from "../../components/icons/Icons";

const EMPTY_FORM = {
  batchName: "",
  admissionFee: "",
  startDate: "",
  endDate: "",
  classStartIn: "",
  classEndIn: "",
  sem1FeeDate: "",
  sem2FeeDate: "",
};

const EMPTY_ROW = { courseId: "", sem1Amount: "", sem2Amount: "" };

const to12HourTime = (timeStr) => {
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
};

const to24HourTime = (timeStr) => {
  if (!timeStr) return "";
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "";
  let hour = parseInt(match[1], 10);
  const period = match[3].toUpperCase();
  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

const isNumeric = (v) => /^\d+$/.test(String(v).trim());

const rowTotal = (row) =>
  (Number(row.sem1Amount) || 0) + (Number(row.sem2Amount) || 0);

const CreateBatchModal = ({ open, onClose, onSave, courses, batchData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (batchData) {
      setForm({
        batchName: batchData.batchName || "",
        admissionFee: String(batchData.admissionFee ?? ""),
        startDate: batchData.startDate || "",
        endDate: batchData.endDate || "",
        classStartIn: to24HourTime(batchData.classStartIn),
        classEndIn: to24HourTime(batchData.classEndIn),
        sem1FeeDate: batchData.sem1PayDate || "",
        sem2FeeDate: batchData.sem2PayDate || "",
      });
      setRows(
        batchData.courses?.length
          ? batchData.courses.map((c) => ({
              courseId: c.courseId,
              sem1Amount: String(c.sem1Amount),
              sem2Amount: String(c.sem2Amount),
            }))
          : [{ ...EMPTY_ROW }],
      );
    } else {
      setForm(EMPTY_FORM);
      setRows([{ ...EMPTY_ROW }]);
    }
    setErrors({});
  }, [open, batchData]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleRowChange = (index, field) => (e) => {
    const next = rows.map((r, i) =>
      i === index ? { ...r, [field]: e.target.value } : r,
    );
    setRows(next);
    const key = `row-${index}-${field}`;
    if (errors[key]) setErrors({ ...errors, [key]: "" });
  };

  const addRow = () => setRows([...rows, { ...EMPTY_ROW }]);

  const removeRow = (index) => {
    if (rows.length === 1) {
      setRows([{ ...EMPTY_ROW }]);
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const err = {};

    if (!form.batchName.trim()) err.batchName = "Batch name is required";
    if (!String(form.admissionFee).trim())
      err.admissionFee = "Admission fee is required";
    else if (!isNumeric(form.admissionFee))
      err.admissionFee = "Admission fee must be a number";
    if (!form.startDate) err.startDate = "Start date is required";
    if (!form.endDate) err.endDate = "End date is required";
    if (!form.classStartIn) err.classStartIn = "Class start time is required";
    if (!form.classEndIn) err.classEndIn = "Class end time is required";
    if (!form.sem1FeeDate) err.sem1FeeDate = "Semester 1 fee date is required";
    if (!form.sem2FeeDate) err.sem2FeeDate = "Semester 2 fee date is required";

    if (form.startDate && form.endDate) {
      if (new Date(form.endDate) <= new Date(form.startDate))
        err.endDate = "End date must be after start date";
    }

    const inRange = (d) =>
      new Date(d) >= new Date(form.startDate) &&
      new Date(d) <= new Date(form.endDate);

    if (form.sem1FeeDate && form.startDate && form.endDate && !err.sem1FeeDate) {
      if (!inRange(form.sem1FeeDate))
        err.sem1FeeDate = "Must be within batch duration";
    }

    if (form.sem2FeeDate && form.startDate && form.endDate && !err.sem2FeeDate) {
      if (!inRange(form.sem2FeeDate))
        err.sem2FeeDate = "Must be within batch duration";
    }

    if (form.sem1FeeDate && form.sem2FeeDate && !err.sem2FeeDate) {
      if (new Date(form.sem2FeeDate) <= new Date(form.sem1FeeDate))
        err.sem2FeeDate = "Must be after Semester 1 fee date";
    }

    if (form.classStartIn && form.classEndIn && !err.classEndIn) {
      if (form.classEndIn <= form.classStartIn)
        err.classEndIn = "Must be after class start time";
    }

    const seen = new Set();
    rows.forEach((row, i) => {
      if (!row.courseId) err[`row-${i}-courseId`] = "Course is required";
      else if (seen.has(row.courseId))
        err[`row-${i}-courseId`] = "Course already added";
      else seen.add(row.courseId);

      if (!String(row.sem1Amount).trim())
        err[`row-${i}-sem1Amount`] = "Required";
      else if (!isNumeric(row.sem1Amount))
        err[`row-${i}-sem1Amount`] = "Must be a number";

      if (!String(row.sem2Amount).trim())
        err[`row-${i}-sem2Amount`] = "Required";
      else if (!isNumeric(row.sem2Amount))
        err[`row-${i}-sem2Amount`] = "Must be a number";
    });

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formattedName = form.batchName
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    setSaving(true);
    try {
      await onSave({
        ...(batchData ? { id: batchData.id } : {}),
        batchName: formattedName,
        admissionFee: Number(form.admissionFee),
        startDate: form.startDate,
        endDate: form.endDate,
        classStartIn: to12HourTime(form.classStartIn),
        classEndIn: to12HourTime(form.classEndIn),
        sem1PayDate: form.sem1FeeDate,
        sem2PayDate: form.sem2FeeDate,
        courses: rows.map((r) => ({
          courseId: r.courseId,
          sem1Amount: Number(r.sem1Amount),
          sem2Amount: Number(r.sem2Amount),
        })),
      });
      // Only close once the API call has actually succeeded - onSave throws
      // on failure, so a rejected save leaves the modal open with the data
      // the user typed, instead of closing as if it worked.
      onClose();
    } catch (err) {
      // Failure toast is already shown by onSave (App.jsx); keep the modal
      // open so the user can retry without re-entering everything.
    } finally {
      setSaving(false);
    }
  };

  const title = batchData ? "Edit Batch" : "Create Batch";

  return (
    <Modal open={open} title={title} onClose={onClose} width={900}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          <div className={`${styles.group} ${errors.batchName ? styles.invalid : ""}`}>
            <label htmlFor="batchName">
              Batch Name<span className={styles.required}>*</span>
            </label>
            <input
              id="batchName"
              type="text"
              placeholder="Enter Batch Name"
              value={form.batchName}
              onChange={handleChange("batchName")}
            />
            <p className={styles.error}>{errors.batchName}</p>
          </div>

          <div className={`${styles.group} ${errors.admissionFee ? styles.invalid : ""}`}>
            <label htmlFor="admissionFee">
              Admission Fee (₹)<span className={styles.required}>*</span>
            </label>
            <input
              id="admissionFee"
              type="text"
              inputMode="numeric"
              placeholder="Enter Admission Fee"
              value={form.admissionFee}
              onChange={handleChange("admissionFee")}
            />
            <p className={styles.error}>{errors.admissionFee}</p>
          </div>

          <div className={`${styles.group} ${errors.startDate ? styles.invalid : ""}`}>
            <label htmlFor="startDate">
              Start Date<span className={styles.required}>*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange("startDate")}
            />
            <p className={styles.error}>{errors.startDate}</p>
          </div>

          <div className={`${styles.group} ${errors.endDate ? styles.invalid : ""}`}>
            <label htmlFor="endDate">
              End Date<span className={styles.required}>*</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange("endDate")}
            />
            <p className={styles.error}>{errors.endDate}</p>
          </div>

          <div className={`${styles.group} ${errors.classStartIn ? styles.invalid : ""}`}>
            <label htmlFor="classStartIn">
              Class Start Time<span className={styles.required}>*</span>
            </label>
            <input
              id="classStartIn"
              type="time"
              value={form.classStartIn}
              onChange={handleChange("classStartIn")}
            />
            <p className={styles.error}>{errors.classStartIn}</p>
          </div>

          <div className={`${styles.group} ${errors.classEndIn ? styles.invalid : ""}`}>
            <label htmlFor="classEndIn">
              Class End Time<span className={styles.required}>*</span>
            </label>
            <input
              id="classEndIn"
              type="time"
              value={form.classEndIn}
              onChange={handleChange("classEndIn")}
            />
            <p className={styles.error}>{errors.classEndIn}</p>
          </div>

          <div className={`${styles.group} ${errors.sem1FeeDate ? styles.invalid : ""}`}>
            <label htmlFor="sem1FeeDate">
              Semester 1 Fee Date<span className={styles.required}>*</span>
            </label>
            <input
              id="sem1FeeDate"
              type="date"
              value={form.sem1FeeDate}
              onChange={handleChange("sem1FeeDate")}
            />
            <p className={styles.error}>{errors.sem1FeeDate}</p>
          </div>

          <div className={`${styles.group} ${errors.sem2FeeDate ? styles.invalid : ""}`}>
            <label htmlFor="sem2FeeDate">
              Semester 2 Fee Date<span className={styles.required}>*</span>
            </label>
            <input
              id="sem2FeeDate"
              type="date"
              value={form.sem2FeeDate}
              onChange={handleChange("sem2FeeDate")}
            />
            <p className={styles.error}>{errors.sem2FeeDate}</p>
          </div>
        </div>

        {/* --- Course list --- */}
        <div className={styles.listHead}>
          <h3>
            Course List<span className={styles.required}>*</span>
          </h3>
          <button type="button" className={styles.addRowBtn} onClick={addRow}>
            <PlusIcon width={15} height={15} />
            Add Course
          </button>
        </div>

        <div className={styles.courseRows}>
          <div className={`${styles.courseRow} ${styles.courseRowHead}`}>
            <span>#</span>
            <span>
              Course<span className={styles.required}>*</span>
            </span>
            <span>
              Sem 1 Amount (₹)<span className={styles.required}>*</span>
            </span>
            <span>
              Sem 2 Amount (₹)<span className={styles.required}>*</span>
            </span>
            <span>Total (₹)</span>
            <span>Action</span>
          </div>

          {rows.map((row, i) => (
            <div key={i} className={styles.courseRow}>
              <span className={styles.rowIndex}>{i + 1}</span>

              <div className={`${styles.rowField} ${errors[`row-${i}-courseId`] ? styles.invalid : ""}`}>
                <select
                  aria-label={`Course ${i + 1}`}
                  value={row.courseId}
                  onChange={handleRowChange(i, "courseId")}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
                <p className={styles.error}>{errors[`row-${i}-courseId`]}</p>
              </div>

              <div className={`${styles.rowField} ${errors[`row-${i}-sem1Amount`] ? styles.invalid : ""}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                  aria-label={`Course ${i + 1} semester 1 amount`}
                  value={row.sem1Amount}
                  onChange={handleRowChange(i, "sem1Amount")}
                />
                <p className={styles.error}>{errors[`row-${i}-sem1Amount`]}</p>
              </div>

              <div className={`${styles.rowField} ${errors[`row-${i}-sem2Amount`] ? styles.invalid : ""}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                  aria-label={`Course ${i + 1} semester 2 amount`}
                  value={row.sem2Amount}
                  onChange={handleRowChange(i, "sem2Amount")}
                />
                <p className={styles.error}>{errors[`row-${i}-sem2Amount`]}</p>
              </div>

              <span className={styles.rowTotal}>
                {rowTotal(row) > 0 ? rowTotal(row).toLocaleString("en-IN") : "—"}
              </span>

              <button
                type="button"
                className={styles.rowDelete}
                aria-label={`Remove course ${i + 1}`}
                onClick={() => removeRow(i)}
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving
              ? batchData
                ? "Saving..."
                : "Creating..."
              : batchData
                ? "Save Changes"
                : "Create Batch"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBatchModal;
