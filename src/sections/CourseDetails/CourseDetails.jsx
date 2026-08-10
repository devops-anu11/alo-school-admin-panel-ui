import React, { useEffect, useState } from "react";
import styles from "./courseDetails.module.css";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; 
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import nodata from '../../assets/nodata.jpg'
import Skeleton from '@mui/material/Skeleton';
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCourseById,
  getCourseBatch,
  updateCourseBatch,
  getCourseBatchByCourseId,
} from "../../api/Serviceapi";
import { toast, ToastContainer } from 'react-toastify';
import { FaArrowRightLong } from "react-icons/fa6";


import EditCourseModal from "./EditCourseModel";
import CreateBatchModal from "./CreateBatchModal";
import Pagination from "@mui/material/Pagination";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Loader from "../../component/loader/Loader";
import Modal from 'react-modal';

const theme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          color: "#1f2937",
          "&.Mui-selected": {
            background: "linear-gradient(to bottom, #144196, #0b2456)",
            color: "#fff",
            border: "none",
          },
          "&:hover": {
            backgroundColor: "#f5f8ff",
          },
        },
      },
    },
  },
});

const CourseDetails = () => {
  const [limit, setLimit] = useState(4);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalItems);
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState([]);
  const [editTable, setEditTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [totalstudent, settotalstudent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseloading, setCourseLoading] = useState(false);
  const [completedStudentCount, setCompletedStudentCount] = useState(0);

  const goBack = () => {
    navigate(-1);
  };

  const handlePageChange = (event, value) => {
    setBatches([]);
    setPage(value);
    fetchBatch(value);
  };

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / limit);
    setTotalPages(totalPages);
  }, [totalItems, limit]);

 
  const fetchCourse = async () => {
    setCourseLoading(true);

    try {
      const res = await getCourseById(id);

      setFormData(res.data.data.data || []);
      settotalstudent(res.data.data.studentTotalCount || 0);
      setCompletedStudentCount(res.data.data.completedStudentCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setCourseLoading(false);
    }
  };
  useEffect(() => {
    fetchCourse();
  }, [id]);


  const fetchBatch = async () => {
    try {
      setLoading(true);
      const offset = (page - 1);
      const res = await getCourseBatchByCourseId(id, limit, offset);
      setBatches(res.data.data.data || []);
      setTotalItems(res?.data?.data?.totalCount);
    } catch (err) {
      console.error("Error fetching batch:", err);
    } finally {
      setLoading(false);
    }
  };
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    fetchBatch();
  }, [id, page, limit]);

  const handleEdit = () => {
    formData.map((ele) => {
      if (ele.studentCount >= 0) {
        setEditTable(true);
      } else return;
    });
  };

  const handleEditCards = (batchId) => {
    const batchToEdit = batches.find((b) => b._id === batchId);
    setSelectedBatch(batchToEdit);
    setShowModal(true);
  };

  const handleDeleteCards = async (batch) => {
    try {
      await updateCourseBatch(batch._id, { ...batch, deleted: true });
      setBatches((prev) => prev.filter((b) => b._id !== batch._id));
      console.log("Batch marked as deleted:", batch._id);
    } catch (err) {
      console.error("Error deleting batch:", err);
    }
  };

  const [delid, setId] = useState([])


 return (
   <div className={styles.container}>
     <ToastContainer />

     {/* Header */}
     <div className={styles.header}>
       <button className={styles.backBtn} onClick={goBack}>
         <FontAwesomeIcon icon={faArrowLeft} />
       </button>

       <p>Course Overview</p>
     </div>

     {/* Course Overview */}
     <div className={styles.diplomatable}>
       {courseloading ? (
         <div className={styles.loadingText}>
           <Loader />
         </div>
       ) : (
         formData.map((course) => (
           <div className={styles.courseCard} key={course._id}>
             <div className={styles.courseHeader}>
               <h2 className={styles.courseTitle}>{course.courseName}</h2>

               <div className={styles.tableheadicon} onClick={handleEdit}>
                 <FaPencilAlt />
                 <span>Edit</span>
               </div>
             </div>

             <div className={styles.courseInfoGrid}>
               <div className={styles.infoCard}>
                 <p className={styles.infoLabel}>Duration</p>
                 <h3 className={styles.infoValue}>{course.duration} Year</h3>
               </div>

               <div className={styles.infoCard}>
                 <p className={styles.infoLabel}>Semesters</p>
                 <h3 className={styles.infoValue}>{course.noOfSem}</h3>
               </div>

               <div className={styles.infoCard}>
                 <p className={styles.infoLabel}>Total Students</p>
                 <h3 className={styles.infoValue}>{totalstudent}</h3>
               </div>

               <div className={styles.infoCard}>
                 <p className={styles.infoLabel}>Ongoing Students</p>

                 <h3 className={`${styles.infoValue} ${styles.ongoingText}`}>
                   {course.studentCount}
                 </h3>
               </div>

               <div className={styles.infoCard}>
                 <p className={styles.infoLabel}>Completed Students</p>

                 <h3 className={`${styles.infoValue} ${styles.completedText}`}>
                   {completedStudentCount}
                 </h3>
               </div>
             </div>
           </div>
         ))
       )}

       <EditCourseModal
         visible={editTable}
         onCancel={() => setEditTable(false)}
         formData={formData}
         id={id}
         onUpdate={fetchCourse}
       />
     </div>

     {/* Batch Section */}
     <div className={styles.diplomacard}>
       <div className={styles.cardcreate}>
         <h2 className={styles.batchHeading}>Batches</h2>

         <div
           className={styles.createbtn}
           onClick={() => {
             console.log("Clicked");
             setShowModal(true);
           }}
         >
           <FontAwesomeIcon icon={faPlus} />
           <span>Create Batch</span>
         </div>
       </div>

       <div className={styles.cards}>
         {loading ? (
           <div className={styles.loadingText}>
             <Loader />
           </div>
         ) : batches.length > 0 ? (
           batches.map((batch) => {
             const isComplete = new Date(batch.endDate) < new Date();

             return (
               <div className={styles.divcards} key={batch._id}>
                 <div className={styles.batchTop}>
                   <p className={styles.divcardspara1}>{batch.batchName}</p>

                   <Link to={`/course/Subjects/${id}/${batch._id}`}>
                     <FaArrowRightLong className={styles.arrowIcon} />
                   </Link>
                 </div>

                 <p className={styles.studentCount}>
                   Students :<strong> {batch.noOfStudents}</strong>
                 </p>

                 <div className={styles.datesection}>
                   <div>
                     <p className={styles.datesectionpara1}>Sem 1 Fee Date</p>

                     <p className={styles.datesectionpara2}>
                       {new Date(batch.sem1PayDate).toLocaleDateString()}
                     </p>
                   </div>

                   <div>
                     <p className={styles.datesectionpara1}>Sem 2 Fee Date</p>

                     <p className={styles.datesectionpara2}>
                       {new Date(batch.sem2PayDate).toLocaleDateString()}
                     </p>
                   </div>
                 </div>

                 <div className={styles.iconsection}>
                   <div className={styles.icondiv}>
                     <div
                       className={styles.iconsectionsvg}
                       onClick={() => handleEditCards(batch._id)}
                     >
                       <FaPencilAlt />
                     </div>

                     <div
                       className={styles.iconsectionsvg}
                       onClick={() => {
                         setDeleteOpen(true);
                         setId(batch);
                       }}
                     >
                       <FaTrash color="#d92d20" />
                     </div>
                   </div>

                   <div
                     className={isComplete ? styles.complete : styles.ongoing}
                   >
                     {isComplete ? "Completed" : "Ongoing"}
                   </div>
                 </div>
               </div>
             );
           })
         ) : (
           <div className={styles.loadingText}>
             <img src={nodata} alt="No Data" width={200} />
             <p>No Data Found</p>
           </div>
         )}
       </div>

       <div className={styles.paginationWrapper}>
         {totalPages > 0 && (
           <>
             <ThemeProvider theme={theme}>
               <Pagination
                 count={totalPages}
                 page={page}
                 onChange={handlePageChange}
                 showFirstButton
                 showLastButton
               />
             </ThemeProvider>

             <p className={styles.paginationInfo}>
               Showing {startIndex} – {endIndex} of {totalItems} Batches
             </p>
           </>
         )}
       </div>
       <CreateBatchModal
         visible={showModal}
         onClose={() => {
           setShowModal(false);
           setSelectedBatch(null);
         }}
         id={id}
         batchData={selectedBatch}
         onBatchCreated={() => {
           fetchBatch();
           fetchCourse();
         }}
       />
     </div>
   </div>
 );
};

export default CourseDetails;