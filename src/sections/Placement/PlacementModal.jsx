import { useEffect, useRef, useState } from "react";
import Modal from "../../components/modal/Modal";
import { getUser } from "../../api/Serviceapi";
import formStyles from "../CourseDetails/courseForms.module.css";
import styles from "./Placement.module.css";

const EMPTY_FORM = {
  companyName: "",
  role: "",
  package: "",
  placementDate: "",
  status: "In Process",
};

const STATUS_OPTIONS = ["In Process", "Placed", "Rejected"];

const PlacementModal = ({ open, onClose, onSave, placementData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (placementData) {
      setForm({
        companyName: placementData.companyName || "",
        role: placementData.role || "",
        package: String(placementData.package ?? ""),
        placementDate: placementData.placementDate
          ? String(placementData.placementDate).split("T")[0]
          : "",
        status: placementData.status || "In Process",
      });
      setSelectedStudent(
        placementData.studentId
          ? {
              _id: placementData.studentId,
              name: placementData.studentName,
              studentId: placementData.studentIdNo,
              courseName: placementData.studentCourseName,
              batchName: placementData.studentBatchName,
            }
          : null,
      );
    } else {
      setForm(EMPTY_FORM);
      setSelectedStudent(null);
    }
    setStudentQuery("");
    setStudentResults([]);
    setShowResults(false);
    setErrors({});
  }, [open, placementData]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!studentQuery.trim()) {
      setStudentResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await getUser(8, 0, studentQuery, "", "", "", "active");
        setStudentResults(res?.data?.data?.data || []);
      } catch {
        setStudentResults([]);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [studentQuery]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const pickStudent = (student) => {
    setSelectedStudent({
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      courseName: student.courseDetails?.courseName,
      batchName: student.batchDetails?.batchName,
    });
    setStudentQuery("");
    setShowResults(false);
    if (errors.student) setErrors({ ...errors, student: "" });
  };

  const validate = () => {
    const err = {};
    if (!selectedStudent) err.student = "Select a student";
    if (!form.companyName.trim()) err.companyName = "Company name is required";
    if (!form.role.trim()) err.role = "Role is required";
    if (!String(form.package).trim()) err.package = "Package is required";
    else if (isNaN(Number(form.package))) err.package = "Must be a number";
    if (!form.placementDate) err.placementDate = "Placement date is required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        ...(placementData ? { id: placementData.id } : {}),
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        studentIdNo: selectedStudent.studentId,
        studentCourseName: selectedStudent.courseName,
        studentBatchName: selectedStudent.batchName,
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        package: Number(form.package),
        placementDate: form.placementDate,
        status: form.status,
      });
      onClose();
    } catch {
      // failure toast is already shown by onSave; keep the modal open so the
      // user can retry without re-entering everything.
    } finally {
      setSaving(false);
    }
  };

  const title = placementData ? "Edit Placement" : "Add Placement";

  return (
    <Modal open={open} title={title} onClose={onClose} width={620}>
      <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
        <div className={`${formStyles.group} ${errors.student ? formStyles.invalid : ""}`}>
          <label htmlFor="studentSearch">
            Student<span className={formStyles.required}>*</span>
          </label>

          {selectedStudent ? (
            <div className={styles.selectedStudent}>
              <div>
                <strong>{selectedStudent.name}</strong>
                <span>{selectedStudent.studentId}</span>
                {(selectedStudent.courseName || selectedStudent.batchName) && (
                  <span className={styles.selectedStudentMeta}>
                    {selectedStudent.courseName || "No course"}
                    {selectedStudent.batchName ? ` · ${selectedStudent.batchName}` : ""}
                  </span>
                )}
              </div>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={() => setSelectedStudent(null)}
              >
                Change
              </button>
            </div>
          ) : (
            <div className={styles.searchWrap}>
              <input
                id="studentSearch"
                type="text"
                placeholder="Search by name or ID"
                value={studentQuery}
                onChange={(e) => {
                  setStudentQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                autoComplete="off"
              />
              {showResults && studentResults.length > 0 && (
                <div className={styles.searchResults}>
                  {studentResults.map((s) => (
                    <button
                      type="button"
                      key={s._id}
                      className={styles.searchItem}
                      onMouseDown={() => pickStudent(s)}
                    >
                      <strong>{s.name}</strong>
                      <span>{s.studentId}</span>
                      <span className={styles.searchItemMeta}>
                        {s.courseDetails?.courseName || "No course"}
                        {s.batchDetails?.batchName ? ` · ${s.batchDetails.batchName}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className={formStyles.error}>{errors.student}</p>
        </div>

        <div className={formStyles.grid}>
          <div className={`${formStyles.group} ${errors.companyName ? formStyles.invalid : ""}`}>
            <label htmlFor="companyName">
              Company Name<span className={formStyles.required}>*</span>
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="Enter Company Name"
              value={form.companyName}
              onChange={handleChange("companyName")}
            />
            <p className={formStyles.error}>{errors.companyName}</p>
          </div>

          <div className={`${formStyles.group} ${errors.role ? formStyles.invalid : ""}`}>
            <label htmlFor="role">
              Role<span className={formStyles.required}>*</span>
            </label>
            <input
              id="role"
              type="text"
              placeholder="Enter Role / Designation"
              value={form.role}
              onChange={handleChange("role")}
            />
            <p className={formStyles.error}>{errors.role}</p>
          </div>

          <div className={`${formStyles.group} ${errors.package ? formStyles.invalid : ""}`}>
            <label htmlFor="package">
              Package (LPA)<span className={formStyles.required}>*</span>
            </label>
            <input
              id="package"
              type="text"
              inputMode="decimal"
              placeholder="Enter Package"
              value={form.package}
              onChange={handleChange("package")}
            />
            <p className={formStyles.error}>{errors.package}</p>
          </div>

          <div className={`${formStyles.group} ${errors.placementDate ? formStyles.invalid : ""}`}>
            <label htmlFor="placementDate">
              Placement Date<span className={formStyles.required}>*</span>
            </label>
            <input
              id="placementDate"
              type="date"
              value={form.placementDate}
              onChange={handleChange("placementDate")}
            />
            <p className={formStyles.error}>{errors.placementDate}</p>
          </div>

          <div className={formStyles.group}>
            <label htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={handleChange("status")}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={formStyles.actions}>
          <button
            type="button"
            className={formStyles.cancelBtn}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className={formStyles.submitBtn} disabled={saving}>
            {saving
              ? placementData
                ? "Saving..."
                : "Adding..."
              : placementData
                ? "Save Changes"
                : "Add Placement"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlacementModal;
