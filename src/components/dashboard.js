import React from "react";
import './dashboard.css';
import DashboardHeader from "./dashboard-header";
import { fetchStudentsData,fetchBatchData } from "./data";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let alertLineFunc = false;
export const Alert = (status,info,time=null) => {
    if (alertLineFunc)return
    let timer = 0;
    if (time !== null && time > 0){
        timer = time;
    }else{
        timer = 5000;
    };
    let img = '';
    let waitTime = timer * 0.001;
    alertLineFunc = true;
    const alertDiv = document.querySelector('.alert-div');
    const alertPEle = document.querySelector('.alert-div p');
    const alertLine = document.querySelector('.alert-timer-line');
    const alertImg = document.querySelector('.alert-div-img');
    if (status === 'success'){
        alertDiv.style.background = '#d1e6dd';
        alertPEle.style.color = 'darkgreen';
        alertLine.style.border = 'solid 1.5px green';
        alertImg.setAttribute('src','images/success-icon.png')
    }else if(status === 'error'){
        alertDiv.style.background = '#f8d7da';
        alertPEle.style.color = 'darkred';
        alertLine.style.border = 'solid 1.5px darkred';
        alertImg.setAttribute('src','images/error-icon.png')
    }else if(status === 'warning'){
        alertDiv.style.background = '#fff3cd';
        alertPEle.style.color = '#674c03';
        alertLine.style.border = 'solid 1.5px #674c03';
        alertImg.setAttribute('src','images/warning-icon.png')
    }else if(status === 'note'){
        alertDiv.style.background = '#cff4fc';
        alertPEle.style.color = '#055160';
        alertLine.style.border = 'solid 1.5px #055160';
        alertImg.setAttribute('src','images/note-alert-icon.png')
    }
    alertPEle.innerHTML = `${img} ${info}`;
    alertDiv.style.top = '5%';
    alertDiv.style.opacity = '1';
    alertLine.style.width = '100%';
    alertDiv.style.visibility = 'visible';
    alertLine.style.transition = `width ${waitTime}s linear`;
    alertLine.style.width = '0%';
    setTimeout(()=>{
        alertDiv.style.opacity = '0';
        setTimeout(() => {
            alertDiv.style.visibility = 'hidden';
            alertDiv.style.top = '0%';
            alertLine.style.transition = 'none'; 
            alertLine.style.width = '100%';
            alertLineFunc = false;
        }, 1000);
    },timer);
};

export const isAdminAuth = () => {
    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();
    const loginned = localStorage.getItem('Login') || 'False';
    const isAuth = localStorage.getItem('isAuthenticated') || 'False';
    const stdLogin = sessionStorage.getItem('StdLogin') || 'False';
    const isStdAuth = sessionStorage.getItem('isStdAuthenticated') || 'False';
    if (isAuth === 'True' && loginned.includes(`True ${day} ${month} ${year}`)){
        if (stdLogin === 'True' && isStdAuth === 'True'){
            return false;
        }else if (stdLogin === 'False' && isStdAuth === 'False'){
            sessionStorage.setItem('isAdmin','True');
            return true;
        };
    }else{
        return false;
    };
};

export const isStudentAuth = () => {
    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();
    const loginned = localStorage.getItem('Login') || 'False';
    const isAuth = localStorage.getItem('isAuthenticated') || 'False';
    const stdLogin = sessionStorage.getItem('StdLogin') || 'False';
    const isStdAuth = sessionStorage.getItem('isStdAuthenticated') || 'False';
    if (stdLogin === 'True' && isStdAuth === 'True'){
        if (isAuth === 'False' && !loginned.includes(`True ${day} ${month} ${year}`)){
            sessionStorage.setItem('isStudent','True');
            return true;
        }else if (isAuth === 'True' && loginned.includes(`True ${day} ${month} ${year}`)){
            return false;
        }
    }else{
        return false;
    };
};

export const closeAlert = () => {
    const alertDiv = document.querySelector('.alert-div');
    alertDiv.style.opacity = '0';
    setTimeout(()=>{
        alertDiv.style.visibility = 'hidden';
    },1000);
};

const Dashboard = () => {
    const [allStudentsData, setAllStudentsData] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    const [batchesData, setbatchesData] = useState([]);
    const [selectedBatch,setSelectedBatch] = useState("All");
    const studentsDataLength = (Array.isArray(studentsData)) ? studentsData.length : 0;
    const batchesDataLength = (Array.isArray(batchesData)) ? batchesData.length : 0;
    const isAdminAction = sessionStorage.getItem('isAdminLoggined');
    const history = useNavigate();

    const getStudents = async () => {
        const student_Data = await fetchStudentsData();
        setStudentsData(student_Data);
        setAllStudentsData(student_Data);
    };
    
    const getBatchesData = async () => {
        const batchesData = await fetchBatchData();
        setbatchesData(batchesData);
    };  
    
    useEffect(() => {
      getBatchesData();
      getStudents();
    }, []);

    useEffect(() => {
        getStudents();
    }, [studentsData]);

    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();

    if ((isAdminAuth() && !isStudentAuth()) || (!isAdminAuth() && isStudentAuth())) {
        
        if (isAdminAction === 'True'){
            setTimeout(()=>{
                Alert('note',`Welcome back <strong>${JSON.parse(sessionStorage.getItem('LogginedUser'))}</strong>.`);
                sessionStorage.setItem('isAdminLoggined','False');
            },50);
        };

        sessionStorage.getItem('SelectedStudent',JSON.stringify([]));
        if (sessionStorage.getItem('std_into_tried') === 'True'){
            sessionStorage.setItem('std_into_tried','False');
            setTimeout(()=>{
                Alert('error','Student must be selected to show details !');
            },100);
        };

        const addBatch =  async (batchName) => {
            const data = {
                BatchName : batchName,
                Classes : 0,
                CaseStudies : 0,
                MockTests : 0,
                Interviews : 0,
            };
            try {
                let res = await axios.post('http://127.0.0.1:8000/batches/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',`Batch : ${batchName} Added successfully !`);
                    setbatchesData([...batchesData, data]);
                    setSelectedBatch(batchName);
                }
            } catch (error){
                Alert('error', 'Unfortunately, the batch addition was unsuccessful.<br/>Please check & try again !');
                setSelectedBatch(batchesData[0].BatchName);
            }
        };

        const dashboardBatchChange = (event=null,clicked=null) => {
            const selectElement = document.querySelector('.batches');
            if((!batchesData) && (!studentsData)){
                Alert('error','Something went wrong. Please try again later !');
                selectElement.value = 'All';
            }else{
                const addBatchInput = document.querySelector('.add-batch-option');
                const addBatchBtn = document.querySelector('.add-batch-option-btn');
                const deleteBatchCon = document.querySelector('.delete-batch-container');
                const deleteBlurDiv = document.querySelector('.blur-div');
                if (event !== null){
                    const selectedValue = event.target.value;
                    if (event.target.value === 'AddBatch'){
                        selectElement.style.visibility = 'hidden';
                        addBatchInput.style.visibility = 'visible';
                        addBatchBtn.style.visibility = 'visible';
                    }else if (event.target.value === 'DeleteBatch'){
                        deleteBatchCon.style.opacity = '1';
                        deleteBatchCon.style.visibility = 'visible';
                        deleteBlurDiv.style.visibility = 'visible';
                    }else{
                        setSelectedBatch(selectedValue);
                    }
                }
                if (clicked === 'click'){
                    if (addBatchInput.value.length > 5){
                        addBatchBtn.style.transition = 'right 0.5s ease-in-out, width 0.5s ease-in-out';
                        addBatchBtn.style.width = '40px';
                        addBatchBtn.style.right = '5%';
                        setTimeout(()=>{
                            addBatchBtn.classList.add('btn-rotate');
                            setTimeout(()=>{
                                addBatchBtn.classList.remove('btn-rotate')
                                addBatchBtn.style.width = '35%';
                                const newBatch = addBatchInput.value.toUpperCase();
                                const searchBatchData = batchesData.some(batch=>batch.BatchName.toLowerCase() === newBatch.toLowerCase());
                                if (searchBatchData){
                                    setSelectedBatch(newBatch);
                                    Alert('warning',`Batch : ${newBatch} already exists !`);
                                }else{
                                    addBatch(newBatch);
                                }
                                selectElement.style.visibility = 'visible';
                                addBatchInput.style.visibility = 'hidden';
                                addBatchBtn.style.visibility = 'hidden';
                                addBatchInput.value = "";
                                addBatchBtn.style.right = '0';
                            },3000)
                        },500)
                    }else{
                        selectElement.style.visibility = 'visible';
                        addBatchInput.style.visibility = 'hidden';
                        addBatchBtn.style.visibility = 'hidden';
                        if (Array.isArray(batchesData) && batchesData.length > 0) {
                            setSelectedBatch(batchesData[0].BatchName);
                        }
                        Alert('error', 'Error : Input must be at least 5 characters !');
                    };
                };
            };
        };

        const searchData = (clicked=null) => {
            if((!batchesData) && (!studentsData)){
                Alert('error','Something went wrong. Please try again later !');
            }else{
                const searchedInput = document.querySelector('.search-data-input');
                const imgElement = document.querySelector('.search-input-div img');
                let found1 = false;
                let found2 = false;
                if (searchedInput.value.length > 0){
                    found1 = true
                    if (clicked === 'Enter' || imgElement.getAttribute('src') === 'images/Search-logo.png'){
                        setSelectedBatch("None");
                        imgElement.setAttribute('src', 'images/x-icon.png');
                        found2 = true;
                        const searchArray = [];
                        allStudentsData.forEach((data)=>{
                            if ((data.Name.toLowerCase().includes(searchedInput.value.toLowerCase()) || data.Email.toLowerCase().includes(searchedInput.value.toLowerCase()) || data.Phone.includes(searchedInput.value)) || (data.PG === 'N/A' ? data.Degree.toLowerCase().includes(searchedInput.value) : data.PG.toLowerCase().includes(searchedInput.value)) || ((data.PG_Year==='N/A') ? data.Degree_Year.includes(searchedInput.value) : data.PG_Year.includes(searchedInput.value))){
                                searchArray.push(data);
                            };
                        });
                    sessionStorage.setItem('isSearched','True');
                    sessionStorage.setItem('SearchedData', JSON.stringify(searchArray));
                    }
                };
                if (!found1 || !found2){
                    getStudents();
                    if (Array.isArray(batchesData) && batchesData.length > 0) {
                        setSelectedBatch(batchesData[0].BatchName);
                    }
                    sessionStorage.setItem('StdData', 'True');
                    searchedInput.value = '';
                    imgElement.setAttribute('src', 'images/Search-logo.png');
                    sessionStorage.setItem('isSearched','False');
                    sessionStorage.setItem('SearchedData', JSON.stringify([]));
                };
            };
        };
        const SearchInput = (event) => {
            if((!batchesData) && (!studentsData)){
                Alert('error','Something went wrong. Please try again later !');
            }else{
                if (event.key === 'Enter') {
                    searchData('Enter');
                }
            }
        };

        const selectStd = (idx,id) => {
            let status = true;
            studentsData.forEach(data=>{
                if (data.id === id){
                    if (data.Status !== 'Active'){
                        status = false;
                    }
                }
            });
            if (status){
                const stdCheckboxEle = document.querySelector(`.student-details-container${idx} .std-checkbox${idx}`);
                stdCheckboxEle.checked = (stdCheckboxEle.checked === true) ? false : true;
            }
        }

        const stdAttPopUp = (status) => {
            if((!batchesData) && (!studentsData)){
                Alert('error','Something went wrong. Please try again later !');
            }else{
                const attPopUpDiv = document.querySelector('.attendance-pop-up-container');
                const tkeAttBtn = document.querySelector('.make-operation-btn');
                const att_Submit_Btn = document.querySelector('.attendance-submit-btn');
                const attChkbxElemsnts = document.querySelectorAll('.att-ck');
                const att_Chkbx_Elemsnts = Array.from(attChkbxElemsnts);
                if (status === 'open'){
                    const stdCheckboxEle = document.querySelectorAll('.student-details-container .std-checkbox');
                    const stdCheckboxElements = Array.from(stdCheckboxEle);
                    studentsData.forEach((data,index)=>{
                        if (selectedBatch === 'All' || data.BatchName === selectedBatch){
                            if (document.querySelector(`.std-checkbox${index}`).checked === true){
                                if (data.Classes.includes(`${day} ${month} ${year}`)){
                                    document.querySelector('.att-ck-1').disabled = true;
                                }
                                if (data.MockTests.includes(`${day} ${month} ${year}`)){
                                    document.querySelector('.att-ck-2').disabled = true;
                                }
                                if (data.CaseStudies.includes(`${day} ${month} ${year}`)){
                                    document.querySelector('.att-ck-3').disabled = true;
                                }
                                if (data.Interviews.includes(`${day} ${month} ${year}`)){
                                    document.querySelector('.att-ck-4').disabled = true;
                                };
                            };
                        };
                    });
                    const isAttChecked = att_Chkbx_Elemsnts.some(ele=>ele.disabled);
                    const isAll_AttChecked = att_Chkbx_Elemsnts.every(ele=>ele.disabled);
                    const isChecked = stdCheckboxElements.some(chk=>chk.checked);
                    if (isChecked){
                        tkeAttBtn.style.width = '40px';
                        tkeAttBtn.style.color = 'transparent';
                        setTimeout(()=>{
                            tkeAttBtn.classList.add('btn-rotate');
                            setTimeout(()=>{
                                tkeAttBtn.classList.remove('btn-rotate');
                                tkeAttBtn.style.width = '80%';
                                setTimeout(()=>{
                                    tkeAttBtn.style.color = '#ffff';
                                },500)
                                attPopUpDiv.style.visibility = 'visible';
                                if (isAttChecked && !isAll_AttChecked){
                                    Alert('note',"Some selected students have already taken today's attendance.",5000);
                                }else if (isAll_AttChecked){
                                    Alert('error',"All selected students have already taken today's attendance.<br/>Check and try again!",5000);
                                    att_Submit_Btn.disabled = true;
                                    att_Submit_Btn.classList.add('disabled-btn');
                                }else{
                                    att_Submit_Btn.disabled = false;
                                    att_Chkbx_Elemsnts.forEach(ele=>ele.checked = false);
                                    att_Chkbx_Elemsnts.forEach(ele=>ele.disabled = false);
                                }
                            },3000);
                        },500);
                    }else{
                        Alert('warning','Select atleast one student to take Attendance !');
                    }
                }else if (status === 'close'){
                    attPopUpDiv.style.visibility = 'hidden';
                    att_Chkbx_Elemsnts.forEach(ele=>ele.checked = false);
                    att_Chkbx_Elemsnts.forEach(ele=>ele.disabled = false);
                    att_Submit_Btn.disabled = false;
                };
            };
        };

        const takeStdAttendance = () => {
            const attElements = document.querySelectorAll('.att-ck');
            const attSubmitBtn = document.querySelector('.attendance-submit-btn');
            const att_Elements = Array.from(attElements);
            const selectedAttEle = att_Elements.some(ele=>ele.checked === true);
            const classAtt = document.querySelector('.att-ck-1').checked ? true : false;
            const mockAtt = document.querySelector('.att-ck-2').checked ? true : false;
            const studyAtt = document.querySelector('.att-ck-3').checked ? true : false;
            const interviewAtt = document.querySelector('.att-ck-4').checked ? true : false;
            if (selectedAttEle === true){
                attSubmitBtn.style.width = '40px';
                attSubmitBtn.style.color = 'transparent';
                setTimeout(()=>{
                    attSubmitBtn.classList.add('btn-rotate');
                    attSubmitBtn.style.background = 'transparent';
                    attSubmitBtn.style.border = 'solid 5px #616bf1';
                    attSubmitBtn.style.borderRight = 'solid 5px transparent';
                    attSubmitBtn.style.borderRadius = '50%';
                    setTimeout(()=>{
                        studentsData.forEach((data,index)=>{
                            if (selectedBatch === 'All' || data.BatchName === selectedBatch){
                                if (document.querySelector(`.std-checkbox${index}`).checked === true){
                                    if (classAtt){
                                        const classCnt = data.Classes.split(' ')[0];
                                        data.Classes = `${parseInt(classCnt) + 1} ${data.id} ${day} ${month} ${year}`; 
                                    }
                                    if (mockAtt){
                                        const mockCnt = data.MockTests.split(' ')[0];
                                        data.MockTests = `${parseInt(mockCnt) + 1} ${data.id} ${day} ${month} ${year}`; 
                                    }
                                    if (studyAtt){
                                        const studyCnt = data.CaseStudies.split(' ')[0];
                                        data.CaseStudies = `${parseInt(studyCnt) + 1} ${data.id} ${day} ${month} ${year}`; 
                                    }
                                    if (interviewAtt){
                                        const interviewsCnt = data.Interviews.split(' ')[0];
                                        data.Interviews = `${parseInt(interviewsCnt) + 1} ${data.id} ${day} ${month} ${year}`; 
                                    }
                                    updateStdAttendance(data);
                                };
                            }
                        });
                        attSubmitBtn.classList.remove('btn-rotate');
                        attSubmitBtn.style.width = '50%';
                        attSubmitBtn.style.background = '#616bf1';
                        attSubmitBtn.style.border = 'solid 1px #616bf1';
                        attSubmitBtn.style.borderRadius = '5px';
                        stdAttPopUp('close');
                        setTimeout(()=>{
                            attSubmitBtn.style.color = '#ffff';
                        },500)
                    },3000)
                },500)
            }else{
                Alert('warning', 'Select atleast one Attandence option !');
            };
        };
        
        const updateStdAttendance = async (data) => {
            const stdInputEles = document.querySelectorAll('.std-checkbox');
            const inputEles = Array.from(stdInputEles);
            try {
                let res = await axios.put('http://127.0.0.1:8000/students/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success','Student(s) Attendance updated successfully !');
                    inputEles.forEach(ele=>{
                        ele.checked = false;
                    })
                }
            } catch (error){
                Alert('error', 'Unfortunately, Attendance update was unsuccessful. Please check & try again !');
            }
        };


        const sideBar =()=> {
            const blurdiv = document.querySelector('.blur-div');
            const opts = document.querySelectorAll('.logo-opt');
            const opt = Array.from(opts)
            const optsDiv = document.querySelector('.profile-side-bar');
            if (optsDiv && optsDiv.getAttribute('data-value') === 'hidden'){
                optsDiv.style.visibility = 'visible';
                blurdiv.style.visibility = 'visible';
                optsDiv.style.pointerEvents = 'auto';
                opt.forEach(ele=>ele.style.margin = '0');
                optsDiv.setAttribute('data-value','visible')
            }else if (optsDiv && optsDiv.getAttribute('data-value') === 'visible'){
                opt.forEach(ele=>ele.style.marginRight = '-450px');
                setTimeout(()=>{
                    optsDiv.style.visibility = 'hidden';
                    blurdiv.style.visibility = 'hidden';
                    optsDiv.style.pointerEvents = 'none';
                    optsDiv.setAttribute('data-value','hidden')
                },1000)
            }
        };

        const confirmationDiv = (context,name) => {
            let mainDiv;
            if (name === 'logout'){
                mainDiv = document.querySelector('.confirm-operation-div-1');
            }else{
                mainDiv = document.querySelector('.confirm-operation-div-2');
            }
            if (mainDiv){
                if (context === 'open'){
                    mainDiv.style.top = '5%';
                    mainDiv.style.opacity = '1';
                    mainDiv.style.visibility = 'visible';
                }else{
                    mainDiv.style.opacity = '0';
                    mainDiv.style.visibility = 'hidden';
                    mainDiv.style.top = '0';
                }
            };
        };

        const logout =()=>{
            localStorage.setItem('Login','False');
            localStorage.setItem('isAuthenticated','False');
            sessionStorage.setItem('SelectedStudent',JSON.stringify([]));
            sessionStorage.setItem('StdID',JSON.stringify([]));
            sessionStorage.setItem('SelectedBatchData',JSON.stringify([]));
            sessionStorage.setItem('StdLogin','False');
            sessionStorage.setItem('isStdAuthenticated','False');
            sessionStorage.setItem('isAdminLoggined','False');
            sessionStorage.setItem('isStudentdLoggined','False');
            Alert('success',"You've successfully logged out !");
            confirmationDiv('close','logout');
            setTimeout(()=>{
                history('/login');
                sideBar();
            },3000)
        };

        const showStdInfo = (data,id,batch) => {
            sessionStorage.setItem('SelectedStudent',JSON.stringify(data));
            sessionStorage.setItem('StdID',JSON.stringify(id));
            const selectedBatch = batchesData.find(data=>data.BatchName === batch);
            sessionStorage.setItem('SelectedBatchData',JSON.stringify(selectedBatch));
            history('/studentinfo');
        };

        const navigateAddStd = () => {
            if (studentsData && batchesData){
                if (batchesDataLength > 0){
                    sessionStorage.setItem('updateStdForm', 'False');
                    history('/studentform');
                }else{
                    Alert('error','Add atleast one batch to add a student !');
                    sideBar();
                }
            }else{
                Alert('error','Something went wrong. Please try again later !');
                sideBar();
            }
        };

        const navigateSettings = () => {
            if (studentsData && batchesData){
                history('/settings')
            }else{
                Alert('error','Something went wrong. Please try again later !');
                sideBar();
            }
        };

        const deleteBatch = () => {
            const deleteEle = document.querySelectorAll('.delete-batch-chx');
            const selectedDeleteEles = Array.from(deleteEle);
            const isFoundArray = []
            selectedDeleteEles.forEach(ele=>{
                if (ele.checked){
                    const isFound = studentsData.some(data=>data.BatchName === ele.value);
                    isFoundArray.push(isFound);
                }
            });
            if (isFoundArray.some(ele=>ele === true)){
                Alert('error','Cannot delete the batch. Students are assigned to this batch.<br/>Please change their batch assignments and try again')
            }else{
                selectedDeleteEles.forEach(ele=>{
                    if (ele.checked === true){
                        batchesData.forEach(data=>{
                            if (data.BatchName === ele.value){
                                deleteSelectedBatch(data);
                                deleteSelectedBatch(data);
                            };
                        });
                    };
                });
            };
            selectedDeleteEles.forEach((ele)=>{
                ele.checked = false;
            });
            confirmationDiv('close','deleteBatch');
            closeDeleteBatchDiv();
        };

        const deleteSelectedBatch = async (batchData) => {
            try {
                let res = await axios.delete('http://127.0.0.1:8000/batches/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(batchData)
                });
                if (res.status === 204){
                    Alert('success', 'Batch deleted successfully!');
                    getBatchesData();
                };
            } catch (error) {
                Alert('error', 'Unfortunately, the batch deletion was unsuccessful.<br/>Please check & try again!');
            }
        };

        const closeDeleteBatchDiv = () => {
            const deleteBatchCon = document.querySelector('.delete-batch-container');
            const deleteBlurDiv = document.querySelector('.blur-div');
            deleteBatchCon.style.transition = '0.5s ease-in-out';
            deleteBatchCon.style.opacity = '0';
            setTimeout(()=>{
                deleteBatchCon.style.visibility = 'hidden';
                deleteBlurDiv.style.visibility = 'hidden';
            },500);
            setSelectedBatch(batchesData[0].BatchName);
            const deleteEle = document.querySelectorAll('.delete-batch-chx');
            const selectedDeleteEles = Array.from(deleteEle);
            selectedDeleteEles.forEach((ele)=>{
                ele.checked = false;
            });
        };

        const deleteConfrmDiv = () => {
            const deleteEle = document.querySelectorAll('.delete-batch-chx');
            const selectedDeleteEles = Array.from(deleteEle);
            const isChecked = selectedDeleteEles.some(ele => ele.checked);
            if (isChecked){
                confirmationDiv('open','deleteBatch');
            }else{
                Alert('error','Select atleast one batch !');
            }
        };
        
        let dataCnt = 0;
        const searchDataArray = JSON.parse(sessionStorage.getItem('SearchedData'));
        const isSearched = sessionStorage.getItem('isSearched') || 'False';
        let students_Data = [];
        if (isSearched === 'True'){
            students_Data = searchDataArray;
        }else{
            students_Data = studentsData;
        };

        return (
            <center>
                    <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
            <div className="Main-Page-Container">
                <DashboardHeader selectBatch={selectedBatch} studentData={studentsData || []} todayDate={`${day} ${month} ${year}`} Alert={Alert}/>
                <div className="search-div">
                    <div className="search-input-div">
                        <input type="text" placeholder="search" className="search-data-input" onKeyPress={(event)=>SearchInput(event)}/>
                        <button onClick={searchData}><img src="images/Search-logo.png" width="18px" alt="" /></button>
                    </div>
                    <div className="search-select-option">
                        <select name="batch" className="batches" onChange={dashboardBatchChange}>
                            {batchesData && batchesData.map((batch,index)=>(
                            <option value={batch.BatchName} style={{fontSize : '23px', cursor: 'pointer'}} selected={batch.BatchName === selectedBatch ? true : false}> {batch.BatchName}</option>
                            ))}
                            <option value="All" style={{fontSize : '25px'}} selected={selectedBatch === 'All' ? true : false}>All Batches</option>
                            <option disabled></option>
                            <option value="AddBatch" style={{fontSize : '25px'}}>Add Batch ++</option>
                            <option value="DeleteBatch" style={{fontSize : '25px'}}>Delete Batch</option>
                        </select>
                        <input type="text" placeholder="Add Batch" className="add-batch-option" /> <button className="add-batch-option-btn" onClick={()=>dashboardBatchChange(null,'click')}>Add</button>
                    </div>
                    <div className="make-operation-div">
                        <button className="make-operation-btn" onClick={()=>stdAttPopUp('open')}>Take Attendance</button>
                    </div>
                </div>

                <div className="students-details-container">
                    <div className="student-details-header">
                        <span>Att.</span>
                        <span>Student S.No</span>
                        <span>Name</span>
                        <span>Mobile</span>
                        <span>Email</span>
                        <span>Graduation</span>
                        <span>Branch</span>
                        <span>Passed Year</span>
                    </div>
                {Array.isArray(students_Data) && studentsDataLength > 0 && students_Data.map((data,index)=>{
                    if ((selectedBatch === "None" || selectedBatch === 'All') || data.BatchName === selectedBatch){
                    dataCnt ++
                    return(
                    <div className={`student-details-container student-details-container${index}`} style={{background : (data.Status === 'Active') ? '#ffff' : '#ff6033',color : (data.Status === 'Active') ? '#000' : '#ffff'}} onClick={()=>selectStd(index,data.id)} onDoubleClick={()=>showStdInfo(data,dataCnt,data.BatchName)}>
                        <input type="checkbox" value={`${data.id}`} className={`std-checkbox std-checkbox${index}`} disabled={data.Status === 'Active' ? false : true} onClick={()=>selectStd(index)} style={{backgroundColor: 'green'}} />
                        <img src={data.Classes.includes(`${day} ${month} ${year}`) ? 'images/std-P.png' : 'images/std-A.png'} alt="" className={`student-details-profile student-details-profile${index}`} />
                        <span>{data.BatchName}-<span className="std-batch-no">{dataCnt < 10 ? `0${dataCnt}` : dataCnt}</span></span>
                        <span>{data.Name}</span>
                        <span>{data.Phone}</span>
                        <span>{data.Email}</span>
                        <span>{data.PG !== 'N/A' ? data.PG : data.Degree}</span>
                        <span>{data.PG_Branch !== 'N/A' ? data.PG_Branch : data.Degree_Branch}</span>
                        <span>{data.PG_Year !== 'N/A' ? data.PG_Year : data.Degree_Year}</span>
                    </div>
                )}})}
                    <label className="empty-search-label" style={{visibility : (isSearched === 'True' && students_Data.length === 0) ? 'visible' : 'hidden'}}><img src="images/empty-search-icon.gif" alt="" className="empty-search-icon" /><h1>No Search Found!</h1><span>Try again with different keyword.</span></label>
                    <img style={{visibility : (isSearched === 'False' && Array.isArray(studentsData) && Array.isArray(batchesData) && dataCnt < 1) ? 'visible' : 'hidden'}} src="images/empty-std-list.png" alt="" className="empty-std-icon" />
                    <img style={{visibility : (!Array.isArray(studentsData) && !Array.isArray(batchesData)) ? 'visible' : 'hidden'}} src="images/something-went-wrong.png" alt="" className="empty-error-icon" />
                </div>
            </div>
            <div className="alert-div">
                <img className="alert-div-img" src="" alt="" width="40px"/>
                <p></p>
                <span className="X" onClick={closeAlert}>&times;</span>
                <div className="alert-timer-line"></div>
            </div>

            <div className="attendance-pop-up-container">
                <div className="attendance-pop-up-div">
                    <span className="selected-std-note" style={{color:'red',width:'100%',visibility:'hidden',height:'0'}}>Selected students has already been taken attendance.<br/>Check and try again.</span>
                    <h2>Students Attendance : </h2>
                    <label><input type="checkbox" value="Classes" className="att-ck-1 att-ck" /> Class Attendance</label>
                    <label><input type="checkbox" value="MockTests" className="att-ck-2 att-ck" /> Mock Test Attendance</label>
                    <label><input type="checkbox" value="CaseStudies" className="att-ck-3 att-ck" /> Case Study Attendance</label>
                    <label><input type="checkbox" value="Interviews" className="att-ck-4 att-ck" /> Interview Attendance</label>
                    <div>
                        <button className="attendance-submit-btn" onClick={takeStdAttendance}>Submit</button>
                    </div>
                    <img src="images/x-icon.png" alt="" className="attendance-submit-close-btn" onClick={()=>stdAttPopUp('close')} />
                </div>
            </div>
            <button className="dashboard-vcube-logo" onClick={sideBar}><img src="images/V-CUBE-Logo.png" alt="" /></button>
            <div className="profile-side-bar" data-value="hidden">
                <button className="add-student logo-opt" id="profile1" onClick={navigateAddStd}><img src="images/add-student-icon.png" alt=""/> Add Student </button>
                <button className="setting-btn logo-opt" onClick={navigateSettings}><img src="images/settings-icon.png" alt=""/>Settings</button>
                <button className="log-out logo-opt" id="profile2" onClick={()=>confirmationDiv('open','logout')}><img src="images/log-out-icon.png" alt=""/> Log Out </button>
            </div>
            <div className="blur-div"></div>
            <div className="confirm-operation-div confirm-operation-div-1">
                <p>Are you sure you want to log out ?</p>
                <div className="outer-confirm-div" onClick={logout}><button className="inner-confirm-button">Confirm</button></div>
                <button className="cancel-button" onClick={()=>confirmationDiv('close','logout')}>Cancel</button>
            </div>
            <div className="delete-batch-container">
                <h1 style={{fontWeight : 'normal'}}>Select Batch</h1>
                <div className="delete-batch-div">
                    {batchesData && batchesData.map((batch,index)=>(
                        <label><input type="checkbox" value={batch.BatchName} className="delete-batch-chx"/> {batch.BatchName}</label>
                    ))}
                </div>
                <button onClick={deleteConfrmDiv}>Delete</button>
                <span className="delete-batch-X" onClick={closeDeleteBatchDiv}>&times;</span>
            </div>
            <div className="confirm-operation-div confirm-operation-div-2">
                <p>Are you sure you want to delete the batch ?</p>
                <div className="outer-confirm-div" onClick={deleteBatch}><button className="inner-confirm-button">Confirm</button></div>
                <button className="cancel-button" onClick={()=>confirmationDiv('close','deleteBatch')}>Cancel</button>
            </div>
            </center>
        )
    }else{
        sessionStorage.setItem('Tried','True');
        history('/login');
    };
};

export default Dashboard;
  
