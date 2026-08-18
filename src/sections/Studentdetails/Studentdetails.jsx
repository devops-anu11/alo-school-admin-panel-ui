import { React, useEffect, useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import BarChartIcon from "@mui/icons-material/BarChart";
import profile from "../../assets/dashboardimgs/profile.png";
import Import from "../../assets/dashboardimgs/Import.png";
import { Form, useParams } from "react-router-dom";
import {
  attendancestudentrate,
  getAttendanceStudentList,
  getStudentAttendencemonth,
  getUserId,
  makeabsent,
  updatedetailsuser,
  updateUser,
  createTermSem,
  updateTermSem,
  getPerformance,
  Performanceuser,
  deleteTermSem,
  uploadFile,
  getFeeBalance,
} from "../../api/Serviceapi";
import Modal from "react-modal";
import { deleteTermSem as deleteTermSemApi } from "../../api/Serviceapi";

import UpdateStudent from "../../component/updatestudent/UpdateStudent";
import styles from "./Studentdetails.module.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import Skeleton from "@mui/material/Skeleton";
import nodata from "../../assets/trans.png";
import { Switch } from "antd";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { set } from "date-fns";
// import { use } from 'react';
import { getDailyTaskSubjects } from "../../api/Serviceapi";

const Studentdetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState([]);
  const [profileImgError, setProfileImgError] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [totalcount, setTotalcount] = useState(null);
  const [studentattendance, setAttendance] = useState({});
  const [status, setStatus] = useState(true);
  const [termList, setTermList] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [editMode, setEditMode] = useState(false);
  const { RangePicker } = DatePicker;
  const [termModal, setTermModal] = useState(false);
  const [Academic, setAcademic] = useState("");
  const [sem, setSem] = useState('sem1');

  // sub

  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [feeDetails, setFeeDetails] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);

  const handleSemesterChange = (event) => {

    setSem(event.target.value)
  };


  const fetchSubjects = async () => {
    if (!user?.courseDetails?._id || !sem) return;

    setSubjectsLoading(true);
    try {
      // Same subject list Task Settings uses to power task creation - course
      // + semester scoped only (no per-batch subjects), so every batch of a
      // course shares one list. "sem1"/"sem2" here -> "1"/"2" there.
      const res = await getDailyTaskSubjects({
        courseId: user.courseDetails._id,
        semester: sem.toLowerCase().replace("sem", ""),
      });

      // Normalize once - Task Settings subjects come back as {_id, name,
      // totalMarks}, but the rest of this form (render labels, marks state,
      // saved payload) all expect {subjectCode, subjectName}. The subject's
      // own _id stands in for subjectCode, since Task Settings subjects
      // don't have a separate short code like the old SUB001-style ones did.
      const subjectList = (res?.data?.data || []).map((sub) => ({
        subjectCode: sub._id,
        subjectName: sub.name,
        totalMarks: sub.totalMarks ?? 100,
      }));

      setSubjects(subjectList);

      const initialMarks = subjectList.map((sub) => ({
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        totalMarks: sub.totalMarks,
        mark: "",
        revaluationUrl: "",
        revaluationFileName: ""
      }));


      setMarks(initialMarks);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const [revaluationUploadingIndex, setRevaluationUploadingIndex] = useState(null);

  const handleRevaluationUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files allowed");
      return;
    }

    setRevaluationUploadingIndex(index);
    try {
      const res = await uploadFile(file);
      const fileUrl = res?.data?.data?.imageURL;

      const updated = [...marks];
      updated[index].revaluationUrl = fileUrl;
      updated[index].revaluationFileName = file.name;

      setMarks(updated);

    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed");
    } finally {
      setRevaluationUploadingIndex(null);
    }
  };


  useEffect(() => {
    if (termModal && !editMode) {
      fetchSubjects();
    }
  }, [sem]);

  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);



  const openEditTermSem = (record) => {
    setEditMode(true);
    setTermModal(true);

    setEditingId(record._id);
    setAcademic(record.Academic || "");
    setSem(record.exam || "sem1");

    // Convert API Marks → UI format. totalMarks falls back to 100 for
    // records saved before subjects carried their own total marks.
    const formattedMarks = (record.Marks || []).map((m) => ({
      subjectCode: m.subjectCode || "",
      subjectName: m.subjectName || "",
      totalMarks: m.totalMarks ?? 100,
      mark: m.mark ?? "",
      revaluationUrl: m.revaluationUrl || "",
      revaluationFileName: m.revaluationUrl ? "Uploaded File" : ""
    }));


    setMarks(formattedMarks);

    // Also set subjects list so UI labels show
    const subjectList = formattedMarks.map((m) => ({
      subjectCode: m.subjectCode,
      subjectName: m.subjectName,
      totalMarks: m.totalMarks,
    }));
    setSubjects(subjectList);
  };
  const [performanceLoading, setPerformanceLoading] = useState(false);


  const handleSavePerformance = async () => {
    setFormError("");

    if (!Academic) return setFormError("Please select Term / Sem");
    if (!marks.length) return setFormError("Marks not available");

    if (!editMode && allAcademicsUsed) {
      return setFormError(
        "All Term / Semester marks already entered for this semester"
      );
    }

    if (!editMode && usedAcademicsForSemester.includes(Academic)) {
      return setFormError(
        "Marks already exist for this Term / Sem in the selected semester"
      );
    }

    for (let m of marks) {
      const maxMarks = Number(m.totalMarks) || 100;

      if (m.mark === "") {
        return setFormError(`Enter mark for ${m.subjectName}`);
      }

      if (m.mark !== "AA" && (isNaN(m.mark) || Number(m.mark) < 0)) {
        return setFormError(`Invalid mark for ${m.subjectName}`);
      }

      if (m.mark !== "AA" && Number(m.mark) > maxMarks) {
        return setFormError(`Mark for ${m.subjectName} cannot exceed ${maxMarks}`);
      }
    }


    const numericMarks = marks.map((m) => {
      // If absent → count as 0
      if (m.mark === "AA") return 0;

      // Convert to number safely
      const num = Number(m.mark);

      // If invalid number → treat as 0 (prevents NaN)
      return isNaN(num) ? 0 : num;
    });

    const total = numericMarks.reduce((sum, m) => sum + m, 0);

    // Weighted by each subject's own total marks, not a flat average -
    // matches the live preview in the footer.
    const maxTotal = marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 100), 0);

    const average = maxTotal
      ? Number(((total / maxTotal) * 100).toFixed(2))
      : 0;


    const payload = {
      userId: id,
      courseId: user?.courseDetails?._id,
      batchId: user?.batchDetails?._id,
      exam: sem,
      Academic,
      total,
      average,
      Marks: marks.map((m) => ({
        subjectCode: m.subjectCode,
        subjectName: m.subjectName,
        totalMarks: Number(m.totalMarks) || 100,
        mark: m.mark === "AA" ? "AA" : Number(m.mark),
        revaluationUrl: m.revaluationUrl || ""
      }))


    };

    try {
      setPerformanceLoading(true);

      if (editMode && editingId) {
        await updateTermSem(editingId, payload);
        toast.success("Marks updated successfully ✏️");
      } else {
        await createTermSem(payload);
        toast.success("Marks saved successfully 🎉");
      }

      setTermModal(false);
      setEditMode(false);
      setEditingId(null);
      setMarks([]);
      setSubjects([]);
      fetchPerformance();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Academics already used for selected semester
  const usedAcademicsForSemester = termList
    .filter((item) => item.exam === sem)
    .map((item) => item.Academic);

  // All possible academic options
  const allAcademicOptions = ["Term1", "Term2", "Semester"];

  // Check if all options already entered
  const allAcademicsUsed = allAcademicOptions.every((opt) =>
    usedAcademicsForSemester.includes(opt)
  );


  const numericMarksUI = marks.map((m) => {
    if (m.mark === "AA") return 0;
    const num = Number(m.mark);
    return isNaN(num) ? 0 : num;
  });

  const totalMarks = numericMarksUI.reduce((sum, m) => sum + m, 0);

  // Weighted by each subject's own total marks (not a flat count) - two
  // subjects out of 100 and 50 shouldn't count equally toward the average.
  const maxMarksSum = marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 100), 0);

  const avgMarks = maxMarksSum
    ? ((totalMarks / maxMarksSum) * 100).toFixed(2)
    : 0;



  const handleMarkChange = (index, value) => {
    const updated = [...marks];
    updated[index] = { ...updated[index], mark: value };
    setMarks(updated);
  };


  useEffect(() => {
    attdancemonth();
  }, []);

  useEffect(() => {
    attendancelist();
  }, []);

  const [loading, setLoading] = useState(false);
  const getUserById = (id) => {
    setLoading(true);
    getUserId(id)
      .then((res) => {
        const users = res?.data?.data?.data || [];
        if (users.length > 0) {
          const userData = users[0];
          setUser({
            ...userData,
            //   inStatus: userData.inStatus || "Ongoing"
          });
          setStatus(userData.status === "active");
          setFileUrl(userData.aadharURL);
          setCertificateUrl(userData.certificateURL);
        }
      })
      .catch((err) => console.error("Error fetching user:", err))
      .finally(() => setLoading(false));
  };

  const [isOpen, setIsOpen] = useState(false);
  let attdancemonth = async () => {
    try {
      let res = await getStudentAttendencemonth(id);
      setTotalcount(res?.data?.data);
      // console.log(res?.data?.data)
    } catch (err) {
      console.log(err);
    }
  };

  let attendancelist = async () => {
    try {
      let res = await getAttendanceStudentList(id);
      setAttendance(res?.data?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      const blob = await response.blob();

      const contentType = response.headers.get("content-type");
      let extension = "";

      if (contentType) {
        if (contentType.includes("pdf")) extension = ".pdf";
        else if (contentType.includes("png")) extension = ".png";
        else if (contentType.includes("jpeg") || contentType.includes("jpg"))
          extension = ".jpg";
        else if (contentType.includes("gif")) extension = ".gif";
        else extension = "";
      } else {
        extension = fileUrl.split(".").pop().split(/\#|\?/)[0]
          ? "." + fileUrl.split(".").pop().split(/\#|\?/)[0]
          : "";
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = "download" + extension;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const [statusUpdating, setStatusUpdating] = useState(false);

  const onChange = async (checked) => {
    const newStatus = checked ? "active" : "inactive";
    setStatusUpdating(true);
    try {
      await updatedetailsuser(newStatus, id);
      setStatus(checked);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
      getUserById(id); // Refresh user data after status change
       fetchPerformance(); // Refresh performance data if loading
    }
  };

  const [isDisabledToday, setIsDisabledToday] = useState(false);

  useEffect(() => {
    const savedDate = localStorage.getItem(`absentSubmittedDate_${id}`);
    const today = new Date().toLocaleDateString(); // "11/25/2025" format

    if (savedDate === today) {
      setIsDisabledToday(true); // already submitted today
    } else {
      setIsDisabledToday(false); // allow submit
    }
  }, []);

  const [absentloading, setAbsentloading] = useState(false);
  const [discription, setdiscription] = useState("");
  const [error, setError] = useState("");
  const createabsent = async () => {
    if (!discription.trim()) {
      setError("Description is required");
      return;
    }

    setAbsentloading(true);
    try {
      await makeabsent(id, discription);
      setAbsentloading(false);
      attendancelist();
      setAbsentModel(false);
      setdiscription("");
      setError("");
      localStorage.setItem(
        `absentSubmittedDate_${id}`,
        new Date().toLocaleDateString()
      );
      setIsDisabledToday(true);
    } catch (err) {
      console.error("Error updating status:", err);
      setAbsentloading(false);
      toast.error(err?.response?.data?.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  };

  const [Studentattendancerate, setStudentAttendance] = useState({});

  const [rateLoading, setRateLoading] = useState(false);
  const studentrate = async () => {
    setRateLoading(true);
    try {
      const formatDate = (date) =>
        date ? date.toLocaleDateString("en-CA") : "";

      const fromDate = selectedRange.length
        ? formatDate(selectedRange[0].startDate)
        : "";
      const toDate = selectedRange.length
        ? formatDate(selectedRange[0].endDate)
        : "";

      const response = await attendancestudentrate(id, fromDate, toDate);
      console.log(
        "response",
        response.data?.data,
        studentattendance.attendanceRate
      );
      setStudentAttendance(response?.data?.data);
      setRateLoading(false);
    } catch (error) {
      console.log(error);
      setRateLoading(false);
    }
  };


  useEffect(() => {
    studentrate();
  }, [selectedRange]);

  const [absentModel, setAbsentModel] = useState(false);

  useEffect(() => {
    getUserById(id);
    // getTermDetails();
  }, [id]);


  const [termLoading, setTermLoading] = useState(false);


  const fetchPerformance = async () => {
    setTermLoading(true);
    try {
      const res = await Performanceuser(id);

      // 🔥 Correct path to records array
      const records = res?.data?.data?.data || [];

      setTermList(records);
    } catch (err) {
      console.error("Error fetching performance:", err);
    } finally {
      setTermLoading(false);
    }
  };


  useEffect(() => {
    console.log("Student ID:", id);
    if (id) {
      fetchPerformance();
      fetchFeeDetails();
    }
  }, [id]);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const confirmDeleteTermSem = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      await deleteTermSem(deleteId);

      toast.success("Record deleted successfully 🗑️");

      // Remove from UI
      setTermList((prev) => prev.filter((item) => item._id !== deleteId));

      setDeleteId(null); // close popup
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

 const fetchFeeDetails = async () => {
   console.log("fetchFeeDetails called");

   try {
     setFeeLoading(true);

     const res = await getFeeBalance(id);

     console.log(res);

     setFeeDetails(res?.data?.data || []);
   } catch (err) {
     console.log(err);
   } finally {
     setFeeLoading(false);
   }
 }
  return (
    <>
      <ToastContainer />
      <div className={styles.spacing}>
        <div className="flex gap-[10px] items-center pb-[16px]">
          <div>
            <IoMdArrowRoundBack
              style={{ cursor: "pointer", fontSize: "20px", marginTop: "2px", color: "#123d84" }}
              onClick={() => window.history.back()}
            />
          </div>
          <div>
            <h4 className={styles.pageHeading}>Student Details</h4>
          </div>
        </div>
        {loading ? (
          <div>
            <div className="bg-white border border-[#eef0f5] px-[10px] py-[10px] rounded-[12px]">
              <div className="flex justify-evenly items-center flex-col md:flex-row">
                <div className="  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid">
                  <div className="w-[100px] h-[100px]">
                    <Skeleton variant="circular" width={100} height={100} />
                  </div>
                </div>
                <div className="w-[85%]">
                  <div className="flex justify-between items-center pb-[10px]">
                    <Skeleton variant="text" width={80} height={40} />

                    <div
                      onClick={() => setIsOpen(true)}
                      style={{ cursor: "pointer" }}
                      className="text-transparent bg-clip-text bg-gradient-to-b 
                                        from-[#144196] to-[#061530] font-[500] px-[40px] p-2 "
                    >
                      <EditOutlinedIcon
                        className="text-[#144196]"
                        sx={{ fontSize: "14px", cursor: "pointer" }}
                      />{" "}
                      Edit
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-7 md:grid-cols-3 sm:grid-cols-2 text-[14px]">
                    <div>
                      <div className="text-[#6b7280]">ID</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Register Number</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Phone</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">E-Mail</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Course</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Batch</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Blood</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">D.O.B</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px]">
                <div className="flex justify-between items-center">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">
                    Attendance Details
                  </h4>
                  {/* <div className='text-white  bg-gradient-to-b from-[#144196] to-[#061530] text-[12px] px-[40px] p-2 rounded-lg'>Make Absent</div> */}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-2">
                  <div className="bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] mt-5">
                    <p className="text-[#d92d20] text-[12px]">
                      No: Of Days Absents
                    </p>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div className="bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] mt-5 ">
                    <p className="text-[#d92d20] text-[12px]">
                      No: Of Days Absents
                    </p>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#6b7280]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#6b7280]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#6b7280]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#6b7280]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] ">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Fee Details</h4>
                  <div className="grid grid-cols-4 text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5 ">
                    <div>
                      <div className="text-[#6b7280]">Total Fees</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Paid</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Pending</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#6b7280]">Due Date</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] my-3">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Documents</h4>
                  <div className="text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Aadhar card</h4>
                      <Skeleton variant="text" width={80} height={20} />
                    </div>
                  </div>
                  <div className="text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Original</h4>
                      <Skeleton variant="text" width={80} height={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] my-3">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Personal Details</h4>

                  <div className="text-[14px] font-normal my-2">
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Father Name</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Contact No</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Address</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white border border-[#eef0f5] px-[10px] py-[10px] rounded-[12px]">
              <div className="flex justify-evenly items-center flex-col md:flex-row">
                <div className="  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid">
                  <div className="w-[100px] h-[100px]">
                    {user?.profileURL && !profileImgError ? (
                      <img
                        src={user.profileURL}
                        alt="profile"
                        className="w-[100%] h-[100%] object-cover"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <div className="w-[100%] h-[100%] flex items-center justify-center bg-gradient-to-b from-[#144196] to-[#061530] text-white text-[40px] font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-[85%]">
                  <div className="flex justify-between items-center pb-[10px]">
                    <h2 className="text-[22px] font-semibold text-[#123d84] text-center md:text-left">
                      {user?.name?.replace(/\b\w/g, (char) =>
                        char.toUpperCase(),
                      )}
                    </h2>
                    <div className="flex items-center gap-3 pb-[10px] flex-wrap">
                      <button
                        className={styles.absent}
                        onClick={() => setAbsentModel(true)}
                      >
                        <EventBusyOutlinedIcon sx={{ fontSize: "15px" }} />
                        Make Absent
                      </button>
                      <button
                        className={styles.addTermBtn}
                        onClick={() => {
                          setTimeout(fetchSubjects, 0); // ensure modal + user loaded

                          setEditMode(false);
                          setAcademic("");
                          // setSem("");
                          setTermModal(true);
                        }}
                      >
                        <AddOutlinedIcon sx={{ fontSize: "16px" }} />
                        Add Term / Sem Detail
                      </button>
                      <button
                        onClick={() => setIsOpen(true)}
                        className={styles.editBtn}
                      >
                        <EditOutlinedIcon sx={{ fontSize: "15px" }} />
                        Edit
                      </button>
                      <div className={styles.statusPill}>
                        <span
                          className={
                            status
                              ? styles.statusPillLabelActive
                              : styles.statusPillLabelInactive
                          }
                        >
                          {status ? "Active" : "Inactive"}
                        </span>
                        <Switch
                          value={status}
                          onChange={onChange}
                          size="small"
                          loading={statusUpdating}
                          disabled={statusUpdating}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-3 text-[14px] pt-3 mt-1 border-t border-[#f0f1f5]">
                    <div>
                      <div className="text-[#6b7280] text-[12px]">ID</div>
                      <p className="font-[500]">{user?.studentId}</p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Register Number</div>
                      <p className="font-[500]">{user?.ID || "-"}</p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Phone</div>
                      <p className="font-[500]">{user?.mobileNo}</p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">E-Mail</div>
                      <p
                        title={user?.email}
                        className="font-[500] truncate overflow-hidden whitespace-nowrap w-[90%]"
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Password</div>
                      <p className="font-[500]">{user?.password}</p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Course</div>
                      <p className="font-[500]">
                        {user?.courseDetails?.courseName}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Batch</div>
                      <p className="font-[500]">
                        {user?.batchDetails?.batchName}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">Blood</div>
                      <p className="font-[500]">{user?.blood}</p>
                    </div>
                    <div>
                      <div className="text-[#6b7280] text-[12px]">D.O.B</div>
                      <p className="font-[500]">{user?.DOB?.split("T")[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#eef0f5] mt-3 p-3 rounded-[12px]">
              <h4 className="text-[16px] font-semibold text-[#123d84] mb-3">
                Term / Semester Details
              </h4>

              {termLoading ? (
                <p className="text-sm text-gray-500">Loading records...</p>
              ) : termList.length > 0 ? (
                termList.map((p) => (
                  <div key={p._id} className="bg-[#f8fafd] border border-[#eef0f5] p-3 rounded-[10px] mb-3">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">
                          {p.Academic || "—"} ({p.exam || "—"})
                        </p>
                        <p className="text-sm text-gray-500">
                          Total : {p.total} | Avg : {p.average}
                        </p>
                      </div>

                      <div className="flex gap-3 items-center">
                        <EditOutlinedIcon
                          sx={{ cursor: "pointer", fontSize: 18 }}
                          onClick={() => openEditTermSem(p)}
                        />

                        <span
                          className="text-red-600 text-sm cursor-pointer"
                          onClick={() => setDeleteId(p._id)}
                        >
                          Delete
                        </span>
                      </div>
                    </div>

                    {/* 🔥 Revaluation Section */}
                    {p?.Marks?.filter(
                      (m) => m.revaluationUrl && m.revaluationUrl.trim() !== "",
                    ).length > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <p className="text-sm font-medium mb-2">
                          Revaluation Papers:
                        </p>

                        {p.Marks.filter(
                          (m) =>
                            m.revaluationUrl && m.revaluationUrl.trim() !== "",
                        ).map((m, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded mb-1"
                          >
                            <span className="text-sm font-medium">
                              {m.subjectName}
                            </span>

                            <button
                              onClick={() => handleDownload(m.revaluationUrl)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ⬇️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 bg-[#f8fafd] border border-dashed border-[#e5e7eb] rounded-[12px]">
                  <MenuBookOutlinedIcon sx={{ fontSize: 28, color: "#c2c8d4" }} />
                  <p className="text-sm text-gray-400">No Term / Sem Records</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px]">
                <div className="flex justify-between items-center">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">
                    Attendance Details
                  </h4>
                  <div>
                    <RangePicker
                      format="YYYY-MM-DD"
                      onChange={(dates) => {
                        if (dates && dates.length === 2) {
                          setSelectedRange([
                            {
                              startDate: dates[0].toDate(),
                              endDate: dates[1].toDate(),
                              key: "selection",
                            },
                          ]);
                        }
                      }}
                      value={[
                        dayjs(selectedRange[0].startDate),
                        dayjs(selectedRange[0].endDate),
                      ]}
                    />
                  </div>
                  {/* <div className='text-white  bg-gradient-to-b from-[#144196] to-[#061530] text-[12px] px-[40px] p-2 rounded-lg'>Make Absent</div> */}
                </div>
                {totalcount && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-3 mt-5">
                    <div className="bg-[#fdecec] border border-[#fbdada] rounded-[12px] px-[18px] py-[14px]">
                      <EventBusyOutlinedIcon sx={{ fontSize: 20, color: "#d92d20" }} />
                      <p className="text-[#d92d20] text-[11px] mt-1">
                        Absents this month
                      </p>
                      <p className="text-[#d92d20] text-[26px] font-[700]">
                        {totalcount?.total?.currentMonth || 0}
                      </p>
                    </div>
                    <div className="bg-[#fdecec] border border-[#fbdada] rounded-[12px] px-[18px] py-[14px]">
                      <EventBusyOutlinedIcon sx={{ fontSize: 20, color: "#d92d20" }} />
                      <p className="text-[#d92d20] text-[11px] mt-1">
                        Absents last month
                      </p>
                      <p className="text-[#d92d20] text-[26px] font-[700]">
                        {totalcount?.total?.prevMonth || 0}
                      </p>
                    </div>
                    <div className="bg-[#e9f7ef] border border-[#d3f0de] rounded-[12px] px-[18px] py-[14px]">
                      <TrendingUpOutlinedIcon sx={{ fontSize: 20, color: "#12805c" }} />
                      <p className="text-[#12805c] text-[11px] mt-1">
                        Attendance Rate
                      </p>
                      <p className="text-[#6b7280] text-[11px]">
                        Present Days : {Studentattendancerate?.presentDays || 0}
                      </p>
                      <p className="text-[#12805c] text-[26px] font-[700]">
                        {Studentattendancerate?.attendanceRate || 0}
                      </p>
                    </div>
                  </div>
                )}
                {studentattendance.length > 0 ? (
                  studentattendance.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-5"
                    >
                      <div>
                        <div className="text-[#6b7280]">Date</div>
                        <p
                          className="font-[500]"
                          style={{ color: item?.onLeave ? "red" : "" }}
                        >
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#6b7280]">Break-in</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.breakTime[0] ? (
                            formatTime(item?.breakTime[0])
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#6b7280]">Break-out</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.breakTime[1] ? (
                            formatTime(item?.breakTime[1])
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#6b7280]">Check-in</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>Leave</span>
                          ) : item.inTime ? (
                            formatTime(item?.inTime)
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#6b7280]">Check-out</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.outTime ? (
                            formatTime(item?.outTime)
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <img
                      src={nodata}
                      alt=""
                      width={"200px"}
                      height={"200px"}
                      className="m-auto mt-[30px]"
                    />
                    <p className="text-center text-[#6b7280] font-semibold">
                      No Data Found
                    </p>
                  </div>
                )}
              </div>
              <div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] ">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Fee Details</h4>
                  <div className="bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[15px] my-5">
                    <div className="grid grid-cols-5 text-[13px] font-semibold text-[#123d84] border-b border-[#f0f1f5] pb-2">
                      <div>Semester</div>
                      <div className="text-center">Fee</div>
                      <div className="text-center">Paid</div>
                      <div className="text-center">Discount</div>
                      <div className="text-center">Pending</div>
                    </div>

                    {feeDetails.map((item) => (
                      <div
                        key={item._id}
                        className="grid grid-cols-5 text-[13px] py-3 border-b border-[#f0f1f5] items-center"
                      >
                        <div>Semester {item.noOfsem}</div>
                        <div className="text-center">₹{item.semFee}</div>
                        <div className="text-center">₹{item.paidAmount}</div>
                        <div className="text-center text-[#12805c]">
                          {item.discountCredited ? `₹${item.discountCredited}` : "-"}
                        </div>
                        <div className="text-center">₹{item.pendingAmount}</div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="grid grid-cols-5 text-[13px] font-semibold py-3 items-center">
                      <div>Total</div>

                      <div className="text-center">
                        ₹
                        {feeDetails.reduce((sum, item) => sum + item.semFee, 0)}
                      </div>

                      <div className="text-center">
                        ₹
                        {feeDetails.reduce(
                          (sum, item) => sum + item.paidAmount,
                          0,
                        )}
                      </div>

                      <div className="text-center text-[#12805c]">
                        ₹
                        {feeDetails.reduce(
                          (sum, item) => sum + (item.discountCredited || 0),
                          0,
                        )}
                      </div>

                      <div className="text-center">
                        ₹
                        {feeDetails.reduce(
                          (sum, item) => sum + item.pendingAmount,
                          0,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] my-3">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Documents</h4>
                  <div className="text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Aadhar card</h4>
                      <button
                        className="flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]"
                        onClick={() => handleDownload(user.aadharURL)}
                      >
                        Download <img src={Import} alt="" className="px-2" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[12px] bg-[#f8fafd] border border-[#eef0f5] rounded-[12px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Original</h4>
                      <button
                        className="flex items-center text-transparent bg-clip-text bg-gradient-to-b cursor-pointer from-[#144196] to-[#061530]"
                        onClick={() => handleDownload(user.certificateURL)}
                      >
                        Download <img src={Import} alt="" className="px-2" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[#eef0f5] px-[20px] py-[10px] rounded-[12px] my-3">
                  <h4 className="text-[16px] font-semibold text-[#123d84]">Personal Details</h4>

                  <div className="text-[14px] font-normal my-2">
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Father Name</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        {user?.fatherName?.replace(/\b\w/g, (char) =>
                          char.toUpperCase(),
                        )}
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Contact No</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]"> {user?.alterMobileNo} </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Address</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <p className="truncate overflow-hidden whitespace-nowrap w-[80%]">
                          {user?.address}{" "}
                        </p>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(true)}
        contentLabel="Add Student"
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(21, 21, 21, 0.6)",
            zIndex: 1000,
          },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "12px",
            width: "min(800px, 94vw)",
            height: "min(600px, 90vh)",
            overflow: "auto",
            boxShadow: "0 20px 45px rgba(15, 27, 51, 0.25)",
            zIndex: 1001,
            fontFamily: '"Poppins", sans-serif',
          },
        }}
      >
        <UpdateStudent
          closeModal={() => setIsOpen(false)}
          id={id}
          onSuccess={() => getUserById(id)}
        />
      </Modal>

      <Modal
        isOpen={absentModel}
        onRequestClose={() => {
          (setAbsentModel(false), setdiscription(""), setError(""));
        }}
        contentLabel="Make Absent"
        isCloseButtonShown={true}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(21, 21, 21, 0.6)",
            zIndex: 1000,
          },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "12px",
            width: "min(500px, 92vw)",
            height: "max-content",
            overflow: "auto",
            boxShadow: "0 20px 45px rgba(15, 27, 51, 0.25)",
            zIndex: 1001,
            fontFamily: '"Poppins", sans-serif',
          },
        }}
      >
        <div>
          <label className="font-[500] text-[#123d84]">Description</label>
          <div className="my-[20px]">
            <textarea
              placeholder="Enter description"
              className={styles.textarea}
              value={discription}
              onChange={(e) => {
                (setdiscription(e.target.value), setError(""));
              }}
            ></textarea>
            <p className="text-red-500 text-[12px]">{error}</p>
          </div>
        </div>
        <button
          onClick={createabsent}
          className={`${styles.submit} block mx-auto`}
          disabled={absentloading || isDisabledToday}
          style={{
            cursor:
              absentloading || isDisabledToday ? "not-allowed" : "pointer",
          }}
        >
          {absentloading
            ? "Loading..."
            : isDisabledToday
              ? "Submitted Today"
              : "Submit"}
        </button>
      </Modal>

      <Modal
        isOpen={termModal}
        onRequestClose={() => setTermModal(false)}
        style={{
          overlay: {
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(21, 21, 21, 0.6)",
          },
          content: {
            position: "relative",
            inset: "auto",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            margin: 0,
            borderRadius: "12px",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 12px 34px rgba(17, 24, 39, 0.24)",
            fontFamily: '"Poppins", sans-serif',
          },
        }}
      >
        {/* ================= Header (natural size, never shrinks) ================= */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-5 border-b border-[#f0f1f5]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8effc] text-[#123d84] flex-shrink-0">
              <SchoolIcon sx={{ fontSize: 20 }} />
            </span>
            <h3 className="text-[17px] font-semibold text-[#111827]">
              {editMode ? "Edit Term / Sem Detail" : "Add Term / Sem Detail"}
            </h3>
          </div>

          <button
            type="button"
            aria-label="Close"
            className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors"
            onClick={() => {
              setTermModal(false);
              setEditMode(false);
              setAcademic("");
              setMarks([]);
              setSubjects([]);
              setFormError("");
              setSem("sem1");
            }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* ================= Body =================
            flex: 1 1 0% is safe here because the modal is centered as an
            in-flow flex child of the overlay (align-items/justify-content),
            not an absolutely/fixed-positioned box sized via shrink-to-fit -
            so it sizes to content when there's room (few subjects -> no
            scroll) and only compresses + scrolls once content exceeds
            maxHeight (many subjects -> scrolls internally). */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
          {/* ================= Semester (radio) ================= */}
          <div className="mb-4">
            <label className="text-[13px] font-medium text-[#374151] block mb-1.5">
              Semester<span className="text-[#d92d20]"> *</span>
            </label>

            <div className="flex flex-wrap gap-x-5 gap-y-2 px-3.5 py-2.5 border border-[#e5e7eb] rounded-[10px]">
              {[
                { value: "sem1", label: "Semester 1" },
                { value: "sem2", label: "Semester 2" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-1.5 text-[13.5px] text-[#1f2937] ${
                    editMode ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="term-sem-semester"
                    checked={sem === option.value}
                    disabled={editMode}
                    onChange={() => handleSemesterChange({ target: { value: option.value } })}
                    className="accent-[#123d84] cursor-pointer"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* ================= Term / Sem Dropdown ================= */}
          <div className="mb-4">
            <label className="text-[13px] font-medium text-[#374151] block mb-1.5">
              Term / Sem<span className="text-[#d92d20]"> *</span>
            </label>

            <select
              className="w-full border border-[#e5e7eb] rounded-[10px] py-[11px] px-3.5 text-sm text-[#1f2937] bg-white focus:outline-none focus:border-[#123d84] transition-colors"
              value={Academic}
              onChange={(e) => setAcademic(e.target.value)}
              disabled={editMode || allAcademicsUsed}
              style={{
                cursor: editMode || allAcademicsUsed ? "not-allowed" : "pointer",
                // backgroundColor: !editMode || allAcademicsUsed ? "#f3f4f6" : "white",
              }}
            >
              <option value="">Select Term / Sem</option>

              <option
                value="Term1"
                disabled={!editMode && usedAcademicsForSemester.includes("Term1")}
              >
                Term 1
              </option>

              <option
                value="Term2"
                disabled={!editMode && usedAcademicsForSemester.includes("Term2")}
              >
                Term 2
              </option>

              <option
                value="Semester"
                disabled={
                  !editMode && usedAcademicsForSemester.includes("Semester")
                }
              >
                Semester
              </option>
            </select>

            {/* Helper Messages */}
            {!editMode && allAcademicsUsed && (
              <p className="text-xs text-red-500 mt-1">
                All Term / Semester records are already added for this semester.
              </p>
            )}
          </div>

          {/* ================= Marks Section ================= */}
          <div className="mb-2">
            <label className="text-[13px] font-medium text-[#374151] block mb-1.5">
              Marks<span className="text-[#d92d20]"> *</span>
            </label>

            {subjectsLoading ? (
              <p className="text-sm text-gray-500">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-red-500">No subjects found</p>
            ) : (
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-[24px_minmax(0,1fr)_108px_minmax(0,1fr)] gap-3 px-3 py-2.5 rounded-[10px] bg-[#eef2fb] text-[13px] font-semibold text-[#123d84]">
                  <span></span>
                  <span className="flex items-center gap-1.5">
                    <MenuBookIcon sx={{ fontSize: 16 }} /> Subject
                  </span>
                  <span className="flex items-center gap-1.5">
                    <StarIcon sx={{ fontSize: 16 }} /> Marks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UploadFileOutlinedIcon sx={{ fontSize: 16 }} /> Revaluation (PDF)
                  </span>
                </div>

                {subjects.map((sub, index) => (
                  <div
                    key={sub.subjectCode}
                    className="grid grid-cols-[24px_minmax(0,1fr)_108px_minmax(0,1fr)] gap-3 items-center rounded-[10px] border border-[#e5e7eb] px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-[#6b7280]">
                      {index + 1}.
                    </span>

                    <span
                      className="text-sm font-medium text-[#111827] truncate"
                      title={sub.subjectName}
                    >
                      {sub.subjectName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={marks[index]?.mark ?? ""}
                        title={`Out of ${sub.totalMarks ?? 100}`}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();

                          if (value === "AA") {
                            handleMarkChange(index, "AA");
                            return;
                          }

                          const maxMarks = Number(sub.totalMarks) || 100;

                          // Reject any keystroke that would push the value past
                          // this subject's total marks, instead of only
                          // catching it at save time.
                          if (/^\d*$/.test(value) && (value === "" || Number(value) <= maxMarks)) {
                            handleMarkChange(index, value);
                            return;
                          }
                        }}
                        className="border border-[#e5e7eb] p-2 rounded-[10px] w-full min-w-0 text-sm text-[#1f2937] focus:outline-none focus:border-[#123d84] transition-colors"
                      />
                      <span className="text-xs text-[#9ca3af] flex-shrink-0">
                        / {sub.totalMarks ?? 100}
                      </span>
                    </div>

                    {marks[index]?.revaluationUrl ? (
                      <div className="flex items-center justify-between gap-2 bg-gray-100 px-2.5 py-2 rounded-[10px] min-w-0">
                        <span className="flex items-center gap-1.5 text-xs truncate">
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 16 }}
                            className="text-[#123d84] flex-shrink-0"
                          />
                          <span className="truncate">
                            {marks[index].revaluationFileName}
                          </span>
                        </span>

                        <button
                          type="button"
                          title="Remove file"
                          className="text-red-500 cursor-pointer flex-shrink-0 flex items-center"
                          onClick={() => {
                            const updated = [...marks];
                            updated[index].revaluationUrl = "";
                            updated[index].revaluationFileName = "";
                            setMarks(updated);
                          }}
                        >
                          <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ) : revaluationUploadingIndex === index ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
                        Uploading...
                      </div>
                    ) : (
                      <label
                        htmlFor={`revaluation-upload-${sub.subjectCode}`}
                        title="Upload revaluation PDF"
                        className="flex items-center gap-1.5 border border-dashed border-[#c7cede] rounded-[10px] py-1.5 px-2.5 w-fit text-xs text-[#123d84] cursor-pointer hover:border-[#123d84] hover:bg-[#f4f7fd] transition-colors"
                      >
                        <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
                        Upload PDF
                        <input
                          id={`revaluation-upload-${sub.subjectCode}`}
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleRevaluationUpload(index, e)}
                          disabled={revaluationUploadingIndex !== null}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= Footer (natural size, never shrinks) ================= */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#f0f1f5]">
          {formError && <p className="text-[#d92d20] text-xs mb-2.5">{formError}</p>}

          <div className="flex items-center gap-3 mb-3 px-3.5 py-3 rounded-[10px] bg-[#f6f7fb]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#123d84] text-white flex-shrink-0">
              <BarChartIcon sx={{ fontSize: 18 }} />
            </span>
            <div className="text-[13px] text-[#374151]">
              Total: <span className="font-bold text-[#123d84]">{totalMarks} / {maxMarksSum}</span>
              &nbsp;|&nbsp; Average: <span className="font-bold text-[#123d84]">{avgMarks}%</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
                className="px-[22px] py-[11px] border border-[#e5e7eb] rounded-[10px] bg-white text-sm text-[#374151] hover:bg-[#f3f4f6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={performanceLoading}
                onClick={() => {
                  setTermModal(false); // close modal
                  setEditMode(false); // exit edit mode
                  setAcademic(""); // reset academic
                  setMarks([]); // clear marks
                  setSubjects([]); // clear subjects
                  setFormError("");
                  setSem("sem1"); // clear validation error
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePerformance}
                disabled={performanceLoading}
                className={`px-[26px] py-[11px] rounded-[10px] text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity
    ${performanceLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-b from-[#144196] to-[#0b2456] hover:opacity-90"}
  `}
              >
                {performanceLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {editMode ? "Updating..." : "Saving..."}
                  </>
                ) : editMode ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!deleteId}
        onRequestClose={() => setDeleteId(null)}
        style={{
          overlay: { backgroundColor: "rgba(21, 21, 21, 0.6)", zIndex: 1000 },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(350px, 92vw)",
            margin: 0,
            height: "max-content",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            boxShadow: "0 20px 45px rgba(15, 27, 51, 0.25)",
            fontFamily: '"Poppins", sans-serif',
          },
        }}
      >
        <h3 className="text-lg font-semibold mb-4 text-[#123d84]">Delete Record?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this Term / Sem record?
        </p>

        <div className="flex justify-center gap-3">
          <button
            className="px-4 py-2.5 border border-[#e5e7eb] rounded-[10px] text-[#374151] hover:border-[#123d84] hover:text-[#123d84] transition-colors"
            onClick={() => setDeleteId(null)}
            disabled={deleteLoading}
          >
            Cancel
          </button>

          <button
            className="bg-[#d92d20] text-white px-4 py-2.5 rounded-[10px] flex items-center gap-2 hover:brightness-110 transition"
            onClick={confirmDeleteTermSem}
            disabled={deleteLoading}
          >
            {deleteLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Studentdetails;
