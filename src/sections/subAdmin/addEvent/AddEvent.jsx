import React, { useState, useEffect } from "react";
import styles from "./addevent.module.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import AddEventModal from "../../../model/addEventModel/AddEventModel";
import { getWebsiteEvents, deleteWebsiteEvent } from "../../../api/Serviceapi";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const AddEvent = () => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // loader for fetch
  const [overlayLoading, setOverlayLoading] = useState(false); // loader for add/edit/delete
  const [editEvent, setEditEvent] = useState(null);
  const [expandedImages, setExpandedImages] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handleOpen = () => {
    setEditEvent(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const openEditModal = (event) => {
    setEditEvent(event);
    setOpen(true);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [events.length]);

  const fetchEvents = async (eventName = "") => {
    try {
      setLoading(true); // show loader
      const res = await getWebsiteEvents(eventName);
      const list = res?.data?.data?.data || [];
      const formatted = list.map((item) => ({
        id: item._id,
        name: item.eventName,
        images: item.eventImage || [],
      }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
    setTimeout(() => {
      setLoading(false);
    }, 500); // delay so loader visible
  }
  };

  // Delete flow with confirmation
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      setOverlayLoading(true); // show overlay loader
      await deleteWebsiteEvent(eventToDelete.id);
      await fetchEvents(); // refresh list
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setOverlayLoading(false); // hide overlay loader
    }
  };

  const addEventOptimistic = (event) => {
    setEvents((prev) => [event, ...prev]);
  };

  const paginatedEvents = events.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>Events</h2>

          <div className={styles.card} style={{ position: "relative" }}>
            {/* Overlay loader for add/edit/delete */}
            {overlayLoading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                  backdropFilter: "blur(2px)",
                }}
              >
                <CircularProgress />
              </Box>
            )}

            <div className={styles.addRow}>
              <button className={styles.addBtn} onClick={handleOpen}>
                + Add Event
              </button>
            </div>

            <div className={styles.tableWrapper}>
             {loading ? (
  <div className={styles.loaderCenter}>
    <CircularProgress />
  </div>
) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Event Image</th>
                      <th>Event Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan="3">
                          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.8 }}>
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                              alt="empty"
                              width={120}
                              style={{ marginBottom: 10,margin:"auto"}}
                            />
                            <p>No Events Yet</p>
                            <small>Add your first event to get started</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedEvents.map((event) => (
                        <tr key={event.id}>
                          <td>
                           <div style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: 250 }}>
  {event.images.length ? (
    <>
      {(expandedImages[event.id]
        ? event.images
        : event.images.slice(0, 2)
      ).map((img, i) => (
        <img
          key={i}
          src={img}
          className={styles.thumbnail}
          alt=""
        />
      ))}

      {event.images.length > 2 && (
        <span
          onClick={() =>
            setExpandedImages((prev) => ({
              ...prev,
              [event.id]: !prev[event.id],
            }))
          }
          style={{
            alignSelf: "center",
            fontSize: 13,
            color: "#1976d2",
            cursor: "pointer",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {expandedImages[event.id]
            ? "Show less"
            : `+${event.images.length - 2} more`}
        </span>
      )}
    </>
  ) : (
    <img src="/no-image.png" className={styles.thumbnail} alt="" />
  )}
</div>
                          </td>
                          <td>{event.name}</td>
                          <td className={styles.actions}>
                            <FiEdit className={styles.icon} onClick={() => openEditModal(event)} />
                            <FiTrash2 className={styles.icon} onClick={() => confirmDelete(event)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && events.length > rowsPerPage && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                <Stack>
                  <Pagination
                    count={Math.ceil(events.length / rowsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      <AddEventModal
        open={open}
        handleClose={() => {
          setOpen(false);
          setEditEvent(null);
        }}
        editEvent={editEvent}
        refreshEvents={fetchEvents}
        setOverlayLoading={setOverlayLoading}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !overlayLoading && setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{eventToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={overlayLoading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={overlayLoading}>
            {overlayLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEvent;