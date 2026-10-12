import React, { useState } from 'react'
import { CalendarDays, ReceiptIndianRupee, Users } from 'lucide-react';
import WorkshopRegistrations from './WorkshopRegistrations';
import WorkshopManagement from './WorkshopManagement';
import WorkshopTransactions from './WorkshopTransactions';
import '../../App.css'

const TABS = [
    { key: 'management', label: 'Workshop Management', icon: <CalendarDays size={16} />, Component: WorkshopManagement },
    { key: 'registrations', label: 'Registrations', icon: <Users size={16} />, Component: WorkshopRegistrations },
    { key: 'transactions', label: 'Transactions', icon: <ReceiptIndianRupee size={16} />, Component: WorkshopTransactions },
];

const Workshop = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    // only the active tab is mounted, so each tab refetches when opened (e.g. after adding a workshop)
    const { Component } = TABS.find((t) => t.key === activeTab);

    return (
        <div className='px-4 sm:px-6 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
                <div>
                    <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84] leading-tight'>Workshop</h4>
                    <p className='text-sm text-[#6b7280] mt-1'>Create workshops for the website and track who has registered.</p>
                </div>

                <div className='inline-flex max-w-full overflow-x-auto p-1 bg-white border border-[#e6e9f2] rounded-xl shadow-sm self-start sm:self-auto whitespace-nowrap'>
                    {TABS.map(({ key, label, icon }) => {
                        const active = key === activeTab;
                        return (
                            <button
                                key={key}
                                type='button'
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${active
                                    ? 'bg-gradient-to-b from-[#144196] to-[#0b2456] text-white shadow'
                                    : 'text-[#4b5563] hover:text-[#123d84] hover:bg-[#f2f5fc]'
                                    }`}
                            >
                                {icon}
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className='mt-5 sm:mt-6'>
                <Component />
            </div>
        </div>
    )
}

export default Workshop
