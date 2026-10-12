import { useEffect, useState } from 'react';
import { createTheme } from '@mui/material/styles';
import { getWorkshops } from '../../api/Serviceapi';

export const paginationTheme = createTheme({
    components: {
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    color: '#1f2937',
                    '&.Mui-selected': {
                        background: 'linear-gradient(to bottom, #144196, #061530)',
                        color: '#fff',
                        border: 'none',
                    },
                    '&:hover': {
                        backgroundColor: '#f3f4f6',
                    },
                },
            },
        },
    },
});

// "14:30" -> "02:30 PM"
export const formatTime = (time) => {
    if (!time) return '-';
    const [h, m] = time.split(':').map(Number);
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

// workshop dates are plain dates stored as UTC midnight, so format in UTC
export const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// real moments (registered on, paid at), shown in the viewer's time
export const formatDateOnly = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const formatClock = (date) =>
    date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '';

// 199 -> "₹199", 4.7 -> "₹4.70"
export const formatMoney = (amount) => {
    const value = Number(amount) || 0;
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;
};

// "9876543210" -> "+91 98765 43210"
export const formatPhone = (phone) => {
    if (!phone) return '-';
    const digits = String(phone).replace(/\D/g, '');
    const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : `+${digits}`;
};

// Workshops for the filter dropdowns (newest first, as the API sorts them).
export const useWorkshopOptions = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getWorkshops(100, 0)
            .then((res) => setWorkshops(res?.data?.data?.data || []))
            .catch((err) => console.log(err))
            .finally(() => setLoaded(true));
    }, []);

    return { workshops, loaded };
};
