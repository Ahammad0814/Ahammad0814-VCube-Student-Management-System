import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { Alert, closeAlert } from './dashboard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentInfo = () => {
    const selectedStdData = JSON.parse(sessionStorage.getItem('SelectedStudent'));
    const selectedStdBatchData = JSON.parse(sessionStorage.getItem('SelectedBatchData'));
    const stdID = JSON.parse(sessionStorage.getItem('StdID'));
    const history = useNavigate();
    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();
    const loginned = localStorage.getItem('Login') || 'False';
    const stdLogin = sessionStorage.getItem('StdLogin') || 'False';

    if (stdLogin === 'False' || (loginned === 'False' || !loginned.includes(`True ${day} ${month} ${year}`))){
        history('/login');
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
    useEffect(()=>{
        setTimeout(()=>{
            updateScore();
        },50);
    },[])

    const feedBackInput = (num) => {
        let feedbackInputBtn,feedbackInputElement,updated_Feedback;
        if (num === '1'){
            feedbackInputBtn = document.querySelector('.feedback-p-1 button');
            feedbackInputElement = document.querySelector('.feedback-span-1');
        }else if (num === '2'){
            feedbackInputBtn = document.querySelector('.feedback-p-2 button');
            feedbackInputElement = document.querySelector('.feedback-span-2');
        }
        let fedbckTxt = feedbackInputBtn.innerHTML
        feedbackInputBtn.style.width = '40px';
        feedbackInputBtn.style.height = '40px';
        feedbackInputBtn.innerHTML = "";
        feedbackInputBtn.style.background = 'transparent';
        setTimeout(()=>{
            feedbackInputBtn.classList.add('btn-rotate');
            feedbackInputBtn.style.borderRadius = '50%';
            feedbackInputBtn.style.borderTop = 'solid 5px #616bf1';
            feedbackInputBtn.style.borderLeft = 'solid 5px #616bf1';
            feedbackInputBtn.style.borderBottom = 'solid 5px #616bf1';
            feedbackInputBtn.style.borderRight = 'solid 5px transparent';
        },200);
        setTimeout(()=>{
            feedbackInputBtn.classList.remove('btn-rotate');
            feedbackInputBtn.style.width = '50px';
            feedbackInputBtn.style.height = '35px';
            feedbackInputBtn.style.borderRadius = '5px'; 
            feedbackInputBtn.style.border = 'solid 1px #616bf1';
            feedbackInputBtn.innerHTML = fedbckTxt;
            feedbackInputBtn.style.background = '#616bf1';
            if (num === '1'){
                updated_Feedback = document.querySelector('.updated-feeedback-input-1');
            }else if (num === '2'){
                updated_Feedback = document.querySelector('.updated-feeedback-input-2');
            }
            if (feedbackInputBtn.innerHTML === 'Done'){
                if (updated_Feedback.value.length > 0){
                    if (num === '1'){
                        selectedStdData.Feedback = updated_Feedback.value;
                    }else if (num === '2'){
                        selectedStdData.StudentFeedback = updated_Feedback.value;
                    }
                    updateStdDetails(selectedStdData,'Feedback');
                    feedbackInputBtn.innerHTML = 'Edit';
                    feedbackInputElement.innerHTML = updated_Feedback.value;
                }else{
                    feedbackInputElement.innerHTML = selectedStdData.Feedback;
                    feedbackInputBtn.innerHTML = 'Edit';
                    Alert('error','An input value must be entered !');
                }
            }else{
                if (num === '1'){
                    feedbackInputElement.innerHTML = '<input class="updated-feeedback-input-1" type="text">';
                }else if (num === '2'){
                    feedbackInputElement.innerHTML = '<input class="updated-feeedback-input-2" type="text">';
                }
                feedbackInputBtn.innerHTML = 'Done';
            };
        },2000);
    };

    const updateStdDetails = async (data,status) => {
        const feedbackInputElement = document.querySelector('.feedback-span');
        const disconBtn = document.querySelector('.std-details-discontinued-btn');
        const stdData = data;
        try {
            let res = await axios.put('http://127.0.0.1:8000/students/', JSON.stringify(stdData), {
              headers: {
                'Content-Type': 'application/json',
                },
            });
            if (res.status === 200 || res.status === 201){
                if (status === 'Feedback'){
                    Alert('success','Student feedback has been updated succesfully !');
                    sessionStorage.setItem('SelectedStudent',JSON.stringify(selectedStdData));
                    feedbackInputElement.innerHTML = selectedStdData.Feedback;
                }else{
                    Alert('success','Student status has been updated succesfully !');
                    disconBtn.style.background = 'lightgrey';
                    disconBtn.style.border = 'solid 1px lightgrey';
                    disconBtn.style.pointerEvents = 'none';
                    sessionStorage.setItem('SelectedStudent',JSON.stringify(selectedStdData));
                    document.querySelector('.std-status-span').innerHTML = selectedStdData.Status;
                    document.querySelector('.std-status-span').style.color = 'red';
                };
            }
          } catch (error){
            if (status === 'Feedback'){
                Alert('error', 'Unfortunately, the student feedback update was unsuccessful.<br/>Please check & try again !');
                feedbackInputElement.innerHTML = selectedStdData.Feedback;
            }else{
                Alert('error', 'Unfortunately, the student status update was unsuccessful.<br/>Please check & try again !');
            }
          }
    };

    const confirmationDiv = (context,name=null) => {
        const txt = document.querySelector('.confirm-div-p');
        if (name === 'discontinued'){
           txt.innerHTML = 'Are you sure this student is discontinued ?';
        }else{
            txt.innerHTML = 'Are you sure you want to delete this student ?';
        }
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

    const stdDiscontinued = () => {
        const txt = document.querySelector('.confirm-div-p');
        
        if (txt.innerHTML.includes('discontinued')){
            selectedStdData.Status = `Discontinued on ${day} ${month} ${year}`;
            updateStdDetails(selectedStdData,'Status');
        }else if (txt.innerHTML.includes('delete')){
            deleteStudent(selectedStdData);
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

  return (
    <div>
    <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
        <center  className="Main-Page-Container">
        <div className="student-pop-up-details-container">
            <div className="student-details-left-div">
                <img className='std-profile-img' src={selectedStdData.Image && selectedStdData.Image.length > 0 ? selectedStdData.Image : 'images/Empty-Profile.png'}/>
                <h2>{selectedStdData ? selectedStdData.Name : null}</h2>
                <h3>{selectedStdData ? selectedStdData.Phone : null}</h3>
                <h3>{selectedStdData ? selectedStdData.Email : null}</h3>

                <label className='std-g-l-links'>
                    <a className='std-git-url' href={selectedStdData.Github} style={{opacity : selectedStdData.Github ? '1' : '0.3', cursor : selectedStdData.Github ? 'pointer' : 'auto', pointerEvents : selectedStdData.Github ? 'auto' : 'none'}} target='main'><img src='images/git-logo.png' /></a>
                    <a className='std-linkedin-url' href={selectedStdData.Linkedin} style={{opacity : selectedStdData.Linkedin ? '1' : '0.3', cursor : selectedStdData.Linkedin ? 'pointer' : 'auto', pointerEvents : selectedStdData.Linkedin ? 'auto' : 'none'}} target='main'><img src='images/LinkedIn_logo.png' /></a>
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
            </div>
            <div class="student-details-right-div">
                    <h1 class="std-status">Status : <span style={{color : selectedStdData.Status === 'Active' ? 'green' : 'red'}} className="std-status-span">{selectedStdData.Status}</span></h1>
                    <h1 class="std-joining-date">Joining Date : <span>{selectedStdData.JoiningDate}</span></h1>
                    <h2 class="std-batch">Batch : <span>{selectedStdData.BatchName} - {stdID < 10 ? `0${stdID}` : stdID}</span></h2>
                <div class="std-inner-main-div">
                    <div class="std-education-details-div">
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
                        <p>Classes : <span class="std-attendence1 classes-attended"> {selectedStdData.Classes.split(' ')[0] < 10 ? `0${selectedStdData.Classes.split(' ')[0]}` : selectedStdData.Classes.split(' ')[0]}</span> / <span class="std-attendence2 classes"> {selectedStdBatchData.Classes.split(' ')[0] < 10 ? `0${selectedStdBatchData.CaseStudies.split(' ')[0]}` : selectedStdBatchData.CaseStudies.split(' ')[0]}</span></p>
                        <p>Case Studies : <span class="std-attendence1 case-studies-submitted"> {selectedStdData.CaseStudies.split(' ')[0] < 10 ? `0${selectedStdData.CaseStudies.split(' ')[0]}` : selectedStdData.CaseStudies.split(' ')[0]}</span> / <span class="std-attendence2 case-studies"> {selectedStdBatchData.CaseStudies.split(' ')[0] < 10 ? `0${selectedStdBatchData.CaseStudies.split(' ')[0]}` : selectedStdBatchData.CaseStudies.split(' ')[0]}</span></p>
                        <p>Mock Tests : <span class="std-attendence1 mock-test-attended"> {selectedStdData.MockTests.split(' ')[0] < 10 ? `0${selectedStdData.MockTests.split(' ')[0]}` : selectedStdData.MockTests.split(' ')[0]}</span> / <span class="std-attendence2 mock-test"> {selectedStdBatchData.MockTests.split(' ')[0] < 10 ? `0${selectedStdBatchData.MockTests.split(' ')[0]}` : selectedStdBatchData.MockTests.split(' ')[0]}</span></p>
                        <p>Interviews : <span class="std-attendence1 interviews-attended"> {selectedStdData.Interviews.split(' ')[0] < 10 ? `0${selectedStdData.Interviews.split(' ')[0]}` : selectedStdData.Interviews.split(' ')[0]}</span> / <span class="std-attendence2 interviews"> {selectedStdBatchData.Interviews.split(' ')[0] < 10 ? `0${selectedStdBatchData.Interviews.split(' ')[0]}` : selectedStdBatchData.Interviews.split(' ')[0]}</span></p>
                    </div>
                </div>
                <p id="project-p">Project : <span> {selectedStdData.Project}</span></p>
                <p class="feedback-p feedback-p-1">Feedback &nbsp;:&nbsp; <span class="feedback-span feedback-span-1"> {selectedStdData.Feedback}</span> <button class="feedback-edit-btn" onClick={()=>feedBackInput('1')} style={{visibility : (loginned.includes('True')) ? 'visible' : 'hidden'}}>Edit</button></p>
                <p class="feedback-p feedback-p-2">Student Feedback &nbsp;:&nbsp; <span class="feedback-span feedback-span-2"> {selectedStdData.StudentFeedback}</span> <button class="feedback-edit-btn" onClick={()=>feedBackInput('2')} style={{visibility : (loginned.includes('True')) ? 'hidden' : 'visible'}}>Edit</button></p>
                <img class="std-details-logo" src="images/V-CUBE-Logo.png" alt="" />
                <img class="close-std-details" src="images/x-icon.png" alt="" onClick={()=> stdLogin === 'True' ? (history('/login'),sessionStorage.setItem('StdLogin', 'False')) : history('/dashboard')}/>
                <div class="update-std-details-div" >
                    <button style={{ background : 'red', color : '#fff',border : 'solid 1px red', width : '170px',visibility : (loginned.includes('True')) ? 'visible' : 'hidden'}} onClick={()=>confirmationDiv('open')}>Delete Student</button>
                    <button class="std-details-discontinued-btn" onClick={()=>confirmationDiv('open','discontinued')} style={{background : selectedStdData.Status === 'Active' ? 'red' : 'lightgrey',border : selectedStdData.Status === 'Active' ? 'solid 1px red' : 'solid 1px lightgrey',pointerEvents : selectedStdData.Status === 'Active' ? 'auto' : 'none', width : '140px',visibility : (loginned.includes('True')) ? 'visible' : 'hidden'}}>Discontinued</button>
                    <a href={selectedStdData.Resume} target='main' disabled={selectedStdData.Resume && selectedStdData.Resume.length > 0 ? false : true} style={{border : 'none', background : selectedStdData.Resume && selectedStdData.Resume.length > 0 ? '#616bf1' : 'grey', color : '#fff', textDecoration : 'none',width : '150px',height : '35px', borderRadius : '5px', cursor : selectedStdData.Resume && selectedStdData.Resume.length > 0 ? 'pointer' : 'auto', display : 'flex', alignItems : 'center', justifyContent : 'center'}}>View Resume</a>
                    <button class="std-details-update-btn" onClick={()=>{sessionStorage.setItem('updateStdForm','True');history('/studentform')}} style={{width : '140px'}}>Update</button>
                </div>
            </div>
        </div>
        <div className="alert-div">
            <img className="alert-div-img" src="" alt="" width="40px"/>
            <p></p>
            <span className="X" onClick={closeAlert}>&times;</span>
            <div className="alert-timer-line"></div>
        </div>
        <div className="confirm-operation-div">
            <p style={{lineHeight : '0.5', margin : '0', color : 'red'}}>Note : This operation cannot be undone.</p>
            <p className="confirm-div-p" style={{lineHeight : '1', fontWeight : 'bold'}}></p>
            <div className="outer-confirm-div" onClick={()=>stdDiscontinued()}><button className="inner-confirm-button">Confirm</button></div>
            <button className="cancel-button" onClick={()=>confirmationDiv('close')}>Cancel</button>
        </div>
        <div className="blur-div"></div>
        </center>
    </div>
  )
};

export default StudentInfo;
