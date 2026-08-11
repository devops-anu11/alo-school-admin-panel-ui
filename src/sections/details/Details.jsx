import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getApplicationByid } from '../../api/Serviceapi';
import { IoMdArrowRoundBack } from "react-icons/io";
import Import from '../../assets/dashboardimgs/Import.png';
import Loader from '../../component/loader/Loader';
import Skeleton from '@mui/material/Skeleton';

const Details = () => {

    const { id } = useParams();
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDetails();
    }, [id])

    let getDetails = async () => {
        setLoading(true)
        try {
            let res = await getApplicationByid(id)
            setDetails(res?.data?.data)
            console.log(res?.data?.data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (fileUrl) => {
        try {
            const response = await fetch(fileUrl, { mode: "cors" });
            const blob = await response.blob();

            const contentType = response.headers.get("content-type");
            let extension = "";

            if (contentType) {
                if (contentType.includes("pdf")) extension = ".pdf";
                else if (contentType.includes("png")) extension = ".png";
                else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = ".jpg";
                else if (contentType.includes("gif")) extension = ".gif";
                else extension = "";
            } else {
                extension = fileUrl.split(".").pop().split(/\#|\?/)[0] ? "." + fileUrl.split(".").pop().split(/\#|\?/)[0] : "";
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;


            const filename = "download" + extension;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    return (
        <>
            <div className='px-4 sm:px-5 pt-5 sm:pt-6 pb-[100px] bg-[#f6f7fb] min-h-full' style={{ fontFamily: '"Poppins", sans-serif' }}>
                <div className="flex gap-[10px] items-center pb-4">
                    <div >
                        <IoMdArrowRoundBack style={{ cursor: 'pointer', fontSize: '20px', marginTop: '2px', color: '#123d84' }} onClick={() => window.history.back()} />

                    </div>
                    <div>
                        <h4 className='text-[22px] sm:text-[26px] font-semibold text-[#123d84]'>Student Details</h4>

                    </div>
                </div>

                {loading ?


                    <div>
                        <div>
                            <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 rounded-xl'>
                                <div className=''>


                                    <div className='w-[100%]'>
                                        <div className="flex  items-center pb-[10px]">
                                            <div>

                                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                                    <div className='w-[100px] h-[100px]'>
                                                        <Skeleton variant="circular" width={100} height={100} />
                                                    </div>

                                                </div>
                                            </div>
                                            <div style={{ width: '100%' }}>

                                                <Skeleton variant="text" width={80} height={40} />
                                                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-[14px] gap-3'>

                                                    <div>

                                                        <div className='text-[#6b7280]'>Phone</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>E-Mail</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>

                                                    <div>
                                                        <div className='text-[#6b7280]'>Blood</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>D.O.B</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>Gender</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>Pincode</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>




                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 text-[14px] w-[100%] gap-3'>
                            <div >
                                <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 mt-3 rounded-xl '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left'>Personal Details</p>

                                    <div>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Address :</span> <Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Country :</span> <Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>State :</span><Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Parent Name :</span><Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Relation :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Alternate Email :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Emergency Contact :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Occupation :</span><Skeleton variant="text" width={80} height={40} /> </p>

                                    </div>
                                </div>

                                <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 mt-3 rounded-xl '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left'>Documents</p>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 text-[14px] w-[100%] gap-3'>

                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>
                                            <div className='flex justify-between items-center '>
                                                <h4>Aadhar card</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Profile</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Signature</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>


                                            <div className='flex justify-between items-center'>
                                                <h4>Marksheet</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Transfer Certificate</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>



                                    </div>
                                </div>
                            </div>

                            <div >
                                <div className='bg-white border border-[#eef0f5] px-4 py-3 sm:px-5 mt-3 rounded-xl h-[100%] '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left pb-3'>Academic Details</p>

                                    <div className='h-[420px] sm:h-[490px] overflow-y-auto'>

                                        <div className='bg-[#f6f7fb] border border-[#eef0f5] rounded-lg mt-2'>
                                            <div className=' px-[20px] py-[10px]  '>
                                                <p className='py-[5px] flex items-center gap-[5px]   '>Degree\Qualification : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px]   '>School\Unversity : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px] '>Start Year : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className=' py-[5px] flex items-center gap-[5px]  '>End Year : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px]  '>Grade : <Skeleton variant="text" width={80} height={40} /></p>

                                            </div>
                                        </div>



                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>

                    :
                    <div>
                        <div>
                            <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 rounded-xl'>
                                <div className=''>


                                    <div className='w-[100%]'>
                                        <div className="flex   items-center pb-[10px] " >
                                            <div>

                                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                                    <div className='w-[100px] h-[100px]'>
                                                        <img src={details?.imageUrl} alt="profile" className='w-[100%] h-[100%]' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div style={{ width: '100%' }}>

                                                <h2 className='text-[20px] sm:text-[22px] font-semibold text-[#111827] text-center md:text-left'>{details?.firstName?.replace(/\b\w/g, (char) => char.toUpperCase())} {details?.lastName?.replace(/\b\w/g, (char) => char.toUpperCase())}</h2>

                                                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-[14px] gap-3' >

                                                    <div>

                                                        <div className='text-[#6b7280]'>Phone</div>
                                                        <p className='font-[500]'>+{details?.phoneNo}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>E-Mail</div>
                                                        <p title={details?.email} className='font-[500] truncate overflow-hidden whitespace-nowrap w-[90%]'>{details?.email}</p>
                                                    </div>

                                                    <div>
                                                        <div className='text-[#6b7280]'>Blood</div>
                                                        <p className='font-[500]'>{details?.bloodgroup}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>D.O.B</div>
                                                        <p className='font-[500]'>{details?.DOB?.split("T")[0]}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>Gender</div>
                                                        <p className='font-[500]'>{details?.gender}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#6b7280]'>Pincode</div>
                                                        <p className='font-[500]'>{details?.pincode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 text-[14px] gap-3'>
                            <div >
                                <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 mt-3 rounded-xl '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left'>Personal Details</p>

                                    <div>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Address :</span> <span>{details?.fullAddress}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Country :</span> <span>{details?.country}</span></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>State :</span><span>{details?.state}</span></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>District :</span><span>{details?.district}</span></p>

                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Parent Name :</span><span>{details?.parentName}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Relation :</span><span>{details?.relation}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Alternate Email :</span><span>{details?.alternativeEmail}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Emergency Contact :</span><span>{details?.emergencyContact}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Occupation :</span><span>{details?.occupation}</span> </p>

                                    </div>
                                </div>

                                <div className='bg-white border border-[#eef0f5] px-4 py-4 sm:px-5 sm:py-5 mt-3 rounded-xl '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left'>Documents</p>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 text-[14px] w-[100%] gap-3'>

                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>
                                            <div className='flex justify-between items-center '>
                                                <h4>Aadhar card</h4>
                                                <button className='inline-flex items-center gap-1 cursor-pointer bg-[#eef2ff] text-[#123d84] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#123d84] hover:text-white' onClick={() => handleDownload(details?.aadharUrl)
                                                }>Download <img src={Import} alt="" className="w-3.5 ml-1" /></button>

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Profile</h4>
                                                <button className='inline-flex items-center gap-1 cursor-pointer bg-[#eef2ff] text-[#123d84] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#123d84] hover:text-white' onClick={() => handleDownload(details?.imageUrl)
                                                }>Download <img src={Import} alt="" className="w-3.5 ml-1" /></button>

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Signature</h4>
                                                <button className='inline-flex items-center gap-1 cursor-pointer bg-[#eef2ff] text-[#123d84] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#123d84] hover:text-white' onClick={() => handleDownload(details?.signatureUrl)
                                                }>Download <img src={Import} alt="" className="w-3.5 ml-1" /></button>

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>


                                            <div className='flex justify-between items-center'>
                                                <h4>Marksheet</h4>
                                                <button className='inline-flex items-center gap-1 cursor-pointer bg-[#eef2ff] text-[#123d84] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#123d84] hover:text-white' onClick={() => handleDownload(details?.markSheetUrl)
                                                }>Download <img src={Import} alt="" className="w-3.5 ml-1" /></button>

                                            </div>
                                        </div>
                                        <div className='text-xs bg-[#f6f7fb] border border-[#eef0f5] rounded-lg px-4 py-2.5 my-2 hover:border-[#123d84] transition-colors '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Transfer Certificate</h4>
                                                <button className='inline-flex items-center gap-1 cursor-pointer bg-[#eef2ff] text-[#123d84] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#123d84] hover:text-white' onClick={() => handleDownload(details?.tcUrl)
                                                }>Download <img src={Import} alt="" className="w-3.5 ml-1" /></button>

                                            </div>
                                        </div>



                                    </div>
                                </div>
                            </div>

                            <div >
                                <div className='bg-white border border-[#eef0f5] px-4 py-3 sm:px-5 mt-3 rounded-xl h-[100%] '>
                                    <p className='text-[16px] font-semibold text-[#123d84] text-center md:text-left pb-3'>Academic Details</p>

                                    <div className='h-[420px] sm:h-[490px] overflow-y-auto'>
                                        {details?.academicQualification?.map((item, index) => (
                                            <div className='bg-[#f6f7fb] border border-[#eef0f5] rounded-lg mt-2'>
                                                <div className=' px-[20px] py-[10px]  '>
                                                    <p className='py-[5px] flex items-center gap-[5px]   '>Degree\Qualification : {item?.qualification}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px]   '>School\University : {item?.university}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px] '>Start Year : {item?.fromDate}</p>
                                                    <p className=' py-[5px] flex items-center gap-[5px]  '>End Year : {item?.toDate}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px]  '>Grade : {item?.grade}</p>

                                                </div>
                                            </div>

                                        ))}

                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>
                }
            </div>






        </>
    )
}

export default Details