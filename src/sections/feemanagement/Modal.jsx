import { useState } from "react";
import styles from "./Modal.module.css";
import { emailFee, updateFeeEmail } from "../../api/Serviceapi";
const Modal = ({
  isOpen,
  onClose,
  children,
  sendReqColor,
  setReqSendColor,
  status,
  id,
  list
}) => {
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;
  function close() {
    if (sending) return;
    onClose();
  }
  async function sendReq() {
    setSending(true);
    try {
      await email();
      await update();
      setReqSendColor(true);
      list();
      status('Requested Fee');
      onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  }

 let update = async () => {
      let res = await updateFeeEmail(id)
      console.log(res)
  }

  let email = async () => {
      let res = await emailFee(id)
      console.log(res)
  }
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* {children} */}
        <div className={styles.div}>Are you sure want to send request?</div>
        <div className={styles.button}>
          <div className={`${styles.btn} ${styles.extraClass}`}>
            <button
              className={styles.gradientbutton1}
              role="button"
              onClick={close}
              disabled={sending}
            >
              Cancel
            </button>
          </div>

          <div className={styles.btn}>
            <button className={styles.gradientbutton2} onClick={sendReq} disabled={sending}>
              {sending ? "Sending..." : "Send request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Modal;
