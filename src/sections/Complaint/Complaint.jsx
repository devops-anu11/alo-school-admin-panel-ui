import React, { useEffect, useState } from "react";
import styles from "./Complaint.module.css";
import { getAllComplaints, updateComplaintStatus } from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import Pagination from "@mui/material/Pagination";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";

const theme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          color: "#1f2937",

          "&.Mui-selected": {
            background: "linear-gradient(to bottom, #144196, #061530)",
            color: "#fff",
            border: "none",
          },

          "&:hover": {
            backgroundColor: "#f3f4f6",
          },
        },
      },
    },
  },
});

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComplaints(page);
  }, [page]);

  const fetchComplaints = async (currentPage) => {
    try {
      setLoading(true);

      const res = await getAllComplaints(currentPage, limit);

      setComplaints(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch complaints.", {
        autoClose: 1000,
        closeButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleStatus = async (id, status) => {
    try {
      await updateComplaintStatus(id, status);

      toast.success(`Complaint ${status} successfully!`, {
        autoClose: 1000,
        closeButton: false,
      });

      fetchComplaints(page);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to update complaint status.",
        {
          autoClose: 1000,
          closeButton: false,
        },
      );
    }
  };

  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Complaint Management</h2>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Summary</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.length > 0 ? (
                    complaints.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString("en-GB")}
                        </td>

                        <td>{item.studentId?.name}</td>

                        <td>{item.summary}</td>

                        <td>
                          <div className={styles.message}>{item.message}</div>
                        </td>

                        <td>
                          {item.status === "pending" ? (
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.acceptBtn}
                                onClick={() => handleStatus(item._id, "accepted")}
                              >
                                Accept
                              </button>

                              <button
                                className={styles.rejectBtn}
                                onClick={() => handleStatus(item._id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`${styles.status} ${
                                item.status === "accepted"
                                  ? styles.accepted
                                  : styles.rejected
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.noData}>
                        No Complaints Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 0 && (
            <div className={styles.paginationWrapper}>
              <ThemeProvider theme={theme}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                />
              </ThemeProvider>

              <p className={styles.showing}>
                Showing {startIndex} - {endIndex} of {total} complaints
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Complaint;
