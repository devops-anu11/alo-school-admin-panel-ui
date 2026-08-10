import React, { useEffect, useState } from "react";
import styles from "./FeeDetailModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaRegClock } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  createFee,
  getPaymentHistory,
  updateBalanceFee,
  setStudentDiscount,
  removeStudentDiscount,
} from "../../api/Serviceapi";

const emptyForm = { amount: "", date: "", mode: "Cash" };

const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const FeeDetailModal = ({ open, student, onClose, onRequestFee, onPaymentSaved }) => {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountForm, setDiscountForm] = useState("");
  const [discountSaving, setDiscountSaving] = useState(false);

  const studentUserId = student?.userDetails?._id || student?._id;

  useEffect(() => {
    if (open && student) {
      setRows(Array.isArray(student.rows) ? student.rows : []);
      setEditingId(null);
      setForm(emptyForm);
      setDiscountAmount(student.userDetails?.discountAmount || 0);
      setEditingDiscount(false);
      setDiscountForm("");
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  const fetchHistory = async () => {
    if (!studentUserId) return;
    setHistoryLoading(true);
    try {
      const res = await getPaymentHistory(studentUserId);
      setHistory(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!open || !student) return null;

  const startEdit = (row) => {
    setEditingId(editingId === row._id ? null : row._id);
    setForm({ amount: "", date: "", mode: row.modeOfPayment || "Cash" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (row) => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > row.pendingAmount) {
      toast.error(`Amount cannot exceed the pending balance of ${formatAmount(row.pendingAmount)}`);
      return;
    }
    if (!form.date) {
      toast.error("Select a payment date");
      return;
    }

    setSaving(true);
    try {
      const totalPaid = (row.paidAmount || 0) + amount;
      const balancePayload = {
        paidAmount: totalPaid,
        pendingAmount: Math.max(0, row.semFee - totalPaid),
        paymentDate: form.date,
        modeOfPayment: form.mode,
        updatedBy: localStorage.getItem("userId"),
      };

      await updateBalanceFee(row._id, balancePayload);

      // Best-effort receipt/invoice email — failure here should not roll
      // back the fee balance update above.
      try {
        await createFee({
          name: student.userDetails?.name,
          email: student.userDetails?.email,
          courseId: student.courseDetails?._id,
          batchId: student.batchDetails?._id,
          paidAmount: amount,
          noOfsem: row.noOfsem,
          modeOfPayment: form.mode,
          userId: studentUserId,
          studentId: student.userDetails?.studentId,
          paymentDate: form.date,
        });
      } catch (receiptErr) {
        console.error("Receipt email failed, fee balance was still updated:", receiptErr);
      }

      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, ...balancePayload } : r)));
      cancelEdit();
      toast.success("Payment updated successfully!");
      fetchHistory();
      onPaymentSaved && onPaymentSaved();
    } catch (err) {
      console.error("Error updating payment:", err);
      toast.error(err?.response?.data?.message || "Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  const totalFees = rows.reduce((sum, r) => sum + (r.semFee || 0), 0);
  const paidAmount = rows.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const pendingAmount = rows.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);
  // A discount never touches semFee - it's credited into paidAmount instead,
  // so the most it can ever be is whatever's currently pending plus however
  // much of the existing discount is already counted toward that pending.
  const maxDiscount = pendingAmount + discountAmount;

  const applyDiscountToRows = (updatedRows) => {
    if (!Array.isArray(updatedRows)) return;
    setRows((prev) =>
      prev.map((r) => {
        const match = updatedRows.find((u) => u._id === r._id);
        return match ? { ...r, paidAmount: match.paidAmount, pendingAmount: match.pendingAmount } : r;
      }),
    );
  };

  const startEditDiscount = () => {
    setDiscountForm(discountAmount ? String(discountAmount) : "");
    setEditingDiscount(true);
  };

  const cancelEditDiscount = () => {
    setEditingDiscount(false);
    setDiscountForm("");
  };

  const saveDiscount = async () => {
    const amount = Number(discountForm);
    if (discountForm.trim() === "" || Number.isNaN(amount) || amount < 0) {
      toast.error("Enter a valid discount amount");
      return;
    }
    if (amount > maxDiscount) {
      toast.error(`Discount cannot exceed the pending balance of ${formatAmount(maxDiscount)}`);
      return;
    }

    setDiscountSaving(true);
    try {
      const res = await setStudentDiscount(studentUserId, amount);
      applyDiscountToRows(res?.data?.data);
      setDiscountAmount(amount);
      setEditingDiscount(false);
      toast.success("Discount updated successfully!");
      onPaymentSaved && onPaymentSaved();
    } catch (err) {
      console.error("Error updating discount:", err);
      toast.error(err?.response?.data?.message || "Failed to update discount");
    } finally {
      setDiscountSaving(false);
    }
  };

  const removeDiscount = async () => {
    setDiscountSaving(true);
    try {
      const res = await removeStudentDiscount(studentUserId);
      applyDiscountToRows(res?.data?.data);
      setDiscountAmount(0);
      cancelEditDiscount();
      toast.success("Discount removed");
      onPaymentSaved && onPaymentSaved();
    } catch (err) {
      console.error("Error removing discount:", err);
      toast.error(err?.response?.data?.message || "Failed to remove discount");
    } finally {
      setDiscountSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.content}>
        {/* fixed top block: never scrolls away */}
        <div className={styles.pinned}>
          <div className={styles.header}>
            <div className={styles.identity}>
              <div className={styles.avatar}>{initials(student.userDetails?.name)}</div>
              <div>
                <p className={styles.name}>{student.userDetails?.name}</p>
                <p className={styles.subInfo}>
                  {student.userDetails?.studentId} · {student.userDetails?.mobileNo}
                </p>
                <p className={styles.subInfo}>
                  {student.courseDetails?.courseName}
                  {student.batchDetails?.batchName ? ` · ${student.batchDetails.batchName}` : ""}
                </p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Total Fees</p>
              <p className={styles.summaryValue}>{formatAmount(totalFees)}</p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Paid Amount</p>
              <p className={`${styles.summaryValue} ${styles.paidText}`}>{formatAmount(paidAmount)}</p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Pending Fees</p>
              <p className={`${styles.summaryValue} ${pendingAmount === 0 ? styles.paidText : styles.pendingText}`}>
                {formatAmount(pendingAmount)}
              </p>
            </div>
          </div>

          <div className={styles.discountRow}>
            {editingDiscount ? (
              <>
                <label className={styles.discountLabel} htmlFor="discountAmount">Discount</label>
                <input
                  id="discountAmount"
                  className={styles.discountInput}
                  type="number"
                  min="0"
                  max={maxDiscount}
                  placeholder="Amount"
                  value={discountForm}
                  onChange={(e) => setDiscountForm(e.target.value)}
                  autoFocus
                />
                <button className={styles.editBtn} onClick={saveDiscount} disabled={discountSaving}>
                  {discountSaving ? "Saving..." : "Save"}
                </button>
                <button className={styles.requestLink} style={{ color: "#6b7280" }} onClick={cancelEditDiscount}>
                  Cancel
                </button>
              </>
            ) : discountAmount > 0 ? (
              <>
                <span className={styles.discountLabel}>
                  Discount applied: <strong>{formatAmount(discountAmount)}</strong>
                  <span className={styles.discountSticker}> (credited toward paid amount)</span>
                </span>
                <button className={styles.editBtn} onClick={startEditDiscount}>
                  <FaEdit /> Edit
                </button>
                <button
                  className={styles.requestLink}
                  style={{ color: "#d92d20" }}
                  onClick={removeDiscount}
                  disabled={discountSaving}
                >
                  Remove
                </button>
              </>
            ) : (
              <button className={styles.editBtn} onClick={startEditDiscount}>
                + Add Discount
              </button>
            )}
          </div>
        </div>

        {/* everything below scrolls inside the modal, page stays put */}
        <div className={styles.scrollBody}>
          <p className={styles.sectionTitle}>Semester Breakdown</p>
          <div className={styles.tableWrap}>
            <table className={`${styles.table} ${styles.semTable}`}>
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Sem Fee</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Payment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <React.Fragment key={row._id}>
                      <tr className={editingId === row._id ? styles.rowActive : ""}>
                        <td><span className={styles.semBadge}>{row.noOfsem}</span></td>
                        <td>{formatAmount(row.semFee)}</td>
                        <td>{formatAmount(row.paidAmount)}</td>
                        <td>
                          {row.pendingAmount === 0 ? (
                            <span className={styles.pill}>Paid</span>
                          ) : (
                            <span className={styles.pillPending}>{formatAmount(row.pendingAmount)}</span>
                          )}
                        </td>
                        <td>{row.paymentDate ? row.paymentDate.split("T")[0] : "-"}</td>
                        <td>
                          <div className={styles.actionCell}>
                            {row.pendingAmount === 0 ? (
                              <span className={styles.completed}>Completed</span>
                            ) : (
                              <>
                                <span
                                  className={styles.requestLink}
                                  style={{
                                    color: row.mailStatus === "Sent" ? "#144196" : "#d92d20",
                                    cursor: row.mailStatus === "Sent" ? "not-allowed" : "pointer",
                                  }}
                                  onClick={() => {
                                    if (row.mailStatus === "Sent") return;
                                    onRequestFee(row._id);
                                  }}
                                >
                                  {row.mailStatus === "Sent" ? "Requested" : "Remind"}
                                </span>
                                <button
                                  type="button"
                                  className={styles.editBtn}
                                  title="Record a payment"
                                  onClick={() => startEdit(row)}
                                >
                                  <FaEdit /> Add Payment
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {editingId === row._id && (
                        <tr className={styles.editRow}>
                          <td colSpan="6">
                            <div className={styles.editForm}>
                              <div className={styles.editField}>
                                <label>Amount Paid</label>
                                <input
                                  type="number"
                                  placeholder={`Max ${row.pendingAmount}`}
                                  value={form.amount}
                                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                />
                              </div>
                              <div className={styles.editField}>
                                <label>Payment Date</label>
                                <input
                                  type="date"
                                  value={form.date}
                                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                />
                              </div>
                              <div className={styles.editField}>
                                <label>Mode</label>
                                <select
                                  value={form.mode}
                                  onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="Online">Online</option>
                                </select>
                              </div>
                              <div className={styles.editActions}>
                                <button
                                  className={styles.saveBtn}
                                  disabled={saving}
                                  onClick={() => handleSave(row)}
                                >
                                  {saving ? "Saving..." : "Save Payment"}
                                </button>
                                <button className={styles.cancelBtn} disabled={saving} onClick={cancelEdit}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.noData}>No semester records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className={styles.sectionTitle}>
            <FaRegClock style={{ marginRight: 6 }} />
            Payment History {history.length > 0 && <span className={styles.countBadge}>{history.length}</span>}
          </p>
          <div className={styles.historyBox}>
            {historyLoading ? (
              <p className={styles.noData}>Loading...</p>
            ) : history.length > 0 ? (
              <table className={`${styles.table} ${styles.historyTable}`}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sem</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Collected By</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id}>
                      <td>{h.paymentDate ? new Date(h.paymentDate).toLocaleDateString("en-IN") : "-"}</td>
                      <td>{h.noOfsem}</td>
                      <td className={styles.paidText}>{formatAmount(h.paidAmount)}</td>
                      <td>{h.modeOfPayment || "-"}</td>
                      <td>
                        <div className={styles.collector}>
                          <span className={styles.collectorAvatar}>{initials(h.collectedBy?.name)}</span>
                          {h.collectedBy?.name || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noData}>No payments collected yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDetailModal;
