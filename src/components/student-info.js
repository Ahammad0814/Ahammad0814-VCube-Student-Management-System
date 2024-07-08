import React, { useEffect, useState } from 'react';
import { isAdminAuth, isStudentAuth, isUserFound, Alert, closeAlert } from './dashboard';
import { fetchStudentsData,fetchMessagesData,fetchClassData } from './data';
import './dashboard.css';
import { date_time } from './dashboard-header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const date = date_time().split(' ');
const day = date[0];
const month = date[1];
const year = date[2];

export const sendStdAlert = async(mail,mailtype,otp=null,data=null) => {
    let mailData;
    if (otp === null){
        mailData = {
            Email : mail,
            OTP : `${day}-${month}-${year} ${date[3]}:${date[4]}:${date[5]}} ${mailtype}`,
        };
    }else{
        mailData = {
            Email : mail,
            OTP : `${otp} ${mailtype}`,
        };
    }
    try{
        let res = await axios.post('http://127.0.0.1:8000/sendotp/', JSON.stringify(mailData), {
            headers: {
            'Content-Type': 'application/json',
            },
        });
        if (mailtype === 'User_Review'){
            if (res.status === 201 || res.status === 200){
                Alert('success','Thank you for you review !');
                try{
                    let res = await axios.put('http://127.0.0.1:8000/login/', JSON.stringify(data), {
                        headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                }catch(err){

                }
            }
        };
    }catch(error){
        if (mailtype === 'User_Review'){
            Alert('error','Something went wrong. Please try again later !');
        };
    };
};

const StudentInfo = () => {
    const selectedStdData = JSON.parse(sessionStorage.getItem('Selected_Student')) || [];
    const selectedStdBatchData = JSON.parse(sessionStorage.getItem('SelectedBatchData'));
    const stdID = JSON.parse(sessionStorage.getItem('StdID'));
    const [myMessages,setMyMessages] = useState([]);
    const [myNotifications, setMyNotifications] = useState([]);
    const [userOTP,setUserOTP] = useState([]);
    const [requestId, setRequestId] = useState([]);
    const [classData,setClassData] = useState([]);
    const lg_User = sessionStorage.getItem('UserLogout') || 'False';
    const history = useNavigate();
    const getMessageData = async()=>{
        const message_Data = await fetchMessagesData();
        setMyMessages([]);
        setMyNotifications([]);
        if (message_Data && message_Data.length > 0){
            message_Data.forEach(d=>{
                const data = d.StudentMessage.split('~');
                if (data[0] !== 'N/A' && data[0] === selectedStdData.BatchName && data[1] === selectedStdData.Class && data[2] === selectedStdData.Name){
                    setMyMessages(prevMessages => [...prevMessages, d]);                         
                };
            });
            message_Data.forEach(d=>{
                const data = d.BatchMessage.split('~');
                if (data[0] !== 'N/A' && data[0] === selectedStdData.BatchName && data[1] === selectedStdData.Class && data[2] === selectedStdData.Name){
                    setMyNotifications(prevMessages => [...prevMessages, d]);
                };
            });
        };
    };

    const getClassData = async () => { 
        const class_Data = await fetchClassData();
        setClassData(class_Data);
    };

    useEffect(()=>{
        getMessageData();
        isUserFound();
        getClassData();
    },[])

    useEffect(()=>{
        isUserFound();
    },[])

    if ((isAdminAuth() && !isStudentAuth()) || (!isAdminAuth() && isStudentAuth())) {

        const findClassUser = classData && classData.find(data=>data.Class === selectedStdData.Class);
        const classTutors = findClassUser && findClassUser.Tutors.split(',');

        if (lg_User.split('&')[0] === 'True'){
            history('/login');
        }

        if (sessionStorage.getItem('Std_Tried') === 'True'){
            setTimeout(()=>{
                Alert('error','Authentication required !');
                sessionStorage.setItem('Std_Tried','False');
            },50);
        };
        sessionStorage.setItem('updateStdForm','False');

        const chkStudents = async () => {
            const student_Data = await fetchStudentsData();
            if (student_Data && student_Data.length > 0){
                return true;
            }else{
                return false;
            }
        };

    if ((isAdminAuth() && !isStudentAuth()) && ((selectedStdData && selectedStdData.length < 1) || !chkStudents())){
        setTimeout(()=>{
            if (!chkStudents()){
                sessionStorage.setItem('SomethingWrong','True');
            };
            sessionStorage.setItem('std_into_tried','True');
            history('/dashboard');
        },50);

    }else{
        const getStudents = async () => {
            const student_Data = await fetchStudentsData();
            const selectedStd = student_Data.find(data=>data.id === stdID);
            sessionStorage.setItem('Selected_Student',JSON.stringify(selectedStd));
        };
        getStudents();

        if (sessionStorage.getItem('isStudentdLoggined') === 'True'){
            setTimeout(()=>{
                Alert('note',`Hello ${selectedStdData.Name}`);
                sendStdAlert(selectedStdData.Email,'Std_Login_Alert');
                sessionStorage.setItem('isStudentdLoggined','False');
            },50);
        };

        if (sessionStorage.getItem('StdTried') === 'True'){
            setTimeout(()=>{
                if (document.querySelector('.alert-timer-line')){
                    Alert('error','Access restricted !');
                    sessionStorage.setItem('StdTried','False');
                }
            },500)
        };

        let score = 0;
        const setProgress = (percent) => {
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.querySelector('.progress-text');
                if(progressBar && progressText){
                    const radius = progressBar.r.baseVal.value;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (percent / 100) * circumference;
                    progressBar.style.strokeDashoffset = offset;
                    progressText.textContent = percent < 10 ? `0${percent}%` : `${percent}%`;
                };
        };

        const updateScore = () =>{
            const stdClass = parseInt(selectedStdData.Classes.split(' ')[0]);
            const stdMock = parseInt(selectedStdData.MockTests.split(' ')[0]);
            const stdStudy = parseInt(selectedStdData.CaseStudies.split(' ')[0]);
            const stdInterview = parseInt(selectedStdData.Interviews.split(' ')[0]);

            const batchClass = parseInt(selectedStdBatchData.Classes.split(' ')[0]);
            const batchMock = parseInt(selectedStdBatchData.MockTests.split(' ')[0]);
            const batchStudy = parseInt(selectedStdBatchData.CaseStudies.split(' ')[0]);
            const batchInterview = parseInt(selectedStdBatchData.Interviews.split(' ')[0]);

            score = Math.floor(((stdClass + stdMock + stdStudy + stdInterview) / (batchClass + batchMock + batchStudy + batchInterview)) * 100) || 0;
            setProgress(score);
            const performanceProgressBar = document.querySelector('.progress-bar');
            const performanceStatus = document.querySelector('.performance-status');
            const performanceText = document.querySelector('.progress-text');
            if (performanceProgressBar && performanceStatus){
                if (score <= 0){
                    performanceStatus.innerHTML = 'Negative';
                    performanceStatus.style.color = '#CF2528';
                    performanceText.style.color = '#CF2528';
                    performanceProgressBar.style.stroke = '#CF2528';
                }else if (score > 0 && score <= 35){
                    performanceStatus.innerHTML = 'Poor';
                    performanceStatus.style.color = 'red';
                    performanceText.style.color = 'red';
                    performanceProgressBar.style.stroke = 'red';
                }else if (score > 35 && score <= 50){
                    performanceStatus.innerHTML = 'Fair';
                    performanceStatus.style.color = 'orange';
                    performanceText.style.color = 'orange';
                    performanceProgressBar.style.stroke = 'orange';
                }else if (score > 50 && score <= 70){
                    performanceStatus.innerHTML = 'Good';
                    performanceStatus.style.color = '#F6BE00';
                    performanceText.style.color = '#F6BE00'
                    performanceProgressBar.style.stroke = '#F6BE00';
                }else if (score > 70 && score <= 85){
                    performanceStatus.innerHTML = 'Very Good';
                    performanceStatus.style.color = '#00B140';
                    performanceText.style.color = '#00B140';
                    performanceProgressBar.style.stroke = '#00B140';
                }else if (score > 85){
                    performanceStatus.innerHTML = 'Excellent';
                    performanceStatus.style.color = 'green';
                    performanceText.style.color = 'green';
                    performanceProgressBar.style.stroke = 'green';
                };
            };
        };

        setTimeout(()=>{
            updateScore();
        },50);
        
        const updateStdDetails = async (data) => {
            const disconBtn = document.querySelector('.std-details-discontinued-btn');
            const stdData = data;
            try {
                let res = await axios.put('http://127.0.0.1:8000/students/', JSON.stringify(stdData), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success','Student status has been updated succesfully !');
                    disconBtn.style.background = 'lightgrey';
                    disconBtn.style.border = 'solid 1px lightgrey';
                    disconBtn.style.pointerEvents = 'none';
                    document.querySelector('.std-status-span').innerHTML = selectedStdData.Status;
                    document.querySelector('.std-status-span').style.color = 'red';
                    getStudents();
                }
            } catch (error){
                Alert('error', 'Unfortunately, the student status update was unsuccessful.<br/>Please check & try again !');
            }
        };

        const confirmationDiv = (context,name=null) => {
            const txt = document.querySelector('.confirm-div-p');
            const note = document.querySelector('.cnf-note');
                if (name === 'discontinued'){
                txt.textContent = 'Are you sure this student is discontinued ?';
                }else if (name === 'delete'){
                    txt.textContent = 'Are you sure you want to delete this student ?';
                }else if (name === 'user_Auth'){
                    note.textContent = 'Note : OTP required to change login authentication.';
                    txt.textContent = 'Are you sure you want to change login authentication ?';
                }else if (name === 'user_edit'){
                    note.textContent = 'Note : OTP required to edit details.';
                    txt.textContent = 'Are you sure you want to edit details ?';
                }else if (name === 'logout'){
                    note.textContent = '';
                    txt.textContent = 'Are you sure you want to logout ?';
                }else if (name === 'Admin_C_User_Auth'){
                    note.textContent = '';
                    txt.textContent = 'Are you sure you want to change student login access ?';
                }else if (name === 'Delete_Rqt'){
                    note.textContent = 'Note : This cannot be undone.';
                    txt.textContent = 'Are you sure you want to withdraw your request ?';
                }else if (name === 'Delete_Msg'){
                    note.textContent = 'Note : This cannot be undone.';
                    txt.textContent = 'Are you sure you want to withdraw your message ?';
                };
                const mainDiv = document.querySelector('.confirm-operation-div');
                const blurDiv = document.querySelector('.blur-div');
                if (context === 'open'){
                    mainDiv.style.top = '5%';
                    mainDiv.style.opacity = '1';
                    mainDiv.style.visibility = 'visible';
                    blurDiv.style.visibility = 'visible';

                }else{
                    mainDiv.style.opacity = '0';
                    mainDiv.style.visibility = 'hidden';
                    mainDiv.style.top = '0';
                    blurDiv.style.visibility = 'hidden';
                };
        };

        const stdDiscontinued = () => {
            const txt = document.querySelector('.confirm-div-p');
            if (txt.textContent.includes('discontinued')){
                selectedStdData.Status = `Discontinued on ${day} ${month} ${year}`;
                updateStdDetails(selectedStdData);
            }else if (txt.textContent.includes('delete')){
                deleteStudent(selectedStdData);
            }else if (txt.textContent.includes('change login authentication')){
                const otp = Math.floor(100000 + Math.random() * 900000);
                setUserOTP(otp);
                Alert('warning','Sending OTP. Please wait...');
                document.querySelector('.blur-div').style.visibility = 'visible';
                sendOTP(selectedStdData.Email,otp,'User_Auth');
            }else if (txt.textContent.includes('edit details')){
                const otp = Math.floor(100000 + Math.random() * 900000);
                setUserOTP(otp);
                Alert('warning','Sending OTP. Please wait...');
                document.querySelector('.blur-div').style.visibility = 'visible';
                sendOTP(selectedStdData.Email,otp,'User_Details_Change');
            }else if (txt.textContent.includes('logout')){
                stdLogout();
            }else if (txt.textContent.includes('student login access')){
                selectedStdData.Access = (selectedStdData.Access === 'Granted') ? 'Denied' : 'Granted';
                updateStudentAuth(selectedStdData,true);
            }else if (txt.textContent.includes('withdraw your request')){
                const data = myMessages.find(mData=>mData.id === requestId);
                send_Message(data,'delete');
            }else if(txt.textContent.includes('withdraw your message')){
                const data = myNotifications.find(mData=>mData.id === requestId);
                send_Message(data,'delete');
            }
            confirmationDiv('close');
        };

        const deleteStudent = async (data) => {
            try {
                let res = await axios.delete('http://127.0.0.1:8000/students/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(data)
                });
                if (res.status === 204){
                    Alert('success', 'Student deleted successfully!');
                    setTimeout(()=>{
                        history('/dashboard');
                    },3000)
                }
            } catch (error) {
                Alert('error', 'Unfortunately, the student deletion was unsuccessful.<br/>Please check & try again!');
            }
        };

        const closeStdOTPDiv = (type) => {
            const otpDiv = document.querySelector('.std-detail-auth-div');
            const blurDiv = document.querySelector('.blur-div');
            if (type === 'open'){
                otpDiv.style.visibility = 'visible';
                setTimeout(()=>{
                    otpDiv.style.transition = '0.5s ease-in-out';
                    otpDiv.style.opacity = '1';
                    otpDiv.style.zIndex = '100';
                    blurDiv.style.visibility = (blurDiv.style.visibility === 'visible') ? 'visible' : 'visible' ;
                },500);

            }else if (type === 'close'){
                otpDiv.style.transition = '0.5s ease-in-out';
                otpDiv.style.opacity = '0';
                setTimeout(()=>{
                    otpDiv.style.visibility = 'hidden';
                    blurDiv.style.visibility = 'hidden';
                    otpDiv.style.zIndex = '-10';
                },400);
            };
        };

        const sendOTP = async(mail,user,mailtype) => {
            const mailData = {
                Email : mail,
                OTP : `${user} ${mailtype}`,
            };
            try{
                let res = await axios.post('http://127.0.0.1:8000/sendotp/', JSON.stringify(mailData), {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success','OTP has been successfully sent to your email address !<br/>Also check spam folder if not found !');
                    closeStdOTPDiv('open');
                };
            }catch(error){
                Alert('error','There was an error sending the OTP. Please try again later !');
                document.querySelector('.blur-div').style.visibility = 'hidden';
            };
        };

        const stdOTPSubmit = () => {
            const input = document.querySelector('.user-otp-input');
            const txt = document.querySelector('.confirm-div-p');
            if (parseInt(input.value) === userOTP){
                if (txt.innerHTML.includes('login authentication')){
                    selectedStdData.Authentication = (selectedStdData.Authentication === 'Active') ? 'Deactive' : 'Active';
                    updateStudentAuth(selectedStdData);
                }else if (txt.innerHTML.includes('edit details')){
                    sessionStorage.setItem('Std_Authenticated','True');
                    stdUpdateDetails();
                };
                input.value = "";
                closeStdOTPDiv('close');
            }else{
                Alert('error','OTP mismatch. Check and try again !');
            };
        };

        const stdUpdateDetails = () => {
            if (isAdminAuth() && !isStudentAuth() || sessionStorage.getItem('Std_Authenticated') === 'True'){
                sessionStorage.setItem('updateStdForm','True');
                history('/studentform');
            }else{
                confirmationDiv('open','user_edit');
            };
        };

        const stdLogout = () => {
            if (isAdminAuth() && !isStudentAuth()){
                history('/dashboard');
            }else if (!isAdminAuth() && isStudentAuth()){
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    localStorage.setItem(key, JSON.stringify([]));
                }
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    sessionStorage.setItem(key, JSON.stringify([]));
                }
                history('/login');
            };
        };

        const updateStudentAuth = async(data,isAdmin_Chd=false) => {
            try{
                let res = await axios.put('http://127.0.0.1:8000/students/', JSON.stringify(data), {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    if(isAdmin_Chd){
                        Alert('success','Student login authentication changed successfully !');
                        changeBtn(true);
                    }else if (!isAdmin_Chd){
                        Alert('success','Your login authentication changed successfully !');
                        changeBtn();
                        sendStdAlert(data.Email,'Auth_Alert');
                    }
                    getStudents();
                };
            }catch(error){
                Alert('error','There was an error changing login authentication. Please try again later !'); 
            };
        };

        const changeBtn = (isA_Chd=false) => {
            let div,btn;
            if(isA_Chd){
                div = document.querySelector('.A_login-Auth-div');
                btn = document.querySelector('.A_login-Auth-btn');
                btn.style.right = (btn.style.right === '28px') ? '-10px' : '28px'
            }else{
                div = document.querySelector('.login-Auth-div');
                btn = document.querySelector('.login-Auth-btn');
                btn.style.right = (btn.style.right === '0px') ? '38px' : '0px';
            };

            div.style.background = (div.style.background === 'grey') ? '#616bf1' : 'grey';
            div.style.border = (div.style.border === '3px solid grey') ? 'solid 3px #616bf1' : 'solid 3px grey';
        };

        const raiseRqtDiv = (type) =>{
            document.querySelector('.std-raise-rqt-div').style.opacity = (type === 'open') ? '1' : '0';
            document.querySelector('.std-raise-rqt-div').style.zIndex = (type === 'open') ? '100' : '-10';
            document.querySelector('.std-raise-rqt-div').style.visibility = (type === 'open') ? 'visible' : 'hidden';
            document.querySelector('.blur-div').style.visibility = (type === 'open') ? 'visible' : 'hidden';
        };

        const navigateStdProflies = (link,name) =>{
            (link && link.length > 0) ? window.open(link,'_main') : Alert('error',`The ${name} link was not provided by the student.<br/>Please update the submission to show the link !`);
        };

        const openNotifications = (type) =>{
            const divEle = document.querySelector('.std-notification-veiw-container');
            const blurDiv = document.querySelector('.blur-div');
            if (type === 'open'){
                divEle.style.opacity = '1';
                divEle.style.visibility = 'visible';
                divEle.style.zIndex = '100';
                blurDiv.style.visibility = 'visible'
            }else if (type === 'close'){
                divEle.style.opacity = '0';
                divEle.style.visibility = 'hidden';
                divEle.style.zIndex = '-10';
                blurDiv.style.visibility = 'hidden';
                moveSlider('left');
            };
        };

        const submitRequest = (e) => {
            e.preventDefault();
            let data,type;
            const textEle = document.querySelector('.request-text-area');
            if (textEle.value.length < 25){
                Alert('error','The raise request text should contain at least 25 characters !');
            }else{
                if (isStudentAuth() && !isAdminAuth()){
                    data = {
                        StudentMessage : `${selectedStdData.BatchName}~${selectedStdData.Class}~${selectedStdData.Name}~${selectedStdData.Phone}~${textEle.value}~${day}-${month}-${year}`
                    };
                    type = 'Std';
                }else if (!isStudentAuth() && isAdminAuth()){
                    data = {
                        BatchMessage : `${selectedStdData.BatchName}~${selectedStdData.Class}~${selectedStdData.Name}~${selectedStdData.Phone}~${textEle.value}~${day}-${month}-${year}`
                    };
                    type = 'Adm';
                };
                send_Message(data,'post',type);
            };
            textEle.value = "";
            raiseRqtDiv('close');
        };

        const send_Message = async(data,methd="",type) => {
            if (methd === 'post'){
                try {
                    let res = await axios.post('http://127.0.0.1:8000/messages/', JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                    if (res.status === 200 || res.status === 201){
                        if (type === 'Std'){
                            Alert('success',`Your request has been sent successfully.<br/>Check your mail for confirmation !`);
                            sendStdAlert(selectedStdData.Email,'Request_Alert');
                        }else if (type === 'Adm'){
                            Alert('success',`Your message has been sent successfully !`);
                            sendStdAlert(selectedStdData.Email,'Recieved_Request');
                        }
                    }
                } catch (error){
                    if (type === 'Std'){
                        Alert('error', 'Unfortunately, the sending request was unsuccessful.<br/>Please try again later !');
                    }else if (type === 'Adm'){
                        Alert('error', 'Unfortunately, the sending message was unsuccessful.<br/>Please try again later !');
                    }
                }
            }else if (methd === 'delete'){
                try {
                    let res = await axios.delete('http://127.0.0.1:8000/messages/', {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: JSON.stringify(data)
                    });
                    if (res.status === 204){
                        Alert('success', 'Your request has been withdrawn successfully !');
                    }
                } catch (error) {
                    Alert('error', 'Unfortunately, the request withdrawn was unsuccessful.<br/>Please try again later !');
                }
            };
            getMessageData();
        };

        const moveSlider = (move) => {
           const p1Ele = document.querySelector('.std-notif-opts-div .p1');
           const p2Ele = document.querySelector('.std-notif-opts-div .p2');
           const slideEle = document.querySelector('.std-notif-opts-div .notif-slider');
           const notifDiv = document.querySelector('.std-notification-data-div');
           const rqtDiv = document.querySelector('.std-requests-data-div');
            if (move === 'right'){
                slideEle.style.left = '468px';
                slideEle.style.width = '130px';
                setTimeout(()=>{
                    p2Ele.style.color = '#4953e6';
                    p1Ele.style.color = 'black';
                    rqtDiv.style.visibility = 'visible';
                    notifDiv.style.visibility = 'hidden';
                },500);
            }else if (move === 'left'){
                slideEle.style.left = '0px';
                slideEle.style.width = '166px';
                setTimeout(()=>{
                    p1Ele.style.color = '#4953e6';
                    p2Ele.style.color = 'black';
                    rqtDiv.style.visibility = 'hidden';
                    notifDiv.style.visibility = 'visible';
                },500);
            };
        };

        const stdOnHoverEmoji = (type,num,idx=0,leave=false,click=false) => {
            const clicked = sessionStorage.getItem(`click-${idx}`) || 'False';
            const clickedNo = JSON.parse(sessionStorage.getItem(`No-${type}-${idx}`)) || "";
            if(click){
                sessionStorage.setItem(`click-${type}-${idx}`,'True');
                sessionStorage.setItem(`No-${type}-${idx}`,JSON.stringify(num));
            }
            const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
            if(leave && !clicked){
                colors.forEach((color,index)=>{
                    const divEle1 = document.querySelector(`.${type}-emoji-div-${idx}-${index + 1}`);
                    if (index < num){
                        divEle1.style.background = 'lightgrey';
                        divEle1.style.border = `solid 3px lightgrey`;
                    };
                });
            }else if(leave && clicked){
                colors.forEach((color,index)=>{
                    const divEle2 = document.querySelector(`.${type}-emoji-div-${idx}-${index + 1}`);
                    if (index >= clickedNo){
                        divEle2.style.background = 'lightgrey';
                        divEle2.style.border = `solid 3px lightgrey`;
                    };
                });
            }else{
                colors.forEach((color,index)=>{
                    const divEle3 = document.querySelector(`.${type}-emoji-div-${idx}-${index + 1}`);
                    if (index < num){
                        divEle3.style.background = color;
                        divEle3.style.border = `solid 3px ${color}`;
                    }else if(click){
                        divEle3.style.background = 'lightgrey';
                        divEle3.style.border = `solid 3px lightgrey`;
                    };
                });
            }
        };

        const stdOnHoverEmojiTxt = (type,idx=0,num,leave=false) => {
            const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
            const moves = [-3, 3, 18, 31.7, 38.3, 46.5, 60, 65.3, 77.7, 89];
            const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
            const spanEle = document.querySelector(`.${type}-emoji-txt-${idx}`);
                if(leave){
                    spanEle.style.display = 'none';
                }else{
                    spanEle.style.display = '';
                    spanEle.style.left = `${moves[num - 1]}%`;
                    spanEle.style.color = colors[num - 1];
                    spanEle.textContent = names[num - 1];
                };
        };

        const submitFeedback = (e) => {
            e.preventDefault();
            let isGood = true;
            const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
            let tutorReview = "";
            const clsTxt = document.querySelector('.std-cls-fedbck');
            const tutorTxt = document.querySelector('.std-tutor-fedbck');
            const clsReview = JSON.parse(sessionStorage.getItem(`No-cls-0`)) || 0;
            if (clsTxt.value.length >= 25 && tutorTxt.value.length >= 25){
                classTutors && classTutors.forEach((data,index)=>{
                    const num = JSON.parse(sessionStorage.getItem(`No-tutor-${index}`)) || 0;
                    if (num && num > 0){
                        tutorReview += `${data} - ${num}/10. [${names[num - 1]}]~`;
                    }else if (!num || num === 0){
                        isGood = false;
                        Alert('error','Your rating from 1 to 10 is essential for us to enhance our services.<br/>Please take a moment to share your feedback.',7000);
                        return true;
                    };
                });
                if (isGood){
                    if (clsReview && clsReview > 0){
                        const data = {
                            TutorsFeedback : tutorTxt.value,
                            ClassFeedback : clsTxt.value,
                            TurorsReview : tutorReview,
                            ClassReview : `${clsReview}/10. [${names[clsReview - 1]}]`,
                            BatchName : `${selectedStdData.Class} - ${selectedStdData.BatchName}~${day}-${month}-${year}`
                        }
                        submitReview(data);
                    }else{
                        Alert('error','Your rating from 1 to 10 is essential for us to enhance our services.<br/>Please take a moment to share your feedback.',7000);
                        return false;
                    };
                };
            }else{
                Alert('error','Your feedback is valuable to us.<br/>Please take the time to enter at least 25 characters in the text field to share your thoughts !',10000);
            }
        };

        const submitReview = async(data)=>{
            try{
                let res = await axios.post('http://127.0.0.1:8000/feedback/', JSON.stringify(data), {
                    headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',"Thank you for your review. Your feedback has been submitted successfully. We understand the importance of privacy,<br/>and we want to assure you that your name and personal details will be kept strictly confidential.!",20000);
                };
            }catch(error){
                Alert('error','Unfortunately your review submmition was unsuccessful.<br/>Please try again later !')
            };
            stdFedbckForm('close',true);
        };

        const stdFedbckForm = (type,close=false) => {
            const divEle = document.querySelector('.student-feedback-conatiner');
            const blurdiv = document.querySelector('.blur-div');
            divEle.style.opacity = (type === 'open') ? '1' : '0';
            divEle.style.visibility = (type === 'open') ? 'visible' : 'hidden';
            divEle.style.zIndex = (type === 'open') ? '110' : '-10';
            blurdiv.style.visibility = (type === 'open') ? 'visible' : 'hidden';
            if(type === 'open'){
                Alert('note',"Note : For honest and open feedback, Your feedback will be kept completely anonymous.<br/>Your name and any personal details will not be associated with your responses.",25000);
            }else if(!close){
                Alert('error','Ratings provide valuable feedback that motivates us to deliver an even better experience. We would appreciate<br/>if you could spare a few minutes to complete this student feedback form about your experience',15000)
            }
            classTutors && classTutors.forEach((data,index)=>{
                sessionStorage.setItem(`click-tutor-${index}`,'False');
                sessionStorage.setItem(`No-tutor-${index}`,JSON.stringify(0));
            });
            sessionStorage.setItem('click-cls-0','False');
            sessionStorage.setItem('No-cls-0',JSON.stringify(0));
            document.querySelector('.std-cls-fedbck').value = "";
            document.querySelector('.std-tutor-fedbck').value= "";
        };

    return (
        <div>
        <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
            <center  className="Main-Page-Container">
            <div className="student-pop-up-details-container">
                <div className="student-details-left-div">
                    <img className='std-profile-img' src={selectedStdData.Image && selectedStdData.Image.length > 0 ? selectedStdData.Image : 'images/Empty-Profile.png'}/>
                    <h2>{selectedStdData ? selectedStdData.Name : null}</h2>
                    <h3>{selectedStdData ? selectedStdData.Phone : null}<img src='images/copy-icon.png' onClick={()=>navigator.clipboard.writeText(selectedStdData.Phone).then(()=>Alert('success',`Copied <strong>${selectedStdData.Phone}</strong> to clipboard !`)).catch(err=>Alert('error',err))}/></h3>
                    <h3>{selectedStdData ? selectedStdData.Email : null}<img src='images/copy-icon.png' onClick={()=>navigator.clipboard.writeText(selectedStdData.Email).then(()=>Alert('success',`Copied <strong>${selectedStdData.Email}</strong> to clipboard !`)).catch(err=>Alert('error',err))}/></h3>

                    <label className='std-g-l-links'>
                        <a className='std-git-url' onClick={()=>navigateStdProflies(selectedStdData.Github,'Github')} target='main'><img src='images/git-logo.png' /></a>
                        <a className='std-linkedin-url' onClick={()=>navigateStdProflies(selectedStdData.Linkedin,'Linkedin')} target='main'><img src='images/LinkedIn_logo.png' /></a>
                    </label>

                    <h1>Performance &nbsp;:&nbsp; <span className="performance-status"></span></h1>
                    <div className="std-info-progress-circle">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle class="progress-bg" cx="50" cy="50" r="45"></circle>
                            <circle class="progress-bar" cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                        </svg>
                        <div class="progress-text-div">
                            <text x="50%" y="50%" className="progress-text">0%</text>
                        </div>
                    </div>
                    <div className='std-notification-div' onClick={()=>openNotifications('open')}>
                        <img src='images/notification-bell.gif' />
                        <span>{(isStudentAuth() && !isAdminAuth()) ? ((myNotifications) ? myNotifications.length : 0) : ((myMessages) ? myMessages.length : 0) }</span>
                    </div>
                </div>
                <div class="student-details-right-div">
                        <h1 class="std-status">Status : <span style={{color : selectedStdData.Status === 'Active' ? 'green' : 'red'}} className="std-status-span">{selectedStdData.Status}</span></h1>
                        <h1 class="std-joining-date">Joining Date : <span>{selectedStdData.JoiningDate}</span></h1>
                        <h2 class="std-batch">Batch : <span>{selectedStdData.BatchName} - {stdID < 10 ? `0${stdID}` : stdID}</span></h2>
                    <div class="std-inner-main-div">
                        <div class="std-education-details-div" >
                            <div>
                                <p>PG &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp; <span> {selectedStdData.PG}</span></p><p>Branch &nbsp;:&nbsp; <span> {selectedStdData.PG_Branch}</span></p><p>CGPA &nbsp;:&nbsp; <span> {selectedStdData.PG_CGPA}</span></p><p>Passed Year &nbsp;:&nbsp; <span> {selectedStdData.PG_Year}</span></p>
                            </div>
                            <div>
                                <p>Degree &nbsp;:&nbsp; <span> {selectedStdData.Degree}</span></p><p>Branch &nbsp;:&nbsp; <span> {selectedStdData.Degree_Branch}</span></p><p>CGPA &nbsp;:&nbsp; <span> {selectedStdData.Degree_CGPA}</span></p><p>Passed Year &nbsp;:&nbsp; <span> {selectedStdData.Degree_Year}</span></p>
                            </div>
                            <div>
                                <p>Inter &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp; <span> {selectedStdData.Inter}</span></p><p>Branch &nbsp;:&nbsp; <span> {selectedStdData.Inter_Branch}</span></p><p>CGPA &nbsp;:&nbsp; <span> {selectedStdData.Inter_CGPA}</span></p><p>Passed Year &nbsp;:&nbsp; <span> {selectedStdData.Inter_Year}</span></p>
                            </div>
                            <div>
                                <p>School &nbsp;:&nbsp; <span> {selectedStdData.SSC}</span></p><p>Branch &nbsp;:&nbsp; <span> {selectedStdData.SSC_Branch}</span></p><p>CGPA &nbsp;:&nbsp; <span> {selectedStdData.SSC_CGPA}</span></p><p>Passed Year &nbsp;:&nbsp; <span> {selectedStdData.SSC_Year}</span></p>
                            </div>
                        </div>
                        <div class="std-inner-div">
                            <p>Classes : <span class="std-attendence1 classes-attended"> {selectedStdData.Classes.split(' ')[0] < 10 ? `0${selectedStdData.Classes.split(' ')[0]}` : selectedStdData.Classes.split(' ')[0]}</span> / <span class="std-attendence2 classes"> {selectedStdBatchData.Classes.split(' ')[0] < 10 ? `0${selectedStdBatchData.Classes.split(' ')[0]}` : selectedStdBatchData.Classes.split(' ')[0]}</span></p>
                            <p>Case Studies : <span class="std-attendence1 case-studies-submitted"> {selectedStdData.CaseStudies.split(' ')[0] < 10 ? `0${selectedStdData.CaseStudies.split(' ')[0]}` : selectedStdData.CaseStudies.split(' ')[0]}</span> / <span class="std-attendence2 case-studies"> {selectedStdBatchData.CaseStudies.split(' ')[0] < 10 ? `0${selectedStdBatchData.CaseStudies.split(' ')[0]}` : selectedStdBatchData.CaseStudies.split(' ')[0]}</span></p>
                            <p>Mock Tests : <span class="std-attendence1 mock-test-attended"> {selectedStdData.MockTests.split(' ')[0] < 10 ? `0${selectedStdData.MockTests.split(' ')[0]}` : selectedStdData.MockTests.split(' ')[0]}</span> / <span class="std-attendence2 mock-test"> {selectedStdBatchData.MockTests.split(' ')[0] < 10 ? `0${selectedStdBatchData.MockTests.split(' ')[0]}` : selectedStdBatchData.MockTests.split(' ')[0]}</span></p>
                            <p>Interviews : <span class="std-attendence1 interviews-attended"> {selectedStdData.Interviews.split(' ')[0] < 10 ? `0${selectedStdData.Interviews.split(' ')[0]}` : selectedStdData.Interviews.split(' ')[0]}</span> / <span class="std-attendence2 interviews"> {selectedStdBatchData.Interviews.split(' ')[0] < 10 ? `0${selectedStdBatchData.Interviews.split(' ')[0]}` : selectedStdBatchData.Interviews.split(' ')[0]}</span></p>
                        </div>
                    </div>
                    <p id="project-p">Project : <span> {selectedStdData.Project}</span></p>
                    <img class="std-details-logo" src="images/V-CUBE-Logo.png" alt="" />
                    <span class="close-std-details" onClick={()=>(isAdminAuth() && !isStudentAuth()) ? history('/dashboard') : confirmationDiv('open','logout')}>{!isAdminAuth() && isStudentAuth() ? <img src='images/std-logout-icon.png' width='30px' /> : <img src="images/x-icon.png" width='20px' style={{marginRight : '10px'}} /> }<span className='std-close-dtls-txt'>{(!isAdminAuth() && isStudentAuth()) ? 'Logout' : 'Close details'}</span></span>
                    <div class="update-std-details-div">
                        <button style={{ background : 'red', color : '#fff',border : 'solid 1px red', width : '170px',visibility : (isAdminAuth() && !isStudentAuth()) ? 'visible' : 'hidden'}} onClick={()=>confirmationDiv('open','delete')}>Delete Student</button>
                        <button class="std-details-discontinued-btn" onClick={()=>confirmationDiv('open','discontinued')} style={{background : selectedStdData.Status === 'Active' ? 'red' : 'lightgrey',border : selectedStdData.Status === 'Active' ? 'solid 1px red' : 'solid 1px lightgrey',pointerEvents : selectedStdData.Status === 'Active' ? 'auto' : 'none', width : '140px',visibility : (isAdminAuth() && !isStudentAuth()) ? 'visible' : 'hidden'}}>Discontinued</button>
                        <div className='Admin-std-Auth-container' style={{visibility : (isAdminAuth() && !isStudentAuth()) ? 'visible' : 'hidden'}}>
                            <label>Student Login Access : 
                                <div className='A_login-Auth-div' style={{border : (selectedStdData.Access === 'Granted') ? 'solid 3px #616bf1' : 'solid 3px grey', background : (selectedStdData.Access === 'Granted') ? '#616bf1' : 'grey'}}>
                                    <button className='A_login-Auth-btn' onClick={()=>confirmationDiv('open','Admin_C_User_Auth')} style={{right : (selectedStdData.Access === 'Granted') ? '-10px' : '28px'}}></button>
                                </div>
                            </label>
                        </div>
                        <a onClick={()=>navigateStdProflies(selectedStdData.Resume,'Resume')} target='main' style={{border : 'none', background : '#616bf1', color : '#fff', textDecoration : 'none',width : '150px',height : '35px', borderRadius : '5px', display : 'flex', alignItems : 'center', justifyContent : 'center'}}>View Resume</a>
                        <button class="std-details-update-btn" onClick={stdUpdateDetails} style={{background : selectedStdData.Status === 'Active' ? 'green' : 'lightgrey', border : selectedStdData.Status === 'Active' ? 'solid 1px green' : 'solid 1px lightgrey',pointerEvents : selectedStdData.Status === 'Active' ? 'auto' : 'none', width : '140px'}}>Update</button>
                    </div>
                    <div className='stdAuth-container' style={{visibility : (!isAdminAuth() && isStudentAuth()) ? 'visible' : 'hidden'}}>
                        <label>Login Authentication : 
                            <div className='login-Auth-div' style={{border : (selectedStdData.Authentication === 'Active') ? 'solid 3px #616bf1' : 'solid 3px grey', background : (selectedStdData.Authentication === 'Active') ? '#616bf1' : 'grey'}}>
                                <button className='login-Auth-btn' onClick={()=>confirmationDiv('open','user_Auth')} style={{right : (selectedStdData.Authentication === 'Active') ? '0px' : '38px'}}></button>
                            </div>
                        </label>
                    </div>
                    <span className='Raise-rqt' onClick={()=>raiseRqtDiv('open')}>{ (isStudentAuth() && !isAdminAuth()) ? <img src='images/raise-rqt-icon.png'/> : <img src="images/msg-send-icon.png" />}<span className='raise-rqt-txt' style={{top : (isStudentAuth() && !isAdminAuth()) ? '15%' : '0%'}}>{(isStudentAuth() && !isAdminAuth()) ? 'Raise Request' : 'Send Message'}</span></span>
                    <span className='student-feedback-form' style={{visibility : (!isAdminAuth() && isStudentAuth()) ? 'visible' : 'hidden'}} onClick={()=>stdFedbckForm('open')}><img src='images/registration-form.png'/><span className='fedbk-form-txt'>Feedback Form</span></span>
                </div>
            </div>
            <div className="alert-div">
                <img className="alert-div-img" src="" alt="" width="40px"/>
                <p>Gello world</p>
                <span className="X" onClick={closeAlert}>&times;</span>
                <div className="alert-timer-line"></div>
            </div>
            <div className="confirm-operation-div">
                <p style={{lineHeight : '0.5', margin : '0', color : 'red'}} className="cnf-note" >Note : This operation cannot be undone.</p>
                <p className="confirm-div-p" style={{lineHeight : '1', fontWeight : 'bold'}}></p>
                <div className="outer-confirm-div" onClick={()=>stdDiscontinued()}><button className="inner-confirm-button">Confirm</button></div>
                <button className="cancel-button" onClick={()=>confirmationDiv('close')}>Cancel</button>
            </div>
            <div className="blur-div"></div>
            <div className='std-detail-auth-div'>
                <img src='images/V-CUBE-logo.png' width='150px'/>
                <p>Enter <strong>OTP</strong> that has been sent to your Email address.</p>
                <input className='user-otp-input' type='number' placeholder='Enter OTP'/>
                <button onClick={()=>stdOTPSubmit()}>Submit</button>
                <span onClick={()=>closeStdOTPDiv('close')}>&times;</span>
            </div>
            <div className='std-raise-rqt-div'>
                <h1>{(isStudentAuth() && !isAdminAuth()) ? 'Raise a Request.' : 'Send Message'}</h1>
                <form onSubmit={(e)=>submitRequest(e)}>
                    <textarea className="request-text-area" placeholder={(isStudentAuth() && !isAdminAuth()) ? 'Ex. Name,Phone,Email address change or any issues related to personal information.' : 'Send message to the student regarding any information.'} required />
                    <input type='submit' value={(isStudentAuth() && !isAdminAuth()) ? 'Raise Request.' : 'Send Message'} />
                </form>
                <span onClick={()=>raiseRqtDiv('close')}>&times;</span>
            </div>
            <div className='std-notification-veiw-container'>
                <img src='images/V-Cube-Logo.png'/>
                <div className='notification-lists'>
                    <div className='std-notif-opts-div'><p className='p1' onClick={()=>moveSlider('left')}>Your Notifications</p><p className='p2' onClick={()=>moveSlider('right')}>{(!isAdminAuth() && isStudentAuth()) ? 'Your Requests' : 'Your Messages'}</p><div className='notif-slider'></div></div>
                    <div className='std-notification-data-div' style={{overflowY : (myMessages && myMessages.length >= 3) ? 'scroll' : 'auto'}}>
                    {(isAdminAuth() && !isStudentAuth()) ? (myMessages && myMessages.map((data)=>(
                            <div className='std-rqt-data'>
                                <h3 style={{alignItems : 'start',height : '30px'}}>Name : </h3><p style={{height : '30px', alignItems : 'center'}}>{selectedStdData.Name}</p>
                                <h3 style={{alignItems : 'center',height : '30px'}}>Date : </h3><p style={{height : '30px', alignItems : 'center'}}>{data.StudentMessage.split('~')[5]}</p>
                                <h3 style={{alignItems : 'start',height : '30px'}}>Request : </h3><p style={{height : 'auto', alignItems : 'start'}}>{data.StudentMessage.split('~')[4]}</p>
                            </div>
                        ))
                        ):(
                            myNotifications && myNotifications.map((data)=>(
                                <div className='std-rqt-data'>
                                    <h3 style={{alignItems : 'center'}}>Date : </h3><p style={{height : '40px', alignItems : 'center'}}>{data.BatchMessage.split('~')[5]}</p>
                                    <h3 style={{alignItems : 'start'}}>Request : </h3><p style={{height : 'auto', alignItems : 'start'}}>{data.BatchMessage.split('~')[4]}</p>
                                </div>
                            ))
                        )
                    }
                    <img src='images/no-notifi-icon.png' style={{display : ((isAdminAuth() && !isStudentAuth() && (myMessages && myMessages.length > 0)) || (!isAdminAuth() && isStudentAuth() && (myNotifications && myNotifications.length > 0))) ? 'none' : ''}} />                      
                    </div>
                    <div className='std-requests-data-div' style={{overflowY : (myMessages && myMessages.length >= 3) ? 'scroll' : 'auto'}}>
                        {(!isAdminAuth() && isStudentAuth()) ? (myMessages && myMessages.map((data)=>(
                            <div className='std-rqt-data'>
                                <h3 style={{alignItems : 'center'}}>Date : </h3><p style={{height : '40px', alignItems : 'center'}}>{data.StudentMessage.split('~')[5]}</p>
                                <h3 style={{alignItems : 'start'}}>Request : </h3><p style={{height : 'auto', alignItems : 'start'}}>{data.StudentMessage.split('~')[4]}</p>
                                <span style={{color : 'red',textDecoration : 'underline'}} className={`rqt-delete-${data.id}`} onClick={()=>{confirmationDiv('open','Delete_Rqt');setRequestId(data.id)}}>Withdraw Request</span>
                            </div>
                        ))
                        ):(
                            myNotifications && myNotifications.map((data)=>(
                                <div className='std-rqt-data'>
                                    <h3 style={{alignItems : 'center'}}>Date : </h3><p style={{height : '40px', alignItems : 'center'}}>{data.BatchMessage.split('~')[5]}</p>
                                    <h3 style={{alignItems : 'start'}}>Message : </h3><p style={{height : 'auto', alignItems : 'start'}}>{data.BatchMessage.split('~')[4]}</p>
                                    <span style={{color : 'red',textDecoration : 'underline'}} className={`rqt-delete-${data.id}`} onClick={()=>{confirmationDiv('open','Delete_Msg');setRequestId(data.id)}}>Withdraw Message</span>
                                </div>
                            ))
                        )
                        }
                        <div className='rqt-img-div' style={{display : ((isAdminAuth() && !isStudentAuth() && (myNotifications && myNotifications.length > 0)) || (!isAdminAuth() && isStudentAuth() && (myMessages && myMessages.length > 0))) ? 'none' : ''}}>
                            {(!isAdminAuth() && isStudentAuth()) ? <img src='images/no-request-icon.png' /> : <img src='images/no-msg-icon.png' />}
                            <h1>{(!isAdminAuth() && isStudentAuth()) ? 'No Requests Yet' : 'No Messages Yet'}</h1>
                        </div>
                    </div>
                </div>
                <span className='notif-X' onClick={()=>openNotifications('close')}>&times;</span>
            </div>
            <div className='student-feedback-conatiner'>
                <img className='s-f-f-logo' src='images/V-Cube-Logo.png' />
                <h1 className='title'>Student Feedback Form</h1>
                <form onSubmit={(e)=>submitFeedback(e)}>
                    <div className='tariner-lists-div'>
                        {classTutors && classTutors.map((tutor,index)=>(
                            <div className='trainer-lists-inner-div'>
                            <h2>Trainer : <p>{tutor}</p></h2>
                            <div style={{position : 'relative',width : '50%',display : 'flex',alignItems : 'center', justifyContent : 'space-around'}}>
                            {[1,2,3,4,5,6,7,8,9,10].map((num)=>(
                                <div className={`tutor-emoji-div tutor-emoji-div-${index}-${num}`} onMouseOver={()=>{stdOnHoverEmoji('tutor',num,index);stdOnHoverEmojiTxt('tutor',index,num)}} onMouseLeave={()=>{stdOnHoverEmoji('tutor',num,index,true);stdOnHoverEmojiTxt('tutor',index,num,true)}} onClick={()=>{stdOnHoverEmoji('tutor',num,index,false,true)}}><img src={`images/emoji-${num}.png`} width='100%' /></div>
                            ))}
                            <span className={`tutor-emoji-txt-${index} tutor-emoji-txt`}></span>
                            </div>
                            </div>
                         ))}
                        </div>
                    <textarea className='std-tutor-fedbck' required placeholder="Your feedback is important! Please provide your honest assessment of the professor's teaching. What did you find most effective about their teaching style? Any areas where you think they could improve? Your responses will help us enhance the learning experience.   (minimum 25 characters is required)"></textarea>
                    <div className='class-fedbck-div'>
                        <h2>Class Feedback : &nbsp;<p>{selectedStdData.BatchName}</p></h2>
                        <div style={{position : 'relative',width : '50%',display : 'flex',alignItems : 'center', justifyContent : 'space-around'}}>
                        {[1,2,3,4,5,6,7,8,9,10].map((num,index)=>(
                            <div className={`cls-emoji-div cls-emoji-div-0-${num}`} onMouseOver={()=>{stdOnHoverEmoji('cls',num);stdOnHoverEmojiTxt('cls',0,num)}} onMouseLeave={()=>{stdOnHoverEmoji('cls',num,0,true);stdOnHoverEmojiTxt('cls',0,num,true)}} onClick={()=>{stdOnHoverEmoji('cls',num,0,false,true)}} ><img src={`images/emoji-${num}.png`} width='100%' /></div>
                        ))}
                        <span className={`cls-emoji-txt-0 cls-emoji-txt`}></span>
                        </div>
                    </div>
                    <textarea className='std-cls-fedbck' required placeholder="Please provide a summary of your current classes. Highlight key learnings, challenges faced, and any insights gained. Additionally, feel free to offer suggestions for improving the learning experience.   (minimum 25 characters is required)"></textarea>
                    <input type='submit' value='Submit Feedback' />
                </form>
                <span className='s-f-f-X' onClick={()=>stdFedbckForm('close')}>&times;</span>
            </div>
            </center>
        </div>
    );
    };
    }else{
        setTimeout(()=>{
            sessionStorage.setItem('Tried','True');
            history('/login');
        },30);
    };
};

export default StudentInfo;
