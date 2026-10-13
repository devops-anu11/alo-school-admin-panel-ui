import React from 'react'
import Pagination from '@mui/material/Pagination';
import { ThemeProvider } from '@mui/material/styles';
import { paginationTheme } from './workshopUtils';

// Shown whenever there are rows, so the page controls don't disappear while
// everything still fits on one page. page is 1-based.
const WorkshopPagination = ({ page, limit, total, onChange, label = 'records' }) => {
    if (!total) return null;

    const first = (page - 1) * limit + 1;
    const last = Math.min(page * limit, total);

    return (
        <div className='flex flex-wrap items-center justify-end gap-3'>
            <p className='text-xs text-[#6b7280]'>Showing {first}–{last} of {total} {label}</p>
            <ThemeProvider theme={paginationTheme}>
                <Pagination count={Math.ceil(total / limit)} page={page} onChange={onChange} showFirstButton showLastButton />
            </ThemeProvider>
        </div>
    );
};

export default WorkshopPagination
