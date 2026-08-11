import React, { useState, useEffect } from "react";
import { addsubject, updatesubject } from "../../api/Serviceapi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

const Subjectpopup = ({ closeModal, courseId, batchId, semester, editData }) => {
  const [exam, setExam] = useState("sem1");
  const [subjects, setSubjects] = useState([{ subjectCode: "", subjectName: "" }]);
  const [errors, setErrors] = useState([]);
  const isEdit = !!editData?._id;

  useEffect(() => {
    if (editData) {
      setExam(editData.exam);
      setSubjects(editData.subjects || [{ subjectCode: "", subjectName: "" }]);
    } else {
      setExam(semester);
      setSubjects([{ subjectCode: "", subjectName: "" }]);
    }
  }, [editData, semester]);

  const [loading, setLoading] = useState(false);


  // Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);

    // clear error when user types
    const newErrors = [...errors];
    if (newErrors[index]) newErrors[index][field] = "";
    setErrors(newErrors);
  };

  // Add new row
  const addRow = () => {
    setSubjects([...subjects, { subjectCode: "", subjectName: "" }]);
  };

  // Remove row
  const removeRow = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  // Validation
  const validate = () => {
    let tempErrors = [];
    let codes = new Set();
    let isValid = true;

    subjects.forEach((sub, i) => {
      let rowError = {};

      if (!sub.subjectCode.trim()) {
        rowError.subjectCode = "Subject code is required";
        isValid = false;
      }

      if (!sub.subjectName.trim()) {
        rowError.subjectName = "Subject name is required";
        isValid = false;
      }

      const code = sub.subjectCode.trim();
      if (code) {
        if (codes.has(code)) {
          rowError.subjectCode = "Duplicate subject code";
          isValid = false;
        }
        codes.add(code);
      }

      tempErrors[i] = rowError;
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return; // ⛔ stop API if validation fails

    const payload = {
      exam,
      subjects,
      courseId,
      batchId,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await updatesubject(editData._id, payload);
      } else {
        await addsubject(courseId, payload);
      }

      closeModal();
      window.location.reload(); // Replace with refetch later if needed
    } catch (err) {
      console.error("Error saving subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="flex-shrink-0 text-xl sm:text-2xl font-semibold text-[#123d84] pb-4 border-b border-[#f0f1f5]">
        {isEdit ? "Update Subjects" : "Add Subjects"}
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pt-5 sm:pt-6 pr-1 sm:pr-2 space-y-3 sm:space-y-4">
        {subjects.map((sub, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Subject Code"
                value={sub.subjectCode}
                onChange={(e) =>
                  handleChange(index, "subjectCode", e.target.value)
                }
                className={`border border-[#e5e7eb] h-11 px-3 py-2.5 rounded-[10px] w-full text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#123d84] ${errors[index]?.subjectCode ? "border-red-500" : ""
                  }`}
              />
              {errors[index]?.subjectCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].subjectCode}
                </p>
              )}
            </div>

            <div className="w-full sm:w-2/3">
              <input
                type="text"
                placeholder="Subject Name"
                value={sub.subjectName}
                onChange={(e) =>
                  handleChange(index, "subjectName", e.target.value)
                }
                className={`border border-[#e5e7eb] h-11 px-3 py-2.5 rounded-[10px] w-full text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#123d84] ${errors[index]?.subjectName ? "border-red-500" : ""
                  }`}
              />
              {errors[index]?.subjectName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].subjectName}
                </p>
              )}
            </div>

            {subjects.length > 1 && (
              <TrashIcon
                onClick={() => removeRow(index)}
                className="w-5 h-5 text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0 mt-0 sm:mt-3 self-end sm:self-auto transition-colors"
              />
            )}
          </div>
        ))}

        <button
          onClick={addRow}
          className="flex items-center gap-2 text-[#123d84] hover:text-[#0b2456] text-sm font-medium mt-1 transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Add Another Subject
        </button>
      </div>

      <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-0 pt-4 border-t border-[#f0f1f5]">
        <button
          onClick={closeModal}
          disabled={loading}
          className="px-[22px] py-[11px] w-full sm:w-auto border border-[#e5e7eb] rounded-[10px] text-[#374151] hover:border-[#123d84] hover:text-[#123d84] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          disabled={loading}

          onClick={handleSubmit}
          className={`px-[22px] py-[11px] w-full sm:w-auto rounded-[10px] text-white flex items-center justify-center gap-2 transition-colors
    ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-b from-[#144196] to-[#0b2456]"}
  `}        >
          {loading ? (
            <>
              {/* <svg
        className="animate-spin h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg> */}
              {isEdit ? "Updating..." : "Saving..."}
            </>
          ) : (
            isEdit ? "Update" : "Save"
          )}        </button>
      </div>
    </div>
  );
};

export default Subjectpopup;
