import React from 'react'
import { Download, Loader2, Mail, Phone } from 'lucide-react';
import { formatPhone } from './workshopUtils';

// Shared building blocks for the Workshop tabs, so all three look alike.

export const cardClass = 'bg-white border border-[#e9edf5] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04)]';
export const toolbarClass = 'flex flex-col lg:flex-row lg:flex-wrap lg:items-center justify-between gap-3 px-4 py-3 border-b border-[#eef0f5]';
export const thClass = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] text-left whitespace-nowrap bg-[#f8fafc] border-b border-[#eef0f5]';
export const tdClass = 'px-4 py-4 align-top';
export const rowClass = 'border-b border-[#f0f2f7] last:border-0 transition-colors hover:bg-[#f8faff]';
export const inputClass = 'h-9 px-3 text-sm text-[#374151] bg-white border border-[#e2e6ef] rounded-lg focus:outline-none focus:border-[#123d84] focus:ring-2 focus:ring-[#123d84]/10';

// Segmented status filter. A count shows on each tab once the API sends counts.
export const FilterTabs = ({ options, value, onChange, counts = {} }) => (
    <div className='flex max-w-full overflow-x-auto p-1 bg-[#f2f4f8] rounded-lg self-start lg:self-auto'>
        {options.map(({ key, label }) => {
            const active = value === key;
            const count = counts[key || 'all'];
            return (
                <button
                    key={label}
                    type='button'
                    onClick={() => onChange(key)}
                    className={`inline-flex items-center gap-1.5 h-7 px-3 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors ${active ? 'bg-white text-[#123d84] shadow-sm' : 'text-[#6b7280] hover:text-[#123d84]'}`}
                >
                    {label}
                    {typeof count === 'number' && (
                        <span className={`min-w-[18px] px-1 rounded-full text-[10px] leading-4 text-center ${active ? 'bg-[#123d84] text-white' : 'bg-[#e4e8f0] text-[#4b5563]'}`}>{count}</span>
                    )}
                </button>
            );
        })}
    </div>
);

const BADGE_TONES = {
    green: 'bg-[#e7f6ec] text-[#067647]',
    blue: 'bg-[#e8f1fd] text-[#175cd3]',
    amber: 'bg-[#fff4e5] text-[#b54708]',
    red: 'bg-[#fdecec] text-[#d92d20]',
    purple: 'bg-[#f4ebff] text-[#6941c6]',
    gray: 'bg-[#f2f4f7] text-[#4b5563]',
};

export const Badge = ({ tone = 'gray', title, children }) => (
    <span title={title} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${BADGE_TONES[tone] || BADGE_TONES.gray}`}>
        <span className='w-1.5 h-1.5 rounded-full bg-current' />
        {children}
    </span>
);

// On/off switch. `busy` spins the knob while the change saves.
export const Toggle = ({ checked, onChange, disabled, busy, label }) => (
    <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        disabled={disabled || busy}
        onClick={onChange}
        className={`relative inline-flex items-center w-11 h-6 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123d84]/30 disabled:cursor-not-allowed ${checked ? 'bg-[#12b76a]' : 'bg-[#d0d5dd] hover:bg-[#b9c0cc]'} ${disabled && !busy ? 'opacity-50' : ''}`}
    >
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}>
            {busy && <Loader2 size={12} className='animate-spin text-[#6b7280]' />}
        </span>
    </button>
);

// Excel export of a tab with its filters applied. `empty` disables it when
// the filters match nothing.
export const ExportButton = ({ onClick, busy, empty }) => (
    <button
        type='button'
        onClick={onClick}
        disabled={busy || empty}
        title={empty ? 'Nothing to export for these filters' : 'Download as Excel, with the filters applied'}
        className='h-9 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-b from-[#144196] to-[#0b2456] rounded-lg cursor-pointer whitespace-nowrap transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 self-start sm:self-auto'
    >
        {busy ? <Loader2 size={14} className='animate-spin' /> : <Download size={14} />}
        {busy ? 'Exporting…' : 'Export'}
    </button>
);

const ICON_TONES = {
    navy: 'bg-[#eef3fc] text-[#123d84]',
    green: 'bg-[#e7f6ec] text-[#067647]',
    blue: 'bg-[#e8f1fd] text-[#175cd3]',
    amber: 'bg-[#fff4e5] text-[#b54708]',
    red: 'bg-[#fdecec] text-[#d92d20]',
};

export const StatCard = ({ icon, label, value, sub, tone = 'blue' }) => {
    const Icon = icon;
    return (
        <div className={`${cardClass} p-4 flex items-start gap-3 min-w-0`}>
            <div className={`w-10 h-10 rounded-xl hidden sm:flex items-center justify-center shrink-0 ${ICON_TONES[tone]}`}>
                <Icon size={18} />
            </div>
            <div className='min-w-0'>
                <p className='text-xs font-medium text-[#6b7280]'>{label}</p>
                <p className='text-xl font-semibold text-[#111827] leading-tight mt-1 truncate'>{value}</p>
                {sub && <p className='text-xs text-[#9ca3af] mt-1 truncate' title={sub}>{sub}</p>}
            </div>
        </div>
    );
};

export const EmptyState = ({ icon, title, text }) => {
    const Icon = icon;
    return (
        <div className='py-14 px-4 text-center'>
            <div className='w-12 h-12 mx-auto rounded-xl bg-[#f2f5fc] flex items-center justify-center'>
                <Icon size={22} className='text-[#9aa8c7]' />
            </div>
            <p className='text-sm text-[#374151] font-semibold mt-3'>{title}</p>
            {text && <p className='text-xs text-[#9ca3af] mt-1'>{text}</p>}
        </div>
    );
};

const AVATAR_COLORS = ['bg-[#e6edf9] text-[#123d84]', 'bg-[#f3fbe6] text-[#3f7d00]', 'bg-[#fff4e5] text-[#b54708]', 'bg-[#f4ebff] text-[#6941c6]'];

const getInitials = (name) =>
    name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

// Avatar, name, email and phone. Without a name (a payment with no
// registration) the avatar is blank and `fallback` shows instead.
export const PersonCell = ({ name, email, phone, index = 0, fallback = '-', children }) => (
    <div className='flex items-start gap-3 min-w-0'>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${name ? AVATAR_COLORS[index % AVATAR_COLORS.length] : 'bg-[#f2f4f7] text-[#9ca3af]'}`}>
            {name ? getInitials(name) : '?'}
        </div>
        <div className='min-w-0 flex-1'>
            {name ? (
                <p className='text-sm font-semibold text-[#111827] capitalize truncate' title={name}>{name.toLowerCase()}</p>
            ) : (
                <p className='text-sm text-[#9ca3af] italic'>{fallback}</p>
            )}
            <p className='flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 min-w-0' title={email}>
                <Mail size={12} className='shrink-0 text-[#9ca3af]' />
                <span className='truncate'>{email || '-'}</span>
            </p>
            <p className='flex items-center gap-1.5 text-xs text-[#6b7280] mt-1 whitespace-nowrap'>
                <Phone size={12} className='shrink-0 text-[#9ca3af]' />
                {formatPhone(phone)}
            </p>
            {children}
        </div>
    </div>
);
