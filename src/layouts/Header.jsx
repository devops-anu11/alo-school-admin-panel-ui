import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import styles from './Header.module.css'
import logo from '../assets/aloschoolimages/logo1.png'
import { IoPieChart } from "react-icons/io5";
import { IoPieChartOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { RiFileList2Line } from "react-icons/ri";
import { PiFlagPennantLight } from "react-icons/pi";
import { RiSettings5Line } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaBullseye } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaExclamationCircle } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { MdTaskAlt } from "react-icons/md";
import { MdOutlineTaskAlt } from "react-icons/md";
import { MdWork, MdOutlineWork } from "react-icons/md";
import { GoBell } from "react-icons/go";
import user_image from '../assets/user.png'
import { IoMdPerson } from "react-icons/io";
import { RiFileList2Fill } from "react-icons/ri";
import { RiStackLine, RiStackFill } from "react-icons/ri";
import { PiFlagPennantFill } from "react-icons/pi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaIdBadge } from "react-icons/fa";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBill } from "react-icons/fa";
import LogoutModal from '../sections/Logout/LogoutModal';
import { getNotification, updateNotification, markAllNotificationsRead, getNotificationCategoryCounts } from '../api/Serviceapi';
import { IoMdCloseCircle } from "react-icons/io";
import { format } from "date-fns";
import { FaRegIdBadge } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';



const Header = ({ setLoginUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [notification, setNotification] = useState(false)
  const [notificationlist, setNotificationlist] = useState([])
  const [isread, setIsread] = useState(false)
  const [isAcademicOpen, setIsAcademicOpen] = useState(false);
// students, attendance and academic share one dropdown
  const isStudentRoute =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/attendence") ||
    location.pathname.startsWith("/academic");

  const [isStudentOpen, setIsStudentOpen] = useState(isStudentRoute);

  // complaint, harassment and both enquiry pages share one dropdown
  const isGrievanceRoute =
    location.pathname.startsWith("/complaint") ||
    location.pathname.startsWith("/harassment") ||
    location.pathname.startsWith("/enquiry");

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(isGrievanceRoute);
  const [isTaskOpen, setIsTaskOpen] = useState(() =>
    location.pathname.startsWith("/tasks"),
  );

  const notificationRef = useRef(null);

  const handleToggleNavbar = () => {
    setIsNavbarOpen(true);
  };

  const handleCloseNavbar = () => {
    setIsNavbarOpen(false);
  };
  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      // Update both width and navbar state in sync
      setWindowWidth(width);

      if (width > 768 && isNavbarOpen) {
        setIsNavbarOpen(false); // Close on desktop
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial check on mount
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isNavbarOpen]);

  const [isLogoutOpen, setIsLogutOpen] = useState(false);


  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('att_courseId');
    localStorage.removeItem('att_batchId');
    localStorage.removeItem('att_status');
    localStorage.removeItem('att_date');
    localStorage.removeItem('att_searchText');
    localStorage.removeItem('activestatus');
    localStorage.removeItem('status');
    localStorage.removeItem('courseId');
    localStorage.removeItem('batchId');
    localStorage.removeItem('searchText');
    sessionStorage.removeItem('studentActiveStatus');
    sessionStorage.removeItem('studentStatus');
    sessionStorage.removeItem('studentCourseId');
    sessionStorage.removeItem('studentBatchId');
    sessionStorage.removeItem('studentSearchText');
    sessionStorage.removeItem('studentPage');
    navigate('/login');
    setLoginUser(false);
  };

  let userName = localStorage.getItem('username');

 useEffect(() => {

  if (userRole !== "sub-admin") {
    notificationget();
    fetchCategoryCounts();

    const interval = setInterval(() => {
      notificationget();
      fetchCategoryCounts();
    }, 60000);

    return () => clearInterval(interval);
  }

}, [userRole]);

  const [count, setCount] = useState(0)
  // Per-sidebar-section unread counts (Leave Management, Complaint,
  // Harassment, both Enquiry types) - independent of `count` above, which
  // is the bell icon's all-categories total.
  const [categoryCounts, setCategoryCounts] = useState({
    leave: 0,
    complaint: 0,
    harassment: 0,
    "enquiry-aloschool": 0,
    "enquiry-littlesteps": 0,
  });
  const enquiryTotalCount =
    categoryCounts.complaint +
    categoryCounts.harassment +
    categoryCounts["enquiry-aloschool"] +
    categoryCounts["enquiry-littlesteps"];

  let notificationget = async () => {
    try {
      const res = await getNotification();
      setNotificationlist(res?.data?.data?.data);
      // console.log(res?.data?.data?.fetchCount, 'ddd')
      setCount(res?.data?.data?.fetchCount)
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

  }

  let fetchCategoryCounts = async () => {
    try {
      const res = await getNotificationCategoryCounts();
      if (res?.data?.data) setCategoryCounts(res.data.data);
    } catch (error) {
      console.error('Error fetching notification category counts:', error);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      // If notification is open AND click is outside the box
      if (notification && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotification(false);
      }
    }

    // Add listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notification]);

  // Which sidebar section a notification belongs to routes it after read;
  // keep in sync with the markSectionRead calls below.
  const categoryRoutes = {
    leave: '/attendence/leaverequest',
    complaint: '/complaint',
    harassment: '/harassment',
    'enquiry-aloschool': '/enquiry/aloschool',
    'enquiry-littlesteps': '/enquiry/littlesteps',
  };

  let updatenotification = async (item) => {
    try {
      await updateNotification(item?._id, true);
      navigate(categoryRoutes[item?.category] || categoryRoutes.leave);
      setNotification(false);
      notificationget();
      // The bell list only marks the one clicked notification read, but the
      // sidebar badge (categoryCounts) is separate state - refresh it too so
      // clicking a notification also clears its section's unread count.
      fetchCategoryCounts();
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  // Landing on a sidebar section's route is treated as "seen" for that
  // section's badge - clear it immediately (optimistic) and mark its
  // notifications read on the server, scoped to just that category so
  // visiting one section doesn't clear the others' badges too. This is
  // keyed off the route itself (not a specific onClick) so it clears
  // regardless of how the user got there - the sidebar link, the
  // Attendance page's "Leave Requests" card arrow, a bell notification
  // click, a direct URL, browser back/forward, etc.
  useEffect(() => {
    const category = Object.keys(categoryRoutes).find(
      (key) => categoryRoutes[key] === location.pathname
    );
    if (!category || userRole === 'sub-admin') return;
    if (!categoryCounts[category]) return; // already 0, nothing to clear

    setCategoryCounts((prev) => ({ ...prev, [category]: 0 }));
    markAllNotificationsRead('admin', category)
      .then(() => {
        notificationget();
        fetchCategoryCounts();
      })
      .catch((error) => console.error('Error marking notifications as read:', error));
  }, [location.pathname]);

  const handleLeaveManagementClick = () => navigate('/attendence/leaverequest');
  const handleComplaintClick = () => navigate('/complaint');
  const handleHarassmentClick = () => navigate('/harassment');
  const handleEnquiryAloSchoolClick = () => navigate('/enquiry/aloschool');
  const handleEnquiryLittleStepsClick = () => navigate('/enquiry/littlesteps');


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const year = date.getUTCFullYear();
    return { day, month, year };
  };



  return (
    <>
      <div className={styles.aloschool}>
        <div className={styles.menu_toggle} onClick={handleToggleNavbar}>
          <IoMenu />
        </div>
        <div
          className={`${styles.navbar} ${windowWidth <= 768 ? (isNavbarOpen ? styles.open : styles.closed) : ""}`}
        >
          <div className={styles.navbar_close} onClick={handleCloseNavbar}>
            <IoMdClose />
          </div>
          <div className={styles.navbar_content}>
            <div>
              <div className={styles.logo}>
                <Link
                  to={userRole === "admin" ? "/dashboard" : "/alumniimages"}
                >
                  <img
                    src={logo}
                    alt="logo"
                    height={"100%"}
                    width={"100%"}
                    style={{
                      filter: "brightness(0) saturate(100%) invert(100%)",
                    }}
                  />
                </Link>
              </div>
            </div>
            <div className={styles.main_navigation}>
              <div className={styles.navigation}>
                {userRole === "admin" && (
                  <>
                    {/* Admin Navigation */}
                    <div className={styles.dashboard}>
                      <button
                        className={`${styles.dashboard_button} ${location.pathname == "/dashboard" ? styles.navactive : ""}`}
                        onClick={() => navigate("/dashboard")}
                      >
                        {location.pathname == "/dashboard" ? (
                          <IoPieChart className={styles.filled_chart_icon} />
                        ) : (
                          <IoPieChartOutline
                            className={styles.outline_chart_icon}
                          />
                        )}
                        Dashboard
                      </button>
                    </div>
                    <div className={styles.attendance}>
                      <button
                        className={`${styles.attendance_button} ${location.pathname == "/course" || location.pathname.startsWith("/course/coursedetails") ? styles.navactive : ""}`}
                        onClick={() => navigate("/course")}
                      >
                        {location.pathname == "/course" ||
                        location.pathname.startsWith(
                          "/course/coursedetails",
                        ) ? (
                          <RiFileList2Fill
                            className={styles.filled_list_icon}
                          />
                        ) : (
                          <RiFileList2Line
                            className={styles.outline_list_icon}
                          />
                        )}
                        Course
                      </button>
                    </div>
                    <div className={styles.attendance}>
                      <button
                        className={`${styles.attendance_button} ${location.pathname.startsWith("/batch") ? styles.navactive : ""}`}
                        onClick={() => navigate("/batch")}
                      >
                        {location.pathname.startsWith("/batch") ? (
                          <RiStackFill className={styles.filled_list_icon} />
                        ) : (
                          <RiStackLine className={styles.outline_list_icon} />
                        )}
                        Batch
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          location.pathname.startsWith("/tasks")
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => setIsTaskOpen(!isTaskOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {location.pathname.startsWith("/tasks") ? (
                            <MdTaskAlt className={styles.filled_settings_icon} />
                          ) : (
                            <MdOutlineTaskAlt
                              className={styles.outline_settings_icon}
                            />
                          )}
                          Task Management
                        </div>

                        {isTaskOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isTaskOpen && (
                        <div className={styles.submenu}>
                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/tasks"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/tasks")}
                          >
                            Task List
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/tasks/settings"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/tasks/settings")}
                          >
                            Task Settings
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          isStudentRoute ? styles.navactive : ""
                        }`}
                        onClick={() => setIsStudentOpen(!isStudentOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isStudentRoute ? (
                            <IoMdPerson className={styles.filled_person_icon} />
                          ) : (
                            <BsPerson className={styles.outline_person_icon} />
                          )}
                          Student Management
                          {!isStudentOpen && categoryCounts.leave > 0 && (
                            <span className={styles.countBadge}>{categoryCounts.leave}</span>
                          )}
                        </div>

                        {isStudentOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isStudentOpen && (
                        <div className={styles.submenu}>
                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/students")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/students")}
                          >
                            Students
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/attendence") &&
                              !location.pathname.startsWith("/attendence/leaverequest")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/attendence")}
                          >
                            Attendance
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/attendence/leaverequest")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleLeaveManagementClick}
                          >
                            Leave Management
                            {categoryCounts.leave > 0 && (
                              <span className={`${styles.countBadge} ${styles.countBadgeRight}`}>
                                {categoryCounts.leave}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname.startsWith("/academic")
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={() => navigate("/academic")}
                          >
                            Academic
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.fees}>
                      <button
                        className={`${styles.fees_button} ${location.pathname == "/fees" ? styles.navactive : ""}`}
                        onClick={() => navigate("/fees")}
                      >
                        {location.pathname == "/fees" ? (
                          <FaMoneyBill />
                        ) : (
                          <LiaMoneyBillSolid
                            className={styles.outline_fee_icon}
                          />
                        )}
                        Fee Management
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          isGrievanceRoute ? styles.navactive : ""
                        }`}
                        onClick={() => setIsEnquiryOpen(!isEnquiryOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isGrievanceRoute ? (
                            <FaExclamationCircle
                              className={styles.filled_settings_icon}
                            />
                          ) : (
                            <FaRegCommentDots
                              className={styles.outline_settings_icon}
                            />
                          )}
                          Enquiry &amp; Complaints
                          {!isEnquiryOpen && enquiryTotalCount > 0 && (
                            <span className={styles.countBadge}>{enquiryTotalCount}</span>
                          )}
                        </div>

                        {isEnquiryOpen ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>

                      {isEnquiryOpen && (
                        <div className={styles.submenu}>
                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/complaint"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleComplaintClick}
                          >
                            Complaint
                            {categoryCounts.complaint > 0 && (
                              <span className={`${styles.countBadge} ${styles.countBadgeRight}`}>
                                {categoryCounts.complaint}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/harassment"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleHarassmentClick}
                          >
                            Harassment
                            {categoryCounts.harassment > 0 && (
                              <span className={`${styles.countBadge} ${styles.countBadgeRight}`}>
                                {categoryCounts.harassment}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/enquiry/aloschool"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleEnquiryAloSchoolClick}
                          >
                            ALO School Enquiry
                            {categoryCounts["enquiry-aloschool"] > 0 && (
                              <span className={`${styles.countBadge} ${styles.countBadgeRight}`}>
                                {categoryCounts["enquiry-aloschool"]}
                              </span>
                            )}
                          </button>

                          <button
                            className={`${styles.settings_button} text-sm ${
                              location.pathname === "/enquiry/littlesteps"
                                ? styles.navactive
                                : ""
                            }`}
                            onClick={handleEnquiryLittleStepsClick}
                          >
                            ALO LittleSteps Enquiry
                            {categoryCounts["enquiry-littlesteps"] > 0 && (
                              <span className={`${styles.countBadge} ${styles.countBadgeRight}`}>
                                {categoryCounts["enquiry-littlesteps"]}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.events}>
                      <button
                        className={`${styles.events_button} ${location.pathname == "/events" ? styles.navactive : ""}`}
                        onClick={() => navigate("/events")}
                      >
                        {location.pathname == "/events" ? (
                          <PiFlagPennantFill
                            className={styles.filled_flag_icon}
                          />
                        ) : (
                          <PiFlagPennantLight
                            className={styles.outline_flag_icon}
                          />
                        )}
                        Events
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${location.pathname == "/application" ? styles.navactive : ""}`}
                        onClick={() => navigate("/application")}
                      >
                        {location.pathname == "/application" ? (
                          <FaIdBadge className={styles.outline_settings_icon} />
                        ) : (
                          <FaRegIdBadge
                            className={styles.filled_settings_icon}
                          />
                        )}
                        Application
                      </button>
                    </div>
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${location.pathname.startsWith("/placement") ? styles.navactive : ""}`}
                        onClick={() => navigate("/placement")}
                      >
                        {location.pathname.startsWith("/placement") ? (
                          <MdWork className={styles.filled_settings_icon} />
                        ) : (
                          <MdOutlineWork
                            className={styles.outline_settings_icon}
                          />
                        )}
                        Placement Management
                      </button>
                    </div>

                  </>
                )}

                {userRole === "sub-admin" && (
                  <>
                    {/* Alumni Images */}
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          location.pathname === "/alumniimages"
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/alumniimages")}
                      >
                        <FaIdBadge className={styles.outline_settings_icon} />
                        Alumni Images
                      </button>
                    </div>

                    {/* Student Work */}
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          location.pathname === "/studentwork"
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/studentwork")}
                      >
                        <RiFileList2Line
                          className={styles.outline_settings_icon}
                        />
                        Student Work
                      </button>
                    </div>

                    {/* Add Event */}
                    <div className={styles.settings}>
                      <button
                        className={`${styles.settings_button} ${
                          location.pathname === "/addevent"
                            ? styles.navactive
                            : ""
                        }`}
                        onClick={() => navigate("/addevent")}
                      >
                        <PiFlagPennantLight
                          className={styles.outline_settings_icon}
                        />
                        Add Event
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.login_details} style={{ marginLeft: "auto" }}>
              <div
                className={styles.userdetails}
                onClick={() => setIsLogutOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={styles.user_image}
                  style={{ cursor: "pointer" }}
                >
                  <img src={user_image} alt="" height={"100%"} width={"100%"} />
                </div>
                <div className={styles.user_name}>
                  <p
                    className={styles.admin_user}
                    style={{ cursor: "pointer" }}
                  >
                    {userName}
                  </p>
                  <p className={styles.user_role}>
                    {userRole === "admin" ? "Super Admin" : userRole === "sub-admin" ? "Sub Admin" : "User"}
                  </p>
                </div>
              </div>
              {userRole !== "sub-admin" && (
                <button
                  type="button"
                  className={`${styles.notification_icon} ${count > 0 ? styles.hasUnread : ""}`}
                  onClick={() =>
                    Array.isArray(notificationlist) &&
                    notificationlist.length > 0 &&
                    setNotification(!notification)
                  }
                  aria-label="Notifications"
                >
                  <GoBell />
                  {count > 0 && <span className={styles.dot}></span>}
                </button>
              )}
              <button
                type="button"
                className={styles.notification_icon}
                onClick={() => setIsLogutOpen(true)}
                aria-label="Logout"
                title="Logout"
              >
                <RiLogoutCircleLine />
              </button>
            </div>
          </div>

          <div
            className={styles.Outlet}
            style={{ flex: 1, minHeight: 0, overflow: "auto" }}
          >
            <Outlet />
          </div>
        </div>
      </div>

      {isLogoutOpen && (
        <LogoutModal
          onConfirmLogout={handleLogout}
          closeModal={() => setIsLogutOpen(false)}
        />
      )}
      {notification && (
        <div className={styles.notification}>
          <div ref={notificationRef} className={styles.notification_content}>
            <div className={styles.notification_header}>
              <p className={styles.notification_title}>Notifications</p>
              <span
                className={styles.notification_close}
                onClick={() => setNotification(false)}
              >
                <IoMdCloseCircle />
              </span>
            </div>
            <div className={styles.notification_scrollArea}>
              {notificationlist.map((item, index) => {
                const { day, month, year } = formatDate(item.date);
                const firstLetter = item.message?.charAt(0).toUpperCase(); // Get first letter

                return (
                  <div
                    key={item?._id || index}
                    className={styles.notification_box}
                    onClick={() => {
                      updatenotification(item);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">
                          {firstLetter}
                        </div>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            textTransform: "capitalize",
                          }}
                          className={`${item.isRead ? "" : styles.notification_read}`}
                        >
                          {item.message}
                        </p>

                        <span className="text-xs text-gray-400">
                          {day} {month} {year}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;