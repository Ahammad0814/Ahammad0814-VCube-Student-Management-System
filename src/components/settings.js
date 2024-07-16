import React, { useEffect, useState } from "react";
import './dashboard.css';
import { fetchClassData, fetchLoginData } from "./data";
import { useNavigate } from "react-router-dom";
import { sendStdAlert } from "./student-info.js";
import { isAdminAuth, isStudentAuth,isUserFound } from './dashboard';
import axios from "axios";
import { Alert, closeAlert } from "./dashboard.js";

const Settings = () => {
    const history = useNavigate();
    const [loginData, setLoginData] = useState([]);
    const [selectId, setSelectId] = useState([]);
    const [classData,setClassData] = useState([]);
    const [review,setReview] = useState(false);
    const [clicked,setClicked] = useState(false);
    const [clickedNo,setClickedNo] = useState([]);
    const lg_User = sessionStorage.getItem('UserLogout') || 'False';
    const loginUserId = JSON.parse(localStorage.getItem('LoginUserId'));
    const login_User = JSON.parse(localStorage.getItem('IsUser'));

    const getLoginData = async () => {
        const login_Data = await fetchLoginData();
        setLoginData(login_Data);
    };
    const getClassData = async () => { 
        const class_Data = await fetchClassData();
        setClassData(class_Data);
    };
    useEffect(()=>{
        getLoginData();
        getClassData();
        isUserFound();
    },[]);

    useEffect(()=>{
        isUserFound();
    },[loginData])

if ((isAdminAuth() && !isStudentAuth())) {

    if (lg_User.split('&')[0] === 'True'){
        history('/login');
    }

    if ((isAdminAuth() && !isStudentAuth()) && (!loginData)){
        sessionStorage.setItem('SomethingWrong','True');
        history('/dashboard');

    }else{
    let loginnedUser = "";
    if (Array.isArray(loginData) && loginData.length > 0){
        loginnedUser = loginData && loginData.find(data=> data.id === loginUserId);
    };

    const grantPermission = () => {
        let isDelete = false;
        const userDetail = sessionStorage.getItem('UserDetail');
        loginData.forEach((data)=>{
            if (data.id === selectId){
                if (userDetail === 'Permission'){
                    if (data.Permission.includes('~')){
                        data.Permission = (data.Permission === 'Granted~') ? 'Denied~' : 'Granted~';
                    }else{
                        data.Permission = (data.Permission === 'Granted') ? 'Denied' : 'Granted';
                    }
                }else if (userDetail === 'Delete'){
                    isDelete = true;
                    updateLoginData(data,'Delete');
                }
                if (!isDelete){
                    updateLoginData(data,'Put');   
                }
                confirmationDiv('close');
            };
        });
    }

    const confirmationDiv = (context) => {
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
        }
    };

    const addNewUser = (event) => {
        event.preventDefault();
        let data;
        const submitBtn = document.querySelector('.new-user-submit-btn');
        const username = document.querySelector('.new-user-username');
        const email = document.querySelector('.new-user-mail');
        const password = document.querySelector('.new-user-pass');
        const conPassword = document.querySelector('.new-user-con-pass');
        const clss = document.querySelector('.user-select-class');
        const user = document.querySelector('.user-select-User');
        submitBtn.style.width = '40px';
        submitBtn.style.color = 'transparent';
        setTimeout(()=>{
            submitBtn.style.background = 'transparent';
            submitBtn.style.borderRadius = '50%';
            submitBtn.classList.add('btn-rotate')
            submitBtn.style.border = 'solid 5px #4f5af8';
            submitBtn.style.borderRight = 'solid 5px transparent';
            setTimeout(()=>{
                submitBtn.style.borderRadius = '5px';
                submitBtn.classList.remove('btn-rotate');
                submitBtn.style.width = '61%';
                submitBtn.style.background = '#4f5af8';
                submitBtn.style.color = '#ffff';
                submitBtn.style.border = 'solid 1px #4f5af8';
                const isMailFound = loginData && loginData.some(data=>data.Email === email.value);
                const isUserFound = loginData && loginData.some(data=>data.Username === username.value);
                const foundUser = loginData && loginData.find(data=>data.id === loginUserId);
                let isFound = false;
                let isAdminFound = true;
                if (login_User === 'Super Admin' && user.value === 'Admin'){
                    isFound = loginData.some(data=>data.Class === clss.value && data.User === 'Admin');
                }
                if(login_User === 'Super Admin' && user.value === 'User'){
                    isAdminFound = loginData.some(data=>data.Class === clss.value && data.User === 'Admin');
                }
            if(isAdminFound){
                if(!isFound){
                    if (!isUserFound){
                        if (!isMailFound){
                            if (password.value === conPassword.value){
                                if (login_User === 'Super Admin'){
                                    data = {
                                        Username : username.value,
                                        Email : email.value,
                                        Password : password.value,
                                        User : user.value,
                                        Permission : 'Granted',
                                        Class : clss.value
                                    }
                                }else{
                                    data = {
                                        Username : username.value,
                                        Email : email.value,
                                        Password : password.value,
                                        Permission : 'Granted',
                                        Class : foundUser.Class,
                                    }
                                }
                                updateLoginData(data,'Post');
                            }else{
                                Alert('error',"The new password and the confirm password do not match !");
                            }
                        }else{
                            Alert('error','Email address entered has already been taken.<br/>Try using another Email address !');
                        }
                    }else{
                        Alert('error','Username entered has already been taken.<br/>Try using different username !');
                    };
                }else{
                    Alert('error','Admin already assigned to the selected class !');
                }
            }else{
                Alert('error','Admin not found to the selected class.<br/>Add admin before adding user to the selected class !');
            };
            },3000)
        },500);
    };

    const changePassword = (event) => {
        event.preventDefault();
        const submitBtn = document.querySelector('.change-pass-submit');
        const oldPassEle = document.querySelector('.old-pass-input');
        const newPassEle = document.querySelector('.new-pass-input');
        const conPassEle = document.querySelector('.confirm-new-pass-input');
        submitBtn.style.width = '40px';
        submitBtn.style.color = 'transparent';
        setTimeout(()=>{
            submitBtn.style.background = 'transparent';
            submitBtn.style.borderRadius = '50%';
            submitBtn.classList.add('btn-rotate')
            submitBtn.style.border = 'solid 5px #4f5af8';
            submitBtn.style.borderRight = 'solid 5px transparent';
            setTimeout(()=>{
                submitBtn.style.borderRadius = '5px';
                submitBtn.classList.remove('btn-rotate');
                submitBtn.style.width = '61%';
                submitBtn.style.background = '#4f5af8';
                submitBtn.style.color = '#ffff';
                submitBtn.style.border = 'solid 1px #4f5af8';
                if (loginnedUser.Password === oldPassEle.value){
                    if (newPassEle.value === conPassEle.value){
                        loginnedUser.Password = newPassEle.value;
                        updateLoginData(loginnedUser,'Put');
                    }else{
                        Alert('error',"The new password and the confirm password do not match !")
                    }
                }else{
                    Alert('error','The old password you entered is incorrect. Please try again. !')
                };
            },3000)
        },500);
    };

    const updateLoginData = async (data, methodType) => {  
        const username = document.querySelector('.new-user-username');
        const email = document.querySelector('.new-user-mail');
        const password = document.querySelector('.new-user-pass');
        const conPassword = document.querySelector('.new-user-con-pass'); 
        const oldPassEle = document.querySelector('.old-pass-input');
        const newPassEle = document.querySelector('.new-pass-input');
        const conPassEle = document.querySelector('.confirm-new-pass-input');
        let method;
        let newData;
        if (methodType === 'Post') {
            method = axios.post;
            newData = data;
        } else if (methodType === 'Put') {
            method = axios.put;
            newData = data;
        }else if (methodType === 'Delete'){
            method = axios.delete;
            newData = data;
        }
        let res;
        try {
            if (methodType === 'Delete'){
                res = await method('http://127.0.0.1:8000/login/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data : JSON.stringify(newData)
                });
            }else{
                res = await method('http://127.0.0.1:8000/login/',JSON.stringify(newData),{
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
            if (res.status === 200 || res.status === 201 || res.status === 204){
                if (methodType === 'Post'){
                    Alert('success', 'New user added successfully!');
                    username.value = '';
                    password.value = '';
                    email.value = '';
                    conPassword.value = '';
                    document.querySelector('.user-select-class').value = "";
                    document.querySelector('.user-select-User').value = "";
                }else if (methodType === 'Put'){
                    Alert('success', 'Details Updated successfully!');
                    oldPassEle.value = '';
                    newPassEle.value = '';
                    conPassEle.value = '';
                }else if (methodType === 'Delete'){
                    Alert('success','User deleted successfully!');
                }
                getLoginData();
            }
        } catch (error) {
            if (methodType === 'Post'){
                Alert('error', 'Unfortunately, the new user addition was unsuccessful.<br/>Please check & try again!');
            }else if (methodType === 'Put'){
                Alert('error', 'Unfortunately, the details addition was unsuccessful.<br/>Please check & try again!');
            }else if (methodType === 'Delete'){
                Alert('error','Unfortunately, the user deletion was unsuccessful.<br/>Please check & try again!');
            }
        }
        getLoginData();
    };

    const onHoverEmoji = (num,leave=false,click=false) => {
        if(click){
            setClicked(true);
            setClickedNo(num);
        }
        const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
        if(leave && !clicked){
            colors.forEach((color,index)=>{
                if (index < num){
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                };
            });
        }else if(leave && clicked){
            colors.forEach((color,index)=>{
                if (index >= clickedNo){
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                };
            });
        }else{
            colors.forEach((color,index)=>{
                if (index < num){
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.background = color;
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px ${color}`;
                }else if(click){
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.background = 'lightgrey';
                    document.querySelector(`.emoji-img-div-${index + 1}`).style.border = `solid 3px lightgrey`;
                };
            });
        }
    };

    const onHoverEmojiTxt = (num,leave=false) => {
        const colors = ['red','#ee603b','#f58b39','#fcad36','#ffc929','#f9de1c','#d5d73d','#b0d258','#89c973','#00924c'];
        const moves = [-3, 3, 18, 31.7, 38.3, 46.5, 60, 65.3, 77.7, 89];
        const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
        const spanEle = document.querySelector('.emoji-names');
            if(leave){
                spanEle.style.display = 'none';
            }else{
                spanEle.style.display = '';
                spanEle.style.left = `${moves[num - 1]}%`;
                spanEle.style.color = colors[num - 1];
                spanEle.textContent = names[num - 1];
            };
    };

    const submit_U_R = () => {
        const cnt = (clickedNo > 0) ? clickedNo : 0;
        const names = ["Unacceptable", "Needs Improvement", "Satisfactory", "Good", "Impressive", "Remarkable", "Superb", "Extraordinary", "Perfection", "Ultimate"];
        if (cnt > 0){
            const no = (cnt === 0) ? 1 : cnt - 1;
            const r_txt = document.querySelector('.U_R_Txt').value;
            const txt = (r_txt.length > 3) ? r_txt : 'No Text Review Provided';
            const data = loginData && loginData.find(data=>data.id === loginUserId);
            data.Permission = (data.Permission === 'Granted' || data.Permission === 'Granted~') ? 'Granted~' : 'Denied~';
            Alert('note','Submitting Review. Please wait...');
            sendStdAlert('ahammada587@gmail.com','User_Review',`${data.Username}~${data.Email}~${cnt}~${names[no]}~${txt}~`,data);
            closeRatingDiv('close',true);
        }else{
            Alert('error','Please select a rating from 1 to 10 to provide your review !');
        };
    };

    const closeRatingDiv = (type,nope) =>{
        const divEle = document.querySelector('.Rating-User-div');
        divEle.style.opacity = (type === 'open') ? '1' : '0';
        divEle.style.visibility = (type === 'open') ? 'visible' : 'hidden';
        divEle.style.zIndex = (type === 'open') ? '110' : '-10';
        document.querySelector('.blur-div').style.visibility = (type === 'open') ? 'visible' : 'hidden';
        if(type === 'open')window.scrollTo(0,0);
        if (!nope){
            Alert('error','Ratings provide valuable feedback that motivates us to deliver an even better experience.<br/>So we kindly request that you take a moment to share your rating.',10000);
        };
        setReview(false);
        setClickedNo(0);
        setClicked(false);
    }

    const logout =()=>{
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'LoginUserId'){
                localStorage.setItem(key, JSON.stringify([]));
            };
        }
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            sessionStorage.setItem(key, JSON.stringify([]));
        }
        const user = loginData && loginData.find(data=>data.id === JSON.parse(localStorage.getItem('LoginUserId')));
        sessionStorage.setItem('UserLogout',`True&${user.Username}&${user.Email}&${user.Permission}`);
        localStorage.setItem('LoginUserId',JSON.stringify([]));
        history('/login');
    };

  let dataCnt = 0;
  return (
    <div>
        <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
        <div className="settings-main-container Main-Page-Container">
        <center>
            <div className="profile-header-div">
                <button><img className="profile-header-img" src="images/V-CUBE-Logo.png" alt="" width="100%"/></button>
                <span className="settings-x-icon" onClick={()=>history('/dashboard')}>&times;</span>
            </div>
            <div className="add-users-container" style={{opacity : (login_User === 'Admin' || login_User === 'Super Admin') ? '1' : '0',pointerEvents :  (login_User === 'Admin' || login_User === 'Super Admin') ? 'auto' : 'none'}}>
                <h1>Add User</h1>
                <form action="" onSubmit={(event)=>addNewUser(event)}>
                <input type="text" placeholder="Username" className="new-user-username" required/>
                <input type="email" placeholder="Email" className="new-user-mail" required/>
                <input type="text" placeholder="Password" className="new-user-pass" required/>
                <input type="password" placeholder="Confirm Password" className="new-user-con-pass" required/>
                <div className="user-select-class-div" style={{display : 'flex', flexDirection : 'row', width : '60%', height : (login_User === 'Super Admin') ? '35px' : '0px',visibility : (login_User === 'Super Admin') ? 'visible' : 'hidden'}}>
                    <select className="user-select-class" required={(login_User === 'Super Admin') ? true : false} style={{marginRight : '3px',width : '50%',  height : (login_User === 'Super Admin') ? '40px' : '0px', fontSize : '20px',cursor : 'pointer'}} onClick={()=>(classData && classData.length === 0) ? Alert('error','Add atleast one class and try again !') : null }>
                        <option style={{fontSize : '20px'}} value="">Select Class</option>
                        {classData && classData.map(data=>(
                            <option style={{fontSize : '25px'}} value={data.Class}>{data.Class}</option>
                        ))}
                    </select>
                    <select className="user-select-User" required={(login_User === 'Super Admin') ? true : false} style={{marginLeft : '3px',width : '50%',height : (login_User === 'Super Admin') ? '40px' : '0px',fontSize : '20px',cursor : 'pointer'}} >
                        <option style={{fontSize : '20px'}} value="" >Select User</option>
                        <option value='Admin' style={{fontSize : '25px'}}>Admin</option>
                        <option value='User' style={{fontSize : '25px'}}>User</option>
                    </select>
                </div>
                <input type="submit" value="Submit" className="new-user-submit-btn"/>
                </form>
            </div>
            <div className="change-password-container" style={{height : (login_User === 'Super Admin') ? '55%' : '50%'}}>
                <form action="" onSubmit={(event)=>changePassword(event)}>
                    <h1>Change Password</h1>
                    <input type="text" placeholder="Old Password" className="old-pass-input" required/>
                    <input type="text" placeholder="New Password" className="new-pass-input" required/>
                    <input type="password" placeholder="Confirm New Password" className="confirm-new-pass-input" required/>
                    <input type="submit" value="Submit" className="change-pass-submit"/>
                </form>            
            </div>
            <div className="user-details-container">
                <h1>{loginnedUser && loginnedUser.Username} <button className="isAdmin" style={{background : (login_User === 'Super Admin') ? '#2736ff' : (login_User === 'Admin') ? '#616bf1' : '#88a9f0'}}>{login_User}</button></h1>
                <h2>{loginnedUser && loginnedUser.Email}</h2>
            </div>
            <div className="total-users-details-container" style={{transform : (login_User === 'Admin' || login_User === 'Super Admin') ? 'scale(1)' : 'scale(0)'}}>
                <div style={{opacity : (login_User === 'Admin' || login_User === 'Super Admin') ? '1' : '0',pointerEvents :  (login_User === 'Admin' || login_User === 'Super Admin') ? 'auto' : 'none'}}>
                    <h1>Total Users</h1>
                    <div className="total-users-inner-div" style={{height: (login_User === 'Super Admin' || login_User === 'Admin') ? 'auto' : '0'}}>
                        <h2>User</h2><h2>Name</h2><h2>Email</h2><h2>Class</h2><h2>Permission</h2><h2>Remove User</h2>
                        {login_User === 'Super Admin' && loginData && loginData.map((data,index)=>{
                            if ((data.id !== loginUserId) && (data.User !== "Super Admin") && data.User === 'Admin'){
                                dataCnt ++
                                return(
                                    <React.Fragment key={index}>
                                    <button style={{background : data.User === 'Admin' ? '#616bf1' : '#88a9f0',cursor : 'auto'}}>{data.User}</button>
                                    <span>{data.Username}</span><span>{data.Email}</span><span>{data.Class}</span>
                                    <button onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Permission')}} style={{background : data.Permission.includes('Granted') ? 'green' : 'red'}}>{data.Permission.split('~')[0]}</button>
                                    <button style={{background : 'red', color : '#fff'}} onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Delete')}}>Delete</button>
                                    </React.Fragment>
                                ) 
                            };
                        })}
                        {classData && classData.map((clsData,index)=>{
                            const data = loginData.find((data)=>data.id !== loginUserId && data.User !== 'Super Admin' && data.User === 'User' && data.Class === clsData.Class)
                            if(data){
                            dataCnt ++
                            return(
                                <React.Fragment key={index}>
                                <button style={{background : data.User === 'Admin' ? '#616bf1' : '#88a9f0',cursor : 'auto'}}>{data.User}</button>
                                <span>{data.Username}</span><span>{data.Email}</span><span>{data.Class}</span>
                                <button onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Permission')}} style={{background : data.Permission.includes('Granted') ? 'green' : 'red'}}>{data.Permission.split('~')[0]}</button>
                                <button style={{background : 'red', color : '#fff'}} onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Delete')}}>Delete</button>
                                </React.Fragment>
                            )}
                        })
                        }
                        <img className="no-user-found-img" src="images/No_User_Data_Found.png" alt="" style={{visibility : (dataCnt === 0) ? 'visible' : 'hidden', pointerEvents : 'none'}} />
                    </div>
                </div>
                <h2 style={{marginTop : (dataCnt === 0) ? '400px' : '100px'}}>V Cube Software Solutions, Hyderbad.</h2>
                <h2 style={{color : '#4953e6',textDecoration : 'underline',cursor : 'pointer'}} onClick={()=>closeRatingDiv('open',true)}>Tell Us Your Thoughts.</h2>
                <h2 onClick={logout} style={{color : '#616bf1',cursor : 'pointer',textDecoration : 'underline',marginBottom : '80px',width : '80px'}}>Logout.</h2>
            </div>
            <div style={{position : 'absolute', bottom : '-30px',left : '35.5%', visibility : (login_User === 'User') ? 'visible' : 'hidden'}}>
            <h2>V Cube Software Solutions, Hyderbad.</h2>
            <h2 style={{color : '#4953e6',textDecoration : 'underline',cursor : 'pointer'}} onClick={()=>closeRatingDiv('open',true)}>Tell Us Your Thoughts.</h2>
            <h2 onClick={logout} style={{color : '#616bf1',cursor : 'pointer',textDecoration : 'underline',width : '80px'}}>Logout</h2>
            </div>
            <div className="blur-div"></div>
            <div className="confirm-operation-div">
                <p>Are you sure ? <br/>you want to make change to the selected user details.</p>
                <div className="outer-confirm-div" onClick={grantPermission}><button className="inner-confirm-button">Confirm</button></div>
                <button className="cancel-button" onClick={()=>confirmationDiv('close')}>Cancel</button>
            </div>
            <div className="alert-div">
                <img className="alert-div-img" src="" alt="" width="40px"/>
                <p></p>
                <span className="X" onClick={closeAlert}>&times;</span>
                <div className="alert-timer-line"></div>
            </div>
            <div className="Rating-User-div" style={{zIndex : (review === true) ? '110' : '-10',visibility : (review === true) ? 'visible' : 'hidden',opacity : (review === true) ? '1' : '0'}}>
                <h1>Give Us Your Thoughts</h1>
                <div className="emojis-div">
                    {[1,2,3,4,5,6,7,8,9,10].map(num=>(
                        <div className={`emoji-img-div emoji-img-div-${num}`} onMouseOver={()=>{onHoverEmoji(num);onHoverEmojiTxt(num)}} onMouseLeave={()=>{onHoverEmoji(num,true);onHoverEmojiTxt(num,true)}} onClick={()=>onHoverEmoji(num,false,true)}><img src={`images/emoji-${num}.png`}/></div>
                    ))}
                    <span className="emoji-names"></span>
                </div>
                <textarea className="U_R_Txt" placeholder="Feedback & Suggestions (Optional)"></textarea>
                <button onClick={submit_U_R}>Submit Review</button>
                <span className="X-icon" onClick={()=>closeRatingDiv('close',false)}>&times;</span>
            </div>
        </center>
        </div>
    </div>
  )
  };
}else if(!isAdminAuth() && isStudentAuth()){
    sessionStorage.setItem('StdTried','True');
    history('/studentinfo');
}else{
    sessionStorage.setItem('Tried','True');
    history('/login');
};
};

export default Settings;
