import { useEffect, useState } from "react";
import Modal from "../../components/modal/Modal";
import styles from "./courseForms.module.css";

const validateCourseName = (value) => {
  if (!value.trim()) return "Course name is required";
  if (!/^[A-Za-z\s/]+$/.test(value))
    return "Only letters, spaces and '/' are allowed";
  return "";
};

const validateNumber = (value, field) => {
  if (!String(value).trim()) return `${field} is required`;
  if (!/^\d+$/.test(String(value).trim())) return `${field} must be a number`;
  return "";
};

const EMPTY = { courseName: "", duration: "", noOfSem: "" };

// Serves both "Add Course" and "Edit Course" — pass `course` to prefill and
// switch to edit mode, omit it (or pass null) for create mode.
const AddCourseModal = ({ open, onClose, onSubmit, existingCourses, course }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [duplicate, setDuplicate] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(course);

  useEffect(() => {
    if (!open) return;
    setForm(
      course
        ? {
            courseName: course.courseName,
            duration: String(course.duration),
            noOfSem: String(course.noOfSem),
          }
        : EMPTY,
    );
    setErrors({});
    setDuplicate("");
  }, [open, course]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
    if (field === "courseName") setDuplicate("");
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setErrors({});
    setDuplicate("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      courseName: validateCourseName(form.courseName),
      duration: validateNumber(form.duration, "Duration"),
      noOfSem: validateNumber(form.noOfSem, "No. of Semester"),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const formattedName = form.courseName.trim().split(/\s+/).join(" ");

    const isDuplicate = existingCourses?.some(
      (c) =>
        c.courseName.toLowerCase() === formattedName.toLowerCase() &&
        c.id !== course?.id,
    );
    if (isDuplicate) {
      setDuplicate("This course already exists. Please enter another course.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        courseName: formattedName,
        duration: Number(form.duration),
        noOfSem: Number(form.noOfSem),
      });
      // Only close once the API call has actually succeeded - onSubmit
      // throws on failure, so the modal stays open with the entered data.
      handleCancel();
    } catch (err) {
      // Failure toast already shown by App.jsx; keep the modal open.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? "Edit Course" : "Add Course"} onClose={handleCancel} width={640}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {duplicate && <p className={styles.formError}>{duplicate}</p>}

        <div className={`${styles.group} ${errors.courseName ? styles.invalid : ""}`}>
          <label htmlFor="courseName">
            Course Name<span className={styles.required}>*</span>
          </label>
          <input
            id="courseName"
            type="text"
            placeholder="Enter Course Name"
            value={form.courseName}
            onChange={handleChange("courseName")}
          />
          <p className={styles.error}>{errors.courseName}</p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.group} ${errors.duration ? styles.invalid : ""}`}>
            <label htmlFor="duration">
              Duration (Year)<span className={styles.required}>*</span>
            </label>
            <input
              id="duration"
              type="text"
              inputMode="numeric"
              placeholder="Enter Duration"
              value={form.duration}
              onChange={handleChange("duration")}
            />
            <p className={styles.error}>{errors.duration}</p>
          </div>

          <div className={`${styles.group} ${errors.noOfSem ? styles.invalid : ""}`}>
            <label htmlFor="noOfSem">
              No. of Semester<span className={styles.required}>*</span>
            </label>
            <input
              id="noOfSem"
              type="text"
              inputMode="numeric"
              placeholder="Enter No. of Semester"
              value={form.noOfSem}
              onChange={handleChange("noOfSem")}
            />
            <p className={styles.error}>{errors.noOfSem}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Course"
                : "Create Course"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCourseModal;
