import React, { useEffect, useState } from "react";
import './dashboard.css';
import { fetchLoginData } from "./data";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, closeAlert } from "./dashboard.js";

const Settings = () => {
    const history = useNavigate();
    const [loginData, setLoginData] = useState([]);
    const [selectId, setSelectId] = useState([]);
    const loginned = localStorage.getItem('Login') || 'False';
    const loginUserId = JSON.parse(localStorage.getItem('LoginUserId'));
    const getLoginData = async () => {
        const login_Data = await fetchLoginData();
        setLoginData(login_Data);
    };
    useEffect(()=>{
        getLoginData();
    },[]);
    
    useEffect(()=>{
        getLoginData();
    },[loginData]);

    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();

    if (loginned === 'False' || !loginned.includes(`True ${day} ${month} ${year}`)){
        history('/login');
    };

    let loginnedUser = "";
    if (Array.isArray(loginData) && loginData.length > 0){
        loginnedUser = loginData && loginData.find(data=> data.id === loginUserId);
        console.log('worked')
    };

    const grantPermission = () => {
        let isDelete = false;
        const userDetail = sessionStorage.getItem('UserDetail');
        loginData.forEach((data)=>{
            if (data.id === selectId){
                if (userDetail === 'Permission'){
                    data.Permission = (data.Permission === 'Granted') ? 'Denied' : 'Granted';
                }else if (userDetail === 'User'){
                    data.User = (data.User === 'Admin') ? 'User' : 'Admin';
                }else if (userDetail == 'Delete'){
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
        const submitBtn = document.querySelector('.new-user-submit-btn');
        const username = document.querySelector('.new-user-username');
        const email = document.querySelector('.new-user-mail');
        const password = document.querySelector('.new-user-pass');
        const conPassword = document.querySelector('.new-user-con-pass');
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
                const isMailFound = loginData && loginData.find(data=>data.Email === email.value);
                if (!isMailFound){
                    if (password.value === conPassword.value){
                        const data = {
                            Username : username.value,
                            Email : email.value,
                            Password : password.value,
                            Permission : 'Granted'
                        }
                        updateLoginData(data,'Post');
                    }else{
                        Alert('error',"The new password and the confirm password do not match !")
                    }
                }else{
                    Alert('error','Email address entered has already been taken.<br/>Try using another Email address !')
                }
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
            if (res.status === 200 || res.status === 201) {
                if (methodType === 'Post'){
                    Alert('success', 'New user added successfully!');
                    username.value = '';
                    password.value = '';
                    email.value = '';
                    conPassword.value = '';
                }else if (methodType === 'Put'){
                    Alert('success', 'Details Updated successfully!');
                    oldPassEle.value = '';
                    newPassEle.value = '';
                    conPassEle.value = '';
                }else if (methodType === 'Delete'){
                    Alert('success','User deleted successfully!');
                }
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
    };

    const logout =()=>{
        localStorage.setItem('Login','False');
        Alert('success',"You've successfully logged out !");
        setTimeout(()=>{
            history('/login');
        },3000)
    };
    
    let condition;
    if (loginData && loginData.length > 1){
        condition = true;
    }else if (loginData && loginData.length === 1){
        condition = false;
    };

  return (
    <div>
        <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
        <div className="settings-main-container Main-Page-Container">
        <center>
            <div className="profile-header-div">
                <button><img className="profile-header-img" src="images/V-CUBE-Logo.png" alt="" width="100%"/></button>
                <span className="settings-x-icon" onClick={()=>history('/dashboard')}>&times;</span>
            </div>
            <div className="add-users-container" style={{opacity : loginnedUser && loginnedUser.User === 'Admin' ? '1' : '0',pointerEvents : loginnedUser && loginnedUser.User === 'Admin' ? 'auto' : 'none'}}>
                <h1>Add User</h1>
                <form action="" onSubmit={(event)=>addNewUser(event)}>
                <input type="text" placeholder="Username" className="new-user-username" required/>
                <input type="email" placeholder="Email" className="new-user-mail" required/>
                <input type="text" placeholder="Password" className="new-user-pass" required/>
                <input type="password" placeholder="Confirm Password" className="new-user-con-pass" required/>
                <input type="submit" value="Submit" className="new-user-submit-btn"/>
                </form>
            </div>
            <div className="change-password-container">
                <form action="" onSubmit={(event)=>changePassword(event)}>
                    <h1>Change Password</h1>
                    <input type="text" placeholder="Old Password" className="old-pass-input" required/>
                    <input type="text" placeholder="New Password" className="new-pass-input" required/>
                    <input type="password" placeholder="Confirm New Password" className="confirm-new-pass-input" required/>
                    <input type="submit" value="Submit" className="change-pass-submit"/>
                </form>            
            </div>
            <div className="user-details-container">
                <h1>{loginnedUser && loginnedUser.Username} <button className="isAdmin" style={{background : loginnedUser &&  loginnedUser.User === 'Admin' ? '#616bf1' : '#88a9f0'}}>{loginnedUser && loginnedUser.User}</button></h1>
                <h2>{loginnedUser && loginnedUser.Email}</h2>
            </div>
            <div className="total-users-details-container">
                <h1 style={{opacity : loginnedUser && loginnedUser.User === 'Admin' ? '1' : '0',pointerEvents : loginnedUser && loginnedUser.User === 'Admin' ? 'auto' : 'none'}}>Total Users</h1>
                <div className="total-users-inner-div" style={{opacity : loginnedUser && loginnedUser.User === 'Admin' ? '1' : '0',pointerEvents : loginnedUser && loginnedUser.User === 'Admin' ? 'auto' : 'none'}}>
                    <h2>User</h2><h2>Name</h2><h2>Email</h2><h2>Permission</h2><h2>Remove User</h2>
                    {loginData && loginData.map((data,index)=>{
                        if (data.id !== loginUserId){
                            return(
                                <React.Fragment key={index}>
                                <button onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','User')}} style={{background : data.User === 'Admin' ? '#616bf1' : '#88a9f0'}}>{data.User}</button>
                                <span>{data.Username}</span><span>{data.Email}</span>
                                <button onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Permission')}} style={{background : data.Permission === 'Granted' ? 'green' : 'red'}}>{data.Permission}</button>
                                <button style={{background : 'red', color : '#fff'}} onClick={()=>{confirmationDiv('open'); setSelectId(data.id);sessionStorage.setItem('UserDetail','Delete')}}>Delete</button>
                                </React.Fragment>
                            ) 
                        };
                    })}
                    <img className="no-user-found-img" src="images/No_User_Data_Found.png" alt="" style={{visibility : (condition === false) ? 'visible' : 'hidden',pointerEvents : 'none'}} />
                </div>
                <h2 style={{marginTop : (condition === false) ? '400px' : '100px'}}>V Cube Software Solutions, Hyderbad.</h2>
                <h2 onClick={logout} style={{color : '#616bf1',cursor : 'pointer',textDecoration : 'underline',marginBottom : '80px',width : '80px'}}>Logout</h2>
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
        </center>
        </div>
    </div>
  )
}

export default Settings;
