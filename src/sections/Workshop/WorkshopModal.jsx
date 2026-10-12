import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import Modal from "../../components/modal/Modal";
import formStyles from "../CourseDetails/courseForms.module.css";
import { uploadFile } from "../../api/Serviceapi";

const MAX_TAGS = 10;
const MAX_LEARNINGS = 10;
const MAX_POSTER_BYTES = 5 * 1024 * 1024;

const EMPTY_FORM = {
  title: "",
  description: "",
  posterUrl: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  fee: "",
  audience: [],
  learnings: [],
  isActive: true,
};

// learning rows get a local id so React keeps each input's focus when one is removed
let rowId = 0;
const newLearning = (title = "", description = "") => ({ id: ++rowId, title, description });

// courseForms.module.css only styles input/select, so the textarea borrows the same look here
const textareaClass =
  "w-full min-h-[90px] px-[13px] py-[11px] text-sm text-[#111827] bg-white border border-[#e5e7eb] rounded-[10px] resize-y focus:outline-none focus:border-[#123d84]";

const smallBtnClass =
  "inline-flex items-center gap-1.5 px-3 h-[42px] text-[13px] font-semibold text-[#123d84] bg-white border border-[#123d84] rounded-[10px] cursor-pointer hover:bg-[#123d84]/10 disabled:opacity-50 disabled:cursor-not-allowed shrink-0";

const WorkshopModal = ({ open, onClose, onSave, workshopData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const posterInput = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (workshopData) {
      setForm({
        title: workshopData.title || "",
        description: workshopData.description || "",
        posterUrl: workshopData.posterUrl || "",
        date: workshopData.date ? String(workshopData.date).split("T")[0] : "",
        startTime: workshopData.startTime || "",
        endTime: workshopData.endTime || "",
        venue: workshopData.venue || "",
        fee: String(workshopData.fee ?? ""),
        audience: workshopData.audience || [],
        learnings: (workshopData.learnings || []).map((l) => newLearning(l.title, l.description)),
        isActive: Boolean(workshopData.isActive),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setTagInput("");
  }, [open, workshopData]);

  const clearError = (field) => setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handlePoster = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, posterUrl: "Choose an image file (JPG, PNG or WebP)" }));
      return;
    }
    if (file.size > MAX_POSTER_BYTES) {
      setErrors((prev) => ({ ...prev, posterUrl: "Poster must be 5 MB or smaller" }));
      return;
    }

    setUploading(true);
    try {
      // the upload API saves files to S3 under their own name, so give every
      // poster a unique one or a second "poster.png" would replace the first
      const dot = file.name.lastIndexOf(".");
      const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : "";
      const renamed = new File([file], `workshop-poster-${Date.now()}${ext}`, { type: file.type });
      const res = await uploadFile(renamed);
      const url = res?.data?.data?.imageURL;
      if (!url) throw new Error("No URL returned");
      setForm((prev) => ({ ...prev, posterUrl: url }));
      clearError("posterUrl");
    } catch (err) {
      console.log(err);
      setErrors((prev) => ({ ...prev, posterUrl: "Upload failed. Please try again." }));
    } finally {
      setUploading(false);
    }
  };

  const tagsWithPending = () => {
    const tag = tagInput.trim().replace(/\s+/g, " ");
    if (!tag || form.audience.length >= MAX_TAGS || form.audience.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return form.audience;
    }
    return [...form.audience, tag];
  };

  const addTag = () => {
    setForm((prev) => ({ ...prev, audience: tagsWithPending() }));
    setTagInput("");
  };

  const removeTag = (tag) => setForm((prev) => ({ ...prev, audience: prev.audience.filter((t) => t !== tag) }));

  const addLearning = () => setForm((prev) => ({ ...prev, learnings: [...prev.learnings, newLearning()] }));

  const updateLearning = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      learnings: prev.learnings.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
    clearError("learnings");
  };

  const removeLearning = (id) => setForm((prev) => ({ ...prev, learnings: prev.learnings.filter((l) => l.id !== id) }));

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Title is required";
    if (!form.date) err.date = "Date is required";
    if (!form.startTime) err.startTime = "Start time is required";
    if (!form.endTime) err.endTime = "End time is required";
    else if (form.startTime && form.endTime <= form.startTime) err.endTime = "Must be after start time";
    if (!String(form.fee).trim()) err.fee = "Fee is required";
    else if (isNaN(Number(form.fee)) || Number(form.fee) < 0) err.fee = "Enter a valid amount";
    if (form.isActive && !form.posterUrl) err.posterUrl = "Upload a poster to show this workshop on the website";
    if (form.learnings.some((l) => !l.title.trim() && l.description.trim())) err.learnings = "Every point needs a heading";
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
        ...(workshopData ? { id: workshopData._id } : {}),
        title: form.title.trim(),
        description: form.description.trim(),
        posterUrl: form.posterUrl,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        fee: Number(form.fee),
        // a tag typed but not added yet still counts
        audience: tagsWithPending(),
        learnings: form.learnings
          .map((l) => ({ title: l.title.trim(), description: l.description.trim() }))
          .filter((l) => l.title),
        isActive: form.isActive,
      });
      onClose();
    } catch {
      // failure toast is already shown by onSave; keep the modal open to retry
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}, required = true) => (
    <div className={`${formStyles.group} ${errors[name] ? formStyles.invalid : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className={formStyles.required}>*</span>}
      </label>
      <input id={name} value={form[name]} onChange={handleChange(name)} {...props} />
      <p className={formStyles.error}>{errors[name]}</p>
    </div>
  );

  return (
    <Modal open={open} title={workshopData ? "Edit Workshop" : "Add Workshop"} onClose={onClose} width={680} closeOnOverlayClick={false}>
      <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
        {field("title", "Workshop Title", { type: "text", placeholder: "e.g. Packaging Design", maxLength: 120 })}

        <div className={formStyles.group}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className={textareaClass}
            placeholder="Short description shown on the website"
            maxLength={1000}
            value={form.description}
            onChange={handleChange("description")}
          />
        </div>

        {/* poster */}
        <div className={`${formStyles.group} ${errors.posterUrl ? formStyles.invalid : ""}`}>
          <label>
            Poster
            {form.isActive && <span className={formStyles.required}>*</span>}
          </label>
          <input ref={posterInput} type="file" accept="image/*" className="hidden" onChange={handlePoster} />
          {form.posterUrl ? (
            <div className="flex items-center gap-4 p-3 border border-[#e5e7eb] rounded-[10px]">
              <img src={form.posterUrl} alt="Workshop poster" className="w-20 h-20 object-cover rounded-lg border border-[#eef0f5]" />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={smallBtnClass} disabled={uploading} onClick={() => posterInput.current?.click()}>
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  {uploading ? "Uploading..." : "Change"}
                </button>
                <button
                  type="button"
                  className={`${smallBtnClass} !text-[#d92d20] !border-[#f6c6c2] hover:!bg-[#fdecec]`}
                  disabled={uploading}
                  onClick={() => setForm((prev) => ({ ...prev, posterUrl: "" }))}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => posterInput.current?.click()}
              className={`flex flex-col items-center justify-center gap-1.5 h-[110px] text-sm text-[#6b7280] bg-[#f8fafd] border border-dashed rounded-[10px] cursor-pointer hover:border-[#123d84] hover:text-[#123d84] disabled:cursor-wait ${errors.posterUrl ? "border-[#d92d20] bg-[#fdecec]" : "border-[#cfd6e4]"}`}
            >
              {uploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
              {uploading ? "Uploading..." : "Upload poster image (JPG / PNG, up to 5 MB)"}
            </button>
          )}
          <p className={formStyles.error}>{errors.posterUrl}</p>
        </div>

        <div className={formStyles.grid}>
          {field("date", "Date", { type: "date" })}
          {field("fee", "Entry Fee (₹)", { type: "text", inputMode: "decimal", placeholder: "e.g. 199 (0 for free)" })}
          {field("startTime", "Start Time", { type: "time" })}
          {field("endTime", "End Time", { type: "time" })}
        </div>

        {field("venue", "Venue", { type: "text", placeholder: "e.g. ALO Info- Tech Pvt. Ltd, Nagercoil", maxLength: 200 }, false)}

        {/* who can attend */}
        <div className={formStyles.group}>
          <label htmlFor="audience">Who Can Attend?</label>
          <div className="flex gap-2">
            <input
              id="audience"
              type="text"
              placeholder="e.g. Students — press Enter to add"
              maxLength={40}
              value={tagInput}
              disabled={form.audience.length >= MAX_TAGS}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button type="button" className={smallBtnClass} onClick={addTag} disabled={!tagInput.trim() || form.audience.length >= MAX_TAGS}>
              <Plus size={15} />
              Add
            </button>
          </div>
          {form.audience.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {form.audience.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 text-[13px] font-medium text-[#123d84] bg-[#eef3fc] rounded-full">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    className="w-5 h-5 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#123d84] hover:text-white"
                    onClick={() => removeTag(tag)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* what you will learn */}
        <div className={`${formStyles.group} ${errors.learnings ? formStyles.invalid : ""}`}>
          <label>What You Will Learn</label>
          {form.learnings.length > 0 && (
            <div className="flex flex-col gap-2 mb-2.5">
              {form.learnings.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1.6fr_38px] gap-2 items-start max-sm:grid-cols-[1fr_38px]">
                  <div className={formStyles.rowField}>
                    <input
                      type="text"
                      placeholder="Heading, e.g. Design Fundamentals"
                      maxLength={80}
                      value={item.title}
                      onChange={(e) => updateLearning(item.id, "title", e.target.value)}
                    />
                  </div>
                  <div className={`${formStyles.rowField} max-sm:order-3 max-sm:col-span-2`}>
                    <input
                      type="text"
                      placeholder="Short description"
                      maxLength={200}
                      value={item.description}
                      onChange={(e) => updateLearning(item.id, "description", e.target.value)}
                    />
                  </div>
                  <button type="button" aria-label="Remove point" className={formStyles.rowDelete} onClick={() => removeLearning(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={`${formStyles.addRowBtn} self-start`}
            onClick={addLearning}
            disabled={form.learnings.length >= MAX_LEARNINGS}
          >
            <Plus size={15} />
            Add Point
          </button>
          <p className={formStyles.error}>{errors.learnings}</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#374151] mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => {
              const { checked } = e.target;
              setForm((prev) => ({ ...prev, isActive: checked }));
              if (!checked) clearError("posterUrl");
            }}
          />
          Show this workshop on the website (only one workshop can be active)
        </label>

        <div className={formStyles.actions}>
          <button type="button" className={formStyles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={formStyles.submitBtn} disabled={saving || uploading}>
            {saving ? "Saving..." : workshopData ? "Save Changes" : "Add Workshop"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkshopModal;
