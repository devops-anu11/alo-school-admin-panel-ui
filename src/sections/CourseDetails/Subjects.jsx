import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import { useParams } from "react-router-dom";
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from 'react-modal';
import Subjectpopup from './Subjectpopup';
import { getSubjects } from '../../api/Serviceapi';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { HiOutlinePencilAlt } from "react-icons/hi";

const Subjects = () => {
    const [sem, setSem] = useState('sem1');
    const { id, batchId } = useParams();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [coursename, setCourseName] = useState('');
    const [batchname, setBatchName] = useState('');
    const statusChange = (event) => {
        setSem(event.target.value);
    };
    const [isOpen, setIsOpen] = useState(false);

    let getsubjectlist = async () => {
        setLoading(true); // start loading
        await getSubjects(id, batchId, sem)
            .then((res) => {
                setSubjects(res?.data?.data);
                console.log(res?.data?.data);
                console.log(res?.data?.data?.batchData);
                setCourseName(res.data.data[0].courseData?.courseName || "");
                setBatchName(res.data.data[0].batchData?.batchName || "");


            })
            .catch((err) => console.error('Error fetching user:', err))
            .finally(() => setLoading(false)); // stop loading
    };
    useEffect(() => {
        getsubjectlist()
        // getBatchname()
    }, [id, batchId, sem]);
    const [editData, setEditData] = useState(null);
    const hasSubjects =
        Array.isArray(subjects) &&
        subjects.length > 0 &&
        subjects.some(user => user.subjects?.length > 0);


    return (
        <>
            <div className="pb-[100px] bg-[#f6f7fb] min-h-full">
                <div className='p-4 sm:p-5 md:p-6 Outlet max-w-6xl mx-auto' >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-3 sm:gap-4 mb-2">
                        <h4 className='text-xl sm:text-2xl font-semibold text-[#123d84]'>Subjects</h4>
                        <div className='flex items-center flex-wrap w-full sm:w-auto justify-between sm:justify-end gap-3 sm:gap-4'>
                            <div className="w-full sm:w-[150px]">
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        minWidth: 120,
                                        backgroundColor: '#fff',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <Select
                                        value={sem}
                                        onChange={statusChange}
                                        displayEmpty
                                        IconComponent={KeyboardArrowDownIcon}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            fontSize: '14px',
                                            padding: '4px 10px',
                                            height: '40px',
                                            border: 'none',
                                            color: '#374151'
                                        }}
                                    >

                                        <MenuItem value="sem1">Semester 1</MenuItem>
                                        <MenuItem value="sem2">Semester 2</MenuItem>

                                    </Select>
                                </FormControl>
                            </div>
                            <div className="w-full sm:w-auto">
                                <button
                                    onClick={() => !hasSubjects && setIsOpen(true)}
                                    disabled={hasSubjects}
                                    className={`px-[22px] py-[11px] rounded-[10px] flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap transition-colors
    ${hasSubjects
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "text-white bg-gradient-to-b from-[#144196] to-[#0b2456]"}
  `}
                                >
                                    <PlusIcon className='w-4 h-4' />
                                    {hasSubjects ? "Add Subject" : "Add Subject"}
                                </button>

                            </div>
                        </div>
                    </div>


                    {loading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Loader />
                        </div>
                    ) : Array.isArray(subjects) &&
                        subjects.length > 0 &&
                        subjects.some(user => user.subjects?.length > 0) ? (

                        <div className='w-full max-w-4xl mx-auto mt-6 sm:mt-8 rounded-xl border border-[#eef0f5] bg-white overflow-hidden'>
                            <div className='flex gap-3 items-center justify-center py-5 sm:py-6 px-4 border-b border-[#f0f1f5] bg-gradient-to-b from-[#144196] to-[#0b2456] bg-clip-text text-transparent text-lg sm:text-[22px] md:text-[24px] font-semibold text-center'>
                                <span className="truncate">{coursename} - {batchname}</span>
                                <HiOutlinePencilAlt
                                    className='w-4 h-4 flex-shrink-0 text-[#123d84] cursor-pointer'
                                    onClick={() => {
                                        setEditData(subjects[0]); // assuming one record per sem/course/batch
                                        setIsOpen(true);
                                    }}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[420px]">
                                    <thead>
                                        <tr className="bg-gradient-to-b from-[#144196] to-[#0b2456] text-left">
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-white text-xs uppercase tracking-wide whitespace-nowrap">
                                                Subject Code
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-white text-xs uppercase tracking-wide whitespace-nowrap">
                                                Subjects
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white text-[#374151]">
                                        {subjects.flatMap((user) =>
                                            user.subjects.map((item) => (
                                                <tr key={`${user._id}-${item.subjectCode}`} className="border-b border-[#f0f1f5] last:border-b-0 hover:bg-[#f5f8ff] transition-colors">
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">{item.subjectCode}</td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 capitalize">{item.subjectName}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    ) : (
                        <div className='flex flex-col justify-center items-center h-[300px] text-[#6b7280] font-medium'>
                            <img src={nodata} alt="No subjects" width="180" height="180" className="mb-4 opacity-80 max-w-[140px] sm:max-w-[180px] h-auto" />
                            <p className="text-base sm:text-lg text-[#374151] font-semibold">No subjects added yet</p>
                            <p className="text-sm text-[#9ca3af] mt-1">Click "Add Subject" to get started</p>
                        </div>
                    )}

                </div>
            </div>






            <Modal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(true)}
                contentLabel="Add Student"
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(21,21,21,.6)', // gray overlay
                        zIndex: 1000,
                    },
                    content: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '1.5rem 2rem 2rem',
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '800px',
                        height: 'min(620px, 90vh)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(18, 61, 132, 0.15)',
                        zIndex: 1001,
                    },
                }}
            >
                <Subjectpopup
                    closeModal={() => {
                        setIsOpen(false);
                        setEditData(null);
                    }}
                    courseId={id}
                    batchId={batchId}
                    semester={sem}
                    editData={editData}
                />

            </Modal>

        </>
    )
}
export default Subjects
