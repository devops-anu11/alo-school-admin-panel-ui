import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import {
    CalendarDays,
    CircleX,
    CreditCard,
    Hourglass,
    IndianRupee,
    Landmark,
    ReceiptIndianRupee,
    RefreshCw,
    Search,
    Smartphone,
    TriangleAlert,
    Unlink,
    Wallet,
    X,
} from 'lucide-react';
import { excelWorkshopTransactions, getWorkshopTransactions } from '../../api/Serviceapi';
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
    StatCard,
    cardClass,
    inputClass,
    rowClass,
    tdClass,
    thClass,
    toolbarClass,
} from './workshopUi';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'settled', label: 'Settled' },
    { key: 'captured', label: 'Captured' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
    { key: 'refunded', label: 'Refunded' },
];
// opened from the "not linked" notice, so it only shows while selected
const UNLINKED_FILTER = { key: 'unlinked', label: 'Not linked' };

const METHODS = [
    { key: 'upi', label: 'UPI', Icon: Smartphone },
    { key: 'card', label: 'Card', Icon: CreditCard },
    { key: 'netbanking', label: 'Netbanking', Icon: Landmark },
    { key: 'wallet', label: 'Wallet', Icon: Wallet },
];

// settled = received and paid out to the bank; captured = received, not paid out yet
const STATUS_DISPLAY = {
    settled: { label: 'Settled', tone: 'green' },
    captured: { label: 'Captured', tone: 'blue' },
    refunded: { label: 'Refunded', tone: 'purple' },
    failed: { label: 'Failed', tone: 'red' },
    authorized: { label: 'Pending', tone: 'amber' },
    created: { label: 'Pending', tone: 'amber' },
};

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const WorkshopTransactions = () => {
    const limit = 10;
    const { workshops, loaded } = useWorkshopOptions();
    // null until the workshops load; then the live workshop, else all workshops ('')
    const [workshopId, setWorkshopId] = useState(null);
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
    const statusCounts = result?.statusCounts || {};
    const statusTabs = status === 'unlinked' ? [...STATUS_FILTERS, UNLINKED_FILTER] : STATUS_FILTERS;
    const allWorkshops = workshopId === '';
    const columnCount = allWorkshops ? 7 : 6;

    useEffect(() => {
        if (loaded && workshopId === null) {
            setWorkshopId(workshops.find((w) => w.isActive)?._id || '');
        }
    }, [loaded, workshops, workshopId]);

    // search as you type, once typing pauses
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setOffset(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchTransactions = async (refresh = false) => {
        if (workshopId === null) return;
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

    const [exporting, setExporting] = useState(false);
    const exportExcel = async () => {
        setExporting(true);
        try {
            const res = await excelWorkshopTransactions(workshopId, { status, method, search, from, to });
            if (!res?.data?.data) {
                toast.error('No Excel file data found');
                return;
            }
            const workshop = workshops.find((w) => w._id === workshopId);
            const statusLabel = status ? ` (${statusTabs.find((s) => s.key === status)?.label})` : '';
            downloadExcel(res.data.data, `${workshop?.title || 'All workshops'} - Transactions${statusLabel}`);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || 'Could not export transactions');
        } finally {
            setExporting(false);
        }
    };

    if (loaded && workshops.length === 0) {
        return (
            <div className={cardClass}>
                <EmptyState icon={ReceiptIndianRupee} title='No workshops yet' text='Razorpay transactions are listed per workshop once one is created.' />
            </div>
        );
    }

    return (
        <>
            {/* what to look at: workshop and payment dates */}
            <div className='flex flex-col md:flex-row md:items-center gap-3 mb-4'>
                <select
                    aria-label='Workshop'
                    value={workshopId ?? ''}
                    onChange={(e) => changeFilter(setWorkshopId)(e.target.value)}
                    className={`${inputClass} pr-8 cursor-pointer font-medium w-full md:w-[340px]`}
                >
                    <option value=''>All workshops</option>
                    {workshops.map((w) => (
                        <option key={w._id} value={w._id}>
                            {w.title} — {formatWorkshopDate(w.date)}{w.isActive ? ' (Live)' : ''}
                        </option>
                    ))}
                </select>

                <div className='flex items-center gap-2 h-9 px-3 bg-white border border-[#e2e6ef] rounded-lg self-start md:self-auto focus-within:border-[#123d84]'>
                    <input
                        type='date'
                        aria-label='Payments from'
                        value={from}
                        max={to || undefined}
                        onChange={(e) => changeFilter(setFrom)(e.target.value)}
                        className='bg-transparent text-sm text-[#374151] focus:outline-none'
                    />
                    <span className='text-xs text-[#9ca3af]'>to</span>
                    <input
                        type='date'
                        aria-label='Payments to'
                        value={to}
                        min={from || undefined}
                        onChange={(e) => changeFilter(setTo)(e.target.value)}
                        className='bg-transparent text-sm text-[#374151] focus:outline-none'
                    />
                    {(from || to) && (
                        <button
                            type='button'
                            aria-label='Clear dates'
                            onClick={() => { setFrom(''); setTo(''); setOffset(1); }}
                            className='w-5 h-5 flex items-center justify-center rounded-full text-[#9ca3af] cursor-pointer hover:bg-[#f2f4f7] hover:text-[#374151]'
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className='md:ml-auto flex items-center gap-2 self-start md:self-auto'>
                    <button
                        type='button'
                        onClick={() => fetchTransactions(true)}
                        disabled={loader || workshopId === null}
                        className='h-9 px-3.5 flex items-center justify-center gap-2 text-xs font-semibold text-[#123d84] bg-white border border-[#123d84] rounded-lg cursor-pointer hover:bg-[#123d84]/10 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Fetch the latest from Razorpay'
                    >
                        <RefreshCw size={14} className={loader ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <ExportButton onClick={exportExcel} busy={exporting} empty={loader || !result?.totalCount} />
                </div>
            </div>

            {/* totals for the workshop and dates, whatever the filters below */}
            {summary && (
                <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4'>
                    {/* the two cards beside it added up: settled (after fees) + awaiting */}
                    <StatCard
                        icon={Wallet}
                        tone='navy'
                        label='Total amount'
                        value={formatMoney(summary.settledNetAmount + summary.awaitingAmount)}
                        sub={`${plural(summary.settledCount + summary.awaitingCount, 'payment')} · settled + awaiting`}
                    />
                    <StatCard
                        icon={Landmark}
                        tone='green'
                        label='Settled to bank'
                        value={formatMoney(summary.settledNetAmount)}
                        sub={summary.settledCount ? `${plural(summary.settledCount, 'payment')} · after fees` : 'Nothing settled yet'}
                    />
                    <StatCard
                        icon={Hourglass}
                        tone='blue'
                        label='Awaiting settlement'
                        value={formatMoney(summary.awaitingAmount)}
                        sub={summary.awaitingCount ? `${plural(summary.awaitingCount, 'payment')} on the way` : 'Nothing waiting'}
                    />
                    <StatCard
                        icon={CircleX}
                        tone='red'
                        label='Failed attempts'
                        value={summary.failedCount}
                        sub={summary.pendingCount ? `${summary.pendingCount} still pending` : 'No pending attempts'}
                    />
                </div>
            )}
            {result?.truncated && (
                <div className='flex items-center gap-2.5 mb-4 px-4 py-2.5 text-sm text-[#7a4a00] bg-[#fff8e6] border border-[#ffe2a8] rounded-xl'>
                    <TriangleAlert size={16} className='shrink-0 text-[#d98a00]' />
                    <span>Too many Razorpay payments in this period to list at once. Narrow the dates to see all of them.</span>
                </div>
            )}

            <div className={`${cardClass} overflow-hidden`}>
                <div className={toolbarClass}>
                    <FilterTabs options={statusTabs} value={status} onChange={changeFilter(setStatus)} counts={statusCounts} />

                    <div className='flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto'>
                        <div className='relative w-full sm:w-[240px]'>
                            <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]' />
                            <input
                                type='text'
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder='Search name, phone, UTR…'
                                title='Name, phone, email, payment ID, order ID or UTR'
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
                        {hasFilters && (
                            <button type='button' onClick={clearFilters} className='h-9 px-2 text-xs font-semibold text-[#6b7280] hover:text-[#d92d20] cursor-pointer whitespace-nowrap self-start sm:self-auto'>
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                <div className='overflow-x-auto w-full'>
                    <table className="w-full border-collapse table-fixed" style={{ minWidth: allWorkshops ? '1160px' : '1000px' }}>
                        {allWorkshops ? (
                            <colgroup>
                                <col style={{ width: '22%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '17%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '10%' }} />
                            </colgroup>
                        ) : (
                            <colgroup>
                                <col style={{ width: '26%' }} />
                                <col style={{ width: '19%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '11%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '12%' }} />
                            </colgroup>
                        )}
                        <thead>
                            <tr>
                                <th className={thClass}>Participant</th>
                                {allWorkshops && <th className={thClass}>Workshop</th>}
                                <th className={thClass}>Payment</th>
                                <th className={thClass}>Method</th>
                                <th className={thClass}>Amount</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loader ? (
                                <tr>
                                    <td colSpan={columnCount} className="text-center py-20"><Loader /></td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={columnCount} className="text-center py-16">
                                        <p className="text-sm text-[#d92d20] font-semibold">{error}</p>
                                        <button type='button' onClick={() => fetchTransactions(true)} className='mt-3 text-xs font-semibold text-[#123d84] underline cursor-pointer'>Try again</button>
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t, index) => {
                                    const methodInfo = METHODS.find((m) => m.key === t.method);
                                    const MethodIcon = methodInfo?.Icon || IndianRupee;
                                    const display = STATUS_DISPLAY[t.status] || { label: t.status || '-', tone: 'gray' };
                                    return (
                                        <tr key={t.paymentId} className={`${rowClass} ${t.unlinked ? 'bg-[#fffbf0] hover:bg-[#fff6e0]' : ''}`}>
                                            <td className={tdClass}>
                                                <PersonCell
                                                    name={t.registration?.name}
                                                    email={t.email}
                                                    phone={t.contact || t.registration?.mobileNo}
                                                    index={index}
                                                    fallback='No registration'
                                                >
                                                    {t.unlinked && (
                                                        <span className='inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff4e5] text-[#b54708]' title='Received, but no paid registration uses this payment'>
                                                            <Unlink size={11} /> Not linked
                                                        </span>
                                                    )}
                                                </PersonCell>
                                            </td>

                                            {allWorkshops && (
                                                <td className={tdClass}>
                                                    <p className='text-sm font-medium text-[#123d84] line-clamp-2' title={t.workshop?.title}>{t.workshop?.title || '-'}</p>
                                                    {t.workshop?.date && (
                                                        <p className='flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap'><CalendarDays size={12} className='text-[#9ca3af]' />{formatWorkshopDate(t.workshop.date)}</p>
                                                    )}
                                                </td>
                                            )}

                                            <td className={tdClass}>
                                                <p className='text-xs font-mono font-medium text-[#111827] truncate select-all' title={t.orderId ? `Order ${t.orderId}` : undefined}>{t.paymentId}</p>
                                                {t.rrn && <p className='text-[11px] text-[#6b7280] mt-1.5 truncate' title='Bank reference (UTR)'>UTR {t.rrn}</p>}
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
                                                {t.fee > 0 && <p className='text-[11px] text-[#6b7280] mt-1 whitespace-nowrap'>Fee {formatMoney(t.fee)}</p>}
                                            </td>

                                            <td className={tdClass}>
                                                <Badge tone={display.tone}>{display.label}</Badge>
                                                {t.settlement && (
                                                    <p className='text-[11px] text-[#6b7280] mt-1.5 whitespace-nowrap' title={t.settlement.utr ? `Bank UTR ${t.settlement.utr}` : undefined}>
                                                        {t.settlement.settledAt ? `On ${formatDateOnly(t.settlement.settledAt)}` : 'Reached the bank'}
                                                    </p>
                                                )}
                                                {t.amountRefunded > 0 && t.status !== 'refunded' && (
                                                    <p className='text-[11px] text-[#6941c6] mt-1.5'>{formatMoney(t.amountRefunded)} refunded</p>
                                                )}
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
                                    <td colSpan={columnCount}>
                                        <EmptyState
                                            icon={ReceiptIndianRupee}
                                            title={hasFilters ? 'No transactions match these filters' : 'No transactions yet'}
                                            text={hasFilters ? 'Try another status or clear the filters.' : `Razorpay payments for ${allWorkshops ? 'workshops' : 'this workshop'} will appear here.`}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4'>
                <p className='text-xs text-[#9ca3af]'>
                    {result?.range && `Live from Razorpay · payments from ${formatDateOnly(result.range.from)} to ${formatDateOnly(result.range.to)}`}
                </p>
                <WorkshopPagination page={offset} limit={limit} total={result?.totalCount || 0} onChange={(e, value) => setOffset(value)} label="payments" />
            </div>
        </>
    );
};

export default WorkshopTransactions;
