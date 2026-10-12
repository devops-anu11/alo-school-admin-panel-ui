import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import Pagination from '@mui/material/Pagination';
import { ThemeProvider } from '@mui/material/styles';
import {
    CreditCard,
    IndianRupee,
    Landmark,
    Mail,
    Phone,
    ReceiptIndianRupee,
    RefreshCw,
    Search,
    Smartphone,
    TriangleAlert,
    Unlink,
    Wallet,
} from 'lucide-react';
import { getWorkshopTransactions } from '../../api/Serviceapi';
import Loader from '../../component/loader/Loader';
import {
    paginationTheme,
    formatDate as formatWorkshopDate,
    formatDateOnly,
    formatClock,
    formatMoney,
    formatPhone,
    useWorkshopOptions,
} from './workshopUtils';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'captured', label: 'Captured' },
    { key: 'failed', label: 'Failed' },
    { key: 'refunded', label: 'Refunded' },
    { key: 'pending', label: 'Pending' },
];

const METHODS = [
    { key: 'upi', label: 'UPI', Icon: Smartphone },
    { key: 'card', label: 'Card', Icon: CreditCard },
    { key: 'netbanking', label: 'Netbanking', Icon: Landmark },
    { key: 'wallet', label: 'Wallet', Icon: Wallet },
];

const STATUS_BADGE = {
    captured: 'bg-[#e7f6ec] text-[#067647]',
    refunded: 'bg-[#f4ebff] text-[#6941c6]',
    failed: 'bg-[#fdecec] text-[#d92d20]',
    authorized: 'bg-[#fff4e5] text-[#b54708]',
    created: 'bg-[#fff4e5] text-[#b54708]',
};

const thClass = "px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-white text-left";
const tdClass = "px-4 py-4 align-top";
const inputClass = 'h-9 px-3 text-sm text-[#374151] bg-white border border-[#e6e9f2] rounded-lg focus:outline-none focus:border-[#123d84]';

const SummaryCard = ({ label, value, sub, tone = 'text-[#111827]' }) => (
    <div className='p-4 bg-white border border-[#eef0f5] rounded-2xl shadow-sm min-w-0'>
        <p className='text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]'>{label}</p>
        <p className={`text-xl font-semibold mt-1 truncate ${tone}`}>{value}</p>
        {sub && <p className='text-xs text-[#9ca3af] mt-0.5'>{sub}</p>}
    </div>
);

const WorkshopTransactions = () => {
    const limit = 10;
    const { workshops, loaded } = useWorkshopOptions();
    const [workshopId, setWorkshopId] = useState('');
    const [status, setStatus] = useState('');
    const [method, setMethod] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(1);
    const [result, setResult] = useState(null);
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState('');

    const transactions = result?.data || [];
    const summary = result?.summary;
    const totalPages = Math.ceil((result?.totalCount || 0) / limit);

    // the live workshop first, else the newest
    useEffect(() => {
        if (!workshopId && workshops.length) {
            setWorkshopId((workshops.find((w) => w.isActive) || workshops[0])._id);
        }
    }, [workshops, workshopId]);

    // search as you type, once typing pauses
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setOffset(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchTransactions = async (refresh = false) => {
        if (!workshopId) return;
        setLoader(true);
        setError('');
        try {
            const res = await getWorkshopTransactions(workshopId, limit, offset - 1, { status, method, search, from, to }, refresh);
            setResult(res?.data?.data || null);
            if (refresh) toast.success('Transactions refreshed from Razorpay');
        } catch (err) {
            console.log(err);
            setResult(null);
            setError(err?.response?.data?.message || 'Could not load transactions from Razorpay');
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [workshopId, status, method, search, from, to, offset]);

    const changeFilter = (setter) => (value) => {
        setter(value);
        setOffset(1);
    };

    const clearFilters = () => {
        setStatus('');
        setMethod('');
        setFrom('');
        setTo('');
        setSearchInput('');
        setSearch('');
        setOffset(1);
    };

    const hasFilters = status || method || from || to || search;

    if (loaded && workshops.length === 0) {
        return (
            <div className='bg-white border border-[#eef0f5] rounded-2xl shadow-sm text-center py-16'>
                <div className='w-14 h-14 mx-auto rounded-2xl bg-[#f2f5fc] flex items-center justify-center'>
                    <ReceiptIndianRupee size={26} className='text-[#9aa8c7]' />
                </div>
                <p className="text-sm text-[#374151] font-semibold mt-3">No workshops yet</p>
                <p className="text-xs text-[#9ca3af] mt-1">Razorpay transactions are listed per workshop once one is created.</p>
            </div>
        );
    }

    return (
        <>
            {/* filters */}
            <div className='flex flex-col gap-3 mb-4'>
                <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
                    <select
                        aria-label='Workshop'
                        value={workshopId}
                        onChange={(e) => changeFilter(setWorkshopId)(e.target.value)}
                        className={`${inputClass} pr-8 cursor-pointer lg:w-[340px] font-medium`}
                    >
                        {workshops.map((w) => (
                            <option key={w._id} value={w._id}>
                                {w.title} — {formatWorkshopDate(w.date)}{w.isActive ? ' (Live)' : ''}
                            </option>
                        ))}
                    </select>

                    <div className='inline-flex p-1 bg-white border border-[#e6e9f2] rounded-lg self-start lg:self-auto'>
                        {STATUS_FILTERS.map(({ key, label }) => (
                            <button
                                key={label}
                                type='button'
                                onClick={() => changeFilter(setStatus)(key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${status === key ? 'bg-[#123d84] text-white' : 'text-[#4b5563] hover:text-[#123d84]'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='flex flex-wrap items-center gap-2.5'>
                    <div className='relative flex-1 min-w-[220px] max-w-[360px]'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]' />
                        <input
                            type='text'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder='Payment / order ID, name, email, phone, UTR'
                            className={`${inputClass} w-full pl-9`}
                        />
                    </div>
                    <select
                        aria-label='Payment method'
                        value={method}
                        onChange={(e) => changeFilter(setMethod)(e.target.value)}
                        className={`${inputClass} pr-8 cursor-pointer`}
                    >
                        <option value=''>All methods</option>
                        {METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                    <label className='flex items-center gap-2 text-xs text-[#6b7280]'>
                        From
                        <input type='date' value={from} max={to || undefined} onChange={(e) => changeFilter(setFrom)(e.target.value)} className={inputClass} />
                    </label>
                    <label className='flex items-center gap-2 text-xs text-[#6b7280]'>
                        To
                        <input type='date' value={to} min={from || undefined} onChange={(e) => changeFilter(setTo)(e.target.value)} className={inputClass} />
                    </label>
                    {hasFilters && (
                        <button type='button' onClick={clearFilters} className='h-9 px-3 text-xs font-semibold text-[#6b7280] hover:text-[#d92d20] cursor-pointer'>
                            Clear filters
                        </button>
                    )}
                    <button
                        type='button'
                        onClick={() => fetchTransactions(true)}
                        disabled={loader || !workshopId}
                        className='ml-auto h-9 px-3.5 flex items-center gap-2 text-xs font-semibold text-[#123d84] bg-white border border-[#123d84] rounded-lg cursor-pointer hover:bg-[#123d84]/10 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Fetch the latest from Razorpay'
                    >
                        <RefreshCw size={14} className={loader ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* summary for the workshop (and date range) */}
            {summary && (
                <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4'>
                    <SummaryCard label='Received' value={formatMoney(summary.receivedAmount)} sub={`${summary.receivedCount} payment${summary.receivedCount === 1 ? '' : 's'}`} tone='text-[#067647]' />
                    <SummaryCard label='Razorpay Fees' value={formatMoney(summary.feeAmount)} sub='incl. GST' />
                    <SummaryCard label='Net Amount' value={formatMoney(summary.netAmount)} sub='after fees & refunds' tone='text-[#123d84]' />
                    <SummaryCard label='Refunded' value={formatMoney(summary.refundedAmount)} sub={`${summary.refundedCount} payment${summary.refundedCount === 1 ? '' : 's'}`} tone='text-[#6941c6]' />
                    <SummaryCard label='Failed' value={summary.failedCount} sub={summary.pendingCount ? `${summary.pendingCount} pending` : 'attempts'} tone='text-[#d92d20]' />
                </div>
            )}

            {summary?.unlinkedCount > 0 && (
                <div className='flex items-start gap-2.5 mb-4 px-4 py-3 text-sm text-[#7a4a00] bg-[#fff8e6] border border-[#ffe2a8] rounded-xl'>
                    <TriangleAlert size={17} className='shrink-0 mt-0.5 text-[#d98a00]' />
                    <span>
                        <strong>{summary.unlinkedCount} captured payment{summary.unlinkedCount === 1 ? '' : 's'} not linked to a paid registration</strong> — for example a second payment by the same person. Check {summary.unlinkedCount === 1 ? 'it' : 'them'} below (marked “Not linked”); a refund may be due.
                    </span>
                </div>
            )}
            {result?.truncated && (
                <div className='flex items-start gap-2.5 mb-4 px-4 py-3 text-sm text-[#7a4a00] bg-[#fff8e6] border border-[#ffe2a8] rounded-xl'>
                    <TriangleAlert size={17} className='shrink-0 mt-0.5 text-[#d98a00]' />
                    <span>Too many Razorpay payments in this period to list at once. Narrow the date range to see all of them.</span>
                </div>
            )}

            <div className='bg-white border border-[#eef0f5] rounded-2xl overflow-hidden shadow-sm'>
                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse table-fixed" style={{ minWidth: '1080px' }}>
                        <colgroup>
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '24%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '16%' }} />
                            <col style={{ width: '12%' }} />
                        </colgroup>
                        <thead>
                            <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                                <th className={thClass}>Payment</th>
                                <th className={thClass}>Participant</th>
                                <th className={thClass}>Method</th>
                                <th className={thClass}>Amount</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loader ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20"><Loader /></td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16">
                                        <p className="text-sm text-[#d92d20] font-semibold">{error}</p>
                                        <button type='button' onClick={() => fetchTransactions(true)} className='mt-3 text-xs font-semibold text-[#123d84] underline cursor-pointer'>Try again</button>
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t) => {
                                    const methodInfo = METHODS.find((m) => m.key === t.method);
                                    const MethodIcon = methodInfo?.Icon || IndianRupee;
                                    return (
                                        <tr key={t.paymentId} className={`border-b border-[#f0f1f5] last:border-0 transition-colors ${t.unlinked ? 'bg-[#fffbf0] hover:bg-[#fff6e0]' : 'hover:bg-[#f8faff]'}`}>
                                            <td className={tdClass}>
                                                <p className='text-[13px] font-mono font-medium text-[#111827] truncate select-all' title={t.paymentId}>{t.paymentId}</p>
                                                {t.orderId && <p className='text-[11px] font-mono text-[#9ca3af] mt-1 truncate' title={t.orderId}>{t.orderId}</p>}
                                                {t.rrn && <p className='text-[11px] text-[#6b7280] mt-1 truncate' title={`Bank reference ${t.rrn}`}>UTR {t.rrn}</p>}
                                            </td>

                                            <td className={tdClass}>
                                                {t.registration ? (
                                                    <p className='text-sm font-semibold text-[#111827] capitalize truncate' title={t.registration.name}>{t.registration.name.toLowerCase()}</p>
                                                ) : (
                                                    <p className='text-sm text-[#9ca3af] italic'>No registration</p>
                                                )}
                                                <p className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 min-w-0" title={t.email}>
                                                    <Mail size={12} className='shrink-0 text-[#9ca3af]' />
                                                    <span className='truncate'>{t.email || '-'}</span>
                                                </p>
                                                <p className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap">
                                                    <Phone size={12} className='shrink-0 text-[#9ca3af]' />
                                                    {formatPhone(t.contact || t.registration?.mobileNo)}
                                                </p>
                                                {t.unlinked && (
                                                    <span className='inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff4e5] text-[#b54708]' title='Captured, but no paid registration uses this payment'>
                                                        <Unlink size={11} /> Not linked
                                                    </span>
                                                )}
                                            </td>

                                            <td className={tdClass}>
                                                <p className='flex items-center gap-1.5 text-sm text-[#374151]'>
                                                    <MethodIcon size={14} className='text-[#123d84] shrink-0' />
                                                    {methodInfo?.label || t.method || '-'}
                                                </p>
                                                {t.methodDetail && <p className='text-xs text-[#6b7280] mt-1 truncate' title={t.methodDetail}>{t.methodDetail}</p>}
                                            </td>

                                            <td className={tdClass}>
                                                <p className='text-sm font-semibold text-[#111827]'>{formatMoney(t.amount)}</p>
                                                {t.fee > 0 && <p className='text-[11px] text-[#6b7280] mt-1 whitespace-nowrap'>Fee {formatMoney(t.fee)} · Net {formatMoney(t.amount - t.fee)}</p>}
                                                {t.amountRefunded > 0 && <p className='text-[11px] text-[#6941c6] mt-1'>Refunded {formatMoney(t.amountRefunded)}</p>}
                                            </td>

                                            <td className={tdClass}>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_BADGE[t.status] || 'bg-[#f2f4f7] text-[#4b5563]'}`}>{t.status || '-'}</span>
                                                {t.errorReason && <p className='text-[11px] text-[#d92d20] mt-1.5 line-clamp-2' title={t.errorReason}>{t.errorReason}</p>}
                                            </td>

                                            <td className={`${tdClass} whitespace-nowrap`}>
                                                <p className='text-sm text-[#374151]'>{formatDateOnly(t.createdAt)}</p>
                                                <p className='text-xs text-[#9ca3af] mt-1'>{formatClock(t.createdAt)}</p>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-16">
                                        <div className='w-14 h-14 mx-auto rounded-2xl bg-[#f2f5fc] flex items-center justify-center'>
                                            <ReceiptIndianRupee size={26} className='text-[#9aa8c7]' />
                                        </div>
                                        <p className="text-sm text-[#374151] font-semibold mt-3">{hasFilters ? 'No transactions match these filters' : 'No transactions yet'}</p>
                                        <p className="text-xs text-[#9ca3af] mt-1">Razorpay payments for this workshop will appear here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4'>
                <p className='text-xs text-[#9ca3af]'>
                    {result?.range && `Live from Razorpay · payments between ${formatDateOnly(result.range.from)} and ${formatDateOnly(result.range.to)}`}
                </p>
                {totalPages > 1 && (
                    <ThemeProvider theme={paginationTheme}>
                        <Pagination count={totalPages} page={offset} onChange={(e, value) => setOffset(value)} showFirstButton showLastButton />
                    </ThemeProvider>
                )}
            </div>
        </>
    );
};

export default WorkshopTransactions;
