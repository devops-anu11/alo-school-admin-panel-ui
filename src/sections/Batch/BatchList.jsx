import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BatchList.module.css";
import CreateBatchModal from "./CreateBatchModal";
import {
  PlusIcon,
  LayersIcon,
  EditIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  BookIcon,
  StarIcon,
} from "../../components/icons/Icons";
import Loader from "../../component/loader/Loader";

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BatchList = ({
  batches,
  courses,
  loading,
  onSaveBatch,
  onDeleteBatch,
  onToggleActive,
  onSetPrimary,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (batch) => {
    setEditing(batch);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>
          Batches
          <span className={styles.count}>{batches.length}</span>
        </h2>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={courses.length === 0}
          title={courses.length === 0 ? "Create a course first" : undefined}
          onClick={openCreate}
        >
          <PlusIcon width={17} height={17} />
          Create Batch
        </button>
      </div>

      {loading ? (
        <section className={styles.card}>
          <div className={styles.empty}>
            <Loader />
          </div>
        </section>
      ) : batches.length === 0 ? (
        <section className={styles.card}>
          <div className={styles.empty}>
            <LayersIcon width={38} height={38} />
            <h3>No batches yet</h3>
            {courses.length === 0 ? (
              <p>Create a course first, then create a batch with it.</p>
            ) : (
              <>
                <p>Create your first batch and attach courses to it.</p>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={openCreate}
                >
                  <PlusIcon width={17} height={17} />
                  Create Batch
                </button>
              </>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className={styles.grid}>
            {batches.map((b) => {
              const isActive = b.active !== false;
              // Admission fee is a one-time, per-student charge — total it as
              // students × fee, not summed again per course in the batch.
              const totalAdmissionFees = (b.studentsCount ?? 0) * (Number(b.admissionFee) || 0);
              return (
                <article key={b.id} className={styles.batchCard}>
                  <header className={styles.cardHead}>
                    <span className={styles.batchIcon}>
                      <LayersIcon width={20} height={20} />
                    </span>
                    <div className={styles.cardTitle}>
                      <h3>{b.batchName}</h3>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${b.isPrimary ? styles.starActive : ""}`}
                        aria-label={
                          b.isPrimary
                            ? `${b.batchName} is the primary batch`
                            : `Make ${b.batchName} the primary batch`
                        }
                        title={
                          b.isPrimary
                            ? "Primary batch — used as the default filter across other screens"
                            : "Set as primary batch"
                        }
                        disabled={b.isPrimary}
                        onClick={() => onSetPrimary(b.id)}
                      >
                        <StarIcon width={15} height={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={`Edit ${b.batchName}`}
                        onClick={() => openEdit(b)}
                      >
                        <EditIcon width={15} height={15} />
                      </button>
                    </div>
                  </header>

                  <div className={styles.statRow}>
                    <div className={styles.miniStat}>
                      <UsersIcon width={16} height={16} />
                      <strong>{b.studentsCount ?? 0}</strong>
                      <small>Students</small>
                    </div>
                    <div className={styles.miniStat}>
                      <BookIcon width={16} height={16} />
                      <strong>{b.courses?.length || 0}</strong>
                      <small>Courses</small>
                    </div>
                    <div className={styles.miniStat}>
                      <span className={styles.rupee}>₹</span>
                      <strong>{totalAdmissionFees.toLocaleString("en-IN")}</strong>
                      <small>Total Admission Fee</small>
                    </div>
                  </div>

                  <ul className={styles.meta}>
                    <li>
                      <CalendarIcon width={15} height={15} />
                      {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </li>
                    <li>
                      <ClockIcon width={15} height={15} />
                      {b.classStartIn} – {b.classEndIn}
                    </li>
                    <li>
                      <CalendarIcon width={15} height={15} />
                      Sem 1 Fee Date&nbsp;
                      <strong>{formatDate(b.sem1PayDate)}</strong>
                    </li>
                  </ul>

                  <footer className={styles.cardFoot}>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => navigate(`/batch/${b.id}`)}
                    >
                      <EyeIcon width={15} height={15} />
                      View Details
                    </button>
                    <label
                      className={styles.switch}
                      title={isActive ? "Set inactive" : "Set active"}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        aria-label={`${b.batchName} active status`}
                        onChange={() => onToggleActive(b.id)}
                      />
                      <span className={styles.slider} aria-hidden="true" />
                    </label>
                  </footer>
                </article>
              );
            })}
          </div>

          <p className={styles.showing}>
            Showing 1 – {batches.length} of {batches.length}{" "}
            {batches.length === 1 ? "Batch" : "Batches"}
          </p>
        </>
      )}

      <CreateBatchModal
        open={modalOpen}
        onClose={closeModal}
        onSave={onSaveBatch}
        courses={courses}
        batchData={editing}
      />
    </div>
  );
};

export default BatchList;
