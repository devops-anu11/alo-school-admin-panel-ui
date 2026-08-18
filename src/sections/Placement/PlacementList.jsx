import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormControl, MenuItem, Select, InputAdornment, TextField, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import { BiSearchAlt } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { getPlacements, addPlacement, updatePlacement, deletePlacement, getCourseBatch, excelPlacements } from "../../api/Serviceapi";
import Loader from "../../component/loader/Loader";
import Modal from "../../components/modal/Modal";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  InboxIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "../../components/icons/Icons";
import PlacementModal from "./PlacementModal";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import listStyles from "../Studentlist/Studentlist.module.css";
import styles from "./Placement.module.css";

const selectSx = {
  minWidth: 130,
  backgroundColor: "#fff",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const selectInnerSx = {
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  fontSize: "14px",
  padding: "4px 10px",
  height: "42px",
  border: "none",
};

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

const STATUS_STYLE = {
  "In Process": { background: "#fff3e0", color: "#f59e0b" },
  Placed: { background: "#e7f7ee", color: "#12805c" },
  Rejected: { background: "#fdecec", color: "#d92d20" },
};

// Same three statuses, as flat hex - reused by the donut/meter charts below.
// These match the pill colors above (and the app's existing status palette
// used elsewhere for "completed"/"upcoming"/etc pills), so a status means
// the same color everywhere in the app, not just on this page.
const STATUS_COLOR = {
  Placed: "#12805c",
  "In Process": "#f59e0b",
  Rejected: "#d92d20",
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PlacementList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(1);
  const limit = 10;

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [batches, setBatches] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Overall totals for the summary tiles/charts below - independent of the
  // table's filters/pagination above, so they always reflect all placements.
  const [overallTotal, setOverallTotal] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [highestPackage, setHighestPackage] = useState(0);
  const [topCompanies, setTopCompanies] = useState([]);

  const totalPages = Math.ceil(total / limit);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await getPlacements(limit, offset - 1, searchText, status, courseId, batchId);
      setList(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.totalCount || 0);
    } catch (err) {
      console.error(err);
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Pulls every placement record (uncapped by the table's page size) once,
  // and derives every summary number/chart below from that single list
  // client-side, rather than firing a separate request per stat. Assumes
  // the school's total placement count stays comfortably under 1000.
  const fetchSummary = async () => {
    try {
      const res = await getPlacements(1000, 0, "", "");
      const all = res?.data?.data?.data || [];
      const total = res?.data?.data?.totalCount ?? all.length;

      setOverallTotal(total);
      setPlacedCount(all.filter((p) => p.status === "Placed").length);
      setPendingCount(all.filter((p) => p.status === "In Process").length);
      setRejectedCount(all.filter((p) => p.status === "Rejected").length);

      const packages = all
        .map((p) => Number(p.package))
        .filter((n) => !isNaN(n));
      setHighestPackage(packages.length ? Math.max(...packages) : 0);

      const counts = {};
      all.forEach((p) => {
        if (!p.companyName) return;
        counts[p.companyName] = (counts[p.companyName] || 0) + 1;
      });
      setTopCompanies(
        Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [offset, searchText, status, courseId, batchId]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // Batches load once; a batch's own `courses` array supplies the Course
  // filter's options once a batch is picked - mirrors the Student
  // Management filter bar.
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await getCourseBatch();
        setBatches(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!batchId) {
      setCourseOptions([]);
      return;
    }
    const selectedBatch = batches.find((b) => b._id === batchId);
    const options = selectedBatch?.courses || [];
    setCourseOptions(options);
    if (courseId && !options.some((c) => c.courseId === courseId)) {
      setCourseId("");
    }
  }, [batchId, batches]);

  const handleBatchChange = (e) => {
    setOffset(1);
    setBatchId(e.target.value);
    setCourseId("");
  };

  const handleCourseChange = (e) => {
    setOffset(1);
    setCourseId(e.target.value);
  };

  const handleStatusChange = (e) => {
    setOffset(1);
    setStatus(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStatus("");
    setBatchId("");
    setCourseId("");
    setCourseOptions([]);
    setOffset(1);
  };

  const hasActiveFilters =
    searchText.trim() || status || batchId || courseId;

  const getExcel = async () => {
    try {
      const res = await excelPlacements(searchText, status, courseId, batchId);
      let base64String = res.data.data;

      if (!base64String) {
        toast.error("No Excel file data found");
        return;
      }

      base64String = base64String.replace(/\s/g, "");

      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "placementDetails.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Error downloading Excel:", err);
      toast.error(err?.response?.data?.message || "Failed to export placements");
    }
  };

  const handlePageChange = (e, value) => {
    if (value === offset) {
      fetchPlacements();
    } else {
      setOffset(value);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (placement) => {
    setEditing(placement);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        await updatePlacement(payload.id, payload);
        toast.success("Placement updated successfully");
      } else {
        await addPlacement(payload);
        toast.success("Placement added successfully");
      }
      setOffset(1);
      fetchPlacements();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save placement");
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deletePlacement(deleting._id || deleting.id);
      toast.success("Placement deleted successfully");
      setDeleting(null);
      fetchPlacements();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete placement");
    } finally {
      setDeleteLoading(false);
    }
  };

  const placementRate = overallTotal ? Math.round((placedCount / overallTotal) * 1000) / 10 : 0;

  // Donut: three status segments as SVG stroke-dasharray slices around a
  // shared circumference, each separated by a small surface-color gap.
  const RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const GAP = 4;
  const donutTotal = placedCount + pendingCount + rejectedCount;
  const donutSegments = [
    { label: "Placed", value: placedCount, color: STATUS_COLOR.Placed },
    { label: "In Process", value: pendingCount, color: STATUS_COLOR["In Process"] },
    { label: "Rejected", value: rejectedCount, color: STATUS_COLOR.Rejected },
  ];
  let cumulative = 0;
  const donutArcs = donutSegments.map((seg) => {
    const share = donutTotal ? seg.value / donutTotal : 0;
    const length = Math.max(share * CIRCUMFERENCE - GAP, 0);
    const arc = {
      ...seg,
      share,
      dasharray: `${length} ${CIRCUMFERENCE - length}`,
      dashoffset: -cumulative,
    };
    cumulative += share * CIRCUMFERENCE;
    return arc;
  });

  return (
    <div className={listStyles.container}>
      <div className={styles.titleRow}>
        <h4 className={listStyles.heading}>Placement Management</h4>
        <button type="button" className={listStyles.primaryBtn} onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Add Placement
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statTile}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <UsersIcon width={20} height={20} />
          </div>
          <div>
            <p className={styles.statValue}>{overallTotal}</p>
            <p className={styles.statLabel}>Total Students</p>
            <Link to="/students" className={styles.statLink}>
              {/* View all students <ArrowRightIcon width={12} height={12} /> */}
            </Link>
          </div>
        </div>
        <div className={styles.statTile}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <CheckCircleIcon width={20} height={20} />
          </div>
          <div>
            <p className={styles.statValue}>{placedCount}</p>
            <p className={styles.statLabel}>Placed Students</p>
            <p className={styles.statMeta}>{placementRate}% Placement Rate</p>
          </div>
        </div>
        <div className={styles.statTile}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
            <ClockIcon width={20} height={20} />
          </div>
          <div>
            <p className={styles.statValue}>{pendingCount}</p>
            <p className={styles.statLabel}>In Process</p>
            <p className={styles.statMeta}>Ongoing</p>
          </div>
        </div>
        <div className={styles.statTile}>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>
            <XCircleIcon width={20} height={20} />
          </div>
          <div>
            <p className={styles.statValue}>{rejectedCount}</p>
            <p className={styles.statLabel}>Rejected</p>
            <p className={styles.statMeta}>Not Placed</p>
          </div>
        </div>
        <div className={styles.statTile}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>₹</div>
          <div>
            <p className={styles.statValue}>{highestPackage ? `₹${highestPackage}` : "-"}</p>
            <p className={styles.statLabel}>Highest Package</p>
            {highestPackage > 0 && <p className={styles.statMeta}>LPA</p>}
          </div>
        </div>
      </div>

      <div className={styles.overviewRow}>
        <div className={styles.overviewCard}>
          <div className={styles.overviewHead}>
            <h5>Placement Overview</h5>
          </div>
          {donutTotal > 0 ? (
            <div className={styles.donutRow}>
              <svg viewBox="0 0 100 100" width={140} height={140} role="img" aria-label="Placement status breakdown">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#eef0f5" strokeWidth="14" />
                {donutArcs.map((arc) =>
                  arc.value > 0 ? (
                    <circle
                      key={arc.label}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="14"
                      strokeDasharray={arc.dasharray}
                      strokeDashoffset={arc.dashoffset}
                      transform="rotate(-90 50 50)"
                    />
                  ) : null,
                )}
                <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">
                  {placedCount}
                </text>
                <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#9ca3af">
                  Placed
                </text>
              </svg>

              <ul className={styles.donutLegend}>
                {donutArcs.map((arc) => (
                  <li key={arc.label}>
                    <span className={styles.legendDot} style={{ background: arc.color }} />
                    <span className={styles.legendLabel}>
                      {arc.label} ({arc.value})
                    </span>
                    <span className={styles.legendPct}>
                      {donutTotal ? Math.round((arc.value / donutTotal) * 1000) / 10 : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={styles.emptyCard}>
              <InboxIcon width={28} height={28} style={{ color: "#c2c8d4" }} />
              <p>No placement data yet</p>
            </div>
          )}
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.overviewHead}>
            <h5>Top Recruiting Companies</h5>
          </div>
          {topCompanies.length > 0 ? (
            <ul className={styles.companyList}>
              {topCompanies.map((c) => (
                <li key={c.name}>
                  <span className={styles.companyAvatar}>{c.name.charAt(0).toUpperCase()}</span>
                  <span className={styles.companyName}>{c.name}</span>
                  <span className={styles.companyCount}>{c.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyCard}>
              <InboxIcon width={28} height={28} style={{ color: "#c2c8d4" }} />
              <p>No companies yet</p>
            </div>
          )}
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.overviewHead}>
            <h5>Placement Status</h5>
          </div>
          <ul className={styles.meterList}>
            {donutArcs.map((arc) => (
              <li key={arc.label}>
                <div className={styles.meterHead}>
                  <span>{arc.label}</span>
                  <span>
                    {arc.value} ({donutTotal ? Math.round((arc.value / donutTotal) * 1000) / 10 : 0}%)
                  </span>
                </div>
                <div className={styles.meterTrack}>
                  <div
                    className={styles.meterFill}
                    style={{ width: `${arc.share * 100}%`, background: arc.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.pageHeader}>
        <div className={listStyles.filterBar}>
          <div>
            <FormControl variant="outlined" size="small" sx={selectSx}>
              <Select
                value={batchId}
                onChange={handleBatchChange}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={selectInnerSx}
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((b) => (
                  <MenuItem value={b._id} key={b._id}>
                    {b.batchName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div>
            <FormControl variant="outlined" size="small" sx={selectSx}>
              <Select
                value={courseId}
                onChange={handleCourseChange}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={selectInnerSx}
                disabled={!batchId}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courseOptions.map((c) => (
                  <MenuItem value={c.courseId} key={c.courseId}>
                    {c.courseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div>
            <FormControl variant="outlined" size="small" sx={selectSx}>
              <Select
                value={status}
                onChange={handleStatusChange}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={selectInnerSx}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="In Process">In Process</MenuItem>
                <MenuItem value="Placed">Placed</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className={listStyles.searchBox}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search here"
              value={searchText}
              onChange={(e) => {
                setOffset(1);
                setSearchText(e.target.value);
              }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BiSearchAlt style={{ fontSize: 18, color: "#555" }} />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchText("")} edge="end">
                      <CloseIcon style={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                style: {
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  height: "42px",
                  fontSize: "14px",
                  padding: "4px 10px",
                },
                notched: false,
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e5e7eb" },
                minWidth: 120,
                width: "100%",
              }}
            />
          </div>

          <div>
            {hasActiveFilters && (
              <button className={listStyles.clear} onClick={handleClearFilters} title="Clear filters">
                <IoClose />
              </button>
            )}
          </div>

          <div>
            <button type="button" className={listStyles.exportBtn} onClick={getExcel}>
              Export
              <MdOutlineFileDownload />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f5] rounded-xl overflow-hidden mt-4 sm:mt-5">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse" style={{ minWidth: "860px" }}>
            <thead>
              <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Student</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Company</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Role</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Package (LPA)</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Placement Date</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <Loader />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {list?.length > 0 ? (
                  list.map((item) => {
                    const pill = STATUS_STYLE[item.status] || STATUS_STYLE["In Process"];
                    return (
                      <tr
                        key={item._id}
                        className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors"
                      >
                        <td className="px-4 py-3.5 text-sm text-[#374151]">
                          <div className="font-medium text-[#111827]">{item?.studentName || "-"}</div>
                          <div className="text-xs text-[#9ca3af]">{item?.studentIdNo}</div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.companyName || "-"}</td>
                        <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.role || "-"}</td>
                        <td className="px-4 py-3.5 text-sm text-[#374151]">{item?.package ?? "-"}</td>
                        <td className="px-4 py-3.5 text-sm text-[#374151]">{formatDate(item?.placementDate)}</td>
                        <td className="px-4 py-3.5 text-sm">
                          <span className={styles.statusPill} style={pill}>
                            {item?.status || "In Process"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Edit placement for ${item?.studentName}`}
                              className="text-[#123d84] border border-[#123d84] rounded-lg p-1.5 flex items-center cursor-pointer hover:bg-[#123d84] hover:text-white transition-colors"
                              onClick={() => openEdit({ ...item, id: item._id })}
                            >
                              <EditIcon width={15} height={15} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete placement for ${item?.studentName}`}
                              className="text-[#d92d20] border border-[#d92d20] rounded-lg p-1.5 flex items-center cursor-pointer hover:bg-[#d92d20] hover:text-white transition-colors"
                              onClick={() => setDeleting(item)}
                            >
                              <TrashIcon width={15} height={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <InboxIcon width={32} height={32} style={{ color: "#c2c8d4", margin: "0 auto" }} />
                      <p className="text-sm text-[#9ca3af] font-medium mt-2">No Data Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <ThemeProvider theme={theme}>
          <div className="flex justify-end mt-4">
            <Pagination
              count={totalPages}
              page={offset}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
            />
          </div>
        </ThemeProvider>
      )}

      <PlacementModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        placementData={editing}
      />

      <Modal
        open={!!deleting}
        title="Delete Placement"
        onClose={() => !deleteLoading && setDeleting(null)}
        width={420}
      >
        <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>
          This removes the placement record for{" "}
          <strong>{deleting?.studentName}</strong> at{" "}
          <strong>{deleting?.companyName}</strong>. This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-[#6b7280] bg-white border border-[#e5e7eb] rounded-lg cursor-pointer"
            onClick={() => setDeleting(null)}
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#d92d20] rounded-lg cursor-pointer disabled:opacity-70"
            onClick={confirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlacementList;
