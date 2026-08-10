// src/api/userService.js
import { FaCertificate } from "react-icons/fa6";
import apiService from "./apiService";
import Form from "antd/es/form/Form";
import { useState } from "react";

export const getUserFilter = (value) => {
  return apiService.get(`/user?value=${value}`);
};
export const getBatch = () => {
  return apiService.get(`/batch`);
};

export const getUserId = (id) => {
  return apiService.get(`/user?id=${id}`);
};

export const LoginUser = (email, password) => {
  return apiService.post(`/user/login`, { email, password });
};

//postcourse
export const postCourse = (courseData) => {
  return apiService.post(`/course/create`, courseData);
};

export const getCourse = (limit, offset) => {
  return apiService.get(`/course/count?limit=${limit}&page=${offset}`);
};

//getcoursebyid
export const getCourseById = (id) => {
  return apiService.get(`/course/count?courseId=${id}`);
};
//editcourse
export const editCouse = (id, editData) => {
  return apiService.put(`/course/${id}`, editData);
};

// Course Management page (modules/course) — list already includes batchCount per course
export const getAllCourses = () => {
  return apiService.get(`/course`);
};

export const addCourse = (courseData) => {
  return apiService.post(`/course`, courseData);
};

export const removeCourse = (id) => {
  return apiService.delete(`/course/${id}`);
};
//getbatch
export const getCourseBatch = () => {
  return apiService.get(`/batch`);
};
//postbatch
export const postCourseBatch = (data) => {
  return apiService.post(`/batch/create`, data);
};
//putbatch
export const updateCourseBatch = (id, editdata) => {
  return apiService.put(`/batch/${id}`, editdata);
};

// Batch Management page (modules/batch) — list/detail already include
// courseCount, studentCount and totalFees computed server-side
export const getBatchById = (id, status = "active") => {
  return apiService.get(`/batch/${id}?status=${status}`);
};

export const addBatch = (batchData) => {
  return apiService.post(`/batch`, batchData);
};

export const removeBatch = (id) => {
  return apiService.delete(`/batch/${id}`);
};

export const setPrimaryBatch = (id) => {
  return apiService.put(`/batch/${id}/primary`);
};

// get batch by courseId
export const getCourseBatchByCourseId = (courseId, limit, offset) => {
  return apiService.get(
    `/batch?courseId=${courseId}&limit=${limit}&page=${offset}`,
  );
};

export const addUser = (FormData) => {
  let data = {
    name: FormData.name,
    email: FormData.student_email,
    mobileNo: FormData.student_mobile,
    fatherName: FormData.student_father,
    alterMobileNo: FormData.parent_number,
    address: FormData.student_address,
    blood: FormData.student_bloodgroup,
    qualification: FormData.student_qualification,
    aadharURL: FormData.student_aadhar,
    certificateURL: FormData.student_original,
    profileURL: FormData.student_profile,
    courseId: FormData.student_course,
    batchId: FormData.student_batch,
    DOB: FormData.student_dob,
    createdBy: localStorage.getItem("userId"),
  };
  return apiService.post(`/user/create`, data);
};

export const updateUser = (FormData, id) => {
  let data = {
    name: FormData.name,
    email: FormData.student_email,
    mobileNo: FormData.student_mobile,
    fatherName: FormData.student_father,
    alterMobileNo: FormData.parent_number,
    address: FormData.student_address,
    blood: FormData.student_bloodgroup,
    qualification: FormData.student_qualification,
    aadharURL: FormData.student_aadhar,
    certificateURL: FormData.student_original,
    profileURL: FormData.student_profile,
    courseId: FormData.student_course,
    batchId: FormData.student_batch,
    DOB: FormData.student_dob,
    inStatus: FormData.inStatus,
    ID: FormData.ID,
  };
  return apiService.put(`/user/${id}`, data);
};

export const updatedetailsuser = (status, id) => {
  return apiService.put(`/user/${id}`, { status });
};

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file); // key name must be 'file'

  return apiService.post("file/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteUserId = (id) => {
  return apiService.delete(`user/${id}`);
};

export const getBatchName = () => {
  return apiService.get(`/batch/batch`);
};

export const getBatchbyid = (id) => {
  return apiService.get(`/batch/batch?courseId=${id}`);
};

// events
export const getEvents = (limit, offset, status) => {
  return apiService.get(
    `/event?limit=${limit}&offset=${offset}&status=${status}`,
  );
};

export const getEventcreate = (formdata) => {
  return apiService.post(`/event/create`, formdata);
};

export const deleteEvent = (id) => {
  return apiService.delete(`/event/${id}`);
};

export const updateEvent = (formdata, id) => {
  let data = {
    title: formdata.title,
    description: formdata.description,
    date: formdata.date,
    time: formdata.time,
    eventType: formdata.eventType,
  };
  return apiService.put(`/event/${id}`, data);
};

export const getEventById = (id) => {
  return apiService.get(`/event/${id}`);
};

// attendence
export const getAttendance = (
  limit,
  offset,
  searchtext,
  courseId,
  batchId,
  date,
  status,
) => {
  let url = `/attendance/admin?limit=${limit}&page=${offset}&value=${searchtext}&courseId=${courseId}&batchId=${batchId}&date=${date}`;

  if (status !== "") {
    url += `&onLeave=${status}`;
  }

  return apiService.get(url);
};

export const getAttendancerate = (date, courseId, batchId) => {
  return apiService.get(
    `/attendance/rate?date=${date}&courseId=${courseId}&batchId=${batchId}`,
  );
};

// leave request

export const getLeaveRequest = (
  limit,
  offset,
  date,
  status,
  value,
  courseId,
  batchId,
  leaveType,
) => {
  return apiService.get(
    `/leave?limit=${limit}&offset=${offset}&date=${date}&status=${status}&value=${value}&courseId=${courseId}&batchId=${batchId}&leaveType=${leaveType}`,
  );
};

export const getLeaveRequestById = (id) => {
  return apiService.get(`/leave?_id=${id}`);
};

export const updateLeaveRequest = (id, status, adminId, reason) => {
  let reasonType = "";
  if (status === "Rejected") {
    reasonType = "rejectReason";
  } else {
    reasonType = "approvedReason";
  }
  return apiService.put(`/leave/${id}`, {
    status: status,
    approverId: adminId,
    [reasonType]: reason,
  });
};

// fee

export const getFee = (
  limit,
  offset,
  courseId,
  batchId,
  semester,
  searchtext,
) => {
  return apiService.get(
    `/feeBalance?limit=${limit}&offset=${offset}&courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchtext}`,
  );
};

export const createFee = (formdata) => {
  return apiService.post(`/fee/create`, formdata);
};

export const calcfee = (courseId, batchId, semester, searchText) => {
  return apiService.get(
    `/feeBalance/dasboard?courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchText}`,
  );
};

// dashboard

// export const createBalanceFee = (formdata) => {
//   return apiService.post(`/feeBalance`, formdata);
// };

export const updateBalanceFee = (userId, payload) => {
  return apiService.put(`/feeBalance/${userId}`, payload);
};

export const emailFee = (userId) => {
  return apiService.post(`/feeBalance/mail`, { _id: userId });
};

export const updateFeeEmail = (id) => {
  return apiService.put(`/feeBalance/${id}`, { mailStatus: "Sent" });
};

export const getPaymentHistory = (userId) => {
  return apiService.get(`/paymentLog/user/${userId}`);
};

// Student discount - add/edit share the same PUT (whatever amount is sent
// becomes the new total discount); remove is a DELETE that zeroes it.
export const setStudentDiscount = (userId, discountAmount) => {
  return apiService.put(`/feeBalance/discount/${userId}`, { discountAmount });
};

export const removeStudentDiscount = (userId) => {
  return apiService.delete(`/feeBalance/discount/${userId}`);
};

export const getDashboardUser = (batchId = "") => {
  return apiService.get(`/user?limit=3&inStatus=ongoing&status=active${batchId ? `&batchId=${batchId}` : ""}`);
};

export const getDashboardEvents = (status) => {
  return apiService.get(`/event?status=${status}&limit=6`);
};

export const getDashboardLeave = (status, batchId = "") => {
  const today = new Date().toLocaleDateString("en-CA");

  return apiService.get(`/leave?status=${status}&date=${today}&limit=5${batchId ? `&batchId=${batchId}` : ""}`);
};

export const studentCount = (batchId = "") => {
  return apiService.get(`/user/count${batchId ? `?batchId=${batchId}` : ""}`);
};

export const getStudentAttendencemonth = (userId) => {
  return apiService.get(`/leave/month?userId=${userId}`);
};

export const getAttendanceStudentList = (userId) => {
  return apiService.get(`/attendance?userId=${userId}&limit=4`);
};

export const getTodayrate = (batchId = "") => {
  const today = new Date().toLocaleDateString("en-CA");
  return apiService.get(`/attendance/rate?date=${today}${batchId ? `&batchId=${batchId}` : ""}`);
};

export const getDashboardAttendencerate = (date, batchId = "") => {
  return apiService.get(`/attendance/rate?date=${date}${batchId ? `&batchId=${batchId}` : ""}`);
};

// notification

export const getNotification = () => {
  return apiService.get(`/notification?notificationType=admin`);
};

export const updateNotification = (id, read) => {
  return apiService.put(`/notification/${id}`, { isRead: read });
};

// enquiry

export const getEnquiry = (limit, offset, enroll) => {
  return apiService.get(
    `/aloEnroll?limit=${limit}&page=${offset}&enrollType=${enroll}`,
  );
};
export const getLittleStepsEnquiry = (limit, page) => {
  return enquiryapi.get(`/littlestep-enquiry?limit=${limit}&page=${page}`);
};

//application

export const getApplication = (limit, offset) => {
  return apiService.get(`/student?limit=${limit}&page=${offset}`);
};

export const getApplicationByid = (id) => {
  return apiService.get(`/student/${id}`);
};

export const excelStudents = (
  courseId,
  batchId,
  status,
  activestatus,
  searchText,
) => {
  return apiService.get(
    `/user/excel?courseId=${courseId}&inStatus=${status}&batchId=${batchId}&status=${activestatus}&value=${searchText}`,
  );
};

export const excelfee = (courseId, batchId, semester, searchText) => {
  return apiService.get(
    `/feeBalance/excel?&courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchText}`,
  );
};

export const excelAttendance = (
  searchtext,
  courseId,
  batchId,
  date,
  status,
) => {
  let url = `/attendance/excel?value=${searchtext}&courseId=${courseId}&batchId=${batchId}&date=${date}`;

  if (status !== "") {
    url += `&onLeave=${status}`;
  }

  return apiService.get(url);
};

export const excelPerformance = (
  courseId,
  batchId,
  semester,
  value,
  academic,
) => {
  return apiService.get(
    `/performance/excel?courseId=${courseId}&batchId=${batchId}&exam=${semester}&Academic=${academic}&value=${value}`,
  );
};

export const makeabsent = (id, discription) => {
  const userId = sessionStorage.getItem("userId");
  const date = new Date().toLocaleDateString("en-CA");
  return apiService.post(`/leave/admin/create`, {
    userId: id,
    date: date,
    approverId: userId,
    discription: discription,
  });
};

export const attendancestudentrate = (userid, fromdate, todate) => {
  return apiService.get(
    `attendance/studentrate?userId=${userid}&fromDate=${fromdate}&toDate=${todate}`,
  );
};
// export const getUserByStudentId = (studentId) => {
//   return apiService.get(`/user?studentId=${studentId}`);
// };

// term / sem (performance)

export const createTermSem = (payload) => {
  return apiService.post("/performance/send", payload);
};

// export const getUsers = (params = {}) => {
//   return apiService.get("/user", {
//     params: params   // ✅ THIS IS REQUIRED
//   });
// };

export const getUser = (
  limit,
  offset,
  value,
  courseId,
  status,
  batchId,
  activestatus,
) => {
  return apiService.get(
    `/user?limit=${limit}&offset=${offset}&value=${value}&courseId=${courseId}&inStatus=${status}&batchId=${batchId}&status=${activestatus}`,
  );
};

export const getPerformance = (
  limit,
  offset,
  courseId,
  batchId,
  semester,
  value,
  academic,
) => {
  return apiService.get(
    `/performance?limit=${limit}&page=${offset}&courseId=${courseId}&batchId=${batchId}&exam=${semester}&Academic=${academic}&value=${value}`,
  );
};

export const getSubjects = (courseId, batchId, semester) => {
  return apiService.get(
    `/subject?&courseId=${courseId}&batchId=${batchId}&exam=${semester}`,
  );
};

export const addsubject = (id, payload) => {
  return apiService.post(`/subject/`, payload);
};

export const updatesubject = (id, payload) => {
  return apiService.put(`/subject/${id}`, payload);
};
export const Performanceuser = (id) => {
  return apiService.get(`/performance?userId=${id}`);
};
export const updateTermSem = (id, payload) => {
  return apiService.put(`/performance/${id}`, payload);
};

export const deleteTermSem = (id) => {
  return apiService.delete(`/performance/${id}`);
};
// term wise toppers
export const getDashboardTermToppers = (
  academic,
  semester,
  courseId,
  batchId,
) => {
  return apiService.get(
    `/performance/leaderboard?Academic=${academic}&exam=${semester}&courseId=${courseId}&batchId=${batchId}`,
  );
};

// semester wise toppers
export const getDashboardSemesterToppers = (semester) => {
  return apiService.get("/performance/leaderboard", {
    params: {
      Academic: semester,
    },
  });
};
export const createAlumni = (payload) => {
  return apiService.post("/alumni", payload, {});
};

export const getAlumniList = () => {
  return apiService.get("/alumni?model=alumni");
};

export const createWebsiteEvent = (payload) => {
  return apiService.post("/eventWebsite", payload);
};

export const getWebsiteEvents = (eventName) => {
  return apiService.get("/eventWebsite", {
    params: { eventName }, // ?eventName=pongal
  });
};

export const getStudentWork = () => {
  return apiService.get("/alumni?model=work");
};

export const createStudentWork = (payload) => {
  return apiService.post("/alumni", payload);
};
export const updateAlumni = (id, formData) => {
  return apiService.put(`/alumni/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteAlumni = (id) => {
  return apiService.delete(`/alumni/${id}`);
};
export const updateStudentWork = (id, formData) => {
  return apiService.put(`/alumni/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔹 Delete Student Work
export const deleteStudentWork = (id) => {
  return apiService.delete(`/alumni/${id}`);
};
export const deleteWebsiteEvent = (id) => {
  return apiService.delete(`/eventWebsite/${id}`);
};
export const updateWebsiteEvent = (id, payload) => {
  return apiService.put(`/eventWebsite/${id}`, payload);
};

export const getFeeBalance = (userId) => {
  return apiService.get(`/feeBalance/user/${userId}`);
};
export const updateFeeBalance = (feeBalanceId, payload) => {
  return apiService.put(`/feeBalance/${feeBalanceId}`, payload);
};

export const getAllComplaints = (page = 1, limit = 10) => {
  return apiService.get(`/complaint/get-all?page=${page}&limit=${limit}`);
};

export const updateComplaintStatus = (id, status) => {
  return apiService.put(`/complaint/update-status/${id}`, {
    status,
  });
};



export const getAllHarassment = (page = 1, limit = 10) => {
  return apiService.get(`/harassment/get-all?page=${page}&limit=${limit}`);
};

export const markHarassmentAsRead = (id) => {
  return apiService.put(`/harassment/read/${id}`);
};

// admin task list, grouped by subject for a given date/course/batch
export const getGroupedTasks = (params = {}) => {
  return apiService.get(`/daily-task/admin/grouped-by-subject`, params);
};

// admin task list, grouped by student — who submitted, and what — for a given date/course/batch
export const getGroupedTasksByStudent = (params = {}) => {
  return apiService.get(`/daily-task/admin/grouped`, params);
};

export const updateTaskStatus = (id, status) => {
  return apiService.put(`/daily-task/update-status/${id}`, {
    status,
  });
};

// daily task hours - powers the Time tab of task settings
export const getDailyTaskHours = () => {
  return apiService.get(`/daily-task-hour`);
};

export const updateDailyTaskHour = (id, payload) => {
  return apiService.put(`/daily-task-hour/${id}`, payload);
};

// daily task subjects - powers the Subject tab of task settings, and can be
// narrowed to a course (optionally + semester) for the course detail report
export const getDailyTaskSubjects = (params = {}) => {
  return apiService.get(`/daily-task-subject`, params);
};

export const createDailyTaskSubject = (payload) => {
  return apiService.post(`/daily-task-subject/create`, payload);
};

export const updateDailyTaskSubject = (id, payload) => {
  return apiService.put(`/daily-task-subject/${id}`, payload);
};

export const deleteDailyTaskSubject = (id) => {
  return apiService.delete(`/daily-task-subject/${id}`);
};

// trainers - powers the Trainer tab of task settings
export const getTrainers = () => {
  return apiService.get(`/admin/trainer`);
};

export const createTrainer = (payload) => {
  return apiService.post(`/admin/trainer/create`, payload);
};

export const updateTrainer = (id, payload) => {
  return apiService.put(`/admin/trainer/${id}`, payload);
};

export const deleteTrainer = (id) => {
  return apiService.delete(`/admin/trainer/${id}`);
};