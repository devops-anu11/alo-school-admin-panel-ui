import React, { useEffect, useState } from 'react'
import { getWorkshopRegistrations } from '../../api/Serviceapi';
import { Mail, Phone, MapPin, Users, CalendarDays } from 'lucide-react';
import Loader from '../../component/loader/Loader';
import WorkshopPagination from './WorkshopPagination';
import {
    formatDate as formatWorkshopDate,
    formatDateOnly,
    formatClock,
    formatMoney,
    formatPhone,
    useWorkshopOptions,
} from './workshopUtils';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
];

const STATUS_BADGE = {
    paid: 'bg-[#e7f6ec] text-[#067647]',
    pending: 'bg-[#fff4e5] text-[#b54708]',
    failed: 'bg-[#fdecec] text-[#d92d20]',
};

const getInitials = (name) =>
    name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

const AVATAR_COLORS = ['bg-[#e6edf9] text-[#123d84]', 'bg-[#f3fbe6] text-[#3f7d00]', 'bg-[#fff4e5] text-[#b54708]', 'bg-[#f4ebff] text-[#6941c6]'];

const thClass = "px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-white text-left";
const tdClass = "px-4 py-4 align-top";

const WorkshopRegistrations = () => {
    const limit = 10;
    const [totaluser, settotal] = useState(0);
    const [offset, setoffset] = useState(1);
    const [registrations, setRegistrations] = useState([])
    const [loader, setloader] = useState(false)
    const [status, setStatus] = useState('');
    const [statusCounts, setStatusCounts] = useState({});
    const [workshopId, setWorkshopId] = useState('');
    const { workshops } = useWorkshopOptions();

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

    return (
        <>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3'>
                <p className='text-sm text-[#374151] font-semibold'>
                    {status ? `${STATUS_FILTERS.find((f) => f.key === status).label} Registrations` : 'All Registrations'}
                    <span className='ml-1.5 px-2 py-0.5 rounded-full bg-[#e6edf9] text-[#123d84] text-xs'>{totaluser}</span>
                </p>

                <div className='flex flex-col sm:flex-row gap-2.5'>
                    <select
                        aria-label='Filter by workshop'
                        value={workshopId}
                        onChange={(e) => changeFilter(setWorkshopId)(e.target.value)}
                        className='h-9 px-3 pr-8 text-sm text-[#374151] bg-white border border-[#e6e9f2] rounded-lg cursor-pointer focus:outline-none focus:border-[#123d84] sm:w-[260px]'
                    >
                        <option value=''>All workshops</option>
                        {workshops.map((w) => (
                            <option key={w._id} value={w._id}>{w.title} — {formatWorkshopDate(w.date)}</option>
                        ))}
                    </select>

                    <div className='inline-flex p-1 bg-white border border-[#e6e9f2] rounded-lg self-start'>
                        {STATUS_FILTERS.map(({ key, label }) => {
                            const active = status === key;
                            const count = statusCounts[key || 'all'];
                            return (
                                <button
                                    key={label}
                                    type='button'
                                    onClick={() => changeFilter(setStatus)(key)}
                                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${active ? 'bg-[#123d84] text-white' : 'text-[#4b5563] hover:text-[#123d84]'}`}
                                >
                                    {label}
                                    {typeof count === 'number' && (
                                        <span className={`ml-1.5 px-1.5 rounded-full text-[10px] leading-4 ${active ? 'bg-white/20 text-white' : 'bg-[#f2f4f7] text-[#4b5563]'}`}>{count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className='bg-white border border-[#eef0f5] rounded-2xl overflow-hidden shadow-sm'>
                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse table-fixed" style={{ minWidth: '1080px' }}>
                        <colgroup>
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '11%' }} />
                        </colgroup>
                        <thead>
                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                <th className={thClass}>Participant</th>
                                <th className={thClass}>Workshop</th>
                                <th className={thClass}>Education / Work</th>
                                <th className={thClass}>Address</th>
                                <th className={thClass}>Payment</th>
                                <th className={thClass}>Registered On</th>
                            </tr>
                        </thead>
                        {loader ?
                            <tbody>
                                <tr>
                                    <td colSpan="6" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                        <Loader />
                                    </td>
                                </tr>
                            </tbody>
                            : <tbody>
                                {registrations?.length > 0 ? (
                                    registrations.map((item, index) => {
                                        const name = item?.name || '-';
                                        return (
                                            <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f8faff] transition-colors">
                                                {/* participant: name, email, phone */}
                                                <td className={tdClass}>
                                                    <div className='flex items-start gap-3 min-w-0'>
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                                                            {getInitials(name)}
                                                        </div>
                                                        <div className='min-w-0 flex-1'>
                                                            <p className="text-sm font-semibold text-[#111827] capitalize truncate" title={name}>{name.toLowerCase()}</p>
                                                            <p className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 min-w-0" title={item?.email}>
                                                                <Mail size={12} className='shrink-0 text-[#9ca3af]' />
                                                                <span className='truncate'>{item?.email || '-'}</span>
                                                            </p>
                                                            <p className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap">
                                                                <Phone size={12} className='shrink-0 text-[#9ca3af]' />
                                                                {formatPhone(item?.mobileNo)}
                                                            </p>
                                                        </div>
                                                    </div>
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
                                                    <div className='flex items-center gap-2 flex-wrap'>
                                                        <span className='text-sm font-semibold text-[#111827]'>{Number(item?.amount) > 0 ? formatMoney(item.amount) : 'Free'}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_BADGE[item?.status] || 'bg-[#f2f4f7] text-[#4b5563]'}`}>{item?.status || '-'}</span>
                                                    </div>
                                                    {item?.razorpayPaymentId && (
                                                        <p className='text-[11px] text-[#6b7280] mt-1 font-mono truncate select-all' title={item.razorpayPaymentId}>{item.razorpayPaymentId}</p>
                                                    )}
                                                </td>

                                                <td className={`${tdClass} whitespace-nowrap`}>
                                                    <p className='text-sm text-[#374151]'>{formatDateOnly(item?.createdAt)}</p>
                                                    <p className='text-xs text-[#9ca3af] mt-1'>{formatClock(item?.createdAt)}</p>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className='w-14 h-14 mx-auto rounded-2xl bg-[#f2f5fc] flex items-center justify-center'>
                                                <Users size={26} className='text-[#9aa8c7]' />
                                            </div>
                                            <p className="text-sm text-[#374151] font-semibold mt-3">No registrations yet</p>
                                            <p className="text-xs text-[#9ca3af] mt-1">Sign-ups from the website’s workshop page will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        }
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
