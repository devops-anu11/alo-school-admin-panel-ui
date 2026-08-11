import React, { useEffect, useState } from "react";
import styles from "./Harassement.module.css";
import { getAllHarassment, markHarassmentAsRead } from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import Pagination from "@mui/material/Pagination";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

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

const Harassement = () => {
  const [harassment, setHarassment] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHarassment(page);
  }, [page]);

  const fetchHarassment = async (currentPage) => {
    try {
      setLoading(true);

      const res = await getAllHarassment(currentPage, limit);

      console.log(res.data);

      setHarassment(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch harassment reports.", {
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

  const [markingReadId, setMarkingReadId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpanded = (id) =>
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleMarkAsRead = async (id) => {
    setMarkingReadId(id);
    try {
      await markHarassmentAsRead(id);

      toast.success("Marked as read successfully!", {
        autoClose: 1000,
        closeButton: false,
      });

      fetchHarassment(page);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to mark as read.", {
        autoClose: 1000,
        closeButton: false,
      });
    } finally {
      setMarkingReadId(null);
    }
  };

  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Harassment Management</h2>

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
                    <th>Email</th>
                    <th>Message</th>
                    <th>Read Status</th>
                  </tr>
                </thead>

                <tbody>
                  {harassment.length > 0 ? (
                    harassment.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString("en-GB")}
                        </td>

                        <td>{item.studentId?.name}</td>

                        <td>{item.studentId?.email}</td>

                        <td>
                          <div
                            className={`${styles.message} ${
                              expandedIds.has(item._id) ? styles.messageExpanded : ""
                            }`}
                          >
                            {item.message}
                          </div>
                          {item.message && item.message.length > 120 && (
                            <button
                              type="button"
                              className={styles.readMoreBtn}
                              onClick={() => toggleExpanded(item._id)}
                            >
                              {expandedIds.has(item._id) ? "Show less" : "Read more"}
                            </button>
                          )}
                        </td>

                        <td>
                          {item.isRead ? (
                            <span className={styles.readStatus}>Read</span>
                          ) : (
                            <button
                              className={styles.readBtn}
                              onClick={() => handleMarkAsRead(item._id)}
                              disabled={markingReadId === item._id}
                            >
                              {markingReadId === item._id ? "Marking..." : "Mark as Read"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.noData}>
                        <InboxOutlinedIcon sx={{ fontSize: 32, color: "#c2c8d4" }} />
                        <p className={styles.noDataText}>No Harassment Reports Found</p>
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
                Showing {startIndex} - {endIndex} of {total} reports
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Harassement;
