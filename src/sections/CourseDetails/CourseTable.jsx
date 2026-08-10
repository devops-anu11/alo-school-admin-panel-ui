import styles from "./CourseTable.module.css";
import AddCourseModal from "./AddCourseModel";
import { useState } from "react";
import { BookIcon, EditIcon, PlusIcon } from "../../components/icons/Icons";
import Loader from "../../component/loader/Loader";

const CourseTable = ({ courses, loading, onCreateCourse, onEditCourse }) => {
  const [formState, setFormState] = useState({ open: false, course: null });

  const openCreate = () => setFormState({ open: true, course: null });
  const openEdit = (course) => setFormState({ open: true, course });
  const closeForm = () => setFormState({ open: false, course: null });

  const handleSubmit = (payload) => {
    if (formState.course) {
      onEditCourse(formState.course.id, payload);
    } else {
      onCreateCourse(payload);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>
          Courses
          <span className={styles.headCount}>{courses.length}</span>
        </h2>
        <button type="button" className={styles.primaryBtn} onClick={openCreate}>
          <PlusIcon width={17} height={17} />
          Add Course
        </button>
      </div>

      <section className={styles.card}>
        {loading ? (
          <div className={styles.empty}>
            <Loader />
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.empty}>
            <BookIcon width={38} height={38} />
            <h3>No courses yet</h3>
            <p>Create your first course. Courses are shared across batches.</p>
            <button type="button" className={styles.primaryBtn} onClick={openCreate}>
              <PlusIcon width={17} height={17} />
              Add Course
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Semesters</th>
                  <th>Used In</th>
                  <th className={styles.actionsCol}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className={styles.nameCell}>
                        <span className={styles.courseIcon}>
                          <BookIcon width={17} height={17} />
                        </span>
                        {c.courseName}
                      </span>
                    </td>
                    <td>
                      {c.duration} {c.duration === 1 ? "Year" : "Years"}
                    </td>
                    <td>{c.noOfSem}</td>
                    <td>
                      <span className={styles.batchChip}>
                        {c.batchCount || 0}{" "}
                        {c.batchCount === 1 ? "Batch" : "Batches"}
                      </span>
                    </td>
                    <td className={styles.actionsCol}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        aria-label={`Edit ${c.courseName}`}
                        onClick={() => openEdit(c)}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddCourseModal
        open={formState.open}
        course={formState.course}
        onClose={closeForm}
        onSubmit={handleSubmit}
        existingCourses={courses}
      />
    </div>
  );
};

export default CourseTable;
