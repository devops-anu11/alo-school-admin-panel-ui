import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { CalendarDays, Clock, MapPin, Plus, Pencil, Trash2, Globe, CalendarX, ImageOff } from 'lucide-react';
import { getWorkshops, addWorkshop, updateWorkshop, deleteWorkshop } from '../../api/Serviceapi';
import Loader from '../../component/loader/Loader';
import Modal from '../../components/modal/Modal';
import WorkshopModal from './WorkshopModal';
import WorkshopPagination from './WorkshopPagination';
import { formatDate, formatTime } from './workshopUtils';
import { EmptyState, Toggle, cardClass, rowClass, thClass } from './workshopUi';

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
    const [toggling, setToggling] = useState(null);
    const [hiding, setHiding] = useState(null);

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

    // Saves the switch and updates the rows in place, so it animates instead of reloading the table.
    const saveLive = async (item, isActive) => {
        setToggling(item._id);
        try {
            // the API updates only the fields sent and switches the previously live workshop off
            await updateWorkshop(item._id, { isActive });
            setWorkshops((prev) => prev.map((w) => ({ ...w, isActive: isActive ? w._id === item._id : w.isActive && w._id !== item._id })));
            toast.success(isActive ? `"${item.title}" is now live on the website` : `"${item.title}" is hidden from the website`);
            return true;
        } catch (err) {
            toast.error(err?.response?.data?.message || (isActive ? "Failed to make the workshop live" : "Failed to hide the workshop"));
            return false;
        } finally {
            setToggling(null);
        }
    };

    // turning the live one off empties the website's workshop page, so confirm that first
    const toggleLive = (item) => (item.isActive ? setHiding(item) : saveLive(item, true));

    const confirmHide = async () => {
        if (hiding && (await saveLive(hiding, false))) setHiding(null);
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

            <div className={`${cardClass} overflow-hidden`}>
                <div className='flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#eef0f5]'>
                    <p className='text-sm text-[#111827] font-semibold'>
                        All workshops
                        <span className='ml-2 px-2 py-0.5 rounded-full bg-[#eef3fc] text-[#123d84] text-xs'>{total}</span>
                    </p>
                    <p className='text-xs text-[#9ca3af] hidden sm:block'>Only one workshop can be live at a time.</p>
                </div>
                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
                        <thead>
                            <tr>
                                <th className={`${thClass} px-5`}>Workshop</th>
                                <th className={`${thClass} px-5`}>Schedule</th>
                                <th className={`${thClass} px-5`}>Venue</th>
                                <th className={`${thClass} px-5`}>Fee</th>
                                <th className={`${thClass} px-5`}>Status</th>
                                <th className={`${thClass} px-5 !text-right`}>Actions</th>
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
                                            className={`${rowClass} ${item.isActive ? 'bg-[#f6fcee] hover:bg-[#eef8e1]' : ''}`}
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
                                            <td className="px-5 py-4 align-top">
                                                {/* title on the wrapper: a disabled switch shows no tooltip of its own */}
                                                <div
                                                    className='flex items-center gap-2.5 mt-0.5'
                                                    title={item.isActive
                                                        ? 'Hide from the website'
                                                        : item.posterUrl ? 'Show on the website (replaces the live one)' : 'Add a poster to show this on the website'}
                                                >
                                                    <Toggle
                                                        checked={item.isActive}
                                                        busy={toggling === item._id}
                                                        disabled={!!toggling || (!item.isActive && !item.posterUrl)}
                                                        onChange={() => toggleLive(item)}
                                                        label={`Show ${item.title} on the website`}
                                                    />
                                                    <span className={`text-xs font-semibold ${item.isActive ? 'text-[#067647]' : 'text-[#9ca3af]'}`}>
                                                        {item.isActive ? 'Live' : 'Off'}
                                                    </span>
                                                </div>
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
                                                    {/* delete hidden for now
                                                    <button
                                                        type="button"
                                                        aria-label={`Delete ${item.title}`}
                                                        title="Delete"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d92d20] bg-[#fef1f0] cursor-pointer hover:bg-[#d92d20] hover:text-white transition-colors"
                                                        onClick={() => setDeleting(item)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                    */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <EmptyState icon={CalendarX} title='No workshops yet' text='Click “Add Workshop” to create the first one.' />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <WorkshopPagination page={offset} limit={limit} total={total} onChange={handlePageChange} label="workshops" />
            </div>

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

            <Modal open={!!hiding} title="Hide from Website" onClose={() => !toggling && setHiding(null)} width={420}>
                <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>
                    The website will stop showing <strong>{hiding?.title}</strong>, and no workshop will be live until you switch one on. Its registrations are kept.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-5 py-2.5 text-sm font-semibold text-[#6b7280] bg-white border border-[#e5e7eb] rounded-lg cursor-pointer"
                        onClick={() => setHiding(null)}
                        disabled={!!toggling}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#123d84] rounded-lg cursor-pointer disabled:opacity-70"
                        onClick={confirmHide}
                        disabled={!!toggling}
                    >
                        {toggling ? "Hiding..." : "Hide"}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default WorkshopManagement;
