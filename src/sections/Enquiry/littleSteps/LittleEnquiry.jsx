import React, { useEffect, useState } from 'react'
import { getLittleStepsEnquiry } from '../../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../../assets/nodata.jpg'
import Loader from '../../../component/loader/Loader';

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
  const [offset, setoffset] = useState(1);
  const [enquiry, setEnquiry] = useState([]);
  const [loader, setloader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const getData = async () => {
    setloader(true);
    try {
      let res = await getLittleStepsEnquiry(limit, offset - 1);

      const data = res?.data?.data;

      setEnquiry(data?.enquiries || []);
      setTotalCount(data?.totalCount || 0); // ✅ IMPORTANT

    } catch (err) {
      console.log(err);
    } finally {
      setloader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [offset]);

  // ✅ total pages calculation
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className='px-5 pt-6 pb-[100px]'>

      <h4 className='text-xl font-normal'>ALO LittleSteps Enquiry</h4>

      <div className='mt-5 overflow-x-auto'>
        <table className="w-full rounded-md">

          <thead className="bg-[#F8F8F8] text-left">
            <tr>
              <th className="px-4 py-2">Parent Name</th>
              <th className="px-4 py-2">Child Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Program</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>

          {loader ? (
            <tbody>
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <Loader />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>

              {enquiry.length > 0 ? (
                enquiry.map((item, index) => (
                  <tr key={item._id || index} style={{ borderBottom: '1px solid #eee' }}>
                    <td className="px-4 py-3">{item.parentsName}</td>
                    <td className="px-4 py-3">{item.childsName}</td>
                    <td className="px-4 py-3">{item.phoneNumber}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">{item.age}</td>
                    <td className="px-4 py-3">{item.programOfInterest}</td>
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <img src={nodata} width="150" className="m-auto" />
                    <p>No Data Found</p>
                  </td>
                </tr>
              )}

            </tbody>
          )}
        </table>
      </div>

   
      {totalPages > 1 && (
        <ThemeProvider theme={theme}>
          <div className="flex justify-end mt-4">
            <Pagination
              count={totalPages}
              page={offset}
              onChange={(e, val) => setoffset(val)}
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