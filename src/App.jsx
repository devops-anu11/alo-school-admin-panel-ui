import { useEffect, useState } from 'react';
import PrivateRoute from './api/PrivateRoute';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashborad from './sections/Dashborad/Dashborad';
import Login from './sections/Login/Login';
import Studentdetails from './sections/Studentdetails/Studentdetails';
import Studentlist from './sections/Studentlist/Studentlist';
import Header from './layouts/Header';
import Addstudent from './sections/Addstudent/Addstudent';
import CourseTable from './sections/CourseDetails/CourseTable';
import Attendance from './sections/AttendancePage/Attendance';
import Eventlist from './sections/Eventlist/Eventlist';
import FeeHome from './sections/feemanagement/FeeHome';
import LeaveRequest from './sections/Leaverequestmodel/Leaverequest';
import CourseDetails from './sections/CourseDetails/CourseDetails';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Enquiry from './sections/Enquiry/Aloschool/Enquiry';
import Application from './sections/Application/Application';
import Details from './sections/details/Details';
import TermExam from './sections/Academicdetails/TermExam';
import SemesterExam from './sections/Academicdetails/SemExam';
import Subjects from './sections/CourseDetails/Subjects';
import AlumniImages from './sections/subAdmin/aluminiImage/AlunimiImage';
import StudentWork from "./sections/subAdmin/studentWork/StudentWork";
import AddEvent from "./sections/subAdmin/addEvent/AddEvent";
import LittleStepsEnquiry from "./sections/Enquiry/littleSteps/LittleEnquiry"
import Complaint from './sections/Complaint/Complaint';
import Harassement from './sections/Harassment/Harassement';
import TaskManagement from './sections/Task/TaskManagement';
import TaskSettings from './sections/Task/TaskSettings';
import TaskCourseDetail from './sections/Task/TaskCourseDetail';
import BatchList from './sections/Batch/BatchList';
import BatchDetailsPage from './sections/Batch/BatchDetails';
import PlacementList from './sections/Placement/PlacementList';
import {
  addBatch,
  addCourse,
  editCouse,
  getAllCourses,
  getCourseBatch,
  removeBatch,
  setPrimaryBatch,
  updateCourseBatch,
} from './api/Serviceapi';

// The course module returns _id; normalize to `id` so the batch pages
// (which expect `course.id`) keep working against real course data.
const normalizeCourse = (c) => ({ ...c, id: c._id });

// "HH:mm" (24h, what the backend stores) -> "hh:mm AM/PM" (what the batch
// UI displays and what CreateBatchModal round-trips through its own form).
const to12Hour = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

// "hh:mm AM/PM" -> "HH:mm" (24h, what the backend expects)
const to24Hour = (time12) => {
  if (!time12) return '';
  const match = time12.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return time12;
  let hour = parseInt(match[1], 10);
  const period = match[3].toUpperCase();
  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

// The backend returns full ISO datetimes ("2026-08-01T00:00:00.000Z"), but
// <input type="date"> needs a plain "YYYY-MM-DD" or it just renders blank.
const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  return String(isoDate).split('T')[0];
};

// The batch module returns _id/isActive/classStartTime.../sem1FeeDate...;
// normalize to the field names the (still UI-only) batch pages already use.
const normalizeBatch = (b) => ({
  ...b,
  id: b._id,
  active: b.isActive !== false,
  startDate: toDateInputValue(b.startDate),
  endDate: toDateInputValue(b.endDate),
  classStartIn: to12Hour(b.classStartTime),
  classEndIn: to12Hour(b.classEndTime),
  sem1PayDate: toDateInputValue(b.sem1FeeDate),
  sem2PayDate: toDateInputValue(b.sem2FeeDate),
  studentsCount: b.studentCount ?? 0,
  activeStudentsCount: b.activeStudentCount ?? 0,
  inactiveStudentsCount: b.inactiveStudentCount ?? 0,
});

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await getAllCourses();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setCourses(list.map(normalizeCourse));
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      toast.error(err?.response?.data?.message || 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchBatches = async () => {
    setBatchesLoading(true);
    try {
      const res = await getCourseBatch();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBatches(list.map(normalizeBatch));
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      toast.error(err?.response?.data?.message || 'Failed to load batches');
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    // isAuthenticated only reflects a token's *presence* in localStorage
    // (see the mount check above), not whether it's actually valid for this
    // session - a stale token can leave it true while still sitting on
    // /login. Skip the fetch there so a dead/stale token doesn't surface
    // error toasts on the login screen.
    if (!isAuthenticated || location.pathname === '/login') return;
    fetchCourses();
    fetchBatches();
  }, [isAuthenticated, location.pathname]);

  const handleCreateCourse = async (course) => {
    try {
      const res = await addCourse(course);
      setCourses((prev) => [normalizeCourse(res.data.data), ...prev]);
      toast.success('Course created successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create course');
      throw err;
    }
  };

  const handleEditCourse = async (id, payload) => {
    try {
      const res = await editCouse(id, payload);
      // the update response doesn't include batchCount, so merge onto the
      // existing entry rather than replacing it outright
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...normalizeCourse(res.data.data) } : c)),
      );
      toast.success('Course updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update course');
      throw err;
    }
  };

  const handleSaveBatch = async (batch) => {
    const payload = {
      batchName: batch.batchName,
      admissionFee: batch.admissionFee,
      startDate: batch.startDate,
      endDate: batch.endDate,
      classStartTime: to24Hour(batch.classStartIn),
      classEndTime: to24Hour(batch.classEndIn),
      sem1FeeDate: batch.sem1PayDate,
      sem2FeeDate: batch.sem2PayDate,
      courses: batch.courses?.map((c) => ({
        courseId: c.courseId,
        sem1Amount: c.sem1Amount,
        sem2Amount: c.sem2Amount,
      })),
    };

    try {
      if (batch.id) {
        const res = await updateCourseBatch(batch.id, payload);
        setBatches((prev) =>
          prev.map((b) => (b.id === batch.id ? normalizeBatch(res.data.data) : b)),
        );
        toast.success('Batch updated successfully');
      } else {
        const res = await addBatch(payload);
        setBatches((prev) => [normalizeBatch(res.data.data), ...prev]);
        toast.success('Batch created successfully');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save batch');
      // Re-throw so the modal knows the save failed and stays open instead
      // of closing as if it succeeded.
      throw err;
    }
  };

  const handleDeleteBatch = async (id) => {
    try {
      await removeBatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
      toast.success('Batch deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete batch');
    }
  };

  const handleToggleBatchActive = async (id) => {
    const target = batches.find((b) => b.id === id);
    if (!target) return;
    try {
      const res = await updateCourseBatch(id, { isActive: !target.active });
      setBatches((prev) => prev.map((b) => (b.id === id ? normalizeBatch(res.data.data) : b)));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update batch status');
    }
  };

  const handleSetPrimaryBatch = async (id) => {
    try {
      await setPrimaryBatch(id);
      // only one batch is ever primary — flip it locally rather than refetch
      setBatches((prev) => prev.map((b) => ({ ...b, isPrimary: b.id === id })));
      toast.success('Primary batch updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to set primary batch');
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={<Login setLoginUser={setIsAuthenticated} />}
        />

        <Route
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} loading={loading} />
          }
        >
          <Route path="/dashboard" element={<Header />}>
            <Route index element={<Dashborad />} />
          </Route>

          <Route path="/students" element={<Header />}>
            <Route index element={<Studentlist />} />
            <Route path="studentview/:id" element={<Studentdetails />} />
            <Route path="addstudent" element={<Addstudent />} />
          </Route>

          <Route path="/Fees" element={<Header />}>
            <Route index element={<FeeHome />} />
          </Route>

          <Route path="/attendence" element={<Header />}>
            <Route index element={<Attendance />} />
            <Route
              path="leaverequest/:date?/:courseId?/:batchId?/:searchText?"
              element={<LeaveRequest />}
            />
          </Route>
          <Route path="/academic" element={<Header />}>
            <Route index element={<SemesterExam />} />
          </Route>

          <Route path="/tasks" element={<Header />}>
            <Route index element={<TaskManagement />} />
            <Route path="settings" element={<TaskSettings />} />
            <Route path="detail/:courseId" element={<TaskCourseDetail />} />
          </Route>

          <Route path="/complaint" element={<Header />}>
            <Route index element={<Complaint/>} />
          </Route>

          <Route path="/harassment" element={<Header />}>
            <Route index element={<Harassement/>} />
          </Route>

          <Route path="/events" element={<Header />}>
            <Route index element={<Eventlist />} />
          </Route>
          <Route path="/enquiry" element={<Header />}>
            {/* default → /enquiry */}
            <Route index element={<Enquiry />} />

            {/* ✅ ALO School */}
            <Route path="aloschool" element={<Enquiry />} />

            {/* ✅ ALO LittleSteps */}
            <Route path="littlesteps" element={<LittleStepsEnquiry />} />
          </Route>
          <Route path="/application" element={<Header />}>
            <Route index element={<Application />} />
            <Route path="details/:id" element={<Details />} />
          </Route>

          <Route path="/placement" element={<Header />}>
            <Route index element={<PlacementList />} />
          </Route>

          <Route
            path="/course"
            element={<Header setLoginUser={setIsAuthenticated} />}
          >
            <Route
              index
              element={
                <CourseTable
                  courses={courses}
                  loading={coursesLoading}
                  onCreateCourse={handleCreateCourse}
                  onEditCourse={handleEditCourse}
                />
              }
            />
            <Route path="coursedetails/:id" element={<CourseDetails />} />
            <Route path="Subjects/:id/:batchId" element={<Subjects />} />
          </Route>

          <Route path="/batch" element={<Header />}>
            <Route
              index
              element={
                <BatchList
                  batches={batches}
                  courses={courses}
                  loading={batchesLoading}
                  onSaveBatch={handleSaveBatch}
                  onDeleteBatch={handleDeleteBatch}
                  onToggleActive={handleToggleBatchActive}
                  onSetPrimary={handleSetPrimaryBatch}
                />
              }
            />
            <Route
              path=":batchId"
              element={
                <BatchDetailsPage
                  batches={batches}
                  courses={courses}
                  loading={batchesLoading}
                  onSaveBatch={handleSaveBatch}
                />
              }
            />
          </Route>

          <Route path="/alumniimages" element={<Header />}>
            <Route index element={<AlumniImages />} />
          </Route>

          <Route path="/studentwork" element={<Header />}>
            <Route index element={<StudentWork />} />
          </Route>

          <Route path="/addevent" element={<Header />}>
            <Route index element={<AddEvent />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
export default App