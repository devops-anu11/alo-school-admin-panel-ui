import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import Pagination from '@mui/material/Pagination';
import { ThemeProvider } from '@mui/material/styles';
import { CalendarDays, Clock, MapPin, Plus, Pencil, Trash2, Globe, CalendarX, ImageOff } from 'lucide-react';
import { getWorkshops, addWorkshop, updateWorkshop, deleteWorkshop } from '../../api/Serviceapi';
import Loader from '../../component/loader/Loader';
import Modal from '../../components/modal/Modal';
import WorkshopModal from './WorkshopModal';
import { paginationTheme, formatDate, formatTime } from './workshopUtils';

const thClass = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left";

const WorkshopManagement = () => {
    const limit = 10;
    const [workshops, setWorkshops] = useState([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(1);
    const [loader, setLoader] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const totalPages = Math.ceil(total / limit);
    const activeWorkshop = workshops.find((w) => w.isActive);

    const fetchWorkshops = async () => {
        setLoader(true);
        try {
            const res = await getWorkshops(limit, offset - 1);
            setWorkshops(res?.data?.data?.data || []);
            setTotal(res?.data?.data?.totalCount || 0);
        } catch (err) {
            console.log(err);
            setWorkshops([]);
            setTotal(0);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, [offset]);

    const handlePageChange = (event, value) => {
        if (value === offset) {
            fetchWorkshops();
        } else {
            setOffset(value);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleSave = async ({ id, ...payload }) => {
        try {
            if (id) {
                await updateWorkshop(id, payload);
                toast.success("Workshop updated successfully");
            } else {
                await addWorkshop(payload);
                toast.success("Workshop added successfully");
            }
            fetchWorkshops();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save workshop");
            throw err;
        }
    };

    const setActive = async (item) => {
        try {
            // the API updates only the fields sent and switches the previously live workshop off
            await updateWorkshop(item._id, { isActive: true });
            toast.success(`"${item.title}" is now shown on the website`);
            fetchWorkshops();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to activate workshop");
        }
    };

    const confirmDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            await deleteWorkshop(deleting._id);
            toast.success("Workshop deleted successfully");
            setDeleting(null);
            fetchWorkshops();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete workshop");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            {/* live-on-website banner */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 p-5 rounded-2xl bg-gradient-to-r from-[#144196] to-[#1e5bd8] text-white shadow-sm'>
                <div className='flex items-start gap-4 min-w-0'>
                    <div className='w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0'>
                        <Globe size={22} />
                    </div>
                    <div className='min-w-0'>
                        <p className='text-xs uppercase tracking-wider text-white/70 font-medium'>Live on website</p>
                        {activeWorkshop ? (
                            <>
                                <p className='text-lg font-semibold truncate'>{activeWorkshop.title}</p>
                                <div className='flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/85'>
                                    <span className='flex items-center gap-1.5'><CalendarDays size={14} />{formatDate(activeWorkshop.date)}</span>
                                    <span className='flex items-center gap-1.5'><Clock size={14} />{formatTime(activeWorkshop.startTime)} – {formatTime(activeWorkshop.endTime)}</span>
                                    {activeWorkshop.venue && <span className='flex items-center gap-1.5'><MapPin size={14} />{activeWorkshop.venue}</span>}
                                </div>
                            </>
                        ) : (
                            <p className='text-base font-medium text-white/90'>
                                {loader ? 'Loading…' : total > 0 ? 'No active workshop on this page' : 'No workshop is live yet — add one to show it on the website.'}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#123d84] bg-[#a8ff00] rounded-xl cursor-pointer shrink-0 hover:brightness-95 hover:-translate-y-0.5 transition-all shadow"
                    onClick={openCreate}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Workshop
                </button>
            </div>

            <div className='flex items-center justify-between mb-3'>
                <p className='text-sm text-[#374151] font-semibold'>All Workshops <span className='ml-1 px-2 py-0.5 rounded-full bg-[#e6edf9] text-[#123d84] text-xs'>{total}</span></p>
                <p className='text-xs text-[#9ca3af] hidden sm:block'>Only one workshop can be live at a time.</p>
            </div>

            <div className='bg-white border border-[#eef0f5] rounded-2xl overflow-hidden shadow-sm'>
                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
                        <thead>
                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                <th className={thClass}>Workshop</th>
                                <th className={thClass}>Schedule</th>
                                <th className={thClass}>Venue</th>
                                <th className={thClass}>Fee</th>
                                <th className={thClass}>Status</th>
                                <th className={`${thClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        {loader ? (
                            <tbody>
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <Loader />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {workshops.length > 0 ? (
                                    workshops.map((item) => (
                                        <tr
                                            key={item._id}
                                            className={`border-b border-[#f0f1f5] last:border-0 transition-colors ${item.isActive ? 'bg-[#f3fbe6] hover:bg-[#ecf8da]' : 'hover:bg-[#f5f8ff]'}`}
                                        >
                                            <td className={`px-5 py-4 align-top border-l-4 ${item.isActive ? 'border-l-[#7ccf00]' : 'border-l-transparent'}`}>
                                                <div className='flex items-start gap-3'>
                                                    {item.posterUrl ? (
                                                        <img src={item.posterUrl} alt="" className='w-11 h-11 rounded-lg object-cover border border-[#eef0f5] shrink-0' />
                                                    ) : (
                                                        <div className='w-11 h-11 rounded-lg bg-[#f2f5fc] flex items-center justify-center shrink-0' title='No poster yet'>
                                                            <ImageOff size={16} className='text-[#9aa8c7]' />
                                                        </div>
                                                    )}
                                                    <div className='min-w-0'>
                                                        <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                                                        {item.description && (
                                                            <p className="text-xs text-[#6b7280] mt-1 line-clamp-2 max-w-[300px]">{item.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-top text-sm text-[#374151]">
                                                <p className='flex items-center gap-1.5 font-medium whitespace-nowrap'><CalendarDays size={14} className='text-[#123d84]' />{formatDate(item.date)}</p>
                                                <p className='flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap'><Clock size={13} />{formatTime(item.startTime)} – {formatTime(item.endTime)}</p>
                                            </td>
                                            <td className="px-5 py-4 align-top text-sm text-[#374151]">
                                                {item.venue ? (
                                                    <p className='flex items-start gap-1.5 max-w-[220px]'><MapPin size={14} className='text-[#123d84] mt-0.5 shrink-0' />{item.venue}</p>
                                                ) : '-'}
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <span className='inline-block px-2.5 py-1 rounded-lg bg-[#eef3fc] text-[#123d84] text-sm font-semibold'>{Number(item.fee) > 0 ? `₹${item.fee}` : 'Free'}</span>
                                            </td>
                                            <td className="px-5 py-4 align-top text-sm">
                                                {item.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e7f6ec] text-[#067647]">
                                                        <span className='relative flex w-2 h-2'>
                                                            <span className='absolute inline-flex w-full h-full rounded-full bg-[#12b76a] opacity-75 animate-ping'></span>
                                                            <span className='relative inline-flex w-2 h-2 rounded-full bg-[#12b76a]'></span>
                                                        </span>
                                                        Live
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1 rounded-full text-xs font-semibold border border-[#d0d7e6] text-[#4b5563] bg-white cursor-pointer hover:border-[#123d84] hover:bg-[#123d84] hover:text-white transition-colors"
                                                        onClick={() => setActive(item)}
                                                        title="Show this workshop on the website"
                                                    >
                                                        Set Live
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        aria-label={`Edit ${item.title}`}
                                                        title="Edit"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#123d84] bg-[#eef3fc] cursor-pointer hover:bg-[#123d84] hover:text-white transition-colors"
                                                        onClick={() => { setEditing(item); setModalOpen(true); }}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label={`Delete ${item.title}`}
                                                        title="Delete"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d92d20] bg-[#fef1f0] cursor-pointer hover:bg-[#d92d20] hover:text-white transition-colors"
                                                        onClick={() => setDeleting(item)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className='w-14 h-14 mx-auto rounded-2xl bg-[#f2f5fc] flex items-center justify-center'>
                                                <CalendarX size={26} className='text-[#9aa8c7]' />
                                            </div>
                                            <p className="text-sm text-[#374151] font-semibold mt-3">No workshops yet</p>
                                            <p className="text-xs text-[#9ca3af] mt-1">Click “Add Workshop” to create the first one.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <ThemeProvider theme={paginationTheme}>
                    <div className="flex justify-end mt-4">
                        <Pagination count={totalPages} page={offset} onChange={handlePageChange} showFirstButton showLastButton />
                    </div>
                </ThemeProvider>
            )}

            <WorkshopModal open={modalOpen} onClose={closeModal} onSave={handleSave} workshopData={editing} />

            <Modal open={!!deleting} title="Delete Workshop" onClose={() => !deleteLoading && setDeleting(null)} width={420}>
                <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>
                    This removes <strong>{deleting?.title}</strong>
                    {deleting?.isActive ? " and hides it from the website" : ""}. This can't be undone.
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
        </>
    );
};

export default WorkshopManagement;
