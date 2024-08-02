import React from "react";
import './dashboard.css';
import DashboardHeader from "./dashboard-header";
import { fetchStudentsData, fetchBatchData, fetchLoginData, fetchClassData, fetchMessagesData, fetchFeedbackData } from "./data";
import { useState, useEffect } from "react";
import { sendStdAlert } from "./student-info";
import { date_time } from "./dashboard-header";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let alertLineFunc = false;
let timeoutOne,timeoutTwo,waitTime;
export const Alert = (status,info,timer=5000) => {
    const alertLine = document.querySelector('.alert-timer-line');
    alertLine.style.transition = 'none';
    alertLine.style.width = '100%';
    if (!alertLineFunc){
        let img = '';
        waitTime = timer * 0.001;
        alertLineFunc = true;
        alertLine.style.visibility = 'visible';
        const alertDiv = document.querySelector('.alert-div');
        const alertPEle = document.querySelector('.alert-div p');
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
        timeoutOne = setTimeout(()=>{
            alertDiv.style.opacity = '0';
            timeoutTwo = setTimeout(() => {
                alertDiv.style.visibility = 'hidden';
                alertDiv.style.top = '0%';
                alertLine.style.transition = 'none';
                alertLine.style.width = '100%';
                alertLineFunc = false;
            }, 1000);
        },timer);
    }else{
        closeAlert();
        alertLineFunc = false;
        alertLine.style.visibility = 'hidden';
        setTimeout(()=>{
            clearTimeout(timeoutOne);
            clearTimeout(timeoutTwo);
            Alert(status,info,timer);
            waitTime = 0;
        },1000);
    };
};

export const isAdminAuth = () => {
    const date = date_time().split(' ');
    const loginned = localStorage.getItem('Login') || 'False';
    const isAuth = localStorage.getItem('isAuthenticated') || 'False';
    const stdLogin = sessionStorage.getItem('StdLogin') || 'False';
    const isStdAuth = sessionStorage.getItem('isStdAuthenticated') || 'False';
    if (isAuth === 'True' && loginned.includes(`True ${date[0]} ${date[1]} ${date[2]}`)){
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
    const date = date_time().split(' ');
    const loginned = localStorage.getItem('Login') || 'False';
    const isAuth = localStorage.getItem('isAuthenticated') || 'False';
    const stdLogin = sessionStorage.getItem('StdLogin') || 'False';
    const isStdAuth = sessionStorage.getItem('isStdAuthenticated') || 'False';
    if (stdLogin === 'True' && isStdAuth === 'True'){
        if (isAuth === 'False' && !loginned.includes(`True ${date[0]} ${date[1]} ${date[2]}`)){
            sessionStorage.setItem('isStudent','True');
            return true;
        }else if (isAuth === 'True' && loginned.includes(`True ${date[0]} ${date[1]} ${date[2]}`)){
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

export const delete_User = async(data,mail,A_mail) => {
    try {
        let res = await axios.delete('https://vcubeapi.pythonanywhere.com/api/login/', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        });
    } catch (error){
    };
    sendStdAlert(A_mail,'Unexpected',`${data.Username}-${data.Email}`);
    sendStdAlert(mail,'Unexpected',`Username : ${data.Username}_Email : ${data.Email}_`);
};

export const isUserFound = async() => {
    const class_Data = await fetchClassData();
    const login_Data = await fetchLoginData();
    const userId = JSON.parse(localStorage.getItem('LoginUserId')) || "";
    let s_U_Mail = "";

    const filteredData = login_Data && login_Data.filter(data=>data.User === 'Super Admin');
    if (filteredData && filteredData.length > 1){
        const smallest_Id = Math.min(...filteredData.map(obj => obj.id));
        const R_User = filteredData.find(data=>data.id === smallest_Id);
        s_U_Mail = R_User.Email;
        filteredData.forEach(data=>{
            if(data.id !== smallest_Id){
                delete_User(data,R_User.Email,s_U_Mail);
                if (userId === data.id){
                    sessionStorage.setItem('UserLogout',`True&${data.Username}&${data.Email}&${data.Permission}`);
                    for (let i = 0; i < localStorage.length; i++){
                        const key = localStorage.key(i);
                        localStorage.setItem(key, JSON.stringify([]));
                    }
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        sessionStorage.setItem(key, JSON.stringify([]));
                    }
                }
            }
        })
    };

    class_Data && class_Data.forEach((cls)=>{
        const foundLen = login_Data && login_Data.filter(data=>data.Class === cls.Class && data.User === 'Admin');
        if(foundLen.length > 1){
            const smallestId = Math.min(...foundLen.map(obj => obj.id));
            const R_user = foundLen.find(obj=>obj.id === smallestId);
            foundLen.forEach(fdata=>{
                if (fdata.id !== smallestId){
                    delete_User(fdata,R_user.Email,s_U_Mail);
                    if (userId === fdata.id){
                        sessionStorage.setItem('UserLogout',`True&${fdata.Username}&${fdata.Email}&${fdata.Permission}`);
                        for (let i = 0; i < localStorage.length; i++){
                            const key = localStorage.key(i);
                            localStorage.setItem(key, JSON.stringify([]));
                        }
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            sessionStorage.setItem(key, JSON.stringify([]));
                        }
                    }
                }
            })
        }
    });
};

const Dashboard = () => {
    const [studentsData, setStudentsData] = useState([]);
    const [batchesData, setbatchesData] = useState([]);
    const [loginData,setLoginData] = useState([]);
    const [classData,setClassData] = useState([]);
    const classELe = document.querySelector('.class-selected-opt');
    const batchEle = document.querySelector('.batch-selected-opt');
    const [isDeleteBatch, setIsDeleteBatch] = useState(false);
    const [notifications,setNotifications] = useState([]);
    const [stdFeedback,setStdFeedback] = useState([]);
    const isUser = JSON.parse(localStorage.getItem('IsUser'));
    const userClass = JSON.parse(localStorage.getItem('UserClass'));
    const isAdminAction = sessionStorage.getItem('isAdminLoggined');
    const sClass = (isUser === "Super Admin") ? (JSON.parse(sessionStorage.getItem('Selected_Class')) || "") : userClass;
    const sBatch = (isUser === "Super Admin") ? (JSON.parse(sessionStorage.getItem('Selected_Batch')) || "") : 'All';
    const [selectedBatch,setSelectedBatch] = useState(sBatch);
    const [selectedClass,setSelectedClass] = useState(sClass);
    const [reveiwCnt,setReveiwCnt] = useState(0);
    const lg_User = sessionStorage.getItem('UserLogout') || 'False';
    const isSearched = sessionStorage.getItem('isSearched') || 'False';
    const date = date_time().split(' ');
    const day = date[0];
    const month = date[1];
    const year = date[2];

    if (classELe){
        if (isUser === "Super Admin")classELe.textContent = (sClass.length === 0) ? "Select Class" : (sClass === 'All') ? 'All Classes' : sClass;
    };
    if (batchEle){
        batchEle.textContent = (sBatch.length === 0) ? "Select Batch" : (sBatch === 'All') ? "All Batches" : sBatch;
    }
    const studentsDataLength = (Array.isArray(studentsData)) ? studentsData.length : 0;
    const batchesDataLength = (Array.isArray(batchesData)) ? batchesData.length : 0;
    const history = useNavigate();

    const getStudents = async () => {
        const student_Data = await fetchStudentsData();
        setStudentsData(student_Data);
    };
    
    const getBatchesData = async () => {
        const batchesData = await fetchBatchData();
        setbatchesData(batchesData);
    };  

    const getLoginData = async () => {
        const loginData = await fetchLoginData();
        setLoginData(loginData);
    };
    const getClassData = async () => { 
        const class_Data = await fetchClassData();
        setClassData(class_Data);
    };

    const getFeedbackData = async () => { 
        const feedback_Data = await fetchFeedbackData();
        let cnt = 0;
        const today = new Date();
        const week = today.getUTCDay();
        const currentDate = new Date();
        const yesterdayDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
        const dayAfterYesterdayDate = new Date(currentDate.getTime() - (48 * 60 * 60 * 1000));
        const y_Date = yesterdayDate.toLocaleString('default', { month: 'short', day: 'numeric' });
        const d_A_Y_Date = dayAfterYesterdayDate.toLocaleString('default', { month: 'short', day: 'numeric' });
        feedback_Data && feedback_Data.forEach((data=>{
            const date_ = data.BatchName.split('~')[1]
            if((data.BatchName.split('~')[0].split(' ')[0] === selectedClass || selectedClass === 'All') && (date_ === `${day}-${month}-${year}` || (week === 1 && (date_ === `${day-1}-${y_Date.split(' ')[0]}-${year}` || date_ === `${day-2}-${d_A_Y_Date.split(' ')[0]}-${year}`)))){
                cnt++
            };
        }))
        setReveiwCnt(cnt);
        setStdFeedback(feedback_Data);
    };

    const getNotifications = async() => {
        const msgData = await fetchMessagesData();
        setNotifications([]);
        msgData && msgData.forEach(msgData=>{
            const data = msgData.StudentMessage.split('~');
            if((data[0] !== 'N/A') && (selectedBatch === 'All' || data[0] === selectedBatch) && (selectedClass === 'All' || data[1] === selectedClass)){
                setNotifications(prevMessages => [...prevMessages, msgData]);
            }
        });
    };


    useEffect(() => {
        getBatchesData();
        getStudents();
        getLoginData();
        getClassData();
        isUserFound();
        getFeedbackData();
    }, []);

    useEffect(()=>{
        getNotifications();
    },[selectedBatch,selectedClass]);

    useEffect(()=>{
        isUserFound();
    },[loginData])

    if (isAdminAuth() && !isStudentAuth() && localStorage.getItem('isAuthenticated') === 'True'){
        if (lg_User.split('&')[0] === 'True'){
            history('/login');
        }
        
        if (isAdminAction === 'True'){
            setTimeout(()=>{
                Alert('note',`Welcome back <strong>${JSON.parse(sessionStorage.getItem('LogginedUser'))}</strong>.`);
                sessionStorage.setItem('isAdminLoggined','False');
            },50);
        };

        if (sessionStorage.getItem('SomethingWrong') === 'True'){
            setTimeout(()=>{
                Alert('error','Something went wrong !');
                sessionStorage.setItem('SomethingWrong','False');
            },50);
        };

        if (sessionStorage.getItem('Tried_Form') === 'True'){
            setTimeout(()=>{
                Alert('error','Select the desired class when adding a student,<br/>rather than selecting all classes or not selecting any class !',7000)
                sessionStorage.setItem('Tried_Form','False');
            },50)
        };

        sessionStorage.getItem('Selected_Student',JSON.stringify([]));
        if (sessionStorage.getItem('std_into_tried') === 'True'){
            sessionStorage.setItem('std_into_tried','False');
            setTimeout(()=>{
                Alert('error','Student must be selected to show details !');
            },100);
        };

        const updateData = () =>{
            getBatchesData();
            getStudents();
        };

        const addBatch =  async (batchName) => {
            const data = {
                BatchName : batchName,
                Class : selectedClass,
                Classes : 0,
                CaseStudies : 0,
                MockTests : 0,
                Interviews : 0,
            };
            try {
                let res = await axios.post('https://vcubeapi.pythonanywhere.com/api/batch/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',`Batch : ${batchName} Added successfully !`);
                    setSelectedBatch(batchName);
                    getBatchesData();
                    document.querySelector('.batch-selected-opt').textContent = batchName;
                }
            } catch (error){
                Alert('error', 'Unfortunately, the batch addition was unsuccessful.<br/>Please check & try again !');
                setSelectedBatch(batchesData[0].BatchName);
            }
        };

        const addClass = async (name_,tutors) => {
            const name = name_.charAt(0).toUpperCase() + name_.slice(1).toLowerCase();
            const data = {
                Class : name,
                Tutors : tutors
            }
            try {
                let res = await axios.post('https://vcubeapi.pythonanywhere.com/api/class/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',`Class : ${name} Added successfully !`);
                    getClassData();
                    setSelectedClass(name);
                    document.querySelector('.class-selected-opt').textContent = name;
                }
            } catch (error){
                Alert('error', 'Unfortunately, the class addition was unsuccessful.<br/>Please check & try again !');
                setSelectedClass("Python");
            }
        };

        const dashboardBatchChange = (type) => {
            const selectElement = (type === 'Batch') ? document.querySelector('.batch-main-opt') : document.querySelector('.class-main-opt');
            const timer = (type === 'Batch') ? 3000 : 0;
            if((!batchesData) && (!studentsData)){
                Alert('error','Something went wrong. Please try again later !');
                selectElement.value = 'All';
            }else{
                const addBatchInput = document.querySelector('.add-batch-option');
                const addClassInput = document.querySelector('.add-class-name-input');
                const addClassTurors = document.querySelector('.tutors-names-input');
                const addBatchBtn = (type === 'Batch') ? document.querySelector('.add-batch-option-btn') : document.querySelector('.class-add-btn');
                const inputLen = (type === 'Batch') ? addBatchInput.value.length > 5 : (addClassInput.value.length > 3 && addClassTurors.value.length > 5);
                if (inputLen){
                    if(type === 'Batch')addBatchBtn.style.transition = 'right 0.5s ease-in-out, width 0.5s ease-in-out';
                    if(type === 'Batch')addBatchBtn.style.width = '40px';
                    if(type === 'Batch')addBatchBtn.style.right = '5%';
                    setTimeout(()=>{
                        if(type === 'Batch')addBatchBtn.classList.add('btn-rotate');
                        setTimeout(()=>{
                            if(type === 'Batch')addBatchBtn.classList.remove('btn-rotate')
                            if(type === 'Batch')addBatchBtn.style.width = '35%';
                            const newBatch = addBatchInput.value.toUpperCase();
                            const newClass = addClassInput.value.charAt(0).toUpperCase() + addClassInput.value.slice(1).toLowerCase();
                            const searchBatchData = batchesData.some(batch=>batch.BatchName.toLowerCase() === newBatch.toLowerCase());
                            const searchClassData = classData && classData.some(cls=>cls.Class.toLowerCase() === newClass.toLowerCase());
                            if (type === 'Batch'){
                                if (searchBatchData){
                                    setSelectedBatch(newBatch);
                                    Alert('warning',`Batch : ${newBatch} already exists !`);
                                }else{
                                    addBatch(newBatch);
                                }
                            }else if (type === 'Class'){
                                if (searchClassData){
                                    setSelectedClass(newClass);
                                    Alert('warning',`Class : ${newClass} already exists !`);
                                }else{
                                    addClass(newClass,addClassTurors.value);
                                };
                            };
                            selectElement.style.visibility = 'visible';
                            if(type === 'Batch')addBatchInput.style.visibility = 'hidden';
                            (type === 'Batch') ? addBatchInput.value = "" : addClassInput.value = "";
                            addClassTurors.value = "";
                            if(type === 'Batch')addBatchBtn.style.right = '0';
                            closeAddClassDiv('close');
                        },timer)
                    },500)
                }else{
                    selectElement.style.visibility = 'visible';
                    if(type === 'Batch')addBatchInput.style.visibility = 'hidden';
                    if(type === 'Batch')addBatchBtn.style.visibility = 'hidden';
                    (type === 'Batch') ? addBatchInput.value = "" : addClassInput.value = "";
                    addClassTurors.value = "";
                    if (Array.isArray(batchesData) && batchesData.length > 0) {
                        setSelectedBatch(batchesData[0].BatchName);
                    };
                    Alert('error', 'Error : Input must be at least 5 characters !');
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
                        studentsData.forEach((data)=>{
                            if(selectedClass === 'All' || data.Class === selectedClass){
                            if ((data.Name.toLowerCase().includes(searchedInput.value.toLowerCase()) || data.Email.toLowerCase().includes(searchedInput.value.toLowerCase()) || data.Phone.includes(searchedInput.value)) || (data.PG === 'N/A' ? data.Degree.toLowerCase().includes(searchedInput.value) : data.PG.toLowerCase().includes(searchedInput.value)) || ((data.PG_Year==='N/A') ? data.Degree_Year.includes(searchedInput.value) : data.PG_Year.includes(searchedInput.value))){
                                searchArray.push(data);
                            };
                            }
                        });
                    setStudentsData(searchArray);
                    sessionStorage.setItem('isSearched','True');
                    }
                };
                if (!found1 || !found2){
                    getStudents();
                    setSelectedBatch(sBatch);
                    searchedInput.value = '';
                    imgElement.setAttribute('src', 'images/Search-logo.png');
                    sessionStorage.setItem('isSearched','False');
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
                    };
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
                                if (document.querySelector(`.std-checkbox${index}`) && document.querySelector(`.std-checkbox${index}`).checked === true){
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
                        if (checkStdAttCnt(classAtt,mockAtt,studyAtt,interviewAtt)){
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
                        }else{
                            Alert('error',"Cannot take Student's Attendance Count more than<br/>Batch Attendance Count !")
                        };
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

        const checkStdAttCnt = (clas,mock,study,interview) => {
            const isArray = [];
            if (clas){
                let batchcls;
                studentsData.forEach((data,index)=>{
                    const divEle = document.querySelector(`.std-checkbox${index}`);
                    if (divEle){
                        if (divEle.checked === true){
                            if (selectedBatch === 'All'){
                                batchcls = batchesData.every(btch=> parseInt(btch.Classes.split(' ')[0]) > parseInt(data.Classes.split(' ')[0]));
                            }else{
                                const batch = batchesData.find(btch=> btch.BatchName === selectedBatch)
                                batchcls =  parseInt(batch.Classes.split(' ')[0]) > parseInt(data.Classes.split(' ')[0]);
                            };
                            isArray.push(batchcls);
                        };
                    };
                });
            };

            if (mock){
                let batchmck;
                studentsData.forEach((data,index)=>{
                    const divEle = document.querySelector(`.std-checkbox${index}`);
                    if (divEle){
                        if (divEle.checked === true){
                            if (selectedBatch === 'All'){
                                batchmck = batchesData.every(btch=> parseInt(btch.MockTests.split(' ')[0]) > parseInt(data.MockTests.split(' ')[0]));
                            }else{
                                const batch = batchesData.find(btch=> btch.BatchName === selectedBatch);
                                batchmck = parseInt(batch.MockTests.split(' ')[0]) > parseInt(data.MockTests.split(' ')[0]);
                            };
                            isArray.push(batchmck);
                        };
                    }
                });
            };

            if (study){
                let batchstdy;
                studentsData.forEach((data,index)=>{
                    const divEle = document.querySelector(`.std-checkbox${index}`);
                    if (divEle){
                        if (divEle.checked === true){
                            if (selectedBatch === 'All'){
                                batchstdy = batchesData.every(btch=> parseInt(btch.CaseStudies.split(' ')[0]) > parseInt(data.CaseStudies.split(' ')[0]));
                            }else{
                                const batch = batchesData.find(btch=> btch.BatchName === selectedBatch);
                                batchstdy = parseInt(batch.CaseStudies.split(' ')[0]) > parseInt(data.CaseStudies.split(' ')[0]);
                            };
                            isArray.push(batchstdy);
                        };
                    };
                });
            };

            if (interview){
                let batchintw;
                studentsData.forEach((data,index)=>{
                    const divEle = document.querySelector(`.std-checkbox${index}`);
                    if (divEle){
                        if (divEle.checked === true){
                            if (selectedBatch === 'All'){
                                batchintw = batchesData.every(btch=> parseInt(btch.Interviews.split(' ')[0]) > parseInt(data.Interviews.split(' ')[0]));
                            }else{
                                const batch = batchesData.find(btch=> btch.BatchName === selectedBatch)
                                batchintw = parseInt(batch.Interviews.split(' ')[0]) > parseInt(data.Interviews.split(' ')[0]);
                            };
                            isArray.push(batchintw);
                        }
                    }
                });
            };
            const isTrue = isArray.every(ele=>ele);
            return isTrue;
        };
        
        const updateStdAttendance = async (data) => {
            const stdInputEles = document.querySelectorAll('.std-checkbox');
            const inputEles = Array.from(stdInputEles);
            try {
                let res = await axios.put('https://vcubeapi.pythonanywhere.com/api/student/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success','Student(s) Attendance updated successfully !');
                    getStudents();
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
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key !== 'LoginUserId'){
                    localStorage.setItem(key, JSON.stringify([]));
                };
            };
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                sessionStorage.setItem(key, JSON.stringify([]));
            };
            const user = loginData && loginData.find(data=>data.id === JSON.parse(localStorage.getItem('LoginUserId')));
            sessionStorage.setItem('UserLogout',`True&${user.Username}&${user.Email}&${user.Permission}`);
            localStorage.setItem('LoginUserId',JSON.stringify([]));
            history('/login');
        };

        const showStdInfo = (data,id,batch) => {
            sessionStorage.setItem('Selected_Student',JSON.stringify(data));
            sessionStorage.setItem('StdID',JSON.stringify(id));
            sessionStorage.setItem('SelectedBatchData',JSON.stringify(batchesData.find(data=>data.BatchName === batch)));
            history('/studentinfo');
        };

        const navigateAddStd = () => {
            if (studentsData && batchesData){
                if (classData && classData.length > 0){
                    if (batchesDataLength > 0){
                        if (isUser === 'Super Admin' && (selectedClass === 'All' || selectedClass.length <= 1)){
                            Alert('error','Select the desired class when adding a student,<br/>rather than selecting all classes or not selecting any class !',7000)
                        }else{
                            sessionStorage.setItem('updateStdForm', 'False');
                            history('/studentform');
                        }
                    }else{
                        Alert('error','Add atleast one batch to add a student !');
                    }
                }else if(!classData || classData.length === 0){
                    Alert('error','Add atleast one class !');
                }
            }else{
                Alert('error','Something went wrong. Please try again later !');
            }
            sideBar();
        };

        const navigateSettings = () => {
            if (studentsData && batchesData){
                history('/settings');
            }else{
                Alert('error','Something went wrong. Please try again later !');
            }
            sideBar();
        };

        const deleteBatch = (type) => {
            const deleteEle = document.querySelectorAll('.delete-batch-chx');
            const selectedDeleteEles = Array.from(deleteEle);
            const isFoundArray = []
            let isFound;
            selectedDeleteEles.forEach(ele=>{
                if (ele.checked){
                    if (type === 'Batch'){
                        isFound = studentsData.some(data=>data.BatchName === ele.value);
                    }else if (type === 'Class'){
                        isFound = batchesData.some(data=>data.Class === ele.value);
                    }
                    isFoundArray.push(isFound);
                };
            });
            if (isFoundArray.some(ele=>ele === true)){
                (type === 'Batch') ? Alert('error','Cannot delete the batch. Students are assigned to this batch.<br/>Please change their batch assignments and try again') : 
                                     Alert('error','Cannot delete the class. Batches are assigned to this class.<br/>Please change their class assignments and try again');
            }else{
                let cnt = 0;
                selectedDeleteEles.forEach(ele=>{
                    if (ele.checked === true){
                        if (type === 'Batch'){
                            batchesData.forEach((data,index)=>{
                                if (data.BatchName === ele.value){
                                    cnt++
                                    (cnt === isFoundArray.length) ? deleteSelectedBatch(data,true) : deleteSelectedBatch(data);
                                };
                            });
                        }else if (type === 'Class'){
                            classData.forEach((data,index)=>{
                                if (data.Class === ele.value){
                                    cnt++
                                    (cnt === isFoundArray.length) ? deleteSelectedClass(data,true) : deleteSelectedClass(data);
                                };
                            });
                        }
                    };
                });
            };
            selectedDeleteEles.forEach((ele)=>{
                ele.checked = false;
            });
            confirmationDiv('close','deleteBatch');
            closeDeleteBatchDiv();
        };

        const deleteSelectedBatch = async (batchData,end=false) => {
            try {
                let res = await axios.delete('https://vcubeapi.pythonanywhere.com/api/batch/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(batchData)
                });
                if (res.status === 204){
                    if (end){
                        Alert('success', 'Batch deleted successfully!');
                        getBatchesData();
                        setSelectedBatch("All");
                    };              
                };
            } catch (error) {
                if (end){
                    Alert('error', 'Unfortunately, the batch deletion was unsuccessful.<br/>Please check & try again!');
                };
            };
        };

        const deleteSelectedClass = async (class_Data,end=false) => {
            try {
                let res = await axios.delete('https://vcubeapi.pythonanywhere.com/api/class/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(class_Data)
                });
                if (res.status === 204){
                    if (end){
                        Alert('success', 'Class deleted successfully!');
                        getClassData();
                        setSelectedClass(classData[0].Class);
                        document.querySelector('.class-selected-opt').textContent = "Select Class";
                    };
                };
            } catch (error) {
                if (end){
                    Alert('error', 'Unfortunately, the class deletion was unsuccessful.<br/>Please check & try again!');
                };
            };
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


        const attBatchDivVisibility = (type) =>{
            getFeedbackData();
            if (type === 'Batch' && isUser === "Super Admin"){
                if (selectedClass === "Select Class" || selectedClass.length === 0){
                    Alert('error','Select class to show batch details !')
                    return
                };
            };
            let divEle;
            divEle = (type === 'Batch') ? document.querySelector('.batch-opt-div') : document.querySelector('.class-opt-div');
            const classDivArrowEle = document.querySelector('.class-down-arrow');
            const batchDivArrowEle = document.querySelector('.batch-down-arrow');
            (type === 'Batch') ? batchDivArrowEle.classList.toggle('dashboard-downArrow-rotate') : classDivArrowEle.classList.toggle('dashboard-downArrow-rotate');
            if (batchesDataLength <= 5){
                divEle.style.maxHeight = '300px';
            }else{
                divEle.style.maxHeight = (batchesDataLength <= 10) ? `${batchesDataLength * 50}px` : '500px';
            };
            divEle.classList.toggle('opts');
        };

        const attBatchOptSelect = (type,batchName) => {
            getFeedbackData();
            if (!batchesData && !studentsData){
                Alert('error','No data found or something went wrong !');
            }else{
                const batchSelectedOpt = document.querySelector('.batch-selected-opt');
                const classSelectedopt = document.querySelector('.class-selected-opt');
                const deleteBatchCon = document.querySelector('.delete-batch-container');
                const deleteBlurDiv = document.querySelector('.blur-div');
                const addBatchInput = document.querySelector('.add-batch-option');
                const addBatchBtn = document.querySelector('.add-batch-option-btn');
                const classSelectElement = document.querySelector('.add-class-container');
                const batchSelectElement = document.querySelector('.batch-main-opt');
                if (batchName === 'All Batches' || batchName === 'All Classes'){
                    (type === 'Batch') ? batchSelectedOpt.textContent = batchName : classSelectedopt.textContent = batchName;
                    (type === 'Batch') ? setSelectedBatch('All') : (isUser === "Super Admin") ? setSelectedClass('All') : setSelectedClass(userClass);
                    (type === 'Batch') ? sessionStorage.setItem('Selected_Batch',JSON.stringify('All')) : sessionStorage.setItem('Selected_Class',JSON.stringify('All'));
                }else if (batchName === 'Add'){
                    if (type === 'Batch' && selectedClass === 'All'){
                        Alert('error','Select the desired class when creating a batch,<br/>rather than selecting all classes !',7000)
                    }else{
                        if(type === 'Batch'){
                            batchSelectElement.style.visibility = 'hidden'
                            addBatchInput.style.visibility = 'visible'
                            addBatchBtn.style.visibility = 'visible'
                        }else if (type === 'Class'){
                            document.querySelector('.blur-div').style.visibility = 'visible';
                            classSelectElement.style.visibility = 'visible';
                            classSelectElement.style.opacity = '1';
                            classSelectElement.style.zIndex = '110';
                        };
                    }
                }else if (batchName === 'Delete'){
                    deleteBatchCon.style.opacity = '1';
                    deleteBatchCon.style.visibility = 'visible';
                    deleteBlurDiv.style.visibility = 'visible';
                    (type === 'Batch') ? setIsDeleteBatch(true) : setIsDeleteBatch(false);
                }else{
                    (type === 'Batch') ? batchSelectedOpt.textContent = batchName : classSelectedopt.textContent = batchName;
                    (type === 'Batch') ? setSelectedBatch(batchName) : (isUser === "Super Admin") ? setSelectedClass(batchName) : setSelectedClass(userClass);
                    (type === 'Batch') ? sessionStorage.setItem('Selected_Batch',JSON.stringify(batchName)) : sessionStorage.setItem('Selected_Class',JSON.stringify(batchName));
                };
                attBatchDivVisibility(type);
            };
        };

        const notificationDiv = (type) => {
            const divEle = document.querySelector('.dashboard-notifications-container');
            divEle.style.opacity = (type === 'open') ? '1' : '0';
            divEle.style.visibility = (type === 'open') ? 'visible' : 'hidden';
            divEle.style.zIndex = (type === 'open') ? '110' : '-10';
            document.querySelector('.blur-div').style.visibility = (type === 'open') ? 'visible' : 'hidden';
            getNotifications();
            getFeedbackData();
        };

        const closeAddClassDiv = (type) => {
            const divEle = document.querySelector('.add-class-container');
            document.querySelector('.blur-div').style.visibility = (type === 'open') ? 'visible' : 'hidden';
            divEle.style.visibility = (type === 'open') ? 'visible' : 'hidden';
            divEle.style.opacity = (type === 'open') ? '1' : '0';
            divEle.style.zIndex = (type === 'open') ? '110' : '-10';
        };

        const move_Slider = (move) => {
            const p1Ele = document.querySelector('.notif-reqts-title');
            const p2Ele = document.querySelector('.notif-review-title');
            const slideEle = document.querySelector('.dashboard-notif-slider');
            const notifDiv = document.querySelector('.dashboard-notifications-lists-div');
            const rqtDiv = document.querySelector('.std-feedback-list-div');
            const r_cnt = document.querySelector('.rev-cnt');
            const n_cnt = document.querySelector('.notif-cnt');
             if (move === 'right'){
                 slideEle.style.left = '58.5%';
                 setTimeout(()=>{
                     p2Ele.style.color = '#4953e6';
                     p1Ele.style.color = 'black';
                     rqtDiv.style.visibility = 'visible';
                     notifDiv.style.visibility = 'hidden';
                     rqtDiv.style.opacity = '1';
                     notifDiv.style.opacity = '0';
                     r_cnt.style.color = '#4953e6';
                     n_cnt.style.color = 'black';
                 },300);
             }else if (move === 'left'){
                 slideEle.style.left = '8.4%';
                 setTimeout(()=>{
                     p1Ele.style.color = '#4953e6';
                     p2Ele.style.color = 'black';
                     rqtDiv.style.visibility = 'hidden';
                     notifDiv.style.visibility = 'visible';
                     rqtDiv.style.opacity = '0';
                     r_cnt.style.color = 'black';
                     n_cnt.style.color = '#4953e6';
                     setTimeout(()=>{
                        notifDiv.style.opacity = '1';
                     },300);
                 },300);
             };
         };

        let dataCnt = 0;
        let stdFedbckCnt = 0;
        return (
            <center>
            <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
            <div className="Main-Page-Container">
                <DashboardHeader selectBatch={selectedBatch} studentData={studentsData || []} todayDate={`${day} ${month} ${year}`} Alert={Alert} selected_Cls={selectedClass} class_Data={classData} user={isUser} login_Data={loginData} update_Data={updateData}/>
                <div className="search-div">
                    <div className="search-input-div">
                        <input type="text" placeholder="Search" className="search-data-input" onKeyPress={(event)=>SearchInput(event)}/>
                        <button onClick={searchData}><img src="images/Search-logo.png" width="18px" alt="" /></button>
                    </div>
                    <div className="dashboard-att-opts-container" style={{visibility : (isUser === "Super Admin") ? 'visible' : 'hidden'}}>
                        <div className="main-opt-div dashboard-main-opt class-main-opt" style={{height : '35px',background : '#fff',margin : '0'}} onClick={()=>attBatchDivVisibility('Class')}>
                            <p className="dashboard-selected-opt class-selected-opt" data-value="" style={{fontSize : '20px'}}>Select Class</p>
                            <img className="down-arrow class-down-arrow" src="images/down-arrow.png" alt="" width='20px'/>
                        </div>
                        <div className="dashboard-opts-div class-opt-div">
                        {Array.isArray(classData) && classData.map((data,index)=>{
                            return(
                                <li className="batch-opt" onClick={()=>attBatchOptSelect('Class',data.Class)}><span>{data.Class}</span></li>
                            )
                            })}
                            <li className="batch-opt-last batch-opt" onClick={()=>attBatchOptSelect('Class','All Classes')}><span>All Classes</span></li>
                            <li className="batch-opt-last batch-opt" style={{pointerEvents : 'none'}}></li>
                            <li className="batch-opt-last batch-opt" onClick={()=>attBatchOptSelect('Class','Add')}><span>Add Class++</span><img src="images/add-student-icon.png" width='30px' style={{mixBlendMode : 'difference'}} /></li>
                            <li className="batch-opt-last batch-opt delete-batch-opt" onClick={()=>attBatchOptSelect('Class','Delete')}><span>Delete Class</span><img src="images/batch-delete-icon.png" width='30px' style={{mixBlendMode : 'multiply'}} /></li>
                        </div>
                    </div>
                    <div className="dashboard-att-opts-container">
                        <div className="main-opt-div dashboard-main-opt batch-main-opt" style={{height : '35px',background : '#fff',margin : '0'}} onClick={()=>attBatchDivVisibility('Batch')}>
                            <p className="dashboard-selected-opt batch-selected-opt" data-value="" style={{fontSize : '20px'}}>Select Batch</p>
                            <img className="down-arrow batch-down-arrow" src="images/down-arrow.png" alt="" width='20px'/>
                        </div>
                        <div className="dashboard-opts-div batch-opt-div">
                        {Array.isArray(batchesData) && batchesData.map((data,index)=>{
                            if (selectedClass === 'All' || data.Class === selectedClass){
                                return(
                                    <li className={`batch-opt-${index} batch-opt`} onClick={()=>attBatchOptSelect('Batch',data.BatchName)}><span>{data.BatchName}</span><img className={`batch-att-img-${index}`} src={data.Classes && data.Classes.includes(`${day} ${month} ${year}`) ? 'images/batch-P.png' : 'images/batch-A.png'} width="40px" alt=""/></li>
                                )
                            };
                            })}
                            <li className="batch-opt-last batch-opt" onClick={()=>attBatchOptSelect('Batch','All Batches')}><span>All Batches</span><img className="batch-opt-last-img" src={batchesData.every(data=>data.Classes && data.Classes.includes(`${day} ${month} ${year}`)) ? 'images/batch-P.png' : 'images/batch-A.png'} width="40px" alt=""/></li>
                            <li className="batch-opt-last batch-opt" style={{pointerEvents : 'none'}}></li>
                            <li className="batch-opt-last batch-opt" onClick={()=>attBatchOptSelect('Batch','Add')}><span>Add Batch++</span><img src="images/add-student-icon.png" width='30px' style={{mixBlendMode : 'difference'}} /></li>
                            <li className="batch-opt-last batch-opt delete-batch-opt" onClick={()=>attBatchOptSelect('Batch','Delete')}><span>Delete Batch</span><img src="images/batch-delete-icon.png" width='30px' style={{mixBlendMode : 'multiply'}} /></li>
                        </div>
                        <input type="text" placeholder="Add Batch" className="add-batch-option" /> <button className="add-batch-option-btn" onClick={()=>dashboardBatchChange('Batch')}>Add</button>
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
                    <div style={{height : '90.9%',overflowY : 'scroll',scrollbarWidth : 'thin'}}>
                    {Array.isArray(studentsData) && studentsDataLength > 0 && studentsData.map((data,index)=>{
                        if (isSearched === 'True' || ((selectedClass === 'All' || data.Class === selectedClass) && (selectedBatch === 'All' || data.BatchName === selectedBatch))){
                                dataCnt ++
                                return(
                                <div className={`student-details-container student-details-container${index}`} style={{background : (data.Status === 'Active') ? '#ffff' : '#ff6033',color : (data.Status === 'Active') ? '#000' : '#ffff'}} onClick={()=>selectStd(index,data.id)} onDoubleClick={()=>showStdInfo(data,data.id,data.BatchName)}>
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
                    </div>
                    <label className="empty-search-label" style={{visibility : (isSearched === 'True' && studentsData.length === 0) ? 'visible' : 'hidden'}}><img src="images/empty-search-icon.gif" alt="" className="empty-search-icon" /><h1>No Search Found!</h1><span>Try again with different keyword.</span></label>
                    <img style={{visibility : (selectedClass.length > 0 && isSearched === 'False' && Array.isArray(studentsData) && Array.isArray(batchesData) && dataCnt < 1) ? 'visible' : 'hidden'}} src="images/empty-std-list.png" alt="" className="empty-std-icon" />
                    <img style={{visibility : (!Array.isArray(studentsData) && !Array.isArray(batchesData)) ? 'visible' : 'hidden'}} src="images/something-went-wrong.png" alt="" className="empty-error-icon" />
                    <label className="empty-class-icon" style={{visibility : (isUser === 'Super Admin' && sClass.length === 0) ? 'visible' : 'hidden'}}><img src="images/select-icon.png" /><span>Select Class</span></label>
                </div>
                <div className="dashboard-notification-div" onClick={()=>notificationDiv('open')} >
                    <img src='images/notification-bell.gif' />
                    <span>{notifications ? notifications.length + reveiwCnt : 0 + reveiwCnt}</span>
                </div>
                <div className="dashboard-notifications-container">
                    <img className="D_logo" src="images/V-CUBE-Logo.png" />
                    <div className="dashboard-notifcation-title-div">
                        <span className="notif-cnt">({notifications ? notifications.length : 0})</span><span className="rev-cnt">({reveiwCnt})</span>
                        <h2 className="notif-reqts-title" onClick={()=>move_Slider('left')}>Notifications of Students' Requests</h2>
                        <h2 className="notif-review-title" onClick={()=>move_Slider('right')}>Notifications of Students' Reviews</h2>
                        <div className="dashboard-notif-slider"></div>
                    </div>
                    <div className="dashboard-notifications-lists-div" style={{overflowY : (notifications && notifications.length >= 2) ? 'scroll' : ''}}>
                        {notifications && notifications.map((data)=>(
                            <div className="dashboard-notification-lists">
                                <h3>Name : </h3><p>{data.StudentMessage.split('~')[2]}</p>
                                <h3>Batch : </h3><p>{data.StudentMessage.split('~')[0]}</p>
                                <h3>Phone : </h3><p>{data.StudentMessage.split('~')[3]}</p>
                                <h3>Date : </h3><p>{data.StudentMessage.split('~')[5]}</p>
                                <h3>Request : </h3><p>{data.StudentMessage.split('~')[4]}</p>
                            </div>
                        ))}
                        <img src="images/no-notifi-icon.png" className="D_notif-icon" style={{display : (notifications && notifications.length > 0) ? 'none' : '' }} />
                    </div>
                    <div className="std-feedback-list-div" style={{overflowY : (stdFeedback && stdFeedback.length >= 2) ? 'scroll' : ''}}>
                        {stdFeedback && stdFeedback.map((data=>{
                            if(data.BatchName.split('~')[0].split(' ')[0] === selectedClass || selectedClass === 'All'){
                            stdFedbckCnt++
                            return(
                            <div className="std-fedbck-lists">
                                <h3>Batch : </h3><p>{data.BatchName.split('~')[0]}</p>
                                <h3 style={{marginBottom : '30px'}}>Date : </h3><p>{data.BatchName.split('~')[1]}</p>
                                {data.TurorsReview.split('~').map(review=>{
                                    if(review && review.length > 5){ return (
                                        <><h3>Tutor Review : </h3><p>{review}</p></>
                                    )}
                                })}
                                <h3 >Tutor Feedback : </h3><p style={{textAlign : 'start'}}>{data.TutorsFeedback}</p>
                                <h3 style={{marginTop : '30px'}}>Class Review : </h3><p style={{marginTop : '30px'}}>{data.ClassReview}</p>
                                <h3>Class Feedback : </h3><p style={{textAlign : 'start'}}>{data.ClassFeedback}</p>
                            </div>
                            )}}))}
                        <img style={{display : (stdFedbckCnt > 0) ? 'none' : ''}} src="images/no-feedback.png" />
                    </div>
                    <span className="d_n_X" onClick={()=>{notificationDiv('close');move_Slider('left')}} >&times;</span>
                </div>
            </div>
            <div className="add-class-container">
                <h1>Add Class</h1>
                <form onSubmit={(e)=>{e.preventDefault();dashboardBatchChange('Class')}}>
                    <input className="add-class-name-input" type="text" placeholder="Enter Class Name" required />
                    <input className="tutors-names-input" type="text" placeholder="Enter Class Tutors Names  (Ex.Name1,Name2...)" required />
                    <input className="class-add-btn" type="submit" value='Add Batch'/>
                </form>
                <span className="add-class-X" onClick={()=>closeAddClassDiv('close')}>&times;</span>
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
                <h1 style={{fontWeight : 'normal'}}>{isDeleteBatch ? 'Select Batch' : 'Select Class'}</h1>
                <div className="delete-batch-div">
                    {isDeleteBatch ? (
                        batchesData && batchesData.map((batch, index) => {
                            {if (selectedClass === 'All' || batch.Class === selectedClass){
                                return(
                                    <label key={index} style={{marginTop : '10px'}}>
                                        <input type="checkbox" value={batch.BatchName} className="delete-batch-chx"/> 
                                        {batch.BatchName}
                                    </label>
                                )
                            }}
                            })
                        ) : (
                        classData && classData.map((cls, index) => (
                            <label key={index} style={{marginTop : '10px'}}>
                                <input type="checkbox" value={cls.Class} className="delete-batch-chx"/> 
                                {cls.Class}
                            </label>
                        ))
                    )}
                </div>
                <button onClick={deleteConfrmDiv}>Delete</button>
                <span className="delete-batch-X" onClick={closeDeleteBatchDiv}>&times;</span>
            </div>
            <div className="confirm-operation-div confirm-operation-div-2">
                <p>{isDeleteBatch ? 'Are you sure you want to delete the batch ?' : 'Are you sure you want to delete the class ?'}</p>
                <div className="outer-confirm-div" onClick={()=>isDeleteBatch ? deleteBatch('Batch') : deleteBatch('Class')}><button className="inner-confirm-button">Confirm</button></div>
                <button className="cancel-button" onClick={()=>confirmationDiv('close','deleteBatch')}>Cancel</button>
            </div>
            </center>
        )
    }else{
        if (!isAdminAuth() && isStudentAuth()){
            sessionStorage.setItem('StdTried','True');
            history('/studentinfo');
        }else{
            sessionStorage.setItem('Tried','True');
            history('/login');
        }
    };
};

export default Dashboard;
