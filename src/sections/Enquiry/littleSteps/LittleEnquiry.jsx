import React, { useEffect, useState } from 'react'
import { getLittleStepsEnquiry } from '../../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Loader from '../../../component/loader/Loader';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

const theme = createTheme({
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
        },
      },
    },
  },
});

const LittleStepsEnquiry = () => {

  const [limit] = useState(10);
  const [page, setPage] = useState(1);  
  const [enquiry, setEnquiry] = useState([]);
  const [loader, setloader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const getData = async () => {
    setloader(true);
    try {
      let res = await getLittleStepsEnquiry(limit, page);

      const data = res?.data?.data;

      setEnquiry(data?.enquiries || []);
      setTotalCount(data?.totalRecords || 0); 

    } catch (err) {
      console.log(err);
    } finally {
      setloader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [page]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className='px-4 sm:px-5 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>

      <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84]'>ALO LittleSteps Enquiry</h4>

      <div className='mt-4 sm:mt-5 bg-white border border-[#eef0f5] rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className="w-full border-collapse" style={{ minWidth: '780px' }}>

            <thead>
              <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456]">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Parent Name</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Child Name</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Phone</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Email</th>

                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Program</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white text-left">Date</th>
              </tr>
            </thead>

            {loader ? (
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <Loader />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>

                {enquiry.length > 0 ? (
                  enquiry.map((item, index) => (
                    <tr key={item._id || index} className="border-b border-[#f0f1f5] last:border-0 hover:bg-[#f5f8ff] transition-colors">
                      <td className="px-4 py-3.5 text-sm text-[#374151]">{item.parentsName}</td>
                      <td className="px-4 py-3.5 text-sm text-[#374151]">{item.childsName}</td>
                      <td className="px-4 py-3.5 text-sm text-[#374151]">{item.phoneNumber}</td>
                      <td className="px-4 py-3.5 text-sm text-[#374151]">{item.email}</td>

                      <td className="px-4 py-3.5 text-sm text-[#374151]">{item.programOfInterest}</td>
                      <td className="px-4 py-3.5 text-sm text-[#374151]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <InboxOutlinedIcon sx={{ fontSize: 32, color: "#c2c8d4" }} />
                      <p className="text-sm text-[#9ca3af] font-medium mt-2">No Data Found</p>
                    </td>
                  </tr>
                )}

              </tbody>
            )}
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <ThemeProvider theme={theme}>
          <div className="flex justify-end mt-4">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              showFirstButton
              showLastButton
            />
          </div>
        </ThemeProvider>
      )}

    </div>
  );
};

export default LittleStepsEnquiry;