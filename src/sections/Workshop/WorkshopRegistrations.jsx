import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { excelWorkshopRegistrations, getWorkshopRegistrations } from '../../api/Serviceapi';
import { MapPin, Users, CalendarDays } from 'lucide-react';
import Loader from '../../component/loader/Loader';
import WorkshopPagination from './WorkshopPagination';
import {
    downloadExcel,
    formatDate as formatWorkshopDate,
    formatDateOnly,
    formatClock,
    formatMoney,
    useWorkshopOptions,
} from './workshopUtils';
import {
    Badge,
    EmptyState,
    ExportButton,
    FilterTabs,
    PersonCell,
    cardClass,
    inputClass,
    rowClass,
    tdClass,
    thClass,
    toolbarClass,
} from './workshopUi';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
];

const STATUS_TONE = { paid: 'green', pending: 'amber', failed: 'red' };

const WorkshopRegistrations = () => {
    const limit = 10;
    const [totaluser, settotal] = useState(0);
    const [offset, setoffset] = useState(1);
    const [registrations, setRegistrations] = useState([])
    const [loader, setloader] = useState(true)
    const [status, setStatus] = useState('');
    const [statusCounts, setStatusCounts] = useState({});
    // null until the workshops load; then the live workshop, else all workshops
    const [workshopId, setWorkshopId] = useState(null);
    const { workshops, loaded } = useWorkshopOptions();

    useEffect(() => {
        if (loaded && workshopId === null) {
            setWorkshopId(workshops.find((w) => w.isActive)?._id || '');
        }
    }, [loaded, workshops, workshopId]);

    const getregistrations = async () => {
        setloader(true)
        try {
            let res = await getWorkshopRegistrations(limit, offset - 1, status, workshopId)
            setRegistrations(res?.data?.data?.data || [])
            settotal(res?.data?.data?.totalCount || 0)
            setStatusCounts(res?.data?.data?.statusCounts || {})
        }
        catch (err) {
            console.log(err)
            setRegistrations([])
            settotal(0)
            setStatusCounts({})
        } finally {
            setloader(false)
        }
    }

    useEffect(() => {
        if (workshopId === null) return;
        getregistrations()
    }, [offset, status, workshopId])

    const handlePageChange = (event, value) => {
        if (value === offset) {
            getregistrations();
        } else {
            setoffset(value);
        }
    };

    const changeFilter = (setter) => (value) => {
        setter(value);
        setoffset(1);
    };

    const [exporting, setExporting] = useState(false);
    const exportExcel = async () => {
        setExporting(true);
        try {
            const res = await excelWorkshopRegistrations(status, workshopId);
            if (!res?.data?.data) {
                toast.error('No Excel file data found');
                return;
            }
            const workshop = workshops.find((w) => w._id === workshopId);
            const statusLabel = status ? ` (${STATUS_FILTERS.find((s) => s.key === status)?.label})` : '';
            downloadExcel(res.data.data, `${workshop?.title || 'All workshops'} - Registrations${statusLabel}`);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || 'Could not export registrations');
        } finally {
            setExporting(false);
        }
    };

    const filtered = status || workshopId;

    return (
        <>
            <div className={`${cardClass} overflow-hidden`}>
                <div className={toolbarClass}>
                    <FilterTabs options={STATUS_FILTERS} value={status} onChange={changeFilter(setStatus)} counts={statusCounts} />

                    <div className='flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto'>
                        <select
                            aria-label='Filter by workshop'
                            value={workshopId ?? ''}
                            onChange={(e) => changeFilter(setWorkshopId)(e.target.value)}
                            className={`${inputClass} pr-8 cursor-pointer w-full lg:w-[300px]`}
                        >
                            <option value=''>All workshops</option>
                            {workshops.map((w) => (
                                <option key={w._id} value={w._id}>{w.title} — {formatWorkshopDate(w.date)}{w.isActive ? ' (Live)' : ''}</option>
                            ))}
                        </select>
                        <ExportButton onClick={exportExcel} busy={exporting} empty={loader || totaluser === 0} />
                    </div>
                </div>

                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse table-fixed" style={{ minWidth: '1040px' }}>
                        <colgroup>
                            <col style={{ width: '27%' }} />
                            <col style={{ width: '16%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '14%' }} />
                            <col style={{ width: '12%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className={thClass}>Participant</th>
                                <th className={thClass}>Workshop</th>
                                <th className={thClass}>Education / Work</th>
                                <th className={thClass}>Address</th>
                                <th className={thClass}>Payment</th>
                                <th className={thClass}>Registered On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loader ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20"><Loader /></td>
                                </tr>
                            ) : registrations.length > 0 ? (
                                registrations.map((item, index) => (
                                    <tr key={item._id || index} className={rowClass}>
                                        <td className={tdClass}>
                                            <PersonCell name={item?.name} email={item?.email} phone={item?.mobileNo} index={index} />
                                        </td>

                                        <td className={tdClass}>
                                            <p className='text-sm font-medium text-[#123d84] line-clamp-2' title={item?.workshopTitle}>{item?.workshopTitle || '-'}</p>
                                            {item?.workshopDate && (
                                                <p className='flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap'><CalendarDays size={12} className='text-[#9ca3af]' />{formatWorkshopDate(item.workshopDate)}</p>
                                            )}
                                        </td>

                                        <td className={`${tdClass} text-sm text-[#374151]`}>
                                            <p className='line-clamp-2 break-words' title={item?.educationStatus}>{item?.educationStatus || '-'}</p>
                                        </td>

                                        <td className={`${tdClass} text-sm text-[#374151]`}>
                                            {item?.address ? (
                                                <p className='flex items-start gap-1.5 min-w-0' title={item.address}>
                                                    <MapPin size={13} className='text-[#9ca3af] mt-[3px] shrink-0' />
                                                    <span className='line-clamp-2 break-words'>{item.address}</span>
                                                </p>
                                            ) : '-'}
                                        </td>

                                        <td className={tdClass}>
                                            <p className='text-sm font-semibold text-[#111827]'>{Number(item?.amount) > 0 ? formatMoney(item.amount) : 'Free'}</p>
                                            <div className='mt-1.5'>
                                                <Badge tone={STATUS_TONE[item?.status]}>
                                                    <span className='capitalize'>{item?.status || '-'}</span>
                                                </Badge>
                                            </div>
                                            {item?.razorpayPaymentId && (
                                                <p className='text-[11px] text-[#6b7280] mt-1.5 font-mono truncate select-all' title={item.razorpayPaymentId}>{item.razorpayPaymentId}</p>
                                            )}
                                        </td>

                                        <td className={`${tdClass} whitespace-nowrap`}>
                                            <p className='text-sm text-[#374151]'>{formatDateOnly(item?.createdAt)}</p>
                                            <p className='text-xs text-[#9ca3af] mt-1'>{formatClock(item?.createdAt)}</p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState
                                            icon={Users}
                                            title={filtered ? 'No registrations match these filters' : 'No registrations yet'}
                                            text={filtered ? 'Try another status or workshop.' : 'Sign-ups from the website’s workshop page will appear here.'}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <WorkshopPagination page={offset} limit={limit} total={totaluser} onChange={handlePageChange} label="registrations" />
            </div>
        </>
    )
}

export default WorkshopRegistrations
